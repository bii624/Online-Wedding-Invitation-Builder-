// src/image-process/image-process.controller.ts
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProcessImageDto } from './dto/process-image.dto';
import { ProcessResponse } from './types/image-process.types';
import { CacheService } from './services/cache.service';
import { RemoveBgService } from './services/remove-bg.service';
import { RemoveObjectService } from './services/remove-object.service';
import { ExpandImageService } from './services/expand-image.service';
import { createHash } from 'crypto';

@ApiTags('Image Processing')
@Controller('api/image-process')
export class ImageProcessController {
  private readonly logger = new Logger(ImageProcessController.name);

  constructor(
    private readonly cache: CacheService,
    private readonly removeBg: RemoveBgService,
    private readonly removeObject: RemoveObjectService,
    private readonly expandImage: ExpandImageService,
  ) {}

  /**
   * Unified image processing endpoint.
   *
   * Supported operations:
   * - `remove-bg`     — Remove image background (Clipdrop).
   * - `remove-object` — Erase masked object (Clipdrop Cleanup). Requires `mask`.
   * - `expand`        — Outpaint / extend image borders (Stability AI). Requires `expandPx`.
   *
   * Cache strategy (2 layers):
   * 1. Upstash Redis  — checked first (~1 ms). On hit: returns Cloudinary URL immediately.
   * 2. Cloudinary     — after processing, image is uploaded to `wedding-processed/`.
   *                     The resulting secure_url is stored in Redis for 7 days.
   *
   * @param dto - Validated request body.
   * @returns ProcessResponse with Cloudinary URL and cache/timing metadata.
   */
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process an image (remove-bg / remove-object / expand)' })
  @ApiResponse({
    status: 200,
    description: 'Processing succeeded',
    schema: {
      example: {
        success: true,
        result: 'https://res.cloudinary.com/example/image/upload/wedding-processed/abc123.webp',
        cached: false,
        processingMs: 1234,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error',
    schema: {
      example: { success: false, error: 'mask is required for remove-object', code: 'VALIDATION_ERROR' },
    },
  })
  async process(@Body() dto: ProcessImageDto): Promise<ProcessResponse> {
    const startMs = Date.now();

    try {
      // -----------------------------------------------------------------------
      // 1. Decode base64 inputs → Buffers
      // -----------------------------------------------------------------------
      const imageBuffer = this.decodeBase64(dto.image, 'image');

      let maskBuffer: Buffer | undefined;
      if (dto.operation === 'remove-object') {
        if (!dto.mask) {
          throw new BadRequestException(
            'mask is required for remove-object operation',
          );
        }
        maskBuffer = this.decodeBase64(dto.mask, 'mask');
      }

      if (dto.operation === 'expand' && !dto.expandPx) {
        throw new BadRequestException(
          'expandPx is required for expand operation',
        );
      }

      // -----------------------------------------------------------------------
      // 2. Build cache key — sha256(imageBuffer + operation + JSON.stringify(params))
      // -----------------------------------------------------------------------
      const paramsStr = this.buildParamsString(dto, maskBuffer);
      const cacheKey = this.cache.buildKey(imageBuffer, dto.operation, paramsStr);

      // -----------------------------------------------------------------------
      // 3. Layer 1 — Check Upstash Redis (~1 ms)
      // -----------------------------------------------------------------------
      const cachedUrl = await this.cache.getCachedUrl(cacheKey);
      if (cachedUrl) {
        return {
          success: true,
          result: cachedUrl,
          cached: true,
          processingMs: Date.now() - startMs,
        };
      }

      // -----------------------------------------------------------------------
      // 4. Dispatch to the appropriate processing service
      // -----------------------------------------------------------------------
      let resultBuffer: Buffer;

      switch (dto.operation) {
        case 'remove-bg':
          resultBuffer = await this.removeBg.removeBg(imageBuffer);
          break;

        case 'remove-object':
          resultBuffer = await this.removeObject.removeObject(
            imageBuffer,
            maskBuffer!,
          );
          break;

        case 'expand':
          resultBuffer = await this.expandImage.expandImage({
            imageBuffer,
            expandPx: dto.expandPx!,
          });
          break;

        default: {
          // TypeScript exhaustiveness guard
          const _never: never = dto.operation;
          throw new BadRequestException(`Unknown operation: ${String(_never)}`);
        }
      }

      // -----------------------------------------------------------------------
      // 5. Layer 2 — Upload to Cloudinary → store URL in Redis
      //    (awaited so the URL is available for the response, but errors here
      //     are caught separately so the caller still gets a useful result)
      // -----------------------------------------------------------------------
      let resultUrl: string;
      try {
        resultUrl = await this.cache.storeResult(cacheKey, resultBuffer);
      } catch (cacheErr: unknown) {
        // Non-fatal: if Cloudinary/Redis write fails, fall back to base64
        this.logger.error('Cache storeResult failed; returning base64 fallback', cacheErr);
        resultUrl = `data:image/webp;base64,${resultBuffer.toString('base64')}`;
      }

      const processingMs = Date.now() - startMs;
      this.logger.log(
        `[${dto.operation}] processed in ${processingMs}ms (key: ${cacheKey.slice(0, 8)}…)`,
      );

      return {
        success: true,
        result: resultUrl,
        cached: false,
        processingMs,
      };
    } catch (err: unknown) {
      const processingMs = Date.now() - startMs;
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error';
      const code = this.resolveErrorCode(err);

      this.logger.error(
        `[${dto.operation}] failed in ${processingMs}ms: ${errorMessage}`,
        err instanceof Error ? err.stack : undefined,
      );

      return {
        success: false,
        error: errorMessage,
        code,
      };
    }
  }

  // ---------------------------------------------------------------------------
  // PRIVATE HELPERS
  // ---------------------------------------------------------------------------

  /**
   * Safely decodes a Base64 string to a Buffer.
   * Throws BadRequestException on invalid or empty Base64.
   */
  private decodeBase64(value: string, field: string): Buffer {
    try {
      const buf = Buffer.from(value, 'base64');
      if (buf.length === 0) {
        throw new Error('Empty buffer after decode');
      }
      return buf;
    } catch {
      throw new BadRequestException(`Invalid base64 for field: ${field}`);
    }
  }

  /**
   * Builds an operation-specific params string so the SHA-256 key covers
   * all inputs that affect the output (mask content, expansion amounts).
   */
  private buildParamsString(
    dto: ProcessImageDto,
    maskBuffer: Buffer | undefined,
  ): string {
    if (dto.operation === 'remove-object' && maskBuffer) {
      // Hash the mask separately: same image + different mask = different key
      return createHash('sha256').update(maskBuffer).digest('hex');
    }
    if (dto.operation === 'expand' && dto.expandPx) {
      const { left, right, top, bottom } = dto.expandPx;
      return `${left},${right},${top},${bottom}`;
    }
    return '';
  }

  /**
   * Maps exception instances to machine-readable error codes for clients.
   */
  private resolveErrorCode(err: unknown): string {
    if (err instanceof BadRequestException) return 'VALIDATION_ERROR';
    const msg = err instanceof Error ? err.message : '';
    if (msg.toLowerCase().includes('timeout') || (err as Error)?.name === 'AbortError') {
      return 'TIMEOUT';
    }
    if (msg.toLowerCase().includes('clipdrop')) return 'API_ERROR_CLIPDROP';
    if (msg.toLowerCase().includes('stability')) return 'API_ERROR_STABILITY';
    if (msg.toLowerCase().includes('gemini') || msg.toLowerCase().includes('google')) {
      return 'API_ERROR_GEMINI';
    }
    if (msg.toLowerCase().includes('cloudinary')) return 'API_ERROR_CLOUDINARY';
    return 'INTERNAL_ERROR';
  }
}
