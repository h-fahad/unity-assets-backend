import { Module } from '@nestjs/common';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [PackagesController],
  providers: [PackagesService, PrismaService],
  exports: [PackagesService],
})
export class PackagesModule {} 