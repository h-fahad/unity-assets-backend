import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      activeSubscriptions,
      totalDownloads,
      totalAssets,
      recentDownloads,
      topAssets,
      subscriptionStats,
    ] = await Promise.all([
      this.prisma.user.count({
        where: { role: 'USER', isActive: true },
      }),
      this.prisma.userSubscription.count({
        where: {
          isActive: true,
          endDate: { gt: new Date() },
        },
      }),
      this.prisma.download.count(),
      this.prisma.asset.count({ where: { isActive: true } }),
      this.getRecentDownloads(7),
      this.getTopAssets(10),
      this.getSubscriptionStats(),
    ]);

    return {
      totalUsers,
      activeSubscriptions,
      totalDownloads,
      totalAssets,
      recentDownloads,
      topAssets,
      subscriptionStats,
    };
  }

  async getRecentDownloads(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const downloads = await this.prisma.download.groupBy({
      by: ['downloadedAt'],
      where: {
        downloadedAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
      orderBy: {
        downloadedAt: 'asc',
      },
    });

    const dailyDownloads: Array<{ date: string; downloads: number }> = [];
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayDownloads = downloads.filter(d => 
        d.downloadedAt.toISOString().split('T')[0] === dateStr
      );
      
      dailyDownloads.push({
        date: dateStr,
        downloads: dayDownloads.reduce((sum, d) => sum + d._count.id, 0),
      });
    }

    return dailyDownloads;
  }

  async getTopAssets(limit: number = 10) {
    return this.prisma.asset.findMany({
      select: {
        id: true,
        name: true,
        downloadCount: true,
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            downloads: true,
          },
        },
      },
      orderBy: {
        downloads: {
          _count: 'desc',
        },
      },
      take: limit,
    });
  }

  async getSubscriptionStats() {
    const [planStats, revenueStats] = await Promise.all([
      this.prisma.userSubscription.groupBy({
        by: ['planId'],
        where: {
          isActive: true,
          endDate: { gt: new Date() },
        },
        _count: {
          id: true,
        },
        _sum: {
          planId: true,
        },
      }),
      this.getRevenueStats(),
    ]);

    const plansWithDetails = await Promise.all(
      planStats.map(async (stat) => {
        const plan = await this.prisma.subscriptionPlan.findUnique({
          where: { id: stat.planId },
          select: { name: true, basePrice: true, billingCycle: true },
        });
        return {
          ...stat,
          plan,
        };
      })
    );

    return {
      planStats: plansWithDetails,
      revenueStats,
    };
  }

  async getRevenueStats() {
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date(currentMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [currentMonthRevenue, lastMonthRevenue, totalRevenue] = await Promise.all([
      this.calculateRevenue(currentMonth, new Date()),
      this.calculateRevenue(lastMonth, currentMonth),
      this.calculateRevenue(new Date('2020-01-01'), new Date()),
    ]);

    return {
      currentMonth: currentMonthRevenue,
      lastMonth: lastMonthRevenue,
      total: totalRevenue,
      growth: lastMonthRevenue > 0 
        ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0,
    };
  }

  private async calculateRevenue(startDate: Date, endDate: Date): Promise<number> {
    const subscriptions = await this.prisma.userSubscription.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        plan: true,
      },
    });

    return subscriptions.reduce((total, sub) => {
      const price = sub.plan.basePrice;
      const discount = sub.plan.yearlyDiscount / 100;
      const finalPrice = sub.plan.billingCycle === 'YEARLY' 
        ? price * (1 - discount) 
        : price;
      return total + finalPrice;
    }, 0);
  }

  async getUserAnalytics(userId: number) {
    const [user, subscriptions, downloads, recentActivity] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          role: true,
        },
      }),
      this.prisma.userSubscription.findMany({
        where: { userId },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.download.count({
        where: { userId },
      }),
      this.getUserRecentActivity(userId, 30),
    ]);

    return {
      user,
      subscriptions,
      totalDownloads: downloads,
      recentActivity,
    };
  }

  private async getUserRecentActivity(userId: number, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.prisma.download.findMany({
      where: {
        userId,
        downloadedAt: { gte: startDate },
      },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
            category: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { downloadedAt: 'desc' },
      take: 50,
    });
  }

  async recordMetric(metric: string, value: number, metadata?: any) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.analytics.upsert({
      where: {
        date_metric: {
          date: today,
          metric,
        },
      },
      update: {
        value,
        metadata,
      },
      create: {
        date: today,
        metric,
        value,
        metadata,
      },
    });
  }
}