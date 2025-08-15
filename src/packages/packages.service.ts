import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };

    return this.prisma.subscriptionPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return plan;
  }

  async create(dto: CreatePackageDto) {
    return this.prisma.subscriptionPlan.create({
      data: {
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        billingCycle: dto.billingCycle,
        yearlyDiscount: dto.yearlyDiscount,
        dailyDownloadLimit: dto.dailyDownloadLimit,
        features: dto.features,
        isActive: true,
      },
    });
  }

  async update(id: number, dto: UpdatePackageDto) {
    const plan = await this.findOne(id);

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        basePrice: dto.basePrice,
        billingCycle: dto.billingCycle,
        yearlyDiscount: dto.yearlyDiscount,
        dailyDownloadLimit: dto.dailyDownloadLimit,
        features: dto.features,
      },
    });
  }

  async remove(id: number) {
    const plan = await this.findOne(id);

    // Check if there are any subscriptions using this plan (active or inactive)
    const subscriptions = await this.prisma.userSubscription.findMany({
      where: {
        planId: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (subscriptions.length > 0) {
      const activeCount = subscriptions.filter((sub) => sub.isActive).length;
      const totalCount = subscriptions.length;

      if (activeCount > 0) {
        throw new BadRequestException(
          `Cannot delete package. There are ${activeCount} active and ${totalCount} total subscriptions using this package. Please deactivate the package instead.`,
        );
      } else {
        throw new BadRequestException(
          `Cannot delete package. There are ${totalCount} inactive subscriptions using this package. Please deactivate the package instead.`,
        );
      }
    }

    return this.prisma.subscriptionPlan.delete({
      where: { id },
    });
  }

  async toggleStatus(id: number) {
    const plan = await this.findOne(id);

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: {
        isActive: !plan.isActive,
      },
    });
  }
}
