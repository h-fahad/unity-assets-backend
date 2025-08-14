import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [DownloadsController],
  providers: [DownloadsService, PrismaService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
