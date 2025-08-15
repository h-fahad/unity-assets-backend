import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class DownloadsService {
  constructor(private prisma: PrismaService) {}

  async downloadAsset(
    userId: number,
    assetId: number,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId, isActive: true },
    });

    if (!asset) {
      throw new NotFoundException('Asset not found or not available');
    }

    const canDownload = await this.checkDownloadLimit(userId);
    if (!canDownload.allowed) {
      throw new ForbiddenException(canDownload.message);
    }

    const download = await this.prisma.download.create({
      data: {
        userId,
        assetId,
        ipAddress,
        userAgent,
      },
    });

    await this.prisma.asset.update({
      where: { id: assetId },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    return {
      download,
      asset,
      downloadUrl: asset.fileUrl,
      remainingDownloads: canDownload.remainingDownloads - 1,
    };
  }

  async checkDownloadLimit(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userSubscriptions: {
          where: {
            isActive: true,
            endDate: { gt: new Date() },
          },
          include: { plan: true },
        },
      },
    });

    if (!user) {
      return {
        allowed: false,
        message: 'User not found',
        remainingDownloads: 0,
      };
    }

    if (user.role === 'ADMIN') {
      return {
        allowed: true,
        message: 'Admin has unlimited downloads',
        remainingDownloads: -1,
      };
    }

    const activeSubscription = user.userSubscriptions.find(
      (sub) => sub.isActive && sub.endDate > new Date(),
    );

    if (!activeSubscription) {
      return {
        allowed: false,
        message: 'No active subscription found',
        remainingDownloads: 0,
      };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayDownloads = await this.prisma.download.count({
      where: {
        userId,
        downloadedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const dailyLimit = activeSubscription.plan.dailyDownloadLimit;
    const remainingDownloads = dailyLimit - todayDownloads;

    if (remainingDownloads <= 0) {
      return {
        allowed: false,
        message: `Daily download limit of ${dailyLimit} reached. Limit resets at midnight.`,
        remainingDownloads: 0,
      };
    }

    return {
      allowed: true,
      message: 'Download allowed',
      remainingDownloads,
    };
  }

  async getUserDownloadHistory(
    userId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const [downloads, total] = await Promise.all([
      this.prisma.download.findMany({
        where: { userId },
        include: {
          asset: {
            select: {
              id: true,
              name: true,
              thumbnail: true,
              category: {
                select: { name: true },
              },
            },
          },
        },
        orderBy: { downloadedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.download.count({ where: { userId } }),
    ]);

    return {
      downloads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getTodayDownloadCount(userId: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.prisma.download.count({
      where: {
        userId,
        downloadedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  }

  async getDownloadStats(userId: number) {
    const [todayCount, totalCount, limitInfo] = await Promise.all([
      this.getTodayDownloadCount(userId),
      this.prisma.download.count({ where: { userId } }),
      this.checkDownloadLimit(userId),
    ]);

    return {
      todayDownloads: todayCount,
      totalDownloads: totalCount,
      dailyLimit: limitInfo.remainingDownloads + todayCount,
      remainingDownloads: limitInfo.remainingDownloads,
      canDownload: limitInfo.allowed,
    };
  }

  async getAllDownloads(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [downloads, total] = await Promise.all([
      this.prisma.download.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
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
        skip,
        take: limit,
      }),
      this.prisma.download.count(),
    ]);

    return {
      downloads,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }
}
