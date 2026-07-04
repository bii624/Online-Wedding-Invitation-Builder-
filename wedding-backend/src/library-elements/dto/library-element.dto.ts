// src/library-elements/dto/library-element.dto.ts
import {
  IsString,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsArray,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export enum ElementType {
  icon = 'icon',
  shape = 'shape',
  illustration = 'illustration',
  sticker = 'sticker',
  frame = 'frame',
  photo = 'photo',
}

export class CreateLibraryElementDto {
  @ApiProperty({ description: 'Tên element' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ElementType, description: 'Loại element' })
  @IsEnum(ElementType)
  elementType: ElementType;

  @ApiPropertyOptional({ description: 'ID danh mục' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Tags tìm kiếm', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Element premium hay không',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'ID plan yêu cầu để dùng element này' })
  @IsOptional()
  @IsUUID()
  requiredPlanId?: string;

  @ApiPropertyOptional({
    description: 'SVG có thể đổi màu không',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isRecolorable?: boolean;
}

export class UpdateLibraryElementDto {
  @ApiPropertyOptional({ description: 'Tên element' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ enum: ElementType })
  @IsOptional()
  @IsEnum(ElementType)
  elementType?: ElementType;

  @ApiPropertyOptional({ description: 'ID danh mục' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPremium?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  requiredPlanId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isRecolorable?: boolean;
}

export class LibraryElementQueryDto {
  @ApiPropertyOptional({ description: 'Tìm kiếm theo tên' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Lọc theo danh mục' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ enum: ElementType, description: 'Lọc theo loại' })
  @IsOptional()
  @IsEnum(ElementType)
  elementType?: ElementType;

  @ApiPropertyOptional({ description: 'Lọc premium: true/false' })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : undefined,
  )
  isPremium?: boolean;

  @ApiPropertyOptional({ description: 'Lọc theo status (admin only)' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 48 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 48;
}
