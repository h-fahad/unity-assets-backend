import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@unityassets.com' },
    update: {},
    create: {
      email: 'admin@unityassets.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      password: hashedPassword,
      role: 'USER',
    },
  });

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'characters' },
      update: {},
      create: {
        name: 'Characters',
        description: 'Character models and animations',
        slug: 'characters',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'environments' },
      update: {},
      create: {
        name: 'Environments',
        description: 'Environment assets and scenes',
        slug: 'environments',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'props' },
      update: {},
      create: {
        name: 'Props',
        description: 'Props and decorative objects',
        slug: 'props',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'effects' },
      update: {},
      create: {
        name: 'Effects',
        description: 'Visual effects and particles',
        slug: 'effects',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'audio' },
      update: {},
      create: {
        name: 'Audio',
        description: 'Music and sound effects',
        slug: 'audio',
      },
    }),
  ]);

  const plans = await Promise.all([
    prisma.subscriptionPlan.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Basic',
        description: 'Perfect for individual developers',
        basePrice: 9.99,
        billingCycle: 'MONTHLY',
        dailyDownloadLimit: 5,
        features: ['5 downloads per day', 'Standard support', 'Access to basic assets'],
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Pro',
        description: 'Great for small teams',
        basePrice: 19.99,
        billingCycle: 'MONTHLY',
        dailyDownloadLimit: 20,
        features: ['20 downloads per day', 'Priority support', 'Access to premium assets', 'Commercial license'],
      },
    }),
    prisma.subscriptionPlan.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Enterprise',
        description: 'Unlimited access for large teams',
        basePrice: 99.99,
        billingCycle: 'MONTHLY',
        yearlyDiscount: 20,
        dailyDownloadLimit: 100,
        features: ['100 downloads per day', '24/7 support', 'All assets included', 'Extended commercial license', 'Custom integrations'],
      },
    }),
  ]);

  const assets = await Promise.all([
    prisma.asset.create({
      data: {
        name: 'Medieval Knight Character',
        description: 'High-quality medieval knight character with animations',
        fileUrl: '/uploads/knight.unitypackage',
        thumbnail: '/uploads/knight-thumb.png',
        tags: ['character', 'medieval', 'knight', 'animated'],
        categoryId: categories[0].id,
        uploadedById: admin.id,
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Forest Environment Pack',
        description: 'Complete forest environment with trees, rocks, and terrain',
        fileUrl: '/uploads/forest.unitypackage',
        thumbnail: '/uploads/forest-thumb.png',
        tags: ['environment', 'forest', 'nature', 'trees'],
        categoryId: categories[1].id,
        uploadedById: admin.id,
      },
    }),
    prisma.asset.create({
      data: {
        name: 'Magic Particle Effects',
        description: 'Collection of magical particle effects and shaders',
        fileUrl: '/uploads/magic-effects.unitypackage',
        thumbnail: '/uploads/magic-thumb.png',
        tags: ['effects', 'particles', 'magic', 'shaders'],
        categoryId: categories[3].id,
        uploadedById: admin.id,
      },
    }),
  ]);

  const subscription = await prisma.userSubscription.create({
    data: {
      userId: user.id,
      planId: plans[1].id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log(`👤 Admin user: ${admin.email}`);
  console.log(`👤 Test user: ${user.email}`);
  console.log(`📂 Created ${categories.length} categories`);
  console.log(`💰 Created ${plans.length} subscription plans`);
  console.log(`🎮 Created ${assets.length} assets`);
  console.log(`📋 Created 1 user subscription`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
