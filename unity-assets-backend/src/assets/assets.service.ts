import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { CreateAssetDto } from './dto/create-asset.dto';
import { UpdateAssetDto } from './dto/update-asset.dto';
import { S3Service } from '../s3/s3.service';
import { ActivityService } from '../activity/activity.service';

@Injectable()
export class AssetsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly activityService: ActivityService,
  ) {}

  async findAll(
    categoryId?: number,
    page: number = 1,
    limit: number = 20,
    includeInactive: boolean = false,
  ) {
    const skip = (page - 1) * limit;

    const where: any = includeInactive ? {} : { isActive: true };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, email: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { downloads: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        uploadedBy: { select: { id: true, email: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { downloads: true } },
      },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    return asset;
  }

  async create(dto: CreateAssetDto, uploadedById: number) {
    await this.prisma.category.findUniqueOrThrow({
      where: { id: dto.categoryId },
    });

    const asset = await this.prisma.asset.create({
      data: {
        ...dto,
        uploadedById,
        fileUrl: dto.fileUrl || '',
        thumbnail: dto.thumbnail || '',
        tags: dto.tags || [],
      },
      include: {
        category: { select: { id: true, name: true, slug: true } },
        uploadedBy: { select: { id: true, email: true, name: true } },
      },
    });

    // Log asset upload activity
    await this.activityService.logAssetUpload(asset.id, asset.name, uploadedById);

    return asset;
  }

  async update(id: number, dto: UpdateAssetDto) {
    const asset = await this.findOne(id);

    if (dto.categoryId && dto.categoryId !== asset.categoryId) {
      await this.prisma.category.findUniqueOrThrow({
        where: { id: dto.categoryId },
      });
    }

    return this.prisma.asset.update({
      where: { id },
      data: dto,
      include: {
        category: { select: { id: true, name: true, slug: true } },
        uploadedBy: { select: { id: true, email: true, name: true } },
      },
    });
  }

  async remove(id: number) {
    const asset = await this.findOne(id);

    const downloadCount = await this.prisma.download.count({
      where: { assetId: id },
    });

    if (downloadCount > 0) {
      throw new ConflictException(
        'Cannot delete asset with existing downloads. Deactivate instead.',
      );
    }

    // Delete files from S3 if they exist
    if (process.env.AWS_S3_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID) {
      try {
        if (asset.thumbnail) {
          const thumbnailKey = this.s3Service.extractKeyFromUrl(
            asset.thumbnail,
          );
          if (thumbnailKey) {
            await this.s3Service.deleteFile(thumbnailKey);
          }
        }

        if (asset.fileUrl) {
          const fileKey = this.s3Service.extractKeyFromUrl(asset.fileUrl);
          if (fileKey) {
            await this.s3Service.deleteFile(fileKey);
          }
        }
      } catch (error) {
        console.warn('Failed to delete files from S3:', error);
        // Continue with database deletion even if S3 deletion fails
      }
    }

    return this.prisma.asset.delete({ where: { id } });
  }

  async deactivate(id: number) {
    await this.findOne(id);
    return this.prisma.asset.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: number) {
    await this.findOne(id);
    return this.prisma.asset.update({
      where: { id },
      data: { isActive: true },
    });
  }

  async search(
    query: string,
    categoryId?: number,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
      ],
    };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where,
        include: {
          uploadedBy: { select: { id: true, email: true, name: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { downloads: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({ where }),
    ]);

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getPopularAssets(limit: number = 10) {
    return this.prisma.asset.findMany({
      where: { isActive: true },
      include: {
        uploadedBy: { select: { id: true, email: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { downloads: true } },
      },
      orderBy: {
        downloads: { _count: 'desc' },
      },
      take: limit,
    });
  }

  async getRecentAssets(limit: number = 10) {
    return this.prisma.asset.findMany({
      where: { isActive: true },
      include: {
        uploadedBy: { select: { id: true, email: true, name: true } },
        category: { select: { id: true, name: true, slug: true } },
        _count: { select: { downloads: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getAssetsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 20,
  ) {
    return this.findAll(categoryId, page, limit);
  }

  async getUserAssets(userId: number, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [assets, total] = await Promise.all([
      this.prisma.asset.findMany({
        where: { uploadedById: userId },
        include: {
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { downloads: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.asset.count({ where: { uploadedById: userId } }),
    ]);

    return {
      assets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async getAssetStats() {
    const [total, active, byCategory] = await Promise.all([
      this.prisma.asset.count(),
      this.prisma.asset.count({ where: { isActive: true } }),
      this.prisma.asset.groupBy({
        by: ['categoryId'],
        _count: { id: true },
      }),
    ]);

    const categoriesWithCounts = await Promise.all(
      byCategory.map(async (item) => {
        const category = await this.prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true },
        });
        return {
          categoryName: category?.name || 'Unknown',
          count: item._count.id,
        };
      }),
    );

    return {
      total,
      active,
      inactive: total - active,
      byCategory: categoriesWithCounts,
    };
  }

  // Legacy method for backward compatibility
  async download(assetId: number, userId: number) {
    const asset = await this.findOne(assetId);

    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: new Date() },
      },
      include: { plan: true },
    });

    if (!activeSubscription) {
      throw new ForbiddenException(
        'You need an active subscription to download assets',
      );
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

    if (todayDownloads >= activeSubscription.plan.dailyDownloadLimit) {
      throw new ForbiddenException(
        `Daily download limit of ${activeSubscription.plan.dailyDownloadLimit} reached. Try again tomorrow.`,
      );
    }

    await this.prisma.download.create({
      data: {
        userId,
        assetId,
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
      downloadUrl: asset.fileUrl,
      asset,
      message: 'Download started',
      remainingDownloads:
        activeSubscription.plan.dailyDownloadLimit - todayDownloads - 1,
    };
  }

  async getUserDownloadStatus(userId: number) {
    const activeSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        isActive: true,
        endDate: { gt: new Date() },
      },
      include: { plan: true },
    });

    if (!activeSubscription) {
      return {
        hasActiveSubscription: false,
        dailyLimit: 0,
        downloadsToday: 0,
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

    return {
      hasActiveSubscription: true,
      subscriptionPlan: activeSubscription.plan.name,
      dailyLimit: activeSubscription.plan.dailyDownloadLimit,
      downloadsToday: todayDownloads,
      remainingDownloads: Math.max(
        0,
        activeSubscription.plan.dailyDownloadLimit - todayDownloads,
      ),
      subscriptionEndDate: activeSubscription.endDate,
    };
  }
}
