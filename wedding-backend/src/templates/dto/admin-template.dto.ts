import { IsString, IsOptional, IsBoolean, IsNumber, IsEnum, IsObject } from 'class-validator';

export enum TemplateStatus {
    draft = 'draft',
    published = 'published',
    archived = 'archived'
}

export class CreateAdminTemplateDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsOptional()
    @IsString()
    categoryId?: string;

    @IsOptional()
    @IsBoolean()
    isPremium?: boolean;

    @IsOptional()
    @IsString()
    requiredPlanId?: string;

    @IsOptional()
    @IsNumber()
    canvasWidth?: number;

    @IsOptional()
    @IsObject()
    background?: any;

    @IsOptional()
    @IsEnum(TemplateStatus)
    status?: TemplateStatus;

    @IsOptional()
    @IsNumber()
    displayOrder?: number;
}

export class UpdateAdminTemplateDto {
    @IsOptional() @IsString() name?: string;
    @IsOptional() @IsString() slug?: string;
    @IsOptional() @IsString() categoryId?: string;
    @IsOptional() @IsBoolean() isPremium?: boolean;
    @IsOptional() @IsString() requiredPlanId?: string;
    @IsOptional() @IsNumber() canvasWidth?: number;
    @IsOptional() @IsObject() background?: any;
    @IsOptional() @IsEnum(TemplateStatus) status?: TemplateStatus;
    @IsOptional() @IsNumber() displayOrder?: number;
}

export class UpdateTemplateOrderDto {
    @IsNumber()
    displayOrder: number;
}
