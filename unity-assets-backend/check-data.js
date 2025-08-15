const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkData() {
  try {
    const userCount = await prisma.user.count();
    const assetCount = await prisma.asset.count();
    const categoryCount = await prisma.category.count();
    const activityCount = await prisma.activity.count();
    
    console.log('=== Database Status ===');
    console.log(`Users: ${userCount}`);
    console.log(`Assets: ${assetCount}`);
    console.log(`Categories: ${categoryCount}`);
    console.log(`Activities: ${activityCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: { id: true, email: true, role: true }
      });
      console.log('\n=== Users ===');
      users.forEach(user => {
        console.log(`${user.id}: ${user.email} (${user.role})`);
      });
    }
    
  } catch (error) {
    console.error('Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();