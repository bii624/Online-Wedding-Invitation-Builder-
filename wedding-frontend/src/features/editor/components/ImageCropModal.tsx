import React, { useState, useEffect, useRef } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { ImageCropData, CanvasElement } from '../types/editor.types';
import '../styles/ImageCropModal.css';

// Ratios
const RATIOS = [
  { label: 'Tự do', value: 0 },
  { label: '1:1', value: 1 },
  { label: '3:2', value: 3 / 2 },
  { label: '2:3', value: 2 / 3 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

export function ImageCropModal() {
  const { cropElementId, elements, setCropElementId, updateElementCrop } = useEditorStore();
  const element = elements.find((el) => el.id === cropElementId) as CanvasElement | undefined;
  
  const [crop, setCrop] = useState<ImageCropData>({ x: 0, y: 0, width: 100, height: 100 });
  const [activeRatio, setActiveRatio] = useState<number>(0); // 0 means free
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize crop state when opened
  useEffect(() => {
    if (element && element.imageProps) {
      if (element.imageProps.crop) {
        setCrop({ ...element.imageProps.crop });
      } else {
        setCrop({ x: 0, y: 0, width: 100, height: 100 });
      }
    }
  }, [element]);

  if (!cropElementId || !element || !element.imageProps) return null;

  const handleClose = () => {
    setCropElementId(null);
  };

  const handleConfirm = () => {
    const oldCrop = element.imageProps?.crop || { x: 0, y: 0, width: 100, height: 100 };
    
    let imgRatio = 1;
    if (containerRef.current) {
      const imgEl = containerRef.current.querySelector('img.crop-preview-img') as HTMLImageElement;
      if (imgEl && imgEl.naturalWidth && imgEl.naturalHeight) {
        imgRatio = imgEl.naturalWidth / imgEl.naturalHeight;
      }
    }
    
    // The aspect ratio of the cropped region relative to the natural image
    const cropRatio = (crop.width / crop.height) * imgRatio;
    
    const scaleX = crop.width / oldCrop.width;
    
    const newWidth = Math.max(20, Math.round(element.width * scaleX));
    // Enforce that the new container perfectly matches the crop's aspect ratio
    const newHeight = Math.max(20, Math.round(newWidth / cropRatio));
    
    updateElementCrop(cropElementId, crop, newWidth, newHeight);
    setCropElementId(null);
  };

  const setRatio = (val: number) => {
    setActiveRatio(val);
    if (val !== 0) {
      // Adjust current crop to match ratio while keeping it centered if possible
      // For simplicity, just adjust height based on current width
      let newHeight = crop.width / val;
      let newWidth = crop.width;
      
      if (newHeight > 100) {
        newHeight = 100;
        newWidth = 100 * val;
      }
      
      setCrop({
        ...crop,
        width: newWidth,
        height: newHeight,
        x: Math.min(crop.x, 100 - newWidth),
        y: Math.min(crop.y, 100 - newHeight)
      });
    }
  };

  // Basic drag logic for moving the crop box
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };

    const handleMouseMove = (me: MouseEvent) => {
      const dx = ((me.clientX - startX) / rect.width) * 100;
      const dy = ((me.clientY - startY) / rect.height) * 100;
      
      let newX = startCrop.x + dx;
      let newY = startCrop.y + dy;
      
      // Boundaries
      newX = Math.max(0, Math.min(newX, 100 - startCrop.width));
      newY = Math.max(0, Math.min(newY, 100 - startCrop.height));
      
      setCrop({ ...startCrop, x: newX, y: newY });
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };

    const handleMouseMove = (me: MouseEvent) => {
      const dx = ((me.clientX - startX) / rect.width) * 100;
      const dy = ((me.clientY - startY) / rect.height) * 100;
      
      let newCrop = { ...startCrop };
      
      if (handle.includes('e')) {
        newCrop.width = Math.max(5, Math.min(startCrop.width + dx, 100 - startCrop.x));
      }
      if (handle.includes('s')) {
        newCrop.height = Math.max(5, Math.min(startCrop.height + dy, 100 - startCrop.y));
      }
      if (handle.includes('w')) {
        const dWidth = -dx;
        const widthAllowed = Math.min(startCrop.width + dWidth, startCrop.width + startCrop.x);
        newCrop.width = Math.max(5, widthAllowed);
        newCrop.x = startCrop.x + startCrop.width - newCrop.width;
      }
      if (handle.includes('n')) {
        const dHeight = -dy;
        const heightAllowed = Math.min(startCrop.height + dHeight, startCrop.height + startCrop.y);
        newCrop.height = Math.max(5, heightAllowed);
        newCrop.y = startCrop.y + startCrop.height - newCrop.height;
      }

      setCrop(newCrop);
      if (activeRatio !== 0) setActiveRatio(0);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-content">
        <div className="crop-modal-header">
          <h3>Cắt ảnh</h3>
          <button className="crop-modal-close" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="crop-modal-body">
          {/* Left: Image Preview */}
          <div className="crop-preview-container">
            <div 
              ref={containerRef}
              style={{ position: 'relative', display: 'flex', maxWidth: '100%', maxHeight: '100%' }}
            >
              <img src={element.imageProps.src} alt="Crop preview" className="crop-preview-img" />
              
              {/* The crop overlay dark mask */}
              <div className="crop-overlay-mask" style={{
                top: 0, left: 0, right: 0, bottom: 0,
                clipPath: `polygon(
                  0% 0%, 0% 100%, 100% 100%, 100% 0%, 0% 0%, 
                  ${crop.x}% ${crop.y}%, 
                  ${crop.x + crop.width}% ${crop.y}%, 
                  ${crop.x + crop.width}% ${crop.y + crop.height}%, 
                  ${crop.x}% ${crop.y + crop.height}%, 
                  ${crop.x}% ${crop.y}%
                )`
              }}></div>
              
              {/* The draggable crop box */}
              <div 
                className="crop-box"
                style={{
                  left: `${crop.x}%`,
                  top: `${crop.y}%`,
                  width: `${crop.width}%`,
                  height: `${crop.height}%`
                }}
                onMouseDown={handleDragStart}
              >
                <div className="crop-box-grid">
                  <div></div><div></div><div></div>
                  <div></div><div></div><div></div>
                  <div></div><div></div><div></div>
                </div>
                <div className="crop-handle nw" onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
                <div className="crop-handle n" onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
                <div className="crop-handle ne" onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
                <div className="crop-handle e" onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
                <div className="crop-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')}></div>
                <div className="crop-handle s" onMouseDown={(e) => handleResizeStart(e, 's')}></div>
                <div className="crop-handle sw" onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
                <div className="crop-handle w" onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
              </div>
            </div>
          </div>
          
          {/* Right: Sidebar controls */}
          <div className="crop-sidebar">
            <div className="crop-sidebar-section">
              <h4>Tỉ lệ khung cắt:</h4>
              <div className="crop-ratios">
                {RATIOS.map(r => (
                  <button 
                    key={r.label}
                    className={`crop-ratio-btn ${activeRatio === r.value ? 'active' : ''}`}
                    onClick={() => setRatio(r.value)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="crop-modal-actions">
              <button className="crop-btn-cancel" onClick={handleClose}>Hủy</button>
              <button className="crop-btn-confirm" onClick={handleConfirm}>Xác nhận</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
