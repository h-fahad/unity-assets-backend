import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { AssignSubscriptionDto } from './dto/assign-subscription.dto';
import { AuthRequest } from '../common/auth-request.interface';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  @ApiOperation({ summary: 'List all subscription plans' })
  @ApiResponse({ status: 200, description: 'List of plans' })
  async findAllPlans(@Query('includeInactive') includeInactive?: string) {
    const shouldIncludeInactive = includeInactive === 'true';
    return this.subscriptionsService.findAllPlans(shouldIncludeInactive);
  }

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get a specific subscription plan' })
  async findPlan(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.findPlan(id);
  }

  @Post('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new subscription plan (admin only)' })
  async createPlan(@Body() dto: CreateSubscriptionPlanDto) {
    return this.subscriptionsService.createPlan(dto);
  }

  @Patch('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a subscription plan (admin only)' })
  async updatePlan(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSubscriptionPlanDto,
  ) {
    return this.subscriptionsService.updatePlan(id, dto);
  }

  @Delete('plans/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a subscription plan (admin only)' })
  async deletePlan(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.deletePlan(id);
  }

  @Patch('plans/:id/deactivate')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate a subscription plan (admin only)' })
  async deactivatePlan(@Param('id', ParseIntPipe) id: number) {
    return this.subscriptionsService.deactivatePlan(id);
  }

  @Post('assign')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Assign a plan to a user (admin only)' })
  async assignPlan(@Body() dto: AssignSubscriptionDto) {
    return this.subscriptionsService.assignPlan(dto);
  }

  @Get('user-subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all user subscriptions (admin only)' })
  async getAllUserSubscriptions(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 50;
    return this.subscriptionsService.getAllUserSubscriptions(
      pageNumber,
      limitNumber,
    );
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscriptions' })
  async getMySubscriptions(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.subscriptionsService.getUserSubscriptions(userId);
  }

  @Get('my-active-subscription')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user active subscription' })
  async getMyActiveSubscription(@Req() req: AuthRequest) {
    const userId = req.user.id;
    return this.subscriptionsService.getActiveUserSubscription(userId);
  }

  @Get('admin/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription statistics (admin only)' })
  async getAdminStats() {
    return this.subscriptionsService.getSubscriptionStats();
  }

  @Get('user/:userId/subscriptions')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user subscriptions (admin only)' })
  async getUserSubscriptions(@Param('userId', ParseIntPipe) userId: number) {
    return this.subscriptionsService.getUserSubscriptions(userId);
  }

  @Patch(':subscriptionId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a subscription (admin only)' })
  async cancelSubscription(
    @Param('subscriptionId', ParseIntPipe) subscriptionId: number,
  ) {
    return this.subscriptionsService.cancelSubscription(subscriptionId);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get subscription statistics (admin only)' })
  async getSubscriptionStats() {
    return this.subscriptionsService.getSubscriptionStats();
  }
}
