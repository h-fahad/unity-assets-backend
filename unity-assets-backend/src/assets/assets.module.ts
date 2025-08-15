import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from '../common/prisma.service';
import { FileUploadService } from './file-upload.service';
import { S3Module } from '../s3/s3.module';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [S3Module, ActivityModule],
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService, FileUploadService],
  exports: [AssetsService],
})
export class AssetsModule {}
