// src/image-process/services/preprocessor.service.ts
import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import { PreprocessResult } from '../types/image-process.types';

/** Maximum dimension (width or height) after preprocessing. */
const MAX_DIMENSION = 2048;
/** WebP output quality (0–100). */
const WEBP_QUALITY = 85;

@Injectable()
export class PreprocessorService {
  private readonly logger = new Logger(PreprocessorService.name);

  /**
   * Preprocesses an image buffer before sending to any AI API.
   *
   * Steps performed:
   * 1. Resize to at most 2048×2048 while preserving aspect ratio.
   * 2. Convert to WebP at quality 85.
   * 3. Strip all EXIF/ICC metadata.
   *
   * @param buffer - Raw input image buffer (any format supported by sharp).
   * @returns Preprocessed image metadata and WebP buffer.
   */
  async preprocess(buffer: Buffer): Promise<PreprocessResult> {
    this.logger.debug(
      `Preprocessing image (input size: ${(buffer.length / 1024).toFixed(1)} KB)`,
    );

    const outputBuffer = await sharp(buffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: 'inside',        // maintain aspect ratio, never upscale beyond box
        withoutEnlargement: true, // skip resize if image is already smaller
      })
      .webp({ quality: WEBP_QUALITY })
      .withMetadata({ exif: {} }) // strip EXIF, keep color profile for accuracy
      .toBuffer();

    const metadata = await sharp(outputBuffer).metadata();
    const width = metadata.width ?? 0;
    const height = metadata.height ?? 0;
    const sizeKB = Math.round((outputBuffer.length / 1024) * 100) / 100;

    this.logger.debug(
      `Preprocessing done: ${width}×${height} @ ${sizeKB} KB`,
    );

    return { buffer: outputBuffer, width, height, sizeKB };
  }

  /**
   * Preprocesses a mask buffer and resizes it to exactly the given dimensions.
   * Used by removeObject to ensure image and mask are the same size.
   *
   * @param buffer - Raw mask PNG buffer (white=erase, black=keep).
   * @param width  - Target width in pixels.
   * @param height - Target height in pixels.
   * @returns Resized mask as a PNG buffer.
   */
  async preprocessMask(
    buffer: Buffer,
    width: number,
    height: number,
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(width, height, { fit: 'fill' }) // exact dimensions, no aspect-ratio lock
      .png()
      .toBuffer();
  }
}
