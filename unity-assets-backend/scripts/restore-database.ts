import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface BackupData {
  timestamp: string;
  users: any[];
  categories: any[];
  assets: any[];
  subscriptionPlans: any[];
  userSubscriptions: any[];
  downloads: any[];
  activities: any[];
  analytics: any[];
}

async function restoreFromBackup(backupFile?: string) {
  try {
    console.log('🔄 Restoring database from backup...');
    
    const backupDir = path.join(__dirname, '..', 'backups');
    const targetFile = backupFile || path.join(backupDir, 'latest-backup.json');
    
    if (!fs.existsSync(targetFile)) {
      throw new Error(`Backup file not found: ${targetFile}`);
    }

    const backupData: BackupData = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
    
    console.log(`📁 Restoring from backup: ${backupData.timestamp}`);
    
    // Clear existing data (in reverse dependency order)
    await prisma.download.deleteMany();
    await prisma.userSubscription.deleteMany();
    await prisma.activity.deleteMany();
    await prisma.asset.deleteMany();
    await prisma.category.deleteMany();
    await prisma.subscriptionPlan.deleteMany();
    await prisma.user.deleteMany();
    if (backupData.analytics?.length > 0) {
      await prisma.analytics.deleteMany();
    }

    console.log('🗑️  Cleared existing data');

    // Restore data (in dependency order)
    console.log('📝 Restoring users...');
    for (const user of backupData.users) {
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          password: user.password === '[HASHED]' ? user.password : user.password,
          role: user.role,
          isActive: user.isActive,
          resetToken: user.resetToken,
          resetTokenExpiry: user.resetTokenExpiry ? new Date(user.resetTokenExpiry) : null,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
      });
    }

    console.log('📁 Restoring categories...');
    for (const category of backupData.categories) {
      await prisma.category.create({
        data: {
          id: category.id,
          name: category.name,
          description: category.description,
          slug: category.slug,
          isActive: category.isActive,
          createdAt: new Date(category.createdAt),
          updatedAt: new Date(category.updatedAt),
        },
      });
    }

    console.log('💰 Restoring subscription plans...');
    for (const plan of backupData.subscriptionPlans) {
      await prisma.subscriptionPlan.create({
        data: {
          id: plan.id,
          name: plan.name,
          description: plan.description,
          basePrice: plan.basePrice,
          billingCycle: plan.billingCycle,
          yearlyDiscount: plan.yearlyDiscount,
          dailyDownloadLimit: plan.dailyDownloadLimit,
          features: plan.features,
          isActive: plan.isActive,
          createdAt: new Date(plan.createdAt),
          updatedAt: new Date(plan.updatedAt),
        },
      });
    }

    console.log('🎮 Restoring assets...');
    for (const asset of backupData.assets) {
      await prisma.asset.create({
        data: {
          id: asset.id,
          name: asset.name,
          description: asset.description,
          fileUrl: asset.fileUrl,
          thumbnail: asset.thumbnail,
          tags: asset.tags,
          isActive: asset.isActive,
          downloadCount: asset.downloadCount,
          categoryId: asset.categoryId,
          uploadedById: asset.uploadedById,
          createdAt: new Date(asset.createdAt),
          updatedAt: new Date(asset.updatedAt),
        },
      });
    }

    console.log('📋 Restoring user subscriptions...');
    for (const subscription of backupData.userSubscriptions) {
      await prisma.userSubscription.create({
        data: {
          id: subscription.id,
          userId: subscription.userId,
          planId: subscription.planId,
          startDate: new Date(subscription.startDate),
          endDate: new Date(subscription.endDate),
          isActive: subscription.isActive,
          stripeSubscriptionId: subscription.stripeSubscriptionId,
          createdAt: new Date(subscription.createdAt),
          updatedAt: new Date(subscription.updatedAt),
        },
      });
    }

    console.log('⬇️  Restoring downloads...');
    for (const download of backupData.downloads) {
      await prisma.download.create({
        data: {
          id: download.id,
          userId: download.userId,
          assetId: download.assetId,
          downloadedAt: new Date(download.downloadedAt),
          ipAddress: download.ipAddress,
          userAgent: download.userAgent,
        },
      });
    }

    console.log('📊 Restoring activities...');
    for (const activity of backupData.activities) {
      await prisma.activity.create({
        data: {
          id: activity.id,
          type: activity.type,
          message: activity.message,
          userId: activity.userId,
          assetId: activity.assetId,
          metadata: activity.metadata,
          createdAt: new Date(activity.createdAt),
        },
      });
    }

    if (backupData.analytics?.length > 0) {
      console.log('📈 Restoring analytics...');
      for (const analytic of backupData.analytics) {
        await prisma.analytics.create({
          data: {
            id: analytic.id,
            date: new Date(analytic.date),
            metric: analytic.metric,
            value: analytic.value,
            metadata: analytic.metadata,
            createdAt: new Date(analytic.createdAt),
          },
        });
      }
    }

    console.log('✅ Database restored successfully!');
    console.log(`📊 Restored:`);
    console.log(`   - ${backupData.users.length} users`);
    console.log(`   - ${backupData.categories.length} categories`);
    console.log(`   - ${backupData.assets.length} assets`);
    console.log(`   - ${backupData.subscriptionPlans.length} subscription plans`);
    console.log(`   - ${backupData.userSubscriptions.length} user subscriptions`);
    console.log(`   - ${backupData.downloads.length} downloads`);
    console.log(`   - ${backupData.activities.length} activities`);
    console.log(`   - ${backupData.analytics?.length || 0} analytics records`);
    
  } catch (error) {
    console.error('❌ Error restoring backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow this script to be run directly
if (require.main === module) {
  const backupFile = process.argv[2]; // Optional backup file path
  restoreFromBackup(backupFile).catch(console.error);
}

export { restoreFromBackup };