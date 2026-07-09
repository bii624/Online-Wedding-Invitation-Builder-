import { useEditorStore } from '../store/editorStore';
import { ChevronLeft } from 'lucide-react';
import '../styles/LeftToolbar.css';

export function BeginPagePanel({ onClose }: { onClose: () => void }) {
  const { currentPage, setCurrentPage } = useEditorStore();

  return (
    <div className="lt-image-panel" style={{ width: '280px', display: 'flex', flexDirection: 'column', position: 'absolute', left: '100%', top: 0, bottom: 0, backgroundColor: '#ffffff', zIndex: 1000, borderLeft: '1px solid var(--ed-border)', boxShadow: '4px 0 12px rgba(0,0,0,0.05)' }}>
      {/* Header */}
      <div className="lt-image-panel-header" style={{ padding: '16px', borderBottom: '1px solid var(--ed-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="lt-image-panel-title" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ed-text-primary)' }}>
          Quản lý trang
        </span>
        <button className="panel-collapse-btn" onClick={onClose} title="Thu gọn" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ed-text-muted)' }}>
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Page List */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => setCurrentPage('cover')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: currentPage === 'cover' ? '2px solid var(--ed-accent, #f43f5e)' : '1px solid var(--ed-border)',
            background: currentPage === 'cover' ? 'var(--ed-bg-active, #fff1f2)' : '#ffffff',
            color: currentPage === 'cover' ? 'var(--ed-accent, #f43f5e)' : 'var(--ed-text-primary)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Trang mở đầu</span>
          {currentPage === 'cover' && <span style={{ fontSize: '12px' }}>Đang sửa</span>}
        </button>

        <button
          onClick={() => setCurrentPage('main')}
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: currentPage === 'main' ? '2px solid var(--ed-accent, #f43f5e)' : '1px solid var(--ed-border)',
            background: currentPage === 'main' ? 'var(--ed-bg-active, #fff1f2)' : '#ffffff',
            color: currentPage === 'main' ? 'var(--ed-accent, #f43f5e)' : 'var(--ed-text-primary)',
            fontWeight: 600,
            fontSize: '14px',
            cursor: 'pointer',
            textAlign: 'left',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <span>Thiệp chính</span>
          {currentPage === 'main' && <span style={{ fontSize: '12px' }}>Đang sửa</span>}
        </button>
      </div>
    </div>
  );
}
