import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { imageProcessApi } from '../../../../api/imageProcessApi';
import { toast } from 'sonner';
import { RefreshIcon } from '../RightPanels/RightPanelShared';
import { Expand, X, Sparkles } from 'lucide-react';
import '../../styles/AIModals.css';

export function AIExpandModal() {
  const { aiModalState, setAiModalState, elements, updateImageProp, pushHistory } = useEditorStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [scale, setScale] = useState(1);

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Store expansion in physical screen pixels
  const [expandDisplay, setExpandDisplay] = useState({ top: 0, right: 0, bottom: 0, left: 0 });

  if (aiModalState?.type !== 'expand') return null;

  const element = elements.find(el => el.id === aiModalState.elementId);
  if (!element || element.type !== 'image' || !element.imageProps) return null;

  const originalSrc = element.imageProps.src;
  const currentSrc = resultImg || originalSrc;

  const handleClose = () => {
    setAiModalState(null);
  };

  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startExpand = { ...expandDisplay };

    const handleMouseMove = (me: MouseEvent) => {
      // Adjust dx/dy by current scale so dragging matches visual movement
      const dx = (me.clientX - startX) / scale;
      const dy = (me.clientY - startY) / scale;
      
      const newExpand = { ...startExpand };
      
      if (handle.includes('e')) {
        newExpand.right = Math.max(0, startExpand.right + dx);
      }
      if (handle.includes('s')) {
        newExpand.bottom = Math.max(0, startExpand.bottom + dy);
      }
      if (handle.includes('w')) {
        newExpand.left = Math.max(0, startExpand.left - dx);
      }
      if (handle.includes('n')) {
        newExpand.top = Math.max(0, startExpand.top - dy);
      }

      setExpandDisplay(newExpand);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const processImage = async () => {
    if (!imgRef.current) return;
    setIsProcessing(true);
    try {
      // Calculate real pixels based on natural size vs display size
      const naturalW = imgRef.current.naturalWidth;
      const displayW = imgRef.current.width;
      const scale = naturalW / displayW;

      const expandPx = {
        top: Math.round(expandDisplay.top * scale),
        right: Math.round(expandDisplay.right * scale),
        bottom: Math.round(expandDisplay.bottom * scale),
        left: Math.round(expandDisplay.left * scale),
      };

      // If no expansion, just return
      if (expandPx.top === 0 && expandPx.right === 0 && expandPx.bottom === 0 && expandPx.left === 0) {
        toast.info('Vui lòng kéo khung để mở rộng ảnh');
        setIsProcessing(false);
        return;
      }

      let base64 = '';
      if (originalSrc.startsWith('data:image')) {
        base64 = originalSrc.split(',')[1];
      } else {
        const response = await fetch(originalSrc);
        const blob = await response.blob();
        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const res = await imageProcessApi.process({
        image: base64 as string,
        operation: 'expand',
        expandPx,
      });

      if (res.success && res.result) {
        setResultImg(res.result);
        setExpandDisplay({ top: 0, right: 0, bottom: 0, left: 0 }); // reset box
        toast.success('Xử lý thành công!');
      } else {
        toast.error(res.error || 'Lỗi khi mở rộng ảnh');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi mở rộng ảnh');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    if (resultImg) {
      updateImageProp(element.id, 'src', resultImg);
      pushHistory();
    }
    handleClose();
  };

  const handleReset = () => {
    setResultImg(null);
    setExpandDisplay({ top: 0, right: 0, bottom: 0, left: 0 });
  };

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-content">
        <div className="ai-modal-header">
          <div className="ai-modal-header-left">
            <div className="ai-modal-header-icon">
              <Expand />
            </div>
            <div className="ai-modal-header-text">
              <h3>Mở rộng ảnh bằng AI</h3>
              <p>Kéo các cạnh để mở rộng kích thước hình ảnh theo ý muốn.</p>
            </div>
          </div>
          <button className="ai-modal-close" onClick={handleClose}><X /></button>
        </div>
        <div className="ai-modal-body">
          <div className="ai-preview-container" ref={containerRef}>
            <div style={{ 
              position: 'relative', 
              display: 'inline-block',
              transform: `scale(${scale})`,
              transformOrigin: 'center',
              transition: 'transform 0.1s ease-out'
            }}>
              <img 
                ref={imgRef}
                src={currentSrc} 
                alt="Preview" 
                style={{
                  maxWidth: '50vw',
                  maxHeight: '50vh',
                  display: 'block',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              
              {!resultImg && (
                <div 
                  className="expand-box"
                  style={{
                    top: -expandDisplay.top,
                    right: -expandDisplay.right,
                    bottom: -expandDisplay.bottom,
                    left: -expandDisplay.left,
                  }}
                >
                  <div className="expand-handle nw" onMouseDown={(e) => handleResizeStart(e, 'nw')}></div>
                  <div className="expand-handle n" onMouseDown={(e) => handleResizeStart(e, 'n')}></div>
                  <div className="expand-handle ne" onMouseDown={(e) => handleResizeStart(e, 'ne')}></div>
                  <div className="expand-handle e" onMouseDown={(e) => handleResizeStart(e, 'e')}></div>
                  <div className="expand-handle se" onMouseDown={(e) => handleResizeStart(e, 'se')}></div>
                  <div className="expand-handle s" onMouseDown={(e) => handleResizeStart(e, 's')}></div>
                  <div className="expand-handle sw" onMouseDown={(e) => handleResizeStart(e, 'sw')}></div>
                  <div className="expand-handle w" onMouseDown={(e) => handleResizeStart(e, 'w')}></div>
                </div>
              )}

              {isProcessing && (
                <div className="ai-scanner-overlay" style={{
                  top: -expandDisplay.top,
                  right: -expandDisplay.right,
                  bottom: -expandDisplay.bottom,
                  left: -expandDisplay.left,
                }}>
                  <div className="ai-scanner-line"></div>
                  <div className="ai-loader-container">
                    <div className="ai-loader-icon">
                      <Sparkles />
                    </div>
                    <div className="ai-loader-text">AI Đang Xử Lý...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="ai-sidebar">
            <div className="ai-sidebar-section">
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Thu phóng hình ảnh</span>
                  <span style={{ fontSize: '13px', color: '#666' }}>{Math.round(scale * 100)}%</span>
                </div>
                <input 
                  type="range" 
                  min="0.2" max="2.5" step="0.1" 
                  value={scale} 
                  onChange={(e) => setScale(Number(e.target.value))}
                  className="ai-zoom-slider"
                />
              </div>

              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                Kéo các điểm neo ra ngoài để xác định vùng mở rộng. AI sẽ tự động tạo ra nội dung phù hợp với phần mở rộng.
              </p>
            </div>
            <div className="ai-modal-actions">
              {!resultImg ? (
                <button className="ai-btn-process" onClick={processImage} disabled={isProcessing}>
                  {isProcessing ? 'Đang xử lý...' : 'Xử lý'}
                </button>
              ) : (
                <>
                  <button className="ai-btn-apply" onClick={handleApply}>
                    Áp dụng
                  </button>
                  <button className="ai-btn-reset" onClick={handleReset}>
                    <span style={{ display: 'inline-flex', width: 16, height: 16 }}><RefreshIcon /></span> Đặt lại
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
