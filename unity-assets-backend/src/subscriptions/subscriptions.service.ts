import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ActivityService } from '../activity/activity.service';
import { CreateSubscriptionPlanDto } from './dto/create-subscription-plan.dto';
import { UpdateSubscriptionPlanDto } from './dto/update-subscription-plan.dto';
import { AssignSubscriptionDto } from './dto/assign-subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async findAllPlans(includeInactive: boolean = false) {
    return this.prisma.subscriptionPlan.findMany({
      where: includeInactive ? {} : { isActive: true },
      include: {
        _count: {
          select: { userSubscriptions: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPlan(id: number) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { userSubscriptions: true },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Subscription plan with ID ${id} not found`);
    }

    return plan;
  }

  async createPlan(dto: CreateSubscriptionPlanDto) {
    return this.prisma.subscriptionPlan.create({
      data: dto,
    });
  }

  private calculateDurationInDays(billingCycle: string): number {
    switch (billingCycle) {
      case 'WEEKLY':
        return 7;
      case 'MONTHLY':
        return 30;
      case 'YEARLY':
        return 365;
      default:
        return 30;
    }
  }

  async updatePlan(id: number, dto: UpdateSubscriptionPlanDto) {
    await this.findPlan(id);

    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: dto,
    });
  }

  async deletePlan(id: number) {
    const plan = await this.findPlan(id);

    const activeSubscriptions = await this.prisma.userSubscription.count({
      where: {
        planId: id,
        isActive: true,
        endDate: { gt: new Date() },
      },
    });

    if (activeSubscriptions > 0) {
      throw new ConflictException(
        'Cannot delete plan with active subscriptions',
      );
    }

    return this.prisma.subscriptionPlan.delete({ where: { id } });
  }

  async deactivatePlan(id: number) {
    await this.findPlan(id);
    return this.prisma.subscriptionPlan.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async assignPlan(dto: AssignSubscriptionDto) {
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: dto.planId, isActive: true },
    });
    if (!plan) throw new NotFoundException('Plan not found or inactive');

    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId, isActive: true },
    });
    if (!user) throw new NotFoundException('User not found or inactive');

    const existingActiveSubscription =
      await this.prisma.userSubscription.findFirst({
        where: {
          userId: dto.userId,
          isActive: true,
          endDate: { gt: new Date() },
        },
      });

    if (existingActiveSubscription) {
      await this.prisma.userSubscription.update({
        where: { id: existingActiveSubscription.id },
        data: { isActive: false },
      });
    }

    const startDate = dto.startDate ? new Date(dto.startDate) : new Date();
    const endDate = new Date(startDate);

    switch (plan.billingCycle) {
      case 'WEEKLY':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'YEARLY':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    return this.prisma.userSubscription.create({
      data: {
        userId: dto.userId,
        planId: dto.planId,
        startDate,
        endDate,
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getUserSubscriptions(userId: number) {
    return this.prisma.userSubscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getActiveUserSubscription(userId: number) {
    return this.prisma.userSubscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: new Date() },
      },
      include: { plan: true },
    });
  }

  async getAllUserSubscriptions(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [subscriptions, total] = await Promise.all([
      this.prisma.userSubscription.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          plan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.userSubscription.count(),
    ]);

    return {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async cancelSubscription(subscriptionId: number) {
    const subscription = await this.prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { isActive: false },
    });
  }

  async getSubscriptionStats() {
    const [active, expired, total, revenue, totalDownloads, recentActivity] = await Promise.all([
      this.prisma.userSubscription.count({
        where: {
          isActive: true,
          endDate: { gt: new Date() },
        },
      }),
      this.prisma.userSubscription.count({
        where: {
          OR: [{ isActive: false }, { endDate: { lte: new Date() } }],
        },
      }),
      this.prisma.userSubscription.count(),
      this.calculateTotalRevenue(),
      this.prisma.download.count(),
      this.activityService.getRecentActivities(15),
    ]);

    // Format activities for frontend
    const formattedActivity = recentActivity.map(activity => ({
      type: activity.type.toLowerCase(),
      message: activity.message,
      timestamp: activity.createdAt.toISOString(),
    }));

    return {
      active,
      expired,
      total,
      revenue,
      totalDownloads,
      recentActivity: formattedActivity,
    };
  }

  private async calculateTotalRevenue(): Promise<number> {
    const subscriptions = await this.prisma.userSubscription.findMany({
      include: { plan: true },
    });

    return subscriptions.reduce((total, sub) => {
      const price = sub.plan.basePrice;
      const discount = sub.plan.yearlyDiscount / 100;
      const finalPrice =
        sub.plan.billingCycle === 'YEARLY' ? price * (1 - discount) : price;
      return total + finalPrice;
    }, 0);
  }
}
