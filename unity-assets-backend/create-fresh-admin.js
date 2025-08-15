const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createFreshAdmin() {
  try {
    console.log('🔧 Creating Fresh Admin User...');
    console.log('=================================\n');
    
    const email = 'admin@example.com';
    const password = 'admin123';
    const name = 'Demo Admin';
    
    // Delete existing admin if exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      await prisma.user.delete({ where: { email } });
      console.log('🗑️  Deleted existing admin');
    }

    // Create fresh admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
      },
    });

    console.log('✅ Fresh admin created successfully!');
    console.log(`👤 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🔑 Password: ${password}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🟢 Active: ${admin.isActive}`);
    console.log('\n🚀 You can now login with these credentials!');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFreshAdmin();