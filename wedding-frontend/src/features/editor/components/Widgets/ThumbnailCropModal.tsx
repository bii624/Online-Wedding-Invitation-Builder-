import React, { useState, useRef, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { cardsApi } from '../../../../api/cardsApi';
import { toast } from 'sonner';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  cardId: string;
  onCropSuccess: (newUrl: string) => void;
}

const RATIOS = [
  { label: '3:2', value: 3 / 2 },
  { label: '4:3', value: 4 / 3 },
  { label: '16:9', value: 16 / 9 },
];

export function ThumbnailCropModal({ isOpen, onClose, imageUrl, cardId, onCropSuccess }: Props) {
  const [activeRatio, setActiveRatio] = useState<number>(3 / 2);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 80, height: 80 });
  const [imgLoaded, setImgLoaded] = useState(false);

  const applyRatio = (ratio: number, currentWidth: number = crop.width) => {
    if (!imgRef.current) return;
    const imgRatio = imgRef.current.clientWidth / imgRef.current.clientHeight;
    let newWidth = currentWidth;
    let newHeight = newWidth * (imgRatio / ratio);
    
    if (newHeight > 100) {
      newHeight = 100;
      newWidth = 100 * (ratio / imgRatio);
    }
    setCrop(prev => ({ 
      ...prev, 
      width: newWidth, 
      height: newHeight, 
      x: Math.min(prev.x, 100 - newWidth), 
      y: Math.min(prev.y, 100 - newHeight) 
    }));
  };

  useEffect(() => {
    if (isOpen) {
      setImgLoaded(false);
      setCrop({ x: 10, y: 10, width: 80, height: 80 });
      setActiveRatio(3 / 2);
    }
  }, [isOpen, imageUrl]);

  useEffect(() => {
    if (imgLoaded) {
      applyRatio(activeRatio);
    }
  }, [activeRatio, imgLoaded]);

  if (!isOpen || !imageUrl) return null;

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
      
      let newX = Math.max(0, Math.min(startCrop.x + dx, 100 - startCrop.width));
      let newY = Math.max(0, Math.min(startCrop.y + dy, 100 - startCrop.height));
      
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
    if (!containerRef.current || !imgRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const startX = e.clientX;
    const startY = e.clientY;
    const startCrop = { ...crop };
    const imgRatio = imgRef.current.clientWidth / imgRef.current.clientHeight;

    const handleMouseMove = (me: MouseEvent) => {
      const dx = ((me.clientX - startX) / rect.width) * 100;
      let newWidth = startCrop.width + dx;
      
      if (newWidth < 10) newWidth = 10;
      if (startCrop.x + newWidth > 100) newWidth = 100 - startCrop.x;

      let newHeight = newWidth * (imgRatio / activeRatio);
      
      if (startCrop.y + newHeight > 100) {
        newHeight = 100 - startCrop.y;
        newWidth = newHeight * (activeRatio / imgRatio);
      }

      setCrop(prev => ({ ...prev, width: newWidth, height: newHeight }));
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleConfirm = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);
    try {
      // 1. Load image to a canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });

      // 2. Calculate crop pixel coordinates based on natural size
      const cropPxX = (crop.x / 100) * img.naturalWidth;
      const cropPxY = (crop.y / 100) * img.naturalHeight;
      const cropPxW = (crop.width / 100) * img.naturalWidth;
      const cropPxH = (crop.height / 100) * img.naturalHeight;

      canvas.width = cropPxW;
      canvas.height = cropPxH;

      ctx?.drawImage(img, cropPxX, cropPxY, cropPxW, cropPxH, 0, 0, cropPxW, cropPxH);

      // 3. Convert to Blob
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Canvas to blob failed');
        const file = new File([blob], 'cover.webp', { type: 'image/webp' });
        
        // Dynamic import to avoid circular dependencies if any, or just ensure assetsApi is imported at top
        const { assetsApi } = await import('../../../../api/assetsApi');
        const asset = await assetsApi.uploadAsset(file);
        onCropSuccess(asset.url);
        onClose();
        setIsProcessing(false);
      }, 'image/webp', 0.8);
    } catch (err: any) {
      toast.error('Có lỗi khi cắt ảnh: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-800">Cắt ảnh bìa</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-auto flex flex-col items-center">
          <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl">
            {RATIOS.map(r => (
              <button
                key={r.label}
                onClick={() => setActiveRatio(r.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeRatio === r.value 
                    ? 'bg-white shadow-sm text-rose-500' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div 
            ref={containerRef}
            className="relative bg-gray-100 rounded-xl overflow-hidden select-none"
            style={{ maxWidth: '100%', maxHeight: '500px' }}
          >
            <img 
              ref={imgRef}
              src={imageUrl} 
              alt="Preview" 
              className="max-w-full max-h-[500px] object-contain block pointer-events-none"
              crossOrigin="anonymous"
              onLoad={() => {
                setImgLoaded(true);
              }}
            />

            {/* Crop Overlay */}
            <div className="absolute inset-0 bg-black/50 pointer-events-none" />
            
            {/* Crop Window */}
            <div 
              className="absolute border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] cursor-move"
              style={{
                left: `${crop.x}%`,
                top: `${crop.y}%`,
                width: `${crop.width}%`,
                height: `${crop.height}%`,
              }}
              onMouseDown={handleDragStart}
            >
              {/* Inner grid lines */}
              <div className="absolute inset-0 pointer-events-none flex flex-col justify-evenly">
                <div className="w-full h-px bg-white/30" />
                <div className="w-full h-px bg-white/30" />
              </div>
              <div className="absolute inset-0 pointer-events-none flex justify-evenly">
                <div className="w-px h-full bg-white/30" />
                <div className="w-px h-full bg-white/30" />
              </div>

              {/* Resize Handle (Bottom Right) */}
              <div 
                className="absolute -right-2 -bottom-2 w-4 h-4 bg-white rounded-full shadow cursor-se-resize pointer-events-auto"
                onMouseDown={(e) => handleResizeStart(e, 'se')}
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50 rounded-b-2xl">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button 
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-6 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-rose-500 to-rose-400 hover:from-rose-600 hover:to-rose-500 shadow-sm shadow-rose-200 flex items-center gap-2"
          >
            {isProcessing ? 'Đang xử lý...' : (
              <>
                <Check size={18} /> Xác nhận cắt
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
