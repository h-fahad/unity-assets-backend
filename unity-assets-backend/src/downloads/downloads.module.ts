import { Module } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { DownloadsController } from './downloads.controller';
import { PrismaService } from '../common/prisma.service';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [ActivityModule],
  controllers: [DownloadsController],
  providers: [DownloadsService, PrismaService],
  exports: [DownloadsService],
})
export class DownloadsModule {}
