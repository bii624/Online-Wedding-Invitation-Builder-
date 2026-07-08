import React, { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { imageProcessApi } from '../../../../api/imageProcessApi';
import { toast } from 'sonner';
import { RefreshIcon } from '../RightPanels/RightPanelShared';
import { Paintbrush, X, Sparkles } from 'lucide-react';
import '../../styles/AIModals.css';

export function AIRemoveObjectModal() {
  const { aiModalState, setAiModalState, elements, updateImageProp, pushHistory } = useEditorStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);

  const imgRef = useRef<HTMLImageElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);

  useEffect(() => {
    setResultImg(null);
  }, [aiModalState?.elementId]);

  if (aiModalState?.type !== 'remove-object') return null;

  const element = elements.find(el => el.id === aiModalState.elementId);
  if (!element || element.type !== 'image' || !element.imageProps) return null;

  const originalSrc = element.imageProps.src;
  const currentSrc = resultImg || originalSrc;

  const handleClose = () => {
    setAiModalState(null);
  };

  const initCanvases = () => {
    if (!imgRef.current || !displayCanvasRef.current || !maskCanvasRef.current) return;
    const nw = imgRef.current.naturalWidth;
    const nh = imgRef.current.naturalHeight;

    displayCanvasRef.current.width = nw;
    displayCanvasRef.current.height = nh;
    maskCanvasRef.current.width = nw;
    maskCanvasRef.current.height = nh;

    const mCtx = maskCanvasRef.current.getContext('2d');
    if (mCtx) {
      mCtx.fillStyle = 'black';
      mCtx.fillRect(0, 0, nw, nh);
    }
    
    const dCtx = displayCanvasRef.current.getContext('2d');
    if (dCtx) {
      dCtx.clearRect(0, 0, nw, nh);
    }
  };

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!displayCanvasRef.current) return { x: 0, y: 0 };
    const rect = displayCanvasRef.current.getBoundingClientRect();
    
    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const scaleX = displayCanvasRef.current.width / rect.width;
    const scaleY = displayCanvasRef.current.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    draw(e);
  };

  const stopDrawing = () => {
    isDrawing.current = false;
    const dCtx = displayCanvasRef.current?.getContext('2d');
    const mCtx = maskCanvasRef.current?.getContext('2d');
    if (dCtx) dCtx.beginPath();
    if (mCtx) mCtx.beginPath();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;
    e.preventDefault();

    const { x, y } = getCoordinates(e);
    
    const dCtx = displayCanvasRef.current?.getContext('2d');
    const mCtx = maskCanvasRef.current?.getContext('2d');

    if (dCtx && mCtx) {
      dCtx.lineWidth = brushSize;
      dCtx.lineCap = 'round';
      dCtx.strokeStyle = 'rgba(239, 68, 68, 0.5)'; // red semi-transparent

      mCtx.lineWidth = brushSize;
      mCtx.lineCap = 'round';
      mCtx.strokeStyle = 'white';

      dCtx.lineTo(x, y);
      dCtx.stroke();
      dCtx.beginPath();
      dCtx.moveTo(x, y);

      mCtx.lineTo(x, y);
      mCtx.stroke();
      mCtx.beginPath();
      mCtx.moveTo(x, y);
    }
  };

  const processImage = async () => {
    if (!maskCanvasRef.current) return;
    setIsProcessing(true);
    try {
      let base64Image = '';
      if (originalSrc.startsWith('data:image')) {
        base64Image = originalSrc.split(',')[1];
      } else {
        const response = await fetch(originalSrc);
        const blob = await response.blob();
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const maskDataUrl = maskCanvasRef.current.toDataURL('image/png');
      const base64Mask = maskDataUrl.split(',')[1];

      const res = await imageProcessApi.process({
        image: base64Image,
        operation: 'remove-object',
        mask: base64Mask
      });

      if (res.success && res.result) {
        setResultImg(res.result);
        initCanvases(); // clear drawing
        toast.success('Xử lý thành công!');
      } else {
        toast.error(res.error || 'Lỗi khi xóa đối tượng');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa đối tượng');
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
    initCanvases();
  };

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-content">
        <div className="ai-modal-header">
          <div className="ai-modal-header-left">
            <div className="ai-modal-header-icon">
              <Paintbrush />
            </div>
            <div className="ai-modal-header-text">
              <h3>Xóa đối tượng bằng AI</h3>
              <p>Bôi lên những đối tượng bạn muốn xóa khỏi bức ảnh.</p>
            </div>
          </div>
          <button className="ai-modal-close" onClick={handleClose}><X /></button>
        </div>
        <div className="ai-modal-body">
          <div className="ai-preview-container">
            <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%', maxHeight: '100%' }}>
              <img 
                ref={imgRef}
                src={currentSrc} 
                alt="Preview" 
                onLoad={initCanvases}
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  display: 'block',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }} 
              />
              
              {!resultImg && (
                <canvas
                  ref={displayCanvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseOut={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="ai-brush-cursor"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 10
                  }}
                />
              )}
              
              <canvas ref={maskCanvasRef} style={{ display: 'none' }} />

              {isProcessing && (
                <div className="ai-scanner-overlay">
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
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5', marginBottom: 20 }}>
                Bôi đỏ lên các phần tử bạn muốn xóa. AI sẽ tự động tái tạo lại vùng nền phía sau.
              </p>
              
              {!resultImg && (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    Kích thước cọ: {brushSize}px
                  </label>
                  <input 
                    type="range" 
                    min="5" 
                    max="100" 
                    value={brushSize} 
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                    style={{ width: '100%' }}
                  />
                </div>
              )}
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
