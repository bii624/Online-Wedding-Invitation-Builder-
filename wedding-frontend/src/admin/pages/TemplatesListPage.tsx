import { useState } from 'react';
import { Search, Plus, Edit3, Trash2, CheckCircle, Archive, Crown } from 'lucide-react';

const MOCK_TEMPLATES = [
  { id: '1', name: 'Hoa hồng vàng - Classic', status: 'published', isPremium: false, usageCount: 342, thumbnailUrl: '', category: 'Cổ điển' },
  { id: '2', name: 'Mùa xuân pastel', status: 'published', isPremium: true, usageCount: 287, thumbnailUrl: '', category: 'Pastel' },
  { id: '3', name: 'Rustic vintage', status: 'published', isPremium: false, usageCount: 215, thumbnailUrl: '', category: 'Vintage' },
  { id: '4', name: 'Tối giản hiện đại', status: 'draft', isPremium: false, usageCount: 0, thumbnailUrl: '', category: 'Minimalist' },
  { id: '5', name: 'Garden boho', status: 'published', isPremium: true, usageCount: 156, thumbnailUrl: '', category: 'Boho' },
  { id: '6', name: 'Phong cách Á Đông', status: 'draft', isPremium: false, usageCount: 0, thumbnailUrl: '', category: 'Á Đông' },
  { id: '7', name: 'Sunset romance', status: 'archived', isPremium: false, usageCount: 89, thumbnailUrl: '', category: 'Romance' },
  { id: '8', name: 'Forest fairy', status: 'published', isPremium: true, usageCount: 134, thumbnailUrl: '', category: 'Thiên nhiên' },
];

const STATUS_COLORS: Record<string, string> = {
  published: 'adm-badge-green',
  draft:     'adm-badge-yellow',
  archived:  'adm-badge-gray',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Đã xuất bản',
  draft:     'Bản nháp',
  archived:  'Đã lưu trữ',
};

export function TemplatesListPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [viewMode] = useState<'grid' | 'list'>('grid');

  const filtered = MOCK_TEMPLATES.filter(t => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchPremium = premiumFilter === 'all' || (premiumFilter === 'premium' ? t.isPremium : !t.isPremium);
    return matchSearch && matchStatus && matchPremium;
  });

  // Thumbnail placeholder colors
  const thumbColors = ['#fce7f3','#fef3c7','#d1fae5','#ede9fe','#fce7f3','#dbeafe','#fef9c3','#f3e8ff'];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, gap:12, flexWrap:'wrap' }}>
        <div className="adm-toolbar" style={{ margin:0, flex:1 }}>
          <div className="adm-search">
            <Search className="adm-search-icon" />
            <input placeholder="Tìm theo tên template..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="adm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <select className="adm-select" value={premiumFilter} onChange={e => setPremiumFilter(e.target.value)}>
            <option value="all">Tất cả gói</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <button className="adm-btn adm-btn-primary">
          <Plus size={15} /> Tạo template mới
        </button>
      </div>

      {/* Grid */}
      <div className="adm-template-grid">
        {filtered.map((t, i) => (
          <div key={t.id} className="adm-template-card">
            {/* Thumbnail */}
            <div className="adm-template-thumb" style={{ background: thumbColors[i % thumbColors.length] }}>
              <div style={{ fontSize:40 }}>💌</div>
              {/* Overlay actions */}
              <div className="adm-template-thumb-overlay">
                <button className="adm-btn adm-btn-primary adm-btn-sm">
                  <Edit3 size={13} /> Sửa
                </button>
                <button className="adm-btn adm-btn-danger-ghost adm-btn-sm" style={{ background:'rgba(255,255,255,0.9)', color:'#ef4444' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="adm-template-info">
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:6, marginBottom:8 }}>
                <div className="adm-template-name">{t.name}</div>
                {t.isPremium && (
                  <span className="adm-badge adm-badge-yellow" style={{ flexShrink:0, fontSize:10 }}>
                    <Crown size={9} /> Pro
                  </span>
                )}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <span className={`adm-badge ${STATUS_COLORS[t.status]}`} style={{ fontSize:11 }}>
                  {STATUS_LABELS[t.status]}
                </span>
                <span style={{ fontSize:11, color:'var(--adm-text-muted)' }}>{t.usageCount} lần dùng</span>
              </div>
              {/* Quick status actions */}
              <div style={{ display:'flex', gap:4, marginTop:10 }}>
                {t.status !== 'published' && (
                  <button className="adm-btn adm-btn-outline adm-btn-sm" style={{ flex:1, justifyContent:'center', fontSize:11 }}>
                    <CheckCircle size={12} /> Publish
                  </button>
                )}
                {t.status === 'published' && (
                  <button className="adm-btn adm-btn-outline adm-btn-sm" style={{ flex:1, justifyContent:'center', fontSize:11 }}>
                    <Archive size={12} /> Archive
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="adm-empty">
          <div style={{ fontSize:48 }}>🎨</div>
          <p style={{ fontWeight:600 }}>Không tìm thấy template</p>
          <p style={{ fontSize:13 }}>Thử thay đổi bộ lọc hoặc tạo template mới</p>
        </div>
      )}
    </div>
  );
}
