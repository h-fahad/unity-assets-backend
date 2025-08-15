import { createBackup } from './backup-database';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Auto-backup hook that runs before any risky operations
 * This ensures data is always backed up before making changes
 */
async function autoBackup(operation: string) {
  try {
    console.log(`🛡️  AUTO-BACKUP: Starting backup before ${operation}...`);
    
    const backupFile = await createBackup();
    
    // Keep last 10 backups only to save space
    const backupDir = path.join(__dirname, '..', 'backups');
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('backup-') && f.endsWith('.json'))
      .sort()
      .reverse();
    
    if (files.length > 10) {
      const filesToDelete = files.slice(10);
      filesToDelete.forEach(file => {
        fs.unlinkSync(path.join(backupDir, file));
        console.log(`🗑️  Cleaned up old backup: ${file}`);
      });
    }
    
    console.log(`✅ AUTO-BACKUP: Data safely backed up before ${operation}`);
    return backupFile;
    
  } catch (error) {
    console.error(`❌ AUTO-BACKUP FAILED for ${operation}:`, error.message);
    throw error;
  }
}

export { autoBackup };