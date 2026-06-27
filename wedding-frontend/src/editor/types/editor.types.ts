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
  // Advanced
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowColor: string;
  letterSpacing: number;
  lineHeight: number;
}

export interface ImageProperties {
  src: string;
  alt: string;
  opacity: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  objectFit: 'contain' | 'cover' | 'fill';
  shadowX: number;
  shadowY: number;
  shadowBlur: number;
  shadowColor: string;
  filterBrightness: number;
  filterContrast: number;
  filterSaturation: number;
  filterBlur: number;
}

export interface BackgroundProperties {
  type: 'solid' | 'gradient' | 'image';
  color: string;
  gradientFrom: string;
  gradientTo: string;
  gradientAngle: number;
  imageSrc: string;
  imageOpacity: number;
}

export type CanvasElementType = 'text' | 'image' | 'shape';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  textProps?: TextProperties;
  imageProps?: ImageProperties;
  isSelected?: boolean;
}

export interface FilmstripItem {
  id: string;
  thumbnail: string;
  label: string;
  isActive: boolean;
}

export interface AIColor {
  id: string;
  hex: string;
  label: string;
}

export interface EditorState {
  activeTool: ToolType;
  selectedElement: CanvasElement | null;
  elements: CanvasElement[];
  zoom: number;
  showGrid: boolean;
  canvasWidth: number;
  canvasHeight: number;
  filmstripItems: FilmstripItem[];
  aiColors: AIColor[];
  activeRightTab: 'settings' | 'effects';
  showAIColorPanel: boolean;
  history: CanvasElement[][];
  historyIndex: number;
}
