import { IsString, IsNumber, IsOptional, IsArray, IsEnum, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BillingCycle } from '@prisma/client';

export class CreatePackageDto {
  @ApiProperty({ description: 'Package name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Package description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Base price' })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({ description: 'Billing cycle', enum: BillingCycle })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({ description: 'Yearly discount percentage', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  yearlyDiscount?: number;

  @ApiProperty({ description: 'Daily download limit' })
  @IsNumber()
  @Min(0)
  dailyDownloadLimit: number;

  @ApiProperty({ description: 'Package features', type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];
} 