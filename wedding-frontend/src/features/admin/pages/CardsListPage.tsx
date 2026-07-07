import { useState, useEffect } from 'react';
import { Search, Eye, EyeOff, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { adminApi, type AdminCard } from '../api/adminApi';
import { toast } from 'sonner';

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    published: { cls: 'adm-badge-green', label: 'Đã xuất bản' },
    draft:     { cls: 'adm-badge-yellow', label: 'Bản nháp' },
    archived:  { cls: 'adm-badge-gray',  label: 'Đã lưu trữ' },
  };
  const m = map[status] ?? { cls: 'adm-badge-gray', label: status };
  return <span className={`adm-badge ${m.cls}`}>{m.label}</span>;
}

export function CardsListPage() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [cards, setCards] = useState<AdminCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const fetchCards = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getCards({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setCards(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách thiệp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [page, debouncedSearch, statusFilter]);

  const handleToggleVisibility = async (id: string, currentPublic: boolean) => {
    try {
      await adminApi.updateCardVisibility(id, !currentPublic);
      toast.success(currentPublic ? 'Đã ẩn thiệp' : 'Đã hiển thị thiệp');
      setCards(prev => prev.map(c => c.id === id ? { ...c, isPublic: !currentPublic } : c));
    } catch (error) {
      toast.error('Lỗi khi cập nhật trạng thái hiển thị');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thiệp này? Hành động này không thể hoàn tác.')) return;
    try {
      await adminApi.deleteCard(id);
      toast.success('Đã xóa thiệp');
      fetchCards();
    } catch (error) {
      toast.error('Lỗi khi xóa thiệp');
    }
  };

  return (
    <div>
      <div className="adm-card">
        {/* Toolbar */}
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--adm-border)' }}>
          <div className="adm-toolbar" style={{ margin:0 }}>
            <div className="adm-search">
              <Search className="adm-search-icon" />
              <input placeholder="Tìm theo tiêu đề hoặc email..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <select className="adm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="published">Đã xuất bản</option>
              <option value="draft">Bản nháp</option>
              <option value="archived">Đã lưu trữ</option>
            </select>
            <div style={{ marginLeft:'auto' }}>
              <span style={{ fontSize:12, color:'var(--adm-text-muted)' }}>{total} kết quả</span>
            </div>
          </div>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Tiêu đề thiệp</th>
                <th>Chủ sở hữu</th>
                <th>Trạng thái</th>
                <th>Công khai</th>
                <th>Lượt xem</th>
                <th>Ngày tạo</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}>
                      <Loader2 className="animate-spin" size={20} /> Đang tải...
                    </div>
                  </td>
                </tr>
              ) : cards.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'var(--adm-text-muted)' }}>
                    Không tìm thấy thiệp nào.
                  </td>
                </tr>
              ) : (
                cards.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontWeight:600, maxWidth:200 }}>
                      <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title || 'Thiệp không tên'}</div>
                    </td>
                    <td>
                      <div style={{ fontSize:13 }}>
                        <div style={{ fontWeight:500 }}>{c.user?.fullName || 'Người dùng ẩn danh'}</div>
                        <div style={{ color:'var(--adm-text-muted)', fontSize:12 }}>{c.user?.email || 'Không có email'}</div>
                      </div>
                    </td>
                    <td><StatusBadge status={c.status} /></td>
                    <td>
                      {c.isPublic
                        ? <span className="adm-badge adm-badge-green"><Eye size={10}/>Công khai</span>
                        : <span className="adm-badge adm-badge-gray"><EyeOff size={10}/>Ẩn</span>
                      }
                    </td>
                    <td style={{ fontWeight:600, textAlign:'center' }}>{c.viewCount?.toLocaleString() || 0}</td>
                    <td style={{ color:'var(--adm-text-muted)', fontSize:12 }}>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div style={{ display:'flex', gap:4 }}>
                        <a href={`/view/${c.slug}`} target="_blank" rel="noreferrer" className="adm-btn adm-btn-ghost adm-btn-icon" title="Xem thiệp thực tế">
                          <ExternalLink size={14} />
                        </a>
                        {c.isPublic
                          ? <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Ẩn thiệp" onClick={() => handleToggleVisibility(c.id, c.isPublic)}><EyeOff size={14} /></button>
                          : <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Hiện thiệp" style={{color:'var(--adm-success)'}} onClick={() => handleToggleVisibility(c.id, c.isPublic)}><Eye size={14} /></button>
                        }
                        <button className="adm-btn adm-btn-danger-ghost adm-btn-icon" title="Xóa thiệp" onClick={() => handleDelete(c.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="adm-pagination">
            <span>Hiển thị trang {page} / {totalPages}</span>
            <div className="adm-pagination-btns">
              <button className="adm-page-btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`adm-page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
