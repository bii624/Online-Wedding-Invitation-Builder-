import { useState, useEffect } from 'react';
import { X, Calendar, Lock, AlertTriangle, PlayCircle, Loader2 } from 'lucide-react';
import { adminApi, type AdminUser } from '../api/adminApi';
import { toast } from 'sonner';

interface UserDetailModalProps {
  userId: string;
  onClose: () => void;
  onUserUpdate: (updatedUser: AdminUser) => void;
}

export function UserDetailModal({ userId, onClose, onUserUpdate }: UserDetailModalProps) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'stats' | 'security'>('info');

  // Form states for info tab
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await adminApi.getUser(userId);
        setUser(res);
        setFullName(res.fullName);
        setRole(res.role);
      } catch (error) {
        toast.error('Lỗi khi tải dữ liệu người dùng');
        onClose();
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [userId, onClose]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      const newStatus = user.status === 'active' ? 'suspended' : 'active';
      await adminApi.updateUserStatus(user.id, newStatus);
      toast.success(`Đã ${newStatus === 'active' ? 'mở khóa' : 'khóa'} tài khoản`);
      const updated = { ...user, status: newStatus };
      setUser(updated);
      onUserUpdate(updated);
    } catch (error) {
      toast.error('Lỗi khi đổi trạng thái');
    }
  };

  const handleChangeRole = async () => {
    if (!user || role === user.role) return;
    try {
      await adminApi.updateUserRole(user.id, role);
      toast.success(`Đã cập nhật vai trò thành ${role}`);
      const updated = { ...user, role };
      setUser(updated);
      onUserUpdate(updated);
    } catch (error) {
      toast.error('Lỗi khi cập nhật vai trò');
    }
  };

  if (loading || !user) {
    return (
      <div className="adm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
        <div style={{ background: '#fff', padding: 40, borderRadius: 20 }}>
          <Loader2 className="adm-spinner" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="adm-modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, overflowY: 'auto', padding: '40px 0' }}>
      <style>
        {`
          @keyframes gradient-xy {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .bg-gradient-pink {
            background: linear-gradient(-45deg, #ff758c, #ff7eb3, #ff6a88, #ff8da1);
            background-size: 300% 300%;
            animation: gradient-xy 6s ease infinite;
            color: #fff;
            box-shadow: 0 10px 25px rgba(255, 117, 140, 0.25);
          }
          .btn-white-pink {
            background: #fff;
            color: #e11d48;
            border: none;
            border-radius: 20px;
            padding: 10px 24px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            transition: all 0.2s;
          }
          .btn-white-pink:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
          }
        `}
      </style>
      <div style={{ width: '100%', maxWidth: 720, margin: 'auto', position: 'relative', background: '#fff', borderRadius: 24, padding: 32, boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        
        {/* Close button */}
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: 16, right: 16, background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', zIndex: 10 }}
        >
          <X size={20} color="#64748b" />
        </button>

        {/* Section 1: Top Profile Profile */}
        <div className="bg-gradient-pink" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: 32, borderRadius: 20, marginBottom: 32 }}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} style={{ width: 84, height: 84, borderRadius: 20, objectFit: 'cover', border: '3px solid rgba(255,255,255,0.4)' }} />
          ) : (
            <div style={{ width: 84, height: 84, borderRadius: 20, background: 'rgba(255,255,255,0.2)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, border: '3px solid rgba(255,255,255,0.4)' }}>
              {user.fullName.charAt(0).toUpperCase()}
            </div>
          )}
          
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: '0 0 4px 0', fontSize: 22, fontWeight: 700, color: '#fff' }}>{user.fullName}</h2>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, marginBottom: 12 }}>{user.email}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: '#fef08a', color: '#854d0e', borderRadius: 6, textTransform: 'uppercase' }}>
                {user.role === 'admin' ? 'ADMIN PLAN' : 'FREE PLAN'}
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', background: user.status === 'active' ? '#dcfce7' : '#fee2e2', color: user.status === 'active' ? '#166534' : '#991b1b', borderRadius: 6, textTransform: 'uppercase' }}>
                {user.status === 'active' ? 'ĐÃ XÁC MINH' : 'ĐÃ KHÓA'}
              </span>
            </div>
          </div>

          <button 
            className="btn-white-pink"
            onClick={handleChangeRole}
          >
            Lưu chức vụ
          </button>
        </div>

        {/* Section 2: Tabs & Form */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 32, borderBottom: '1px solid #f1f5f9', paddingBottom: 16, marginBottom: 32 }}>
            <button 
              onClick={() => setActiveTab('info')}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 15, fontWeight: 600, color: activeTab === 'info' ? '#e11d48' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: activeTab === 'info' ? '2px solid #e11d48' : '2px solid transparent', paddingBottom: 16, marginBottom: -17 }}
            >
              👤 Thông tin & Cài đặt
            </button>
            <button 
              onClick={() => setActiveTab('stats')}
              style={{ background: 'none', border: 'none', padding: 0, fontSize: 15, fontWeight: 600, color: activeTab === 'stats' ? '#e11d48' : '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, borderBottom: activeTab === 'stats' ? '2px solid #e11d48' : '2px solid transparent', paddingBottom: 16, marginBottom: -17 }}
            >
              📊 Thống kê hoạt động
            </button>
          </div>

          {activeTab === 'info' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>Tên hiển thị *</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    readOnly
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 15, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>Email (Không thể thay đổi)</label>
                  <input 
                    type="text" 
                    value={user.email}
                    readOnly
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontSize: 15, boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>Chức vụ</label>
                  <select 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#1e293b', fontSize: 15, boxSizing: 'border-box' }}
                  >
                    <option value="user">Người dùng (User)</option>
                    <option value="admin">Quản trị viên (Admin)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>Ngày đăng ký</label>
                  <div style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#64748b', fontSize: 15, boxSizing: 'border-box', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Calendar size={18} color="#94a3b8" />
                    {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </div>
              
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase' }}>Nhà cung cấp đăng nhập</label>
                <input 
                  type="text" 
                  value={user.authProvider || 'email'}
                  readOnly
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', fontSize: 15, boxSizing: 'border-box', textTransform: 'capitalize' }}
                />
              </div>

            </div>
          )}

          {activeTab === 'stats' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, background: '#e0e7ff', color: '#4f46e5', borderRadius: 12 }}>
                    <PlayCircle size={24} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Thiệp đã tạo</span>
                </div>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#1e293b' }}>{user.cardCount}</div>
              </div>
              
              <div style={{ background: '#f8fafc', padding: 24, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 12, background: '#fce7f3', color: '#db2777', borderRadius: 12 }}>
                    <Lock size={24} />
                  </div>
                  <span style={{ fontSize: 15, fontWeight: 600, color: '#475569' }}>Template hệ thống</span>
                </div>
                <div style={{ fontSize: 40, fontWeight: 800, color: '#1e293b' }}>{user.templateCount || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Danger Zone */}
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 32 }}>
          <h3 style={{ margin: '0 0 24px 0', fontSize: 14, fontWeight: 800, color: '#e11d48', textTransform: 'uppercase' }}>Vùng nguy hiểm</h3>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 24, borderBottom: '1px solid #f1f5f9', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>
                {user.status === 'active' 
                  ? 'Người dùng sẽ không thể đăng nhập cho đến khi được mở khóa lại.' 
                  : 'Cho phép người dùng tiếp tục truy cập vào hệ thống.'}
              </div>
            </div>
            <button 
              onClick={handleToggleStatus}
              style={{ padding: '10px 20px', borderRadius: 10, background: '#fff', border: `1px solid ${user.status === 'active' ? '#f43f5e' : '#10b981'}`, color: user.status === 'active' ? '#f43f5e' : '#10b981', fontWeight: 600, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              {user.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Xóa tài khoản vĩnh viễn</div>
              <div style={{ fontSize: 13, color: '#64748b' }}>Hành động này không thể hoàn tác. Tất cả thiệp và dữ liệu sẽ bị xóa hoàn toàn.</div>
            </div>
            <button 
              style={{ padding: '10px 20px', borderRadius: 10, background: '#fff', border: '1px solid #fee2e2', color: '#f43f5e', fontWeight: 600, fontSize: 14, cursor: 'not-allowed', whiteSpace: 'nowrap', opacity: 0.5 }}
              title="Tính năng đang được phát triển"
            >
              Xóa tài khoản
            </button>
          </div>
        </div>
        
      </div>
    </div>
  );
}
