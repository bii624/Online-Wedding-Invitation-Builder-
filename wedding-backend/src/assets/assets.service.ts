// src/assets/assets.service.ts
import { Injectable, Inject, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { v2 as Cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import * as streamifier from 'streamifier';
import { PrismaService } from '../prisma/prisma.service'; // chỉnh đúng path PrismaService của bạn
import { AssetType } from './dto/upload-asset.dto';

@Injectable()
export class AssetsService {
    constructor(
        @Inject('CLOUDINARY') private cloudinary: typeof Cloudinary,
        private prisma: PrismaService,
    ) { }

    // Xác định loại asset dựa theo mimetype thực tế của file
    private resolveAssetType(mimetype: string): AssetType {
        if (mimetype.startsWith('image/')) return AssetType.IMAGE;
        if (mimetype.startsWith('video/')) return AssetType.VIDEO;
        if (mimetype.startsWith('audio/')) return AssetType.AUDIO;
        throw new BadRequestException('Định dạng file không được hỗ trợ');
    }

    // Upload buffer lên Cloudinary bằng stream (không cần ghi file tạm ra ổ cứng)
    private uploadToCloudinary(
        fileBuffer: Buffer,
        resourceType: 'image' | 'video',
        folder: string,
        format?: string,
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinary.uploader.upload_stream(
                {
                    folder, // ví dụ: 'dearlove/user_<userId>'
                    resource_type: resourceType, // Cloudinary gộp audio chung nhóm 'video'
                    format: format, // Ép định dạng nếu có (VD: webp, png, jpg)
                    // Tự tạo thumbnail cho video ngay khi upload
                    eager: resourceType === 'video'
                        ? [{ width: 400, height: 400, crop: 'pad', format: 'jpg' }]
                        : undefined,
                },
                (error: UploadApiErrorResponse, result: UploadApiResponse) => {
                    if (error) return reject(error);
                    resolve(result);
                },
            );
            streamifier.createReadStream(fileBuffer).pipe(uploadStream);
        });
    }

    async uploadAsset(
        file: Express.Multer.File,
        userId: string,
    ) {
        if (!file) {
            throw new BadRequestException('Không có file nào được gửi lên');
        }

        const assetType = this.resolveAssetType(file.mimetype);

        // Cloudinary chỉ nhận 'image' hoặc 'video' làm resource_type, audio cũng đi qua 'video'
        const resourceType = assetType === AssetType.IMAGE ? 'image' : 'video';
        const folder = `dearlove/user_${userId}`;

        // Trích xuất định dạng từ mimetype để truyền cho Cloudinary
        const formatMap: Record<string, string> = {
            'image/webp': 'webp',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/svg+xml': 'svg'
        };
        const format = formatMap[file.mimetype] || undefined;

        let result: UploadApiResponse;
        try {
            result = await this.uploadToCloudinary(file.buffer, resourceType, folder, format);
        } catch (error: any) {
            let errorMessage = error.message || 'Lỗi khi tải file lên Cloudinary';
            if (errorMessage.includes('File size too large')) {
                errorMessage = 'Kích thước file quá lớn (tối đa 20MB). Vui lòng chọn file nhỏ hơn.';
            }
            throw new BadRequestException(errorMessage);
        }

        // Lưu record vào bảng assets theo đúng schema Prisma đã có
        const asset = await this.prisma.asset.create({
            data: {
                userId: userId,
                type: assetType,
                url: result.secure_url,
                thumbnailUrl:
                    assetType === AssetType.VIDEO
                        ? result.eager?.[0]?.secure_url // thumbnail tự sinh từ video
                        : assetType === AssetType.IMAGE
                            ? result.secure_url // ảnh thì dùng chính nó làm thumbnail
                            : null, // audio không có thumbnail
                fileSize: result.bytes,
                width: result.width ?? null,
                height: result.height ?? null,
                durationMs: result.duration ? Math.round(result.duration * 1000) : null,
            },
        });

        return asset;
    }

    // Lấy danh sách assets của user
    async getUserAssets(userId: string) {
        return this.prisma.asset.findMany({
            where: {
                userId: userId,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Xóa asset — kèm xóa luôn file thật trên Cloudinary, không chỉ xóa record DB
    async deleteAsset(assetId: string, userId: string) {
        const asset = await this.prisma.asset.findUnique({ where: { id: assetId } });

        if (!asset) throw new NotFoundException('Không tìm thấy asset');
        if (asset.userId !== userId) throw new ForbiddenException('Bạn không có quyền xóa asset này');

        // Lấy public_id từ url Cloudinary để xóa đúng file
        const publicId = this.extractPublicId(asset.url);
        const resourceType = asset.type === AssetType.IMAGE ? 'image' : 'video';

        await this.cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        await this.prisma.asset.delete({ where: { id: assetId } });

        return { message: 'Đã xóa asset thành công' };
    }

    // Trích public_id từ URL Cloudinary để dùng cho việc xóa
    private extractPublicId(url: string): string {
        // Ví dụ url: https://res.cloudinary.com/xxx/image/upload/v123456/dearlove/user_abc/filename.jpg
        const parts = url.split('/upload/');
        if (parts.length < 2) return '';
        let path = parts[1];
        // Nếu path bắt đầu bằng v và một dãy số, đó là version
        if (/^v\d+\//.test(path)) {
            path = path.replace(/^v\d+\//, '');
        }
        return path.replace(/\.[^/.]+$/, ''); // bỏ đuôi file (.jpg, .mp4...)
    }
}