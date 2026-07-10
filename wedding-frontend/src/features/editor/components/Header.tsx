// ============================================================
// HEADER COMPONENT
// ============================================================

import '../styles/Header.css';
import { useEditorStore } from '../store/editorStore';
import { useAuthStore } from '../../../store/authStore';
import { RevolvingHeartsIcon } from '../../../components/icons/emojione-revolving-hearts';
import { useNavigate } from 'react-router-dom';

// SVG Icons as inline components for zero deps
const UndoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7v6h6" /><path d="M3 13C5.33 7.67 9.73 4 15 4c5.52 0 9 3.58 9 8s-3.48 8-9 8c-3.73 0-6.97-1.95-8.73-4.87" />
  </svg>
);
const RedoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 7v6h-6" /><path d="M21 13C18.67 7.67 14.27 4 9 4c-5.52 0-9 3.58-9 8s3.48 8 9 8c3.73 0 6.97-1.95 8.73-4.87" />
  </svg>
);
const PreviewIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const PublishIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

import { useState } from 'react';
import { PreviewModal } from './PreviewModal';
import { PublishModal } from './PublishModal';
import { adminApi } from '../../admin/api/adminApi';
import { toast } from 'sonner';

const AUTO_SAVE_LABELS: Record<string, { label: string; color: string; pulse: boolean }> = {
  idle: { label: 'Sẵn sàng', color: '#9ca3af', pulse: false },
  saving: { label: 'Đang lưu...', color: '#f59e0b', pulse: true },
  saved: { label: 'Đã lưu', color: '#10b981', pulse: false },
  error: { label: 'Lỗi lưu!', color: '#ef4444', pulse: false },
};

export function Header() {
  const [showPreview, setShowPreview] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  const { undo, redo, historyIndex, history, autoSaveStatus, saveCanvasNow, saveTemplateNow, cardId, templateId, editorMode } = useEditorStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const statusInfo = AUTO_SAVE_LABELS[autoSaveStatus] ?? AUTO_SAVE_LABELS.idle;

  const handlePublishClick = async () => {
    if (editorMode === 'template') {
      if (!templateId) return;
      if (!window.confirm('Bạn có chắc muốn phát hành template này? Khách hàng sẽ có thể nhìn thấy và sử dụng template này trên thư viện.')) return;
      
      try {
        await saveTemplateNow();
        await adminApi.updateTemplateStatus(templateId, 'published');
        toast.success('Đã xuất bản template thành công!');
      } catch (err) {
        toast.error('Lỗi khi xuất bản template');
      }
    } else {
      setShowPublish(true);
    }
  };

  const handleLogoClick = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
      return;
    }

    navigate('/dashboard/overview');
  };

  return (
    <header className="editor-header">
      {/* Left: Logo + History */}
      <div className="header-left">
        <div
          className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          onClick={handleLogoClick}
        >
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl transition-transform group-hover:rotate-12 shadow-sm">
            <RevolvingHeartsIcon size={28} color="#fff" />
          </div>
          <span className="hidden md:inline text-2xl font-serif font-black text-white drop-shadow-sm">DearLove</span>
        </div>
        <div className="header-history">
          <button
            id="btn-undo"
            className="header-history-btn"
            onClick={undo}
            disabled={!canUndo}
            title="Hoàn tác (Ctrl+Z)"
          >
            <UndoIcon />
          </button>
          <button
            id="btn-redo"
            className="header-history-btn"
            onClick={redo}
            disabled={!canRedo}
            title="Làm lại (Ctrl+Y)"
          >
            <RedoIcon />
          </button>
        </div>
      </div>

      {/* Center: Auto-save status */}
      <div className="header-status">
        {/* Dot / Spinner indicator */}
        {autoSaveStatus === 'saving' ? (
          <span className="header-status-spinner" />
        ) : (
          <span
            className="header-status-dot"
            style={{
              backgroundColor: statusInfo.color,
              animation: autoSaveStatus === 'idle' ? 'none' : 'pulse-dot 2s infinite',
            }}
          />
        )}

        {/* Label */}
        <span style={{ color: statusInfo.color, fontSize: 12, fontWeight: 500, transition: 'color 0.3s' }}>
          {statusInfo.label}
        </span>

        {/* "Lưu ngay" button - luôn hiện cho card (nếu chưa có cardId sẽ tạo mới khi bấm), hoặc hiện cho template nếu có templateId */}
        {(editorMode === 'card' || templateId) && autoSaveStatus !== 'saving' && (
          <button
            onClick={editorMode === 'template' ? saveTemplateNow : saveCanvasNow}
            title="Lưu ngay (Ctrl+S)"
            style={{
              marginLeft: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 9px',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.22)',
              background: 'rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.85)',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.1)'; }}
          >
            <SaveIcon />
            Lưu ngay
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="header-actions">
        <button id="btn-preview" className="header-btn header-btn-ghost" onClick={() => setShowPreview(true)}>
          <PreviewIcon />
          Xem trước
        </button>
        <div className="header-divider" />
        <button id="btn-publish" className="header-btn header-btn-publish" onClick={handlePublishClick}>
          <PublishIcon />
          Xuất bản
        </button>
        <div className="header-divider" />
        <div className="header-avatar" title="Hồ sơ người dùng" style={{ overflow: 'hidden' }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            user?.fullName ? user.fullName.charAt(0) : 'U'
          )}
        </div>
      </div>

      <PreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)} />
      <PublishModal isOpen={showPublish} onClose={() => setShowPublish(false)} />
    </header>
  );
}
