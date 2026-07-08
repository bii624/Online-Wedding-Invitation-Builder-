import { useState } from 'react';
import { Plus, Edit3, Trash2, GripVertical, ChevronRight } from 'lucide-react';

const MOCK_CATEGORIES = [
  { id: '1', name: 'Cổ điển', slug: 'co-dien', parentId: null, order: 1, templateCount: 8 },
  { id: '2', name: 'Hiện đại', slug: 'hien-dai', parentId: null, order: 2, templateCount: 12 },
  { id: '3', name: 'Thiên nhiên', slug: 'thien-nhien', parentId: null, order: 3, templateCount: 7 },
  { id: '4', name: 'Minimalist', slug: 'minimalist', parentId: '2', order: 1, templateCount: 5 },
  { id: '5', name: 'Boho', slug: 'boho', parentId: '3', order: 1, templateCount: 3 },
  { id: '6', name: 'Vintage', slug: 'vintage', parentId: '1', order: 2, templateCount: 4 },
  { id: '7', name: 'Á Đông', slug: 'a-dong', parentId: null, order: 4, templateCount: 6 },
];

export function TemplateCategoriesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const roots = MOCK_CATEGORIES.filter(c => !c.parentId);
  const children = (parentId: string) => MOCK_CATEGORIES.filter(c => c.parentId === parentId);

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
        <button className="adm-btn adm-btn-primary" onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus size={14} /> Thêm danh mục
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title">Cây danh mục Template</span>
          <span style={{ fontSize:12, color:'var(--adm-text-muted)' }}>{MOCK_CATEGORIES.length} danh mục</span>
        </div>

        <div>
          {roots.map(cat => (
            <div key={cat.id}>
              {/* Root */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'14px 22px', borderBottom:'1px solid var(--adm-border)', background:'var(--adm-bg)', flexWrap: 'wrap' }}>
                <GripVertical size={16} color="var(--adm-text-light)" style={{ cursor:'grab', flexShrink:0 }} />
                <div style={{ fontSize:14, fontWeight:700, flex: '1 1 auto', minWidth: '150px' }}>{cat.name}</div>
                <span style={{ fontSize:11, color:'var(--adm-text-muted)', marginRight:8 }}>{cat.templateCount} template</span>
                <code style={{ fontSize:11, background:'var(--adm-border)', padding:'2px 8px', borderRadius:4, color:'var(--adm-text-muted)' }}>{cat.slug}</code>
                <div style={{ display:'flex', gap:4 }}>
                  <button className="adm-btn adm-btn-ghost adm-btn-icon" onClick={() => { setEditing(cat); setShowModal(true); }}><Edit3 size={13} /></button>
                  <button className="adm-btn adm-btn-danger-ghost adm-btn-icon"><Trash2 size={13} /></button>
                </div>
              </div>

              {/* Children */}
              {children(cat.id).map(child => (
                <div key={child.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 22px 12px 46px', borderBottom:'1px solid var(--adm-border)', flexWrap: 'wrap' }}>
                  <ChevronRight size={14} color="var(--adm-text-muted)" style={{ flexShrink:0 }} />
                  <GripVertical size={14} color="var(--adm-text-light)" style={{ cursor:'grab', flexShrink:0 }} />
                  <div style={{ fontSize:13, fontWeight:500, flex: '1 1 auto', minWidth: '100px', color:'var(--adm-text)' }}>{child.name}</div>
                  <span style={{ fontSize:11, color:'var(--adm-text-muted)', marginRight:8 }}>{child.templateCount} template</span>
                  <code style={{ fontSize:11, background:'var(--adm-border)', padding:'2px 8px', borderRadius:4, color:'var(--adm-text-muted)' }}>{child.slug}</code>
                  <div style={{ display:'flex', gap:4 }}>
                    <button className="adm-btn adm-btn-ghost adm-btn-icon" onClick={() => { setEditing(child); setShowModal(true); }}><Edit3 size={13} /></button>
                    <button className="adm-btn adm-btn-danger-ghost adm-btn-icon"><Trash2 size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="adm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="adm-modal-title">{editing ? 'Sửa danh mục' : 'Thêm danh mục mới'}</h3>
            <p className="adm-modal-subtitle">Tạo danh mục để phân nhóm các template</p>
            <div className="adm-form-group">
              <label className="adm-form-label">Tên danh mục *</label>
              <input className="adm-form-input" defaultValue={editing?.name ?? ''} placeholder="VD: Cổ điển" />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Slug</label>
              <input className="adm-form-input" defaultValue={editing?.slug ?? ''} placeholder="co-dien (tự sinh)" />
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Danh mục cha</label>
              <select className="adm-form-input adm-select" style={{ padding:'9px 12px', backgroundPosition:'right 12px center' }} defaultValue={editing?.parentId ?? ''}>
                <option value="">— Không có (danh mục gốc)</option>
                {roots.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button className="adm-btn adm-btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="adm-btn adm-btn-primary">Lưu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
