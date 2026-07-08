// src/image-process/types/image-process.types.ts

// =========================================================================
// ENUMS
// =========================================================================

/** The three supported image processing operations. */
export type OperationType = 'remove-bg' | 'remove-object' | 'expand';

// =========================================================================
// PREPROCESSING
// =========================================================================

/**
 * Result returned by PreprocessorService.preprocess().
 * The buffer is always WebP, max 2048×2048, EXIF stripped.
 */
export interface PreprocessResult {
  /** Processed image buffer (WebP). */
  buffer: Buffer;
  /** Output width in pixels. */
  width: number;
  /** Output height in pixels. */
  height: number;
  /** Output file size in kilobytes (rounded to 2 dp). */
  sizeKB: number;
}

// =========================================================================
// EXPANSION
// =========================================================================

/**
 * Pixel expansion amounts for the outpaint operation.
 * Each value must be a non-negative integer.
 */
export interface ExpandPx {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

// =========================================================================
// API RESPONSES
// =========================================================================

/**
 * Successful response shape returned by the controller.
 */
export interface ProcessSuccess {
  success: true;
  /** Cloudinary secure_url of the processed image. */
  result: string;
  /** Whether the result was served from R2 cache. */
  cached: boolean;
  /** Wall-clock processing time in milliseconds. */
  processingMs: number;
}

/**
 * Error response shape returned by the controller.
 */
export interface ProcessError {
  success: false;
  /** Human-readable error description. */
  error: string;
  /** Machine-readable error code (e.g. VALIDATION_ERROR, API_ERROR). */
  code: string;
}

/** Union of the two possible controller response shapes. */
export type ProcessResponse = ProcessSuccess | ProcessError;

// =========================================================================
// INTERNAL SERVICE INPUTS
// =========================================================================

/** Parameters passed to the remove-object service. */
export interface RemoveObjectParams {
  imageBuffer: Buffer;
  maskBuffer: Buffer;
}

/** Parameters passed to the expand-image service. */
export interface ExpandImageParams {
  imageBuffer: Buffer;
  expandPx: ExpandPx;
}
