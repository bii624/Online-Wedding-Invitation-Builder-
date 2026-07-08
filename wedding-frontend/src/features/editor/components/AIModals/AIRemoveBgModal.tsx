import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { imageProcessApi } from '../../../../api/imageProcessApi';
import { toast } from 'sonner';
import { EraserIcon, RefreshIcon } from '../RightPanels/RightPanelShared';
import { X, Sparkles } from 'lucide-react';
import '../../styles/AIModals.css';

export function AIRemoveBgModal() {
  const { aiModalState, setAiModalState, elements, updateImageProp, pushHistory } = useEditorStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImg, setResultImg] = useState<string | null>(null);

  useEffect(() => {
    setResultImg(null);
  }, [aiModalState?.elementId]);

  if (aiModalState?.type !== 'remove-bg') return null;

  const element = elements.find(el => el.id === aiModalState.elementId);
  if (!element || element.type !== 'image' || !element.imageProps) return null;

  const originalSrc = element.imageProps.src;
  const currentSrc = resultImg || originalSrc;

  const handleClose = () => {
    setAiModalState(null);
  };

  const processImage = async () => {
    setIsProcessing(true);
    try {
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
        operation: 'remove-bg',
      });

      if (res.success && res.result) {
        setResultImg(res.result);
        toast.success('Xử lý thành công!');
      } else {
        toast.error(res.error || 'Lỗi khi xóa nền');
      }
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa nền');
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
  };

  return (
    <div className="ai-modal-overlay">
      <div className="ai-modal-content">
        <div className="ai-modal-header">
          <div className="ai-modal-header-left">
            <div className="ai-modal-header-icon">
              <EraserIcon />
            </div>
            <div className="ai-modal-header-text">
              <h3>Xóa nền bằng AI</h3>
              <p>Tự động tách chủ thể ra khỏi nền một cách chính xác.</p>
            </div>
          </div>
          <button className="ai-modal-close" onClick={handleClose}><X /></button>
        </div>
        <div className="ai-modal-body">
          <div className="ai-preview-container">
            <img src={currentSrc} alt="Preview" className="ai-preview-img" />
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
          <div className="ai-sidebar">
            <div className="ai-sidebar-section">
              <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                Công cụ Xóa nền AI sẽ tự động tách chủ thể ra khỏi nền một cách chính xác. Nhấn <strong>Xử lý</strong> để bắt đầu.
              </p>
            </div>
            <div className="ai-modal-actions">
              {!resultImg ? (
                <button className="ai-btn-process" onClick={processImage} disabled={isProcessing}>
                  <span style={{ display: 'inline-flex', width: 20, height: 20 }}><EraserIcon /></span>
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
