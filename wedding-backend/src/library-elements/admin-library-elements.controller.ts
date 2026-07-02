// src/library-elements/admin-library-elements.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Patch,
    Body,
    Param,
    Query,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { LibraryElementsService } from './library-elements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import {
    CreateLibraryElementDto,
    UpdateLibraryElementDto,
    LibraryElementQueryDto,
} from './dto/library-element.dto';
import {
    CreateElementCategoryDto,
    UpdateElementCategoryDto,
} from './dto/element-category.dto';

@Controller('admin/library-elements')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminLibraryElementsController {
    constructor(private readonly service: LibraryElementsService) { }

    // ─── Categories ───────────────────────────────────────────────────────────

    @Get('categories')
    getCategories() {
        return this.service.getCategories();
    }

    @Post('categories')
    createCategory(@Body() dto: CreateElementCategoryDto, @Req() req: any) {
        return this.service.createCategory(dto, req.user.id);
    }

    @Put('categories/:id')
    updateCategory(@Param('id') id: string, @Body() dto: UpdateElementCategoryDto) {
        return this.service.updateCategory(id, dto);
    }

    @Delete('categories/:id')
    deleteCategory(@Param('id') id: string) {
        return this.service.deleteCategory(id);
    }

    // ─── Elements ─────────────────────────────────────────────────────────────

    @Get()
    getElements(@Query() query: LibraryElementQueryDto) {
        return this.service.getElements(query, true); // adminMode = true: xem mọi status
    }

    @Get(':id')
    getElementById(@Param('id') id: string) {
        return this.service.getElementById(id);
    }

    @Post()
    createElement(@Body() dto: CreateLibraryElementDto, @Req() req: any) {
        return this.service.createElement(dto, req.user.id);
    }

    @Put(':id')
    updateElement(@Param('id') id: string, @Body() dto: UpdateLibraryElementDto) {
        return this.service.updateElement(id, dto);
    }

    @Delete(':id')
    deleteElement(@Param('id') id: string) {
        return this.service.deleteElement(id);
    }

    @Patch(':id/toggle')
    toggleStatus(@Param('id') id: string) {
        return this.service.toggleElementStatus(id);
    }

    // Upload file ảnh/SVG cho element
    @Post(':id/upload')
    @UseInterceptors(FileInterceptor('file', {
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
        fileFilter: (req, file, callback) => {
            const allowed = [
                'image/jpeg', 'image/png', 'image/webp',
                'image/svg+xml', 'image/gif',
            ];
            if (!allowed.includes(file.mimetype)) {
                return callback(new BadRequestException('Chỉ hỗ trợ JPG, PNG, WEBP, SVG, GIF'), false);
            }
            callback(null, true);
        },
    }))
    uploadFile(
        @Param('id') id: string,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        if (!file) throw new BadRequestException('Không tìm thấy file');
        return this.service.uploadElementFile(id, file, req.user.id);
    }
}
