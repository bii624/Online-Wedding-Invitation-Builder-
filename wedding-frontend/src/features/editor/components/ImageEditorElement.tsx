// ============================================================
// IMAGE EDITOR ELEMENT
// Renders an image canvas element with full transform support
// ============================================================

import type { CanvasElement } from '../types/editor.types';

interface ImageEditorElementProps {
  element: CanvasElement;
  zoom: number;
}

export function ImageEditorElement({ element }: ImageEditorElementProps) {
  const ip = element.imageProps;
  if (!ip) return null;

  // Build CSS transform for flip (zoom scale is handled by the parent DraggableElement wrapper)
  const transforms: string[] = [];
  if (ip.isFlippedX) transforms.push('scaleX(-1)');
  if (ip.isFlippedY) transforms.push('scaleY(-1)');
  const transform = transforms.length > 0 ? transforms.join(' ') : undefined;

  // Build box-shadow for drop shadow
  const boxShadow =
    ip.shadowBlur > 0 || ip.shadowX !== 0 || ip.shadowY !== 0
      ? `${ip.shadowX}px ${ip.shadowY}px ${ip.shadowBlur}px ${ip.shadowColor}`
      : undefined;

  // Build border shorthand
  const border =
    ip.borderWidth > 0 && ip.borderStyle !== 'none'
      ? `${ip.borderWidth}px ${ip.borderStyle} ${ip.borderColor}`
      : undefined;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    opacity: ip.opacity,
    borderRadius: ip.borderRadius,
    border,
    boxShadow,
    padding: `${ip.paddingTop}px ${ip.paddingRight}px ${ip.paddingBottom}px ${ip.paddingLeft}px`,
    boxSizing: 'border-box',
    overflow: 'hidden',
    display: 'flex',
    position: 'relative',
  };

  const crop = ip.crop;
  const imgStyle: React.CSSProperties = {
    width: crop ? `${10000 / crop.width}%` : '100%',
    height: crop ? `${10000 / crop.height}%` : '100%',
    left: crop ? `${- (crop.x / crop.width) * 100}%` : undefined,
    top: crop ? `${- (crop.y / crop.height) * 100}%` : undefined,
    position: crop ? 'absolute' : undefined,
    objectFit: crop ? 'fill' : ip.objectFit,
    maxWidth: crop ? 'none' : undefined,
    maxHeight: crop ? 'none' : undefined,
    transform,
    display: 'block',
    // CRITICAL: Disable native browser image drag to prevent it from
    // interfering with our custom mousedown drag-and-drop logic on the wrapper.
    pointerEvents: 'none',
    userSelect: 'none',
  };

  // Placeholder when no src yet
  if (!ip.src) {
    return (
      <div
        className="canvas-image-el canvas-image-placeholder"
        style={{ ...containerStyle, alignItems: 'center', justifyContent: 'center' }}
        title={ip.alt}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: 40, height: 40, opacity: 0.4 }}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }

  return (
    <div className="canvas-image-el" style={containerStyle} title={ip.alt}>
      <img
        src={ip.src}
        alt={ip.alt}
        style={imgStyle}
        draggable={false}
        crossOrigin="anonymous"
      />
    </div>
  );
}
