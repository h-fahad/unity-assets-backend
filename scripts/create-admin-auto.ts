import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminAuto() {
  try {
    console.log('🔐 Creating Admin Account Automatically');
    console.log('=====================================\n');

    const email = 'admin@unityassets.com';
    const name = 'Admin';
    const password = 'Admin@123';

    // Check if admin already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      console.log('✅ Admin account already exists');
      console.log(`👤 Email: ${existing.email}`);
      console.log(`👤 Name: ${existing.name}`);
      console.log(`🔑 Role: ${existing.role}`);
      return;
    }

    // Hash password and create admin
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const admin = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin account created successfully!');
    console.log(`👤 Email: ${admin.email}`);
    console.log(`👤 Name: ${admin.name}`);
    console.log(`🔑 Role: ${admin.role}`);
    console.log(`🔑 Password: ${password}`);
    console.log('\nYou can now login with these credentials.');

  } catch (error) {
    console.error('❌ Error creating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminAuto(); 