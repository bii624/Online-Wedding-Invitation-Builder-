// src/library-elements/dto/element-category.dto.ts
import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateElementCategoryDto {
    @ApiProperty({ description: 'Tên danh mục' })
    @IsString()
    name: string;

    @ApiProperty({ description: 'Slug URL-friendly' })
    @IsString()
    slug: string;

    @ApiPropertyOptional({ description: 'ID danh mục cha (nếu có)' })
    @IsOptional()
    @IsUUID()
    parentId?: string;
}

export class UpdateElementCategoryDto {
    @ApiPropertyOptional({ description: 'Tên danh mục' })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional({ description: 'Slug URL-friendly' })
    @IsOptional()
    @IsString()
    slug?: string;

    @ApiPropertyOptional({ description: 'ID danh mục cha' })
    @IsOptional()
    @IsUUID()
    parentId?: string;
}
