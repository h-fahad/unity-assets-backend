import { IsString, IsNotEmpty, IsNumber, Min, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSubscriptionPlanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] })
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY'])
  billingCycle: 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @ApiProperty({ default: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  yearlyDiscount?: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  dailyDownloadLimit: number;

  @ApiProperty({ type: [String], required: false })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];
} 