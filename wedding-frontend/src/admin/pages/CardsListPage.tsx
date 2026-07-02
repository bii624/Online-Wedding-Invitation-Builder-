import { useState } from 'react';
import { Search, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';

const MOCK_CARDS = [
  { id: '1', title: 'Thiệp cưới Lan & Minh', ownerEmail: 'tranthihuong@gmail.com', ownerName:'Trần Thị Hương', status: 'published', isPublic: true, viewCount: 1248, createdAt: '2025-04-01' },
  { id: '2', title: 'Ngày hạnh phúc của chúng tôi', ownerEmail: 'nguyenvannam@gmail.com', ownerName:'Nguyễn Văn Nam', status: 'draft', isPublic: false, viewCount: 0, createdAt: '2025-05-12' },
  { id: '3', title: 'Hội ngộ muôn năm - Tuấn & Mai', ownerEmail: 'hoangminhtuan@gmail.com', ownerName:'Hoàng Minh Tuấn', status: 'published', isPublic: true, viewCount: 567, createdAt: '2025-03-28' },
  { id: '4', title: 'Tình yêu mùa xuân', ownerEmail: 'dothiminh@gmail.com', ownerName:'Đỗ Thị Minh', status: 'published', isPublic: false, viewCount: 89, createdAt: '2025-04-15' },
  { id: '5', title: 'Kết duyên vĩnh cửu', ownerEmail: 'levanson@gmail.com', ownerName:'Lê Văn Sơn', status: 'archived', isPublic: false, viewCount: 2345, createdAt: '2024-12-01' },
];

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
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = MOCK_CARDS.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.ownerEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
              <span style={{ fontSize:12, color:'var(--adm-text-muted)' }}>{filtered.length} kết quả</span>
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
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight:600, maxWidth:200 }}>
                    <div style={{ whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.title}</div>
                  </td>
                  <td>
                    <div style={{ fontSize:13 }}>
                      <div style={{ fontWeight:500 }}>{c.ownerName}</div>
                      <div style={{ color:'var(--adm-text-muted)', fontSize:12 }}>{c.ownerEmail}</div>
                    </div>
                  </td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>
                    {c.isPublic
                      ? <span className="adm-badge adm-badge-green"><Eye size={10}/>Công khai</span>
                      : <span className="adm-badge adm-badge-gray"><EyeOff size={10}/>Ẩn</span>
                    }
                  </td>
                  <td style={{ fontWeight:600, textAlign:'center' }}>{c.viewCount.toLocaleString()}</td>
                  <td style={{ color:'var(--adm-text-muted)', fontSize:12 }}>{new Date(c.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Xem trước">
                        <ExternalLink size={14} />
                      </button>
                      {c.isPublic
                        ? <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Ẩn thiệp"><EyeOff size={14} /></button>
                        : <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Hiện thiệp" style={{color:'var(--adm-success)'}}><Eye size={14} /></button>
                      }
                      <button className="adm-btn adm-btn-danger-ghost adm-btn-icon" title="Xóa thiệp">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pagination">
          <span>Hiển thị {filtered.length}/{MOCK_CARDS.length} thiệp</span>
          <div className="adm-pagination-btns">
            <button className="adm-page-btn" disabled>‹</button>
            <button className="adm-page-btn active">1</button>
            <button className="adm-page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
