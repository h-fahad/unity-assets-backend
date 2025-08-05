import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { PrismaService } from '../common/prisma.service';
import { FileUploadService } from './file-upload.service';

@Module({
  controllers: [AssetsController],
  providers: [AssetsService, PrismaService, FileUploadService],
  exports: [AssetsService],
})
export class AssetsModule {} 