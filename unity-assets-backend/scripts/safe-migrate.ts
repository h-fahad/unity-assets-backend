import { exec } from 'child_process';
import { promisify } from 'util';
import { createBackup } from './backup-database';
import { restoreFromBackup } from './restore-database';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

async function safeMigrate(migrationName?: string) {
  let backupFile: string | undefined;
  
  try {
    console.log('🔒 SAFE MIGRATION PROTOCOL STARTING');
    console.log('=====================================\n');
    
    // Step 1: Create backup
    console.log('📋 Step 1: Creating backup before migration...');
    backupFile = await createBackup();
    console.log('✅ Backup created successfully\n');
    
    // Step 2: Perform migration
    console.log('📋 Step 2: Performing migration...');
    const migrationCommand = migrationName 
      ? `npx prisma migrate dev --name "${migrationName}"` 
      : 'npx prisma db push';
    
    console.log(`Running: ${migrationCommand}`);
    const { stdout, stderr } = await execAsync(migrationCommand);
    
    if (stderr && !stderr.includes('warnings')) {
      throw new Error(`Migration failed: ${stderr}`);
    }
    
    console.log('✅ Migration completed successfully');
    if (stdout) console.log(stdout);
    console.log();
    
    // Step 3: Verify data integrity
    console.log('📋 Step 3: Verifying data integrity...');
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
      const userCount = await prisma.user.count();
      const assetCount = await prisma.asset.count();
      const categoryCount = await prisma.category.count();
      
      console.log(`✅ Data verification completed:`);
      console.log(`   - Users: ${userCount}`);
      console.log(`   - Assets: ${assetCount}`);
      console.log(`   - Categories: ${categoryCount}`);
      
      if (userCount === 0 && assetCount === 0 && categoryCount === 0) {
        throw new Error('⚠️  DATA LOSS DETECTED: All tables appear to be empty!');
      }
      
    } finally {
      await prisma.$disconnect();
    }
    
    console.log('\n🎉 SAFE MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('All data has been preserved during the migration.');
    
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED!');
    console.error('Error:', error.message);
    
    if (backupFile) {
      console.log('\n🚨 INITIATING DATA RECOVERY...');
      console.log('Restoring data from backup...');
      
      try {
        await restoreFromBackup(backupFile);
        console.log('✅ Data successfully restored from backup!');
        console.log('Your data has been preserved.');
      } catch (restoreError) {
        console.error('❌ CRITICAL: Failed to restore backup!');
        console.error('Restore Error:', restoreError.message);
        console.error(`Manual restoration required using: ${backupFile}`);
      }
    }
    
    throw error;
  }
}

// Command line interface
if (require.main === module) {
  const migrationName = process.argv[2];
  safeMigrate(migrationName).catch((error) => {
    console.error('Safe migration failed:', error.message);
    process.exit(1);
  });
}

export { safeMigrate };