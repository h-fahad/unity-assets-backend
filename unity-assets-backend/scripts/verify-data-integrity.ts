import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyDataIntegrity() {
  try {
    console.log('🔍 VERIFYING DATA INTEGRITY');
    console.log('============================\n');

    // Check all tables
    const [users, categories, assets, subscriptionPlans, userSubscriptions, downloads, activities] = await Promise.all([
      prisma.user.count(),
      prisma.category.count(), 
      prisma.asset.count(),
      prisma.subscriptionPlan.count(),
      prisma.userSubscription.count(),
      prisma.download.count(),
      prisma.activity.count(),
    ]);

    const totalRecords = users + categories + assets + subscriptionPlans + userSubscriptions + downloads + activities;

    console.log('📊 Record Counts:');
    console.log(`   👥 Users: ${users}`);
    console.log(`   📁 Categories: ${categories}`);
    console.log(`   🎮 Assets: ${assets}`);
    console.log(`   💰 Subscription Plans: ${subscriptionPlans}`);
    console.log(`   📋 User Subscriptions: ${userSubscriptions}`);
    console.log(`   ⬇️  Downloads: ${downloads}`);
    console.log(`   📊 Activities: ${activities}`);
    console.log(`   📈 Total Records: ${totalRecords}`);

    // Check for admin users
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { email: true, name: true }
    });

    console.log('\n👑 Admin Users:');
    if (adminUsers.length === 0) {
      console.log('   ⚠️  WARNING: No admin users found!');
    } else {
      adminUsers.forEach(admin => {
        console.log(`   ✅ ${admin.email} (${admin.name})`);
      });
    }

    // Check for sample data
    console.log('\n🔗 Checking Data Relationships:');
    try {
      const sampleAsset = await prisma.asset.findFirst({
        include: {
          category: true,
          uploadedBy: { select: { email: true } }
        }
      });
      
      if (sampleAsset) {
        console.log(`   ✅ Sample asset "${sampleAsset.name}" has category "${sampleAsset.category.name}" by ${sampleAsset.uploadedBy.email}`);
      } else {
        console.log('   ℹ️  No assets found to verify relationships');
      }
    } catch (error) {
      console.log('   ⚠️  Could not verify relationships');
    }

    // Status summary
    console.log('\n🎯 INTEGRITY STATUS:');
    if (totalRecords === 0) {
      console.log('   🚨 CRITICAL: Database appears to be empty!');
      console.log('   💡 Run: npm run seed');
      return false;
    } else if (adminUsers.length === 0) {
      console.log('   ⚠️  WARNING: No admin users found');
      console.log('   💡 Run: npm run create-admin-auto');
      return false;
    } else {
      console.log('   ✅ Database integrity looks good!');
      return true;
    }

  } catch (error) {
    console.error('❌ Error verifying data integrity:', error.message);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

// Allow this script to be run directly
if (require.main === module) {
  verifyDataIntegrity().then(isHealthy => {
    if (!isHealthy) {
      process.exit(1);
    }
  });
}

export { verifyDataIntegrity };