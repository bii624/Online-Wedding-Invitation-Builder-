// ============================================================
// EDITOR TYPES - Central type definitions for the editor
// ============================================================

export type ToolType =
  | 'text'
  | 'image'
  | 'background'
  | 'stock'
  | 'tools'
  | 'music'
  | 'widgets'
  | 'templates'
  | 'effects'
  | 'presets'
  | null;

export type AlignType = 'left' | 'center' | 'right' | 'justify';
export type FontWeightType = 'normal' | 'bold';
export type FontStyleType = 'normal' | 'italic';
export type TextDecorationLine = 'none' | 'underline' | 'line-through';
export type BorderStyleType = 'none' | 'solid' | 'dashed' | 'dotted';
export type PageAlignType = 'left' | 'center' | 'right';

// ── Text Properties ───────────────────────────────────────
export interface TextProperties {
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: FontWeightType;
  fontStyle: FontStyleType;
  textDecoration: TextDecorationLine;
  textAlign: AlignType;
  color: string;
  backgroundColor: string;
  opacity: number;
  // Spacing
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  // Border
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  // Shadow
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowColor: string;
  // Typography
  letterSpacing: number;
  lineHeight: number;
}

export interface ImageCropData {
  x: number;      // percentage (0-100)
  y: number;      // percentage (0-100)
  width: number;  // percentage (0-100)
  height: number; // percentage (0-100)
  shape?: 'rect' | 'circle';
}

// ── Image Properties ──────────────────────────────────────
export interface ImageProperties {
  src: string;
  alt: string;
  opacity: number;
  crop?: ImageCropData;
  // Transform
  isFlippedX: boolean;
  isFlippedY: boolean;
  lockAspectRatio: boolean;
  // Padding
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  // Border
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  borderStyle: BorderStyleType;
  // Shadow (single drop-shadow)
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowColor: string;
  // Fit
  objectFit: 'contain' | 'cover' | 'fill';
}

// ── Background Properties ─────────────────────────────────
export interface BackgroundProperties {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  imageSrc: string;
  imageOpacity: number;
}

// ── Music Properties ──────────────────────────────────────
export interface MusicProperties {
  src: string;
  name: string;
  autoPlay: boolean;
  loop: boolean;
  volume: number; // 0–1
}

// ── Canvas Element (base + union) ─────────────────────────
export type CanvasElementType = 'text' | 'image' | 'shape';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  rotation: number;        // degrees, 0 by default
  isLocked?: boolean;
  isSelected?: boolean;
  textProps?: TextProperties;
  imageProps?: ImageProperties;
}

// ── Uploaded Image Record ─────────────────────────────────
export interface UploadedImage {
  id: string;
  src: string;         // data URL or object URL
  name: string;
  thumbnailSrc?: string;
}

// ── Filmstrip / Page ──────────────────────────────────────
export interface FilmstripItem {
  id: string;
  thumbnail: string;
  label: string;
  isActive: boolean;
}

// ── AI Color ──────────────────────────────────────────────
export interface AIColor {
  id: string;
  hex: string;
  label: string;
}

// ── Editor State ──────────────────────────────────────────
export interface EditorState {
  activeTool: ToolType;
  selectedElement: CanvasElement | null;
  elements: CanvasElement[];
  uploadedImages: UploadedImage[];
  zoom: number;
  showGrid: boolean;
  canvasWidth: number;
  canvasHeight: number;
  cropElementId: string | null;
  filmstripItems: FilmstripItem[];
  aiColors: AIColor[];
  activeRightTab: 'settings' | 'effects';
  showAIColorPanel: boolean;
  history: CanvasElement[][];
  historyIndex: number;
  music: MusicProperties | null;
  canvasBackground: BackgroundProperties;
  recentColors: string[];
}
