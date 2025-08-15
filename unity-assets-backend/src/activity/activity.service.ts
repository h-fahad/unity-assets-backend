import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ActivityType } from '@prisma/client';

export interface CreateActivityDto {
  type: ActivityType;
  message: string;
  userId?: number;
  assetId?: number;
  metadata?: any;
}

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async createActivity(data: CreateActivityDto) {
    return this.prisma.activity.create({
      data: {
        type: data.type,
        message: data.message,
        userId: data.userId,
        assetId: data.assetId,
        metadata: data.metadata,
      },
    });
  }

  async getRecentActivities(limit: number = 10) {
    return this.prisma.activity.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
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
          },
        },
      },
    });
  }

  async getActivitiesByType(type: ActivityType, limit: number = 10) {
    return this.prisma.activity.findMany({
      where: { type },
      take: limit,
      orderBy: { createdAt: 'desc' },
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
          },
        },
      },
    });
  }

  async getActivitiesForUser(userId: number, limit: number = 10) {
    return this.prisma.activity.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        asset: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Helper methods for creating specific activity types
  async logUserRegistration(userId: number, userEmail: string) {
    return this.createActivity({
      type: 'USER_REGISTERED',
      message: `New user '${userEmail}' registered`,
      userId,
    });
  }

  async logAssetUpload(assetId: number, assetName: string, userId: number) {
    return this.createActivity({
      type: 'ASSET_UPLOADED',
      message: `New asset '${assetName}' uploaded`,
      userId,
      assetId,
    });
  }

  async logAssetDownload(assetId: number, assetName: string, userId: number) {
    return this.createActivity({
      type: 'ASSET_DOWNLOADED',
      message: `Asset '${assetName}' downloaded`,
      userId,
      assetId,
    });
  }

  async logAssetMilestone(assetId: number, assetName: string, downloads: number) {
    return this.createActivity({
      type: 'ASSET_MILESTONE',
      message: `Asset '${assetName}' reached ${downloads} downloads`,
      assetId,
      metadata: { downloads },
    });
  }

  async logSubscription(userId: number, userEmail: string, planName: string) {
    return this.createActivity({
      type: 'USER_SUBSCRIPTION',
      message: `User '${userEmail}' subscribed to ${planName}`,
      userId,
      metadata: { planName },
    });
  }

  async logSubscriptionCancellation(userId: number, userEmail: string, planName: string) {
    return this.createActivity({
      type: 'USER_SUBSCRIPTION_CANCELLED',
      message: `User '${userEmail}' cancelled ${planName} subscription`,
      userId,
      metadata: { planName },
    });
  }

  async logPaymentProcessed(userId: number, amount: number, planName: string) {
    return this.createActivity({
      type: 'PAYMENT_PROCESSED',
      message: `Payment of $${amount} processed for ${planName}`,
      userId,
      metadata: { amount, planName },
    });
  }

  async logCategoryUpdate(categoryName: string, assetCount: number) {
    return this.createActivity({
      type: 'CATEGORY_UPDATED',
      message: `Category '${categoryName}' updated with ${assetCount} assets`,
      metadata: { categoryName, assetCount },
    });
  }

  async logSystemEvent(message: string, metadata?: any) {
    return this.createActivity({
      type: 'SYSTEM_EVENT',
      message,
      metadata,
    });
  }
}