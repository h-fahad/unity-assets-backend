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

async function createBackup() {
  try {
    console.log('🔄 Creating database backup...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups');
    
    // Create backups directory if it doesn't exist
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Fetch all data
    const [users, categories, assets, subscriptionPlans, userSubscriptions, downloads, activities, analytics] = await Promise.all([
      prisma.user.findMany(),
      prisma.category.findMany(),
      prisma.asset.findMany(),
      prisma.subscriptionPlan.findMany(),
      prisma.userSubscription.findMany({ include: { plan: true, user: true } }),
      prisma.download.findMany({ include: { user: true, asset: true } }),
      prisma.activity.findMany(),
      prisma.analytics.findMany().catch(() => []), // Analytics might not exist
    ]);

    const backupData: BackupData = {
      timestamp,
      users: users.map(u => ({ ...u, password: '[HASHED]' })), // Don't expose passwords in backup
      categories,
      assets,
      subscriptionPlans,
      userSubscriptions,
      downloads,
      activities,
      analytics,
    };

    const backupFile = path.join(backupDir, `backup-${timestamp}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));
    
    // Also create a latest backup
    const latestBackupFile = path.join(backupDir, 'latest-backup.json');
    fs.writeFileSync(latestBackupFile, JSON.stringify(backupData, null, 2));

    console.log('✅ Database backup created successfully!');
    console.log(`📁 Backup saved to: ${backupFile}`);
    console.log(`📊 Backed up:`);
    console.log(`   - ${users.length} users`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${assets.length} assets`);
    console.log(`   - ${subscriptionPlans.length} subscription plans`);
    console.log(`   - ${userSubscriptions.length} user subscriptions`);
    console.log(`   - ${downloads.length} downloads`);
    console.log(`   - ${activities.length} activities`);
    console.log(`   - ${analytics.length} analytics records`);
    
    return backupFile;
  } catch (error) {
    console.error('❌ Error creating backup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow this script to be run directly
if (require.main === module) {
  createBackup().catch(console.error);
}

export { createBackup };