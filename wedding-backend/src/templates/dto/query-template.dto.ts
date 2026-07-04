// dto/query-templates.dto.ts
import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryTemplatesDto {
    @IsOptional()
    @IsString()
    category?: string; // slug của category

    @IsOptional()
    @IsString()
    q?: string; // search theo name/tags (dùng sau)

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    limit?: number = 20;
}