import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCheckoutSessionDto {
  @ApiProperty({ description: 'Plan ID to subscribe to' })
  @IsNumber()
  @Type(() => Number)
  planId: number;

  @ApiProperty({ description: 'Billing cycle', enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] })
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY'])
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
} 