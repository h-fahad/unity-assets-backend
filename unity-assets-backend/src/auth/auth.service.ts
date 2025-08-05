import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto, RequestResetDto } from './dto/reset-password.dto';
import { User } from '@prisma/client';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new UnauthorizedException('Email already in use');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { 
        email: dto.email, 
        password: hash, 
        name: dto.name,
        role: 'USER' // Always create as USER, admins are created via seeding
      },
    });
    const { password, ...result } = user;
    return result;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async login(
    dto: LoginDto,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const user = await this.validateUser(dto.email, dto.password);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = await this.jwtService.signAsync(payload);
    const { password, ...userInfo } = user;
    return { access_token: token, user: userInfo };
  }

  async requestPasswordReset(dto: RequestResetDto): Promise<{ message: string; resetToken: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return { message: 'If the email exists, a reset link has been sent.', resetToken: '' };
    }

    // Generate a secure reset token
    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Store the reset token in the database
    await this.prisma.user.update({
      where: { email: dto.email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    // In a real application, you would send this token via email
    // For now, we'll return it directly (only for development)
    return { 
      message: 'Password reset token generated successfully.', 
      resetToken 
    };
  }

  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        resetToken: dto.resetToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    // Update the user's password and clear the reset token
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { message: 'Password reset successfully' };
  }

  async validateResetToken(email: string, resetToken: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        resetToken,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    return !!user;
  }
}
