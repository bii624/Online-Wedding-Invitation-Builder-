// src/image-process/image-process.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ImageProcessController } from './image-process.controller';
import { PreprocessorService } from './services/preprocessor.service';
import { CacheService } from './services/cache.service';
import { GeminiVisionService } from './services/gemini-vision.service';
import { RemoveBgService } from './services/remove-bg.service';
import { RemoveObjectService } from './services/remove-object.service';
import { ExpandImageService } from './services/expand-image.service';

@Module({
  imports: [ConfigModule],
  controllers: [ImageProcessController],
  providers: [
    PreprocessorService,
    CacheService,
    GeminiVisionService,
    RemoveBgService,
    RemoveObjectService,
    ExpandImageService,
  ],
})
export class ImageProcessModule {}
