import { PrismaClient, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

async function createSampleActivities() {
  console.log('Creating sample activities...');

  // Sample activities for demonstration
  const activities = [
    {
      type: ActivityType.USER_REGISTERED,
      message: "New user 'developer123@example.com' registered",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      type: ActivityType.ASSET_UPLOADED,
      message: "New asset 'Forest Environment Pack' uploaded",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    },
    {
      type: ActivityType.ASSET_DOWNLOADED,
      message: "Asset 'Character Models' downloaded",
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    },
    {
      type: ActivityType.ASSET_MILESTONE,
      message: "Asset 'UI Elements Pack' reached 50 downloads",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
    },
    {
      type: ActivityType.USER_SUBSCRIPTION,
      message: "User 'gamedev_studio@example.com' subscribed to Premium Plan",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    },
    {
      type: ActivityType.PAYMENT_PROCESSED,
      message: "Payment of $29.99 processed for Premium Plan",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4.5), // 4.5 hours ago
    },
    {
      type: ActivityType.ASSET_DOWNLOADED,
      message: "Asset 'Particle Effects' downloaded",
      createdAt: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    },
    {
      type: ActivityType.SYSTEM_EVENT,
      message: "Daily backup completed successfully",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
    },
    {
      type: ActivityType.CATEGORY_UPDATED,
      message: "Category 'Environment' updated with 5 new assets",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    },
    {
      type: ActivityType.ASSET_MILESTONE,
      message: "Asset 'Medieval Castle Pack' reached 100 downloads",
      createdAt: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
    },
  ];

  for (const activity of activities) {
    await prisma.activity.create({
      data: activity,
    });
  }

  console.log(`Created ${activities.length} sample activities`);
}

createSampleActivities()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });