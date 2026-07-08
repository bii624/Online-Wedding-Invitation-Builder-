// src/image-process/dto/process-image.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBase64,
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ExpandPx, OperationType } from '../types/image-process.types';

/** Nested DTO for pixel expansion amounts. */
export class ExpandPxDto implements ExpandPx {
  @ApiProperty({ description: 'Pixels to expand on the left', minimum: 0 })
  @IsInt()
  @Min(0)
  left!: number;

  @ApiProperty({ description: 'Pixels to expand on the right', minimum: 0 })
  @IsInt()
  @Min(0)
  right!: number;

  @ApiProperty({ description: 'Pixels to expand on the top', minimum: 0 })
  @IsInt()
  @Min(0)
  top!: number;

  @ApiProperty({ description: 'Pixels to expand on the bottom', minimum: 0 })
  @IsInt()
  @Min(0)
  bottom!: number;
}

/** Body DTO for POST /api/image-process */
export class ProcessImageDto {
  @ApiProperty({
    description: 'Operation to perform',
    enum: ['remove-bg', 'remove-object', 'expand'],
  })
  @IsEnum(['remove-bg', 'remove-object', 'expand'], {
    message: 'operation must be one of: remove-bg, remove-object, expand',
  })
  operation!: OperationType;

  @ApiProperty({
    description: 'Source image encoded as a Base64 string',
  })
  @IsString()
  @IsBase64()
  image!: string;

  @ApiPropertyOptional({
    description:
      'Mask image encoded as Base64 PNG (white = erase, black = keep). Required for remove-object.',
  })
  @IsOptional()
  @IsString()
  @IsBase64()
  mask?: string;

  @ApiPropertyOptional({
    description:
      'Pixel amounts to expand on each side. Required for expand operation.',
    type: ExpandPxDto,
  })
  @ValidateIf((o: ProcessImageDto) => o.operation === 'expand')
  @IsObject()
  @ValidateNested()
  @Type(() => ExpandPxDto)
  expandPx?: ExpandPxDto;
}
