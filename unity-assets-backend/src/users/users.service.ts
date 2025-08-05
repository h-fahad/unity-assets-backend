import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { User, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role || Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        resetToken: true,
        resetTokenExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async findAll(includeInactive: boolean = false, page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: includeInactive ? {} : { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          userSubscriptions: {
            where: {
              isActive: true,
              endDate: { gt: new Date() },
            },
            include: { plan: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: {
              downloads: true,
              assets: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: includeInactive ? {} : { isActive: true },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        userSubscriptions: {
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            downloads: true,
            assets: true,
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findProfile(id: number): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        userSubscriptions: {
          where: {
            isActive: true,
            endDate: { gt: new Date() },
          },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(
    id: number,
    dto: UpdateUserDto,
    currentUser: Partial<User>,
  ): Promise<Omit<User, 'password'>> {
    if (currentUser.id !== id && currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('You can only update your own profile');
    }

    const user = await this.prisma.user.update({
      where: { id },
      data: { ...dto },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        resetToken: true,
        resetTokenExpiry: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  async remove(id: number, currentUser: Partial<User>): Promise<void> {
    if (currentUser.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can delete users');
    }

    await this.findOne(id);
    
    const activeSubscriptions = await this.prisma.userSubscription.count({
      where: {
        userId: id,
        isActive: true,
        endDate: { gt: new Date() },
      },
    });

    if (activeSubscriptions > 0) {
      throw new ConflictException(
        'Cannot delete user with active subscriptions',
      );
    }

    await this.prisma.user.delete({ where: { id } });
  }

  async deactivateUser(id: number): Promise<any> {
    const user = await this.findOne(id);
    
    await this.prisma.userSubscription.updateMany({
      where: {
        userId: id,
        isActive: true,
      },
      data: { isActive: false },
    });

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async activateUser(id: number): Promise<any> {
    await this.findOne(id);
    
    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async changeRole(id: number, role: Role): Promise<any> {
    await this.findOne(id);
    
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getUserStats() {
    const [total, active, admins, withActiveSubscriptions] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.user.count({ where: { role: Role.ADMIN } }),
      this.prisma.user.count({
        where: {
          userSubscriptions: {
            some: {
              isActive: true,
              endDate: { gt: new Date() },
            },
          },
        },
      }),
    ]);

    return {
      total,
      active,
      inactive: total - active,
      admins,
      withActiveSubscriptions,
    };
  }

  async searchUsers(query: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          userSubscriptions: {
            where: {
              isActive: true,
              endDate: { gt: new Date() },
            },
            include: { plan: true },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getUsersWithSubscriptions() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        userSubscriptions: {
          where: {
            isActive: true,
            endDate: { gt: new Date() },
          },
          include: { plan: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            downloads: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
