import { useEffect, useState } from 'react';
import { Search, UserCheck, UserX, Shield, MoreHorizontal, Eye, Ban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, LineChart, Line } from 'recharts';
import { adminApi, type AdminUser } from '../api/adminApi';
import { toast } from 'sonner';
import { UserDetailModal } from '../components/UserDetailModal';

const MOCK_USERS = [
  { id: '1', fullName: 'Nguyễn Văn Nam', email: 'nguyenvannam@gmail.com', role: 'user', status: 'active', cardCount: 5, createdAt: '2025-01-15' },
  { id: '2', fullName: 'Trần Thị Hương', email: 'tranthihuong@gmail.com', role: 'user', status: 'active', cardCount: 3, createdAt: '2025-02-20' },
  { id: '3', fullName: 'Lê Văn Sơn', email: 'levanson@gmail.com', role: 'admin', status: 'active', cardCount: 12, createdAt: '2024-11-03' },
  { id: '4', fullName: 'Phạm Thị Lan', email: 'phamthilan@gmail.com', role: 'user', status: 'suspended', cardCount: 0, createdAt: '2025-03-08' },
  { id: '5', fullName: 'Hoàng Minh Tuấn', email: 'hoangminhtuan@gmail.com', role: 'user', status: 'active', cardCount: 7, createdAt: '2025-01-28' },
  { id: '6', fullName: 'Đỗ Thị Minh', email: 'dothiminh@gmail.com', role: 'user', status: 'active', cardCount: 2, createdAt: '2025-04-11' },
  { id: '7', fullName: 'Vũ Quang Huy', email: 'vuquanghuy@gmail.com', role: 'user', status: 'suspended', cardCount: 1, createdAt: '2025-03-22' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; label: string }> = {
    active: { cls: 'adm-badge-green', label: 'Hoạt động' },
    suspended: { cls: 'adm-badge-red', label: 'Đã khóa' },
    unverified: { cls: 'adm-badge-yellow', label: 'Chưa xác thực' },
  };
  const m = map[status] ?? { cls: 'adm-badge-gray', label: status };
  return <span className={`adm-badge ${m.cls}`}>{m.label}</span>;
}

function RoleBadge({ role }: { role: string }) {
  return role === 'admin'
    ? <span className="adm-badge adm-badge-pink"><Shield size={10} /> Admin</span>
    : <span className="adm-badge adm-badge-gray">User</span>;
}

export function UsersListPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  // Reset page khi đổi filter
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers({
        page,
        limit: 10,
        search: debouncedSearch || undefined,
        role: roleFilter,
        status: statusFilter,
      });
      setUsers(res.data);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      toast.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, debouncedSearch, roleFilter, statusFilter]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      await adminApi.updateUserStatus(id, newStatus);
      toast.success(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản`);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, status: newStatus } : u));
    } catch (error) {
      toast.error('Lỗi khi đổi trạng thái người dùng');
    }
  };

  const handleUserUpdate = (updatedUser: AdminUser) => {
    setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  return (
    <div>
      {selectedUserId && (
        <UserDetailModal 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
          onUserUpdate={handleUserUpdate}
        />
      )}
      {/* Summary numbers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Tổng người dùng', value: MOCK_USERS.length, change: '+ 12.5%', color: '#6366f1', data: [10, 15, 8, 20, 25, 18, 30] },
          { label: 'Hoạt động', value: MOCK_USERS.filter(u => u.status === 'active').length, change: '+ 8.2%', color: '#10b981', data: [5, 12, 10, 15, 20, 22, 28] },
          { label: 'Đã khóa', value: MOCK_USERS.filter(u => u.status === 'suspended').length, change: '- 2.1%', color: '#ef4444', data: [8, 5, 4, 6, 2, 3, 1] },
          { label: 'Quản trị viên', value: MOCK_USERS.filter(u => u.role === 'admin').length, change: 'Cố định', color: '#f59e0b', data: [1, 1, 1, 1, 1, 1, 1] },
        ].map(s => (
          <div key={s.label} className="adm-stat-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', gap: 0, padding: '20px 24px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none', height: 110 }}>
            {/* Top row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>{s.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.change}</span>
            </div>

            {/* Bottom row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#1e293b', lineHeight: 1 }}>{s.value}</span>
              <div style={{ width: 80, height: 35, filter: `drop-shadow(0px 4px 6px ${s.color}50)` }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={s.data.map(val => ({ val }))} margin={{ top: 5, bottom: 5, left: 5, right: 5 }}>
                    <Line
                      type="monotone"
                      dataKey="val"
                      stroke={s.color}
                      strokeWidth={2.5}
                      dot={(props: any) => {
                        const { cx, cy, index } = props;
                        if (index === s.data.length - 1) {
                          return <circle key={index} cx={cx} cy={cy} r={3.5} fill={s.color} stroke="#fff" strokeWidth={1.5} />;
                        }
                        return null;
                      }}
                      activeDot={false}
                      isAnimationActive={true}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        {/* Toolbar */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--adm-border)' }}>
          <div className="adm-toolbar" style={{ margin: 0 }}>
            <div className="adm-search">
              <Search className="adm-search-icon" />
              <input
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select className="adm-select" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">Tất cả role</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <select className="adm-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="suspended">Đã khóa</option>
            </select>
            <div style={{ marginLeft: 'auto' }}>
              <span style={{ fontSize: 12, color: 'var(--adm-text-muted)' }}>{total} kết quả</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Email</th>
                <th>Role</th>
                <th>Trạng thái</th>
                <th>Số thiệp</th>
                <th>Ngày đăng ký</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 0' }}>
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt={u.fullName} className="adm-user-avatar" style={{ objectFit: 'cover' }} />
                        ) : (
                          <div className="adm-user-avatar">{u.fullName?.charAt(0)?.toUpperCase() || 'U'}</div>
                        )}
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{u.fullName}</span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--adm-text-muted)' }}>{u.email}</td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><StatusBadge status={u.status} /></td>
                    <td style={{ fontWeight: 600, textAlign: 'center' }}>{u.cardCount}</td>
                    <td style={{ color: 'var(--adm-text-muted)', fontSize: 12 }}>{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Xem chi tiết" onClick={() => setSelectedUserId(u.id)}>
                          <Eye size={14} />
                        </button>
                        {u.status === 'active'
                          ? <button className="adm-btn adm-btn-danger-ghost adm-btn-icon" title="Khóa tài khoản" onClick={() => handleToggleStatus(u.id, u.status)}><Ban size={14} /></button>
                          : <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Mở khóa" style={{ color: 'var(--adm-success)' }} onClick={() => handleToggleStatus(u.id, u.status)}><UserCheck size={14} /></button>
                        }
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="adm-pagination">
            <span>Hiển thị trang {page} / {totalPages} ({total} người dùng)</span>
            <div className="adm-pagination-btns">
              <button
                className="adm-page-btn"
                disabled={page <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  className={`adm-page-btn ${page === i + 1 ? 'active' : ''}`}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="adm-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
