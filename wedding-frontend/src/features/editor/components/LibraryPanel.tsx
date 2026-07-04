// src/editor/components/LibraryPanel.tsx
// Panel "Thư viện Element" trong left toolbar của editor
// User duyệt, tìm kiếm và click/kéo element vào canvas

import { useState, useEffect, useCallback } from 'react';
import { useEditorStore } from '../store/editorStore';
import { libraryElementsApi, type LibraryElement, type ElementCategory } from '../../../api/libraryElementsApi';
import '../styles/LibraryPanel.css';

// ── Icons ─────────────────────────────────────────────────
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const CrownIcon = () => (
  <svg viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1.5">
    <path d="M2 18l3-11 7 6 7-6 3 11H2z" />
  </svg>
);

// ── Constants ─────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  icon: 'Icon', shape: 'Hình khối', illustration: 'Minh họa',
  sticker: 'Sticker', frame: 'Khung', photo: 'Ảnh',
};
const TYPE_EMOJI: Record<string, string> = {
  icon: '🎨', shape: '⬟', illustration: '🖼', sticker: '✨', frame: '🖼️', photo: '📷',
};
const BG_COLORS = ['#fce7f3', '#fef3c7', '#d1fae5', '#ede9fe', '#dbeafe', '#fee2e2'];

// ── Element Card ──────────────────────────────────────────
function ElementItem({ element, onUse }: { element: LibraryElement; onUse: (el: LibraryElement) => void }) {
  const idx = element.name.length % BG_COLORS.length;
  return (
    <div
      className="lib-el-item"
      title={element.name}
      onClick={() => onUse(element)}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('application/library-element-id', element.id);
        e.dataTransfer.setData('application/library-element-url', element.fileUrl);
        e.dataTransfer.setData('application/library-element-name', element.name);
        e.dataTransfer.effectAllowed = 'copy';
      }}
    >
      {element.thumbnailUrl || element.fileUrl ? (
        <img
          src={element.thumbnailUrl || element.fileUrl}
          alt={element.name}
          className="lib-el-img"
          draggable={false}
        />
      ) : (
        <div className="lib-el-emoji" style={{ background: BG_COLORS[idx] }}>
          {TYPE_EMOJI[element.elementType]}
        </div>
      )}
      {element.isPremium && (
        <div className="lib-el-premium">
          <CrownIcon />
        </div>
      )}
      <div className="lib-el-name">{element.name}</div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────
interface LibraryPanelProps {
  onClose: () => void;
}

export function LibraryPanel({ onClose }: LibraryPanelProps) {
  const { addImageElement } = useEditorStore();

  const [categories, setCategories] = useState<ElementCategory[]>([]);
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [elementType, setElementType] = useState('');

  const LIMIT = 24;

  // ── Fetch categories once ────────────────────────────────
  useEffect(() => {
    libraryElementsApi.getCategories().then(setCategories).catch(() => { });
  }, []);

  // ── Fetch elements when filters change ───────────────────
  const fetchElements = useCallback(async (newPage = 1, reset = true) => {
    if (newPage === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const params: any = { page: newPage, limit: LIMIT };
      if (search) params.search = search;
      if (categoryId) params.categoryId = categoryId;
      if (elementType) params.elementType = elementType;

      const res = await libraryElementsApi.getElements(params);
      if (reset || newPage === 1) {
        setElements(res.data);
      } else {
        setElements(prev => [...prev, ...res.data]);
      }
      setHasMore(newPage < res.pagination.totalPages);
      setPage(newPage);
    } catch (error) {
      console.error('Failed to fetch library elements:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [search, categoryId, elementType]);

  useEffect(() => {
    const t = setTimeout(() => { fetchElements(1, true); }, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, categoryId, elementType, fetchElements]);

  // ── Use element ──────────────────────────────────────────
  const handleUse = async (el: LibraryElement) => {
    const url = el.fileUrl;
    const name = el.name;
    addImageElement(url, name);

    // Record usage in background (best-effort)
    libraryElementsApi.recordUsage(el.id).catch(() => { });
  };

  const uniqueTypes = [...new Set(elements.map(e => e.elementType))];

  return (
    <div className="lib-panel">
      {/* Header */}
      <div className="lib-panel-header">
        <span className="lib-panel-title">✨ Thư viện Element</span>
        <button className="lt-panel-close-btn" onClick={onClose} title="Đóng">
          <CloseIcon />
        </button>
      </div>

      {/* Search */}
      <div className="lib-search-wrap">
        <SearchIcon />
        <input
          className="lib-search-input"
          placeholder="Tìm element..."
          value={search}
          onChange={e => { setSearch(e.target.value); }}
        />
      </div>

      {/* Category chips */}
      {categories.length > 0 && (
        <div className="lib-chips-wrap">
          <button
            className={`lib-chip ${!categoryId ? 'active' : ''}`}
            onClick={() => setCategoryId('')}
          >
            Tất cả
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`lib-chip ${categoryId === c.id ? 'active' : ''}`}
              onClick={() => setCategoryId(categoryId === c.id ? '' : c.id)}
            >
              {c.name}
              {c._count && <span className="lib-chip-count">{c._count.elements}</span>}
            </button>
          ))}
        </div>
      )}

      {/* Type filter tabs */}
      <div className="lib-type-tabs">
        <button className={`lib-type-tab ${!elementType ? 'active' : ''}`} onClick={() => setElementType('')}>
          Tất cả
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button key={key} className={`lib-type-tab ${elementType === key ? 'active' : ''}`} onClick={() => setElementType(elementType === key ? '' : key)}>
            {TYPE_EMOJI[key]} {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="lib-grid-wrap">
        {loading ? (
          <div className="lib-loading">
            <div className="lib-spinner" />
            <span>Đang tải...</span>
          </div>
        ) : elements.length === 0 ? (
          <div className="lib-empty">
            <span style={{ fontSize: 32 }}>🔍</span>
            <span>Không tìm thấy element</span>
          </div>
        ) : (
          <>
            <div className="lib-grid">
              {elements.map(el => (
                <ElementItem key={el.id} element={el} onUse={handleUse} />
              ))}
            </div>
            {hasMore && (
              <button
                className="lib-load-more"
                onClick={() => fetchElements(page + 1, false)}
                disabled={loadingMore}
              >
                {loadingMore ? 'Đang tải...' : 'Tải thêm'}
              </button>
            )}
          </>
        )}
      </div>

      {/* Hint */}
      <div className="lib-hint">
        Nhấn để thêm vào canvas
      </div>
    </div>
  );
}
