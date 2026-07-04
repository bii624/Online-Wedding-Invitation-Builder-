import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { CanvasElement } from '../../types/editor.types';
import { DEFAULT_ALBUM_PROPS } from '../../store/editorStore';
import { ImageIcon, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

interface AlbumEditorElementProps {
  element: CanvasElement;
  zoom: number;
}

export function AlbumEditorElement({ element, zoom }: AlbumEditorElementProps) {
  const rawProps: Partial<import('../../types/editor.types').AlbumContent> = element.albumProps || {};
  const props = { 
    ...DEFAULT_ALBUM_PROPS, 
    ...rawProps, 
    padding: { ...DEFAULT_ALBUM_PROPS.padding, ...(rawProps.padding || {}) }, 
    border: { ...DEFAULT_ALBUM_PROPS.border, ...(rawProps.border || {}) }, 
    shadow: { ...DEFAULT_ALBUM_PROPS.shadow, ...(rawProps.shadow || {}) } 
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Autoplay
  useEffect(() => {
    if (props.images.length <= 1 || element.isSelected) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % props.images.length);
    }, props.delay * 1000);

    return () => clearInterval(interval);
  }, [props.images.length, props.delay, element.isSelected]);

  // Safe index
  useEffect(() => {
    if (currentIndex >= props.images.length && props.images.length > 0) {
      setCurrentIndex(0);
    }
  }, [props.images.length, currentIndex]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % props.images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + props.images.length) % props.images.length);
  };

  const handleThumbnailClick = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setCurrentIndex(index);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (props.enableFullscreen) {
      setIsFullscreen(true);
    }
  };

  const { padding, border, shadow } = props;

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: props.backgroundColor,
    opacity: props.opacity,
    justifyContent: props.alignment === 'center' ? 'center' : props.alignment === 'right' ? 'flex-end' : 'flex-start',
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    borderWidth: `${border.width}px`,
    borderStyle: border.style as any,
    borderColor: border.color,
    borderRadius: `${border.radius}px`,
    boxShadow: shadow.color !== 'transparent' ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}` : 'none',
    position: 'relative'
  };

  if (props.images.length === 0) {
    return (
      <div style={containerStyle}>
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 rounded-lg overflow-hidden border border-dashed border-gray-300">
          <div className="w-12 h-12 mb-2 opacity-50"><ImageIcon /></div>
          <span className="text-sm font-medium">Chưa có ảnh trong gallery</span>
        </div>
      </div>
    );
  }

  // Effect styles
  const getEffectStyle = (index: number): React.CSSProperties => {
    const isActive = index === currentIndex;
    
    let baseStyle: React.CSSProperties = {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      transition: `all 0.5s ease-in-out`,
      opacity: isActive ? 1 : 0,
      pointerEvents: isActive ? 'auto' : 'none',
    };

    if (props.effectType === 'slide') {
      baseStyle.transform = isActive ? 'translateX(0)' : (index < currentIndex ? 'translateX(-100%)' : 'translateX(100%)');
    } else if (props.effectType === 'zoom') {
      baseStyle.transform = isActive ? 'scale(1)' : 'scale(1.1)';
      baseStyle.opacity = isActive ? 1 : 0; // combine fade with zoom
    }

    return baseStyle;
  };

  return (
    <div style={containerStyle}>
      {/* Main Image Container */}
      <div 
        className="relative flex-1 w-full overflow-hidden group cursor-pointer" 
        style={{ borderRadius: `${Math.max(0, border.radius - 4)}px` }}
        onClick={handleFullscreen}
      >
        {props.images.map((img, idx) => (
          <img 
            key={idx} 
            src={img} 
            alt={`Gallery ${idx}`} 
            style={getEffectStyle(idx)} 
            draggable={false}
            crossOrigin="anonymous"
          />
        ))}

        {/* Nav Buttons */}
        {props.showNavButtons && props.images.length > 1 && (
          <>
            <button 
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/70 hover:bg-white rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-sm z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white/70 hover:bg-white rounded-full text-gray-800 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md shadow-sm z-10"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Fullscreen icon indicator (hover) */}
        {props.enableFullscreen && (
          <div className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/40 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm z-10">
            <Maximize2 size={16} />
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {props.showThumbnails && props.images.length > 1 && (
        <div className="w-full mt-3 overflow-x-auto pb-2" style={{ flexShrink: 0, scrollbarWidth: 'none' }}>
          <div className="flex w-max max-w-full mx-auto gap-2" style={{ height: '48px' }}>
            {props.images.map((img, idx) => (
              <div 
                key={idx}
                onClick={(e) => handleThumbnailClick(e, idx)}
                className={`relative h-full aspect-square rounded-md overflow-hidden cursor-pointer flex-shrink-0 border-2 transition-all ${idx === currentIndex ? 'border-rose-500 opacity-100 scale-105 shadow-md' : 'border-transparent opacity-40 hover:opacity-70'}`}
              >
                <img src={img} className="w-full h-full object-cover" alt={`Thumb ${idx}`} draggable={false} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fullscreen Modal */}
      {isFullscreen && createPortal(
        <div 
          className="fixed inset-0 z-[999999] bg-black/90 flex items-center justify-center backdrop-blur-sm" 
          onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
          <img src={props.images[currentIndex]} className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl" alt="Fullscreen" draggable={false} />
          <button 
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors w-10 h-10 flex items-center justify-center rounded-full bg-white/10" 
            onClick={(e) => { e.stopPropagation(); setIsFullscreen(false); }}
          >
            <span className="text-2xl leading-none -mt-1">&times;</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
