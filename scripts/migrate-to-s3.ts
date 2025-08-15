import { PrismaClient } from '@prisma/client';
import { S3Service } from '../src/s3/s3.service';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const prisma = new PrismaClient();
const s3Service = new S3Service();

async function migrateLocalFilesToS3() {
  console.log('Starting migration of local files to S3...');

  if (!process.env.AWS_S3_BUCKET_NAME || !process.env.AWS_ACCESS_KEY_ID) {
    console.error('AWS S3 configuration is missing. Please set AWS environment variables.');
    process.exit(1);
  }

  try {
    // Get all assets with local file paths
    const assets = await prisma.asset.findMany({
      where: {
        OR: [
          { thumbnail: { startsWith: '/uploads/' } },
          { fileUrl: { startsWith: '/uploads/' } },
          { thumbnail: { not: { contains: 'https://' } } },
          { fileUrl: { not: { contains: 'https://' } } },
        ]
      }
    });

    console.log(`Found ${assets.length} assets with local files to migrate.`);

    for (const asset of assets) {
      console.log(`\nProcessing asset: ${asset.name} (ID: ${asset.id})`);
      
      let newThumbnailUrl = asset.thumbnail;
      let newFileUrl = asset.fileUrl;
      let hasUpdates = false;

      // Migrate thumbnail
      if (asset.thumbnail && !asset.thumbnail.startsWith('https://')) {
        const thumbnailPath = asset.thumbnail.startsWith('/uploads/') 
          ? asset.thumbnail.slice(9) // Remove '/uploads/' prefix
          : asset.thumbnail;
        
        const localFilePath = join(__dirname, '..', 'uploads', thumbnailPath);
        
        if (existsSync(localFilePath)) {
          try {
            console.log(`  Migrating thumbnail: ${thumbnailPath}`);
            const fileBuffer = readFileSync(localFilePath);
            const s3Key = s3Service.generateUniqueKey('thumbnail', thumbnailPath);
            
            // Create a mock file object for the S3 service
            const mockFile = {
              buffer: fileBuffer,
              mimetype: getMimeType(thumbnailPath),
              originalname: thumbnailPath,
            } as Express.Multer.File;

            newThumbnailUrl = await s3Service.uploadFile(mockFile, s3Key);
            console.log(`  ✓ Thumbnail migrated to: ${newThumbnailUrl}`);
            hasUpdates = true;
          } catch (error) {
            console.error(`  ✗ Failed to migrate thumbnail: ${error.message}`);
          }
        } else {
          console.warn(`  ⚠ Thumbnail file not found: ${localFilePath}`);
        }
      }

      // Migrate asset file
      if (asset.fileUrl && !asset.fileUrl.startsWith('https://')) {
        const filePath = asset.fileUrl.startsWith('/uploads/') 
          ? asset.fileUrl.slice(9) // Remove '/uploads/' prefix
          : asset.fileUrl;
        
        const localFilePath = join(__dirname, '..', 'uploads', filePath);
        
        if (existsSync(localFilePath)) {
          try {
            console.log(`  Migrating asset file: ${filePath}`);
            const fileBuffer = readFileSync(localFilePath);
            const s3Key = s3Service.generateUniqueKey('assetFile', filePath);
            
            // Create a mock file object for the S3 service
            const mockFile = {
              buffer: fileBuffer,
              mimetype: getMimeType(filePath),
              originalname: filePath,
            } as Express.Multer.File;

            newFileUrl = await s3Service.uploadFile(mockFile, s3Key);
            console.log(`  ✓ Asset file migrated to: ${newFileUrl}`);
            hasUpdates = true;
          } catch (error) {
            console.error(`  ✗ Failed to migrate asset file: ${error.message}`);
          }
        } else {
          console.warn(`  ⚠ Asset file not found: ${localFilePath}`);
        }
      }

      // Update database with new URLs
      if (hasUpdates) {
        await prisma.asset.update({
          where: { id: asset.id },
          data: {
            thumbnail: newThumbnailUrl,
            fileUrl: newFileUrl,
          },
        });
        console.log(`  ✓ Database updated for asset ${asset.id}`);
      }
    }

    console.log('\n✅ Migration completed successfully!');
    console.log('You can now safely remove the local uploads directory if desired.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'avi': 'video/x-msvideo',
    'unitypackage': 'application/octet-stream',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

// Run the migration
if (require.main === module) {
  migrateLocalFilesToS3();
}