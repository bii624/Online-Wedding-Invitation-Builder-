// ============================================================
// FILMSTRIP COMPONENT
// ============================================================

import '../styles/Filmstrip.css';
import { useEditorStore } from '../store/editorStore';

const ChevronLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);
const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// Mini canvas preview inside thumbnail
function ThumbPreview({ label }: { label: string }) {
  return (
    <div className="filmstrip-thumb-preview">
      <div style={{
        position: 'absolute',
        bottom: 4,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 6,
        color: '#9ca3af',
        fontFamily: 'Inter',
        fontWeight: 500,
        letterSpacing: 0.5,
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      {/* Mini text element representation */}
      <div style={{
        position: 'absolute',
        top: '35%',
        left: '10%',
        right: '10%',
        height: 10,
        background: 'rgba(0,0,0,0.12)',
        borderRadius: 2,
      }} />
      <div style={{
        position: 'absolute',
        top: '55%',
        left: '20%',
        right: '20%',
        height: 6,
        background: 'rgba(0,0,0,0.07)',
        borderRadius: 2,
      }} />
    </div>
  );
}

export function Filmstrip() {
  const { filmstripItems } = useEditorStore();

  const handleItemClick = (id: string) => {
    console.log('Navigate to page:', id);
  };

  return (
    <div className="editor-filmstrip">
      {/* Label */}
      <span className="filmstrip-label">Trang</span>

      {/* Prev button */}
      <button className="filmstrip-nav-btn" id="filmstrip-prev" title="Trang trước">
        <ChevronLeftIcon />
      </button>

      {/* Scrollable thumbnails */}
      <div className="filmstrip-scroll" id="filmstrip-scroll">
        {filmstripItems.map((item, i) => (
          <div
            key={item.id}
            id={`filmstrip-item-${item.id}`}
            className={`filmstrip-item ${item.isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(item.id)}
            title={item.label}
          >
            <div className="filmstrip-thumb">
              <ThumbPreview label={`T${i + 1}`} />
            </div>
            <span className="filmstrip-page-num">{i + 1}</span>
          </div>
        ))}

        {/* Add page button */}
        <button
          id="btn-add-page"
          className="filmstrip-add-btn"
          title="Thêm trang mới"
          style={{ marginTop: 0, alignSelf: 'flex-start', flexShrink: 0 }}
        >
          <PlusIcon />
        </button>
      </div>

      {/* Next button */}
      <button className="filmstrip-nav-btn" id="filmstrip-next" title="Trang tiếp theo">
        <ChevronRightIcon />
      </button>
    </div>
  );
}
