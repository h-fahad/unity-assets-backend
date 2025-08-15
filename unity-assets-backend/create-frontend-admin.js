const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createFrontendAdmin() {
  try {
    console.log('Creating frontend demo admin...');
    
    const email = 'admin@example.com';
    const password = 'admin123';
    
    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('Frontend admin already exists');
      return;
    }

    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.user.create({
      data: {
        email,
        name: 'Demo Admin',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Frontend demo admin created!');
    console.log(`Email: ${admin.email}`);
    console.log(`Password: ${password}`);

  } catch (error) {
    console.error('Error creating frontend admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createFrontendAdmin();