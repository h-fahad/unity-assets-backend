import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('ADMIN')
  getDashboardStats() {
    return this.analyticsService.getDashboardStats();
  }

  @Get('downloads/recent')
  @Roles('ADMIN')
  getRecentDownloads(@Query('days') days?: string) {
    const daysNumber = days ? parseInt(days, 10) : 30;
    return this.analyticsService.getRecentDownloads(daysNumber);
  }

  @Get('assets/top')
  @Roles('ADMIN')
  getTopAssets(@Query('limit') limit?: string) {
    const limitNumber = limit ? parseInt(limit, 10) : 10;
    return this.analyticsService.getTopAssets(limitNumber);
  }

  @Get('subscriptions/stats')
  @Roles('ADMIN')
  getSubscriptionStats() {
    return this.analyticsService.getSubscriptionStats();
  }

  @Get('revenue')
  @Roles('ADMIN')
  getRevenueStats() {
    return this.analyticsService.getRevenueStats();
  }

  @Get('users/:id')
  @Roles('ADMIN')
  getUserAnalytics(@Param('id', ParseIntPipe) id: number) {
    return this.analyticsService.getUserAnalytics(id);
  }
}
