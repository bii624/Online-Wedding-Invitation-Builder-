// ============================================================
// HEADER COMPONENT
// ============================================================

import '../styles/Header.css';
import { useEditorStore } from '../store/editorStore';
import { useAuthStore } from '../../store/authStore';
import { RevolvingHeartsIcon } from '../../components/icons/emojione-revolving-hearts';
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

export function Header() {
  const { undo, redo, historyIndex, history } = useEditorStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <header className="editor-header">
      {/* Left: Logo + History */}
      <div className="header-left">
        <div 
          className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
          onClick={() => navigate('/')}
        >
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl transition-transform group-hover:rotate-12 shadow-sm">
            <RevolvingHeartsIcon size={28} color="#fff" />
          </div>
          <span className="text-2xl font-serif font-black text-white drop-shadow-sm">DearLove</span>
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
        <span className="header-status-dot" />
        Đã sao lưu
      </div>

      {/* Right: Actions */}
      <div className="header-actions">
        <button id="btn-preview" className="header-btn header-btn-ghost">
          <PreviewIcon />
          Xem trước
        </button>
        <div className="header-divider" />
        <button id="btn-publish" className="header-btn header-btn-publish">
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
    </header>
  );
}
