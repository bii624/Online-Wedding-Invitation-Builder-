// src/assets/assets.controller.ts
import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    Query,
    UseInterceptors,
    UploadedFile,
    UseGuards,
    Req,
    ParseUUIDPipe,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // chỉnh đúng path guard đã có sẵn
import { AssetsService } from './assets.service';

@Controller('assets')
@UseGuards(JwtAuthGuard) // toàn bộ route trong controller này đều yêu cầu đăng nhập
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Post('upload')
    @UseInterceptors(
        FileInterceptor('file', {
            limits: { fileSize: 20 * 1024 * 1024 }, // giới hạn 50MB/file
            fileFilter: (req, file, callback) => {
                const allowedMimes = [
                    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
                    'video/mp4', 'video/quicktime',
                    'audio/mpeg', 'audio/mp3', 'audio/wav',
                ];
                if (!allowedMimes.includes(file.mimetype)) {
                    return callback(
                        new BadRequestException('Định dạng file không được hỗ trợ'),
                        false,
                    );
                }
                callback(null, true);
            },
        }),
    )
    async upload(
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any, // req.user được gắn sẵn bởi JwtAuthGuard/JwtStrategy
    ) {
        const userId = req.user.userId; // tên field tùy theo payload JWT bạn đã thiết kế ở jwt.strategy.ts
        return this.assetsService.uploadAsset(file, userId);
    }

    @Get()
    async getMyAssets(@Req() req: any) {
        const userId = req.user.userId;
        return this.assetsService.getUserAssets(userId);
    }

    @Delete(':id')
    async delete(@Param('id', ParseUUIDPipe) id: string, @Req() req: any) {
        const userId = req.user.userId;
        return this.assetsService.deleteAsset(id, userId);
    }
}