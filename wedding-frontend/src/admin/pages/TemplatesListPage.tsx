import { useState, useEffect } from 'react';
import { Search, Plus, Edit3, Trash2, CheckCircle, Archive, Crown, Loader2 } from 'lucide-react';
import { adminApi, type AdminTemplate } from '../api/adminApi';
import { useNavigate } from 'react-router-dom';

const STATUS_COLORS: Record<string, string> = {
  published: 'adm-badge-green',
  draft: 'adm-badge-yellow',
  archived: 'adm-badge-gray',
};

const STATUS_LABELS: Record<string, string> = {
  published: 'Đã xuất bản',
  draft: 'Bản nháp',
  archived: 'Đã lưu trữ',
};

export function TemplatesListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [premiumFilter, setPremiumFilter] = useState('all');
  const [viewMode] = useState<'grid' | 'list'>('grid');

  const [templates, setTemplates] = useState<AdminTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplatePremium, setNewTemplatePremium] = useState(false);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError('');
      const params: any = { page, limit: 12 };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (premiumFilter !== 'all') params.isPremium = premiumFilter === 'premium';

      const res = await adminApi.getTemplates(params);
      
      // Backend returns { items, total, page, totalPages }
      const items = (res as any).items || res.data || [];
      setTemplates(items);
      
      setTotalPages((res as any).totalPages || res.pagination?.totalPages || 1);
      setTotal((res as any).total || res.pagination?.total || 0);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setError('Lỗi khi tải danh sách template');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [debouncedSearch, statusFilter, premiumFilter, page]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    if (!window.confirm(`Bạn có chắc muốn đổi trạng thái thành ${STATUS_LABELS[newStatus]}?`)) return;
    try {
      await adminApi.updateTemplateStatus(id, newStatus);
      fetchTemplates();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xoá template này? Hành động này không thể hoàn tác.')) return;
    try {
      await adminApi.deleteTemplate(id);
      fetchTemplates();
    } catch (err) {
      alert('Lỗi khi xoá template');
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      alert('Vui lòng nhập tên template');
      return;
    }
    
    // Generate simple slug
    const slug = newTemplateName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Date.now();

    try {
      const res = await adminApi.createTemplate({
        name: newTemplateName,
        slug,
        isPremium: newTemplatePremium
      });
      
      setShowCreateModal(false);
      setNewTemplateName('');
      setNewTemplatePremium(false);
      
      // Navigate to the editor for the new template
      navigate(`/design/template?templateId=${res.id}`);
    } catch (err) {
      console.error('Create error:', err);
      alert('Lỗi khi tạo template mới');
    }
  };

  // Thumbnail placeholder colors
  const thumbColors = ['#fce7f3', '#fef3c7', '#d1fae5', '#ede9fe', '#fce7f3', '#dbeafe', '#fef9c3', '#f3e8ff'];

  return (
    <div>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
        <div className="adm-toolbar" style={{ margin: 0, flex: 1 }}>
          <div className="adm-search">
            <Search className="adm-search-icon" />
            <input placeholder="Tìm theo tên template..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="adm-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="published">Đã xuất bản</option>
            <option value="draft">Bản nháp</option>
            <option value="archived">Đã lưu trữ</option>
          </select>
          <select className="adm-select" value={premiumFilter} onChange={e => { setPremiumFilter(e.target.value); setPage(1); }}>
            <option value="all">Tất cả gói</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
          </select>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={15} /> Tạo template mới
        </button>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', padding: 24, borderRadius: 8, width: 400, maxWidth: '90%'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Tạo Template Mới</h3>
            
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Tên template <span style={{color: 'red'}}>*</span></label>
              <input 
                className="adm-input" 
                style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 4 }}
                placeholder="VD: Thiệp cưới hiện đại..." 
                value={newTemplateName} 
                onChange={e => setNewTemplateName(e.target.value)} 
                autoFocus
              />
            </div>
            
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
                <input 
                  type="checkbox" 
                  checked={newTemplatePremium} 
                  onChange={e => setNewTemplatePremium(e.target.checked)} 
                />
                Đây là template Premium (Yêu cầu nâng cấp)
              </label>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
              <button 
                className="adm-btn adm-btn-outline" 
                onClick={() => setShowCreateModal(false)}
              >
                Hủy
              </button>
              <button 
                className="adm-btn adm-btn-primary" 
                onClick={handleCreateTemplate}
                disabled={!newTemplateName.trim()}
              >
                Tạo và chuyển đến Editor
              </button>
            </div>
          </div>
        </div>
      )}

      {error && <div style={{ padding: 12, backgroundColor: '#fef2f2', color: '#ef4444', borderRadius: 6, marginBottom: 16 }}>{error}</div>}

      {/* Grid */}
      {loading && templates.length === 0 ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          <Loader2 className="animate-spin" size={32} color="var(--adm-primary)" />
        </div>
      ) : (
        <div className="adm-template-grid">
          {templates.map((t, i) => (
            <div key={t.id} className="adm-template-card">
              {/* Thumbnail */}
              <div className="adm-template-thumb" style={{ background: t.thumbnailUrl ? '#f3f4f6' : thumbColors[i % thumbColors.length], backgroundImage: t.thumbnailUrl ? `url(${t.thumbnailUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!t.thumbnailUrl && <div style={{ fontSize: 40 }}>💌</div>}
                {/* Overlay actions */}
                <div className="adm-template-thumb-overlay">
                  <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => navigate(`/design/template?templateId=${t.id}`)}>
                    <Edit3 size={13} /> Sửa
                  </button>
                  <button className="adm-btn adm-btn-danger-ghost adm-btn-sm" style={{ background: 'rgba(255,255,255,0.9)', color: '#ef4444' }} onClick={() => handleDelete(t.id)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="adm-template-info">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 6, marginBottom: 8 }}>
                  <div className="adm-template-name">{t.name}</div>
                  {t.isPremium && (
                    <span className="adm-badge adm-badge-yellow" style={{ flexShrink: 0, fontSize: 10 }}>
                      <Crown size={9} /> Pro
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className={`adm-badge ${STATUS_COLORS[t.status]}`} style={{ fontSize: 11 }}>
                    {STATUS_LABELS[t.status]}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--adm-text-muted)' }}>{t.useCount ?? t.usageCount ?? 0} lần dùng</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--adm-text-muted)', marginTop: 4 }}>
                  {t.category?.name || 'Không có danh mục'}
                </div>
                {/* Quick status actions */}
                <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
                  {t.status !== 'published' && (
                    <button className="adm-btn adm-btn-outline adm-btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }} onClick={() => handleUpdateStatus(t.id, 'published')}>
                      <CheckCircle size={12} /> Publish
                    </button>
                  )}
                  {t.status === 'published' && (
                    <button className="adm-btn adm-btn-outline adm-btn-sm" style={{ flex: 1, justifyContent: 'center', fontSize: 11 }} onClick={() => handleUpdateStatus(t.id, 'archived')}>
                      <Archive size={12} /> Archive
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && templates.length === 0 && !error && (
        <div className="adm-empty">
          <div style={{ fontSize: 48 }}>🎨</div>
          <p style={{ fontWeight: 600 }}>Không tìm thấy template</p>
          <p style={{ fontSize: 13 }}>Thử thay đổi bộ lọc hoặc tạo template mới</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
          <button className="adm-btn adm-btn-outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Trước</button>
          <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 500 }}>
            Trang {page} / {totalPages}
          </span>
          <button className="adm-btn adm-btn-outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau</button>
        </div>
      )}
    </div>
  );
}
