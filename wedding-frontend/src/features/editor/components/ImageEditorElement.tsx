import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  // Handle custom borderRadius based on frameType
  let borderRadius: string | number = ip.borderRadius;
  if (ip.frameType === 'circle') {
    borderRadius = '50%';
  } else if (ip.frameType === 'arch') {
    borderRadius = '999px 999px 0 0';
  }

  // Handle custom clipPath for SVG shapes
  let clipPath: string | undefined = undefined;
  if (ip.frameType === 'heart') {
    clipPath = 'url(#clip-heart)';
  } else if (ip.frameType === 'star') {
    clipPath = 'url(#clip-star)';
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    opacity: ip.opacity,
    borderRadius,
    clipPath,
    border,
    boxShadow,
    backgroundColor: ip.backgroundColor || 'transparent',
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

  // Render slider/gallery if galleryImages exists and contains items
  if (ip.galleryImages && ip.galleryImages.length > 0) {
    const is3d = !ip.sliderStyle || ip.sliderStyle === '3d';
    const isFlat = ip.sliderStyle === 'flat';
    const isGrid = ip.sliderStyle === 'grid';
    const isCollage = ip.sliderStyle === 'collage';
    
    return (
      <div 
        className="canvas-image-el" 
        style={{ 
          ...containerStyle, 
          overflow: is3d ? 'visible' : 'hidden' 
        }} 
        title={ip.alt}
      >
        {is3d && <ThreeDSlider images={ip.galleryImages} />}
        {isFlat && <FlatSlider images={ip.galleryImages} />}
        {isGrid && <GridCollage images={ip.galleryImages} />}
        {isCollage && <MixedCollage images={ip.galleryImages} />}
      </div>
    );
  }

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

// ── ThreeDSlider Helper Component ─────────────────────────────
interface ThreeDSliderProps {
  images: string[];
}

export function ThreeDSlider({ images }: ThreeDSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'visible',
      perspective: '1000px',
    }}>
      {images.map((imgSrc, index) => {
        const diff = index - activeIndex;
        // Determine transform styles
        let zIndex = 0;
        let opacity = 0;
        let transform = '';

        if (diff === 0) {
          zIndex = 10;
          opacity = 1;
          transform = 'translateX(0) scale(1) rotateY(0deg) translateZ(50px)';
        } else if (diff === -1 || (diff === images.length - 1 && activeIndex === 0 && images.length > 2)) {
          // Left adjacent
          zIndex = 5;
          opacity = 0.6;
          transform = 'translateX(-30%) scale(0.75) rotateY(35deg)';
        } else if (diff === 1 || (diff === -(images.length - 1) && activeIndex === images.length - 1 && images.length > 2)) {
          // Right adjacent
          zIndex = 5;
          opacity = 0.6;
          transform = 'translateX(30%) scale(0.75) rotateY(-35deg)';
        } else {
          // Offscreen
          zIndex = 1;
          opacity = 0;
          transform = diff < 0 ? 'translateX(-60%) scale(0.6) rotateY(45deg)' : 'translateX(60%) scale(0.6) rotateY(-45deg)';
        }

        // Special handling for 2 images
        if (images.length === 2) {
          if (diff !== 0) {
            zIndex = 5;
            opacity = 0.6;
            transform = activeIndex === 0 
              ? 'translateX(30%) scale(0.75) rotateY(-35deg)'
              : 'translateX(-30%) scale(0.75) rotateY(35deg)';
          }
        }

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              width: '75%',
              height: '90%',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: diff === 0 ? '0 12px 24px rgba(0,0,0,0.25)' : '0 4px 10px rgba(0,0,0,0.1)',
              backgroundImage: `url(${imgSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transition: 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
              opacity,
              zIndex,
              transform,
              transformStyle: 'preserve-3d',
              pointerEvents: diff === 0 ? 'auto' : 'none',
            }}
          />
        );
      })}

      {/* Navigation buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '-10px',
              zIndex: 25,
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#333',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '-10px',
              zIndex: 25,
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#333',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}

      {/* Page indicator */}
      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '-25px',
          zIndex: 25,
          background: 'rgba(0, 0, 0, 0.05)',
          padding: '2px 8px',
          borderRadius: '10px',
          fontSize: '10px',
          fontWeight: 'bold',
          color: '#666',
        }}>
          {activeIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

// ── FlatSlider Helper Component ──────────────────────────────
interface FlatSliderProps {
  images: string[];
}

export function FlatSlider({ images }: FlatSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  if (!images || images.length === 0) return null;

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderRadius: '16px',
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        height: '100%',
        transform: `translateX(-${activeIndex * 100}%)`,
        transition: 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}>
        {images.map((imgSrc, index) => (
          <div
            key={index}
            style={{
              width: '100%',
              height: '100%',
              flexShrink: 0,
              backgroundImage: `url(${imgSrc})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        ))}
      </div>

      {images.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '10px',
              zIndex: 25,
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#333',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '10px',
              zIndex: 25,
              background: 'rgba(255, 255, 255, 0.85)',
              border: '1px solid rgba(0,0,0,0.1)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              color: '#333',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}

      {images.length > 1 && (
        <div style={{
          position: 'absolute',
          bottom: '10px',
          zIndex: 25,
          display: 'flex',
          gap: '6px',
        }}>
          {images.map((_, index) => (
            <div
              key={index}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: index === activeIndex ? '#fff' : 'rgba(255, 255, 255, 0.5)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: index === activeIndex ? 'scale(1.2)' : 'none',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── GridCollage Helper Component ──────────────────────────────
interface GridCollageProps {
  images: string[];
}

export function GridCollage({ images }: GridCollageProps) {
  if (!images || images.length === 0) return null;

  const count = images.length;

  if (count === 1) {
    return <div style={{ width: '100%', height: '100%', backgroundImage: `url(${images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '16px' }} />;
  }

  if (count === 2) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
        {images.slice(0, 2).map((img, i) => (
          <div key={i} style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100%' }} />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundImage: `url(${images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100%' }} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '6px', height: '100%' }}>
          <div style={{ backgroundImage: `url(${images[1]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ backgroundImage: `url(${images[2]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </div>
      </div>
    );
  }

  const remaining = count - 4;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '6px', width: '100%', height: '100%', borderRadius: '16px', overflow: 'hidden' }}>
      {images.slice(0, 3).map((img, i) => (
        <div key={i} style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ))}
      <div style={{
        position: 'relative',
        backgroundImage: `url(${images[3]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}>
        {remaining > 0 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '14px',
            fontFamily: 'sans-serif'
          }}>
            +{remaining}
          </div>
        )}
      </div>
    </div>
  );
}

// ── MixedCollage Helper Component ──────────────────────────────
interface MixedCollageProps {
  images: string[];
}

export function MixedCollage({ images }: MixedCollageProps) {
  if (!images || images.length === 0) return null;

  const count = images.length;

  if (count === 1) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        backgroundImage: `url(${images[0]})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '16px'
      }} />
    );
  }

  if (count === 2) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        {images.slice(0, 2).map((img, i) => (
          <div key={i} style={{ backgroundImage: `url(${img})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100%' }} />
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '6px',
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <div style={{ backgroundImage: `url(${images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100%' }} />
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '6px', height: '100%' }}>
          <div style={{ backgroundImage: `url(${images[1]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ backgroundImage: `url(${images[2]})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        height: '100%',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '6px', height: '68%' }}>
          <div style={{ backgroundImage: `url(${images[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', height: '100%', borderRadius: '12px' }} />
          <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: '6px', height: '100%' }}>
            <div style={{ backgroundImage: `url(${images[1]})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px' }} />
            <div style={{ backgroundImage: `url(${images[2]})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px' }} />
          </div>
        </div>
        {/* Bottom row */}
        <div style={{ width: '100%', height: '32%', backgroundImage: `url(${images[3]})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px' }} />
      </div>
    );
  }

  const remaining = count - 5;
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      width: '100%',
      height: '100%',
      borderRadius: '20px',
      overflow: 'hidden',
    }}>
      {/* Top section: left tall, right stacked */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '8px',
        height: '66%',
        width: '100%'
      }}>
        {/* Left tall */}
        <div style={{
          backgroundImage: `url(${images[0]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '100%',
          borderRadius: '18px'
        }} />
        {/* Right stacked */}
        <div style={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          gap: '8px',
          height: '100%'
        }}>
          <div style={{
            backgroundImage: `url(${images[1]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '18px'
          }} />
          <div style={{
            backgroundImage: `url(${images[2]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '18px'
          }} />
        </div>
      </div>

      {/* Bottom section: left, right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '8px',
        height: '34%',
        width: '100%'
      }}>
        {/* Bottom Left */}
        <div style={{
          backgroundImage: `url(${images[3]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '18px'
        }} />
        {/* Bottom Right */}
        <div style={{
          position: 'relative',
          backgroundImage: `url(${images[4]})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: '18px',
          overflow: 'hidden'
        }}>
          {remaining > 0 && (
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '18px',
              fontFamily: 'sans-serif'
            }}>
              +{remaining}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
