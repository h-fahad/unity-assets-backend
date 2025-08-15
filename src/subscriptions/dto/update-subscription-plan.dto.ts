import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsArray,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSubscriptionPlanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  basePrice?: number;

  @ApiPropertyOptional({ enum: ['WEEKLY', 'MONTHLY', 'YEARLY'] })
  @IsOptional()
  @IsEnum(['WEEKLY', 'MONTHLY', 'YEARLY'])
  billingCycle?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  yearlyDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyDownloadLimit?: number;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
