import { useState, useEffect, useRef, useCallback } from 'react';

import { templatesApi, type TemplateItem } from '../../../api/templatesApi';
import { cardsApi } from '../../../api/cardsApi';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { CardRenderer } from './CardRenderer';
import '../styles/TemplatePanel.css';

// ── Icons ─────────────────────────────────────────────────
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
    <path d="M2 18l3-11 7 6 7-6 3 11H2z" />
  </svg>
);
const TemplatesIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
  </svg>
);
const LoaderIcon = () => (
  <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
    <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /><line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
  </svg>
);

// ── Main Panel ────────────────────────────────────────────
interface TemplatePanelProps {
  onClose: () => void;
}

export function TemplatePanel({ onClose }: TemplatePanelProps) {
  const navigate = useNavigate();


  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);
  const [fullPreview, setFullPreview] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [isApplying, setIsApplying] = useState(false);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLDivElement | null) => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prev => prev + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const loadTemplates = async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      const res = await templatesApi.getTemplates({ page: pageNum, limit: 12 });
      
      if (pageNum === 1) {
        setTemplates(res.items);
      } else {
        setTemplates(prev => [...prev, ...res.items]);
      }
      
      setHasMore(pageNum < res.totalPages);
    } catch (error) {
      console.error('Failed to load templates', error);
      toast.error('Lỗi khi tải danh sách mẫu');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadTemplates(page);
  }, [page]);

  useEffect(() => {
    if (previewTemplate && !previewTemplate.thumbnailUrl) {
      setLoadingPreview(true);
      templatesApi.getTemplateById(previewTemplate.id)
        .then(data => setFullPreview(data))
        .catch(err => console.error(err))
        .finally(() => setLoadingPreview(false));
    } else {
      setFullPreview(null);
    }
  }, [previewTemplate]);

  useEffect(() => {
    if (fullPreview && previewContainerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
          const { width } = entry.contentRect;
          if (width > 0) {
            setPreviewScale(width / 500); // Changed to 500px as per user request
          }
        }
      });
      resizeObserver.observe(previewContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [fullPreview]);

  const handleApplyTemplate = async (template: TemplateItem) => {
    try {
      setIsApplying(true);

      // Tạo thiệp mới từ template (không cần save canvas hiện tại — đã auto-save mỗi 30s)
      const newCard = await cardsApi.createCard({
        title: `Thiệp từ mẫu ${template.name}`,
        templateId: template.id
      });
      
      toast.success('Đã tạo thiệp mới từ mẫu!');
      onClose();
      
      navigate(`/loading?next=${encodeURIComponent(`/design?id=${newCard.id}`)}&message=${encodeURIComponent('Đang mở trình thiết kế...')}`);
      
    } catch (error) {
      console.error('Failed to apply template', error);
      toast.error('Có lỗi xảy ra khi tạo thiệp từ mẫu');
    } finally {
      setIsApplying(false);
      setPreviewTemplate(null);
    }
  };

  return (
    <>
      <div className="lt-template-panel">
        <div className="lt-template-header">
          <div className="lt-template-title">
            <TemplatesIcon /> Mẫu thiết kế
          </div>
          <button className="panel-collapse-btn" onClick={onClose} title="Thu gọn">
            <ChevronLeft size={16} />
          </button>
        </div>

        <div className="lt-template-body">
          {loading ? (
            <div className="lt-template-loader">Đang tải danh sách mẫu...</div>
          ) : (
            <>
              <div className="lt-template-grid">
                {templates.map((tpl, index) => {
                  const isLast = index === templates.length - 1;
                  return (
                    <div
                      key={tpl.id}
                      ref={isLast ? lastElementRef : null}
                      className="lt-template-item"
                      onClick={() => setPreviewTemplate(tpl)}
                    >
                      <div className="lt-template-thumb-wrap">
                        {tpl.thumbnailUrl ? (
                          <img src={tpl.thumbnailUrl} alt={tpl.name} className="lt-template-img" />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: '#eee' }} />
                        )}
                        {tpl.isPremium && (
                          <div className="lt-template-premium">
                            <CrownIcon />
                          </div>
                        )}
                      </div>
                      <div className="lt-template-name" title={tpl.name}>{tpl.name}</div>
                    </div>
                  );
                })}
              </div>
              {loadingMore && <div className="lt-template-loader" style={{ padding: '10px' }}>Đang tải thêm...</div>}
              {!hasMore && templates.length > 0 && <div className="lt-template-loader" style={{ padding: '10px' }}>Đã hết mẫu thiết kế.</div>}
              {!loading && templates.length === 0 && <div className="lt-template-loader">Không có mẫu thiết kế nào.</div>}
            </>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {previewTemplate && (
        <div className="lt-template-preview-overlay" onClick={() => !isApplying && setPreviewTemplate(null)}>
          <div className="lt-template-preview-modal" onClick={e => e.stopPropagation()}>
            <div className="lt-template-preview-header">
              <h3 className="lt-template-preview-title">{previewTemplate.name}</h3>
              <button className="lt-template-close-btn" onClick={() => setPreviewTemplate(null)} disabled={isApplying}>
                <CloseIcon />
              </button>
            </div>
            
            <div className="lt-template-preview-img-wrap" ref={previewContainerRef} style={{ overflowY: 'auto' }}>
              {previewTemplate.thumbnailUrl ? (
                <img src={previewTemplate.thumbnailUrl} alt={previewTemplate.name} className="lt-template-preview-img" />
              ) : loadingPreview ? (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ed-text-secondary)' }}>
                  <LoaderIcon />
                </div>
              ) : fullPreview ? (
                <div style={{ 
                  width: '100%', 
                  height: (fullPreview.canvasHeight || Math.max(2000, ...(fullPreview.blocks?.map((b: any) => (b.posY || 0) + (b.height || 0)) || [2000])) + 100) * previewScale 
                }}>
                  <div style={{ 
                    width: fullPreview.canvasWidth || 500, // Dynamic width
                    height: fullPreview.canvasHeight || Math.max(2000, ...(fullPreview.blocks?.map((b: any) => (b.posY || 0) + (b.height || 0)) || [2000])) + 100,
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left'
                  }}>
                    <CardRenderer 
                      elements={(fullPreview.blocks || []).map((block: any) => {
                        const base = {
                          id: block.id,
                          x: block.posX,
                          y: block.posY,
                          width: block.width,
                          height: block.height,
                          rotation: block.rotation,
                          zIndex: block.zIndex,
                          isSelected: false,
                          animationProps: block.style ?? undefined,
                        };
                        if (block.blockType === 'text') return { ...base, type: 'text', textProps: block.content };
                        if (block.blockType === 'image') return { ...base, type: 'image', imageProps: block.content };
                        if (block.blockType === 'shape') return { ...base, type: 'shape', shapeProps: block.content };
                        if (block.blockType === 'countdown') return { ...base, type: 'countdown', countdownProps: block.content };
                        if (block.blockType === 'map') return { ...base, type: 'map', mapProps: block.content };
                        if (block.blockType === 'qr_code') return { ...base, type: 'qr_code', qrGiftBoxProps: block.content };
                        if (block.blockType === 'calendar') return { ...base, type: 'calendar', calendarProps: block.content };
                        if (block.blockType === 'gallery') return { ...base, type: 'album', albumProps: block.content };
                        if (block.blockType === 'rsvp_form') return { ...base, type: 'form', formProps: block.content };
                        if (block.blockType === 'button') return { ...base, type: 'button_contact', buttonContactProps: block.content };
                        return { ...base, type: 'text', textProps: block.content };
                      })} 
                      background={fullPreview.background || { type: 'solid', color: '#fff' }} 
                      canvasWidth={500} 
                    />
                  </div>
                </div>
              ) : (
                <div style={{ width: '100%', height: '100%', background: '#eee' }} />
              )}
            </div>

            <div className="lt-template-preview-actions">
              <button 
                className="lt-template-btn-cancel" 
                onClick={() => setPreviewTemplate(null)}
                disabled={isApplying}
              >
                Hủy
              </button>
              <button 
                className="lt-template-btn-confirm" 
                onClick={() => handleApplyTemplate(previewTemplate)}
                disabled={isApplying}
              >
                {isApplying && <LoaderIcon />}
                Sử dụng mẫu này
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
