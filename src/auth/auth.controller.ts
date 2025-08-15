import { Body, Controller, Post, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ResetPasswordDto, RequestResetDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('request-reset')
  async requestPasswordReset(@Body() dto: RequestResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get('validate-reset-token')
  async validateResetToken(
    @Query('email') email: string,
    @Query('token') token: string,
  ) {
    const isValid = await this.authService.validateResetToken(email, token);
    return { isValid };
  }
}
