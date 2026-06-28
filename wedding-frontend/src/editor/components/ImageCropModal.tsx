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
    // Calculate new width and height for the canvas element based on crop ratio change
    const oldCrop = element.imageProps?.crop || { x: 0, y: 0, width: 100, height: 100 };
    
    const scaleX = crop.width / oldCrop.width;
    const scaleY = crop.height / oldCrop.height;
    
    const newWidth = Math.max(20, Math.round(element.width * scaleX));
    const newHeight = Math.max(20, Math.round(element.height * scaleY));
    
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

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-content">
        <div className="crop-modal-header">
          <h3>Cắt ảnh</h3>
          <button className="crop-modal-close" onClick={handleClose}>&times;</button>
        </div>
        
        <div className="crop-modal-body">
          {/* Left: Image Preview */}
          <div className="crop-preview-container" ref={containerRef}>
            <img src={element.imageProps.src} alt="Crop preview" className="crop-preview-img" />
            
            {/* The crop overlay dark mask */}
            <div className="crop-overlay-mask" style={{
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
              {/* Note: In a full version, we'd add 8 resize handles here */}
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
