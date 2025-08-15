import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';

export class UpdateAssetDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

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

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
