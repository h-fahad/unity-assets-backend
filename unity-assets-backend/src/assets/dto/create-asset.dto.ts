import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAssetDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsInt()
  @Min(1)
  categoryId: number;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @IsOptional()
  price?: number;

  @IsOptional()
  @IsString()
  fileUrl?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
} 