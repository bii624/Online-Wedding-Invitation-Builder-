import React, { useEffect, useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { CardRenderer } from './CardRenderer';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PreviewModal({ isOpen, onClose }: PreviewModalProps) {
  const { elements, canvasBackground, canvasWidth, canvasHeight, cardId } = useEditorStore();
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMobile = windowSize.w < 768;

  // Phone mockup dimensions
  const PHONE_INNER_W = 500;
  const PHONE_INNER_H = 926;
  
  // Calculate dynamic scale based on the actual measured container width (fixes scrollbar clipping)
  const actualContainerWidth = containerWidth || (isMobile ? windowSize.w - 32 : PHONE_INNER_W);
  const scale = actualContainerWidth / canvasWidth;

  // Scale down the phone mockup if the user's screen is too small
  const phoneFrameH = PHONE_INNER_H + 24;
  const phoneFrameW = PHONE_INNER_W + 24;
  const phoneScale = isMobile ? 1 : Math.min(1, (windowSize.h - 100) / phoneFrameH, (windowSize.w - 40) / phoneFrameW);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/view/${cardId || 'preview'}`;
    navigator.clipboard.writeText(link);
    alert('Đã copy link mời!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
      onClick={onClose}
    >
      <style>{`
        .preview-scroll-container::-webkit-scrollbar {
          width: 0px;
          background: transparent;
        }
        .preview-scroll-container {
          scrollbar-width: none;
        }
      `}</style>
      <div 
        style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside
      >
        {isMobile ? (
          // Mobile view: Full screen without phone mockup
          <div
            ref={containerRef}
            className="preview-scroll-container"
            style={{
              width: windowSize.w - 32,
              height: windowSize.h - 80,
              position: 'relative',
              borderRadius: 8,
              overflowY: 'auto',
              overflowX: 'hidden',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
              backgroundColor: '#fff',
            }}
          >
            <div style={{
              width: actualContainerWidth,
              height: canvasHeight * scale,
              position: 'relative',
            }}>
              <div style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                position: 'absolute',
                top: 0,
                left: 0,
              }}>
                <CardRenderer elements={elements} background={canvasBackground} canvasWidth={canvasWidth} />
              </div>
            </div>
          </div>
        ) : (
          // Desktop view: Phone mockup
          <div
            style={{
              width: phoneFrameW,
              height: phoneFrameH,
              backgroundColor: '#000',
              borderRadius: 36,
              padding: 12,
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              transform: `scale(${phoneScale})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Notch */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 120,
                height: 24,
                backgroundColor: '#000',
                borderBottomLeftRadius: 16,
                borderBottomRightRadius: 16,
                zIndex: 10,
              }}
            />
            
            {/* Screen */}
            <div
              ref={containerRef}
              className="preview-scroll-container"
              style={{
                width: PHONE_INNER_W,
                height: PHONE_INNER_H,
                backgroundColor: '#fff',
                borderRadius: 24,
                overflowY: 'auto',
                overflowX: 'hidden',
                position: 'relative',
              }}
            >
              <div style={{
                width: actualContainerWidth,
                height: canvasHeight * scale,
                position: 'relative',
              }}>
                <div style={{
                  width: canvasWidth,
                  height: canvasHeight,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}>
                  <CardRenderer elements={elements} background={canvasBackground} canvasWidth={canvasWidth} />
                </div>
              </div>
            </div>

            {/* Home Indicator */}
            <div
              style={{
                position: 'absolute',
                bottom: 18,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 100,
                height: 4,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 4,
                zIndex: 10,
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ marginTop: 24, display: 'flex', gap: 16 }}>
          <button
            onClick={handleCopyLink}
            style={{
              backgroundColor: '#f43f5e',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 14,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 6px -1px rgba(244, 63, 94, 0.3)',
            }}
          >
            Copy link mời
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: 9999,
              fontWeight: 600,
              fontSize: 14,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
