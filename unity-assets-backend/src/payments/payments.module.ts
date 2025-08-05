import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { StripeService } from './stripe.service';
import { PrismaService } from '../common/prisma.service';

@Module({
  controllers: [PaymentsController],
  providers: [StripeService, PrismaService],
  exports: [StripeService],
})
export class PaymentsModule {} 