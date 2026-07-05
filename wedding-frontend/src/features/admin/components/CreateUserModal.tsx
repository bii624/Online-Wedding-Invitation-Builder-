import React, { useState, useRef } from 'react';
import { X, Loader2, Camera, User, Mail, Phone, Lock, Shield, Activity } from 'lucide-react';
import { adminApi, type AdminUser } from '../api/adminApi';
import { assetsApi } from '../../../api/assetsApi';
import { toast } from 'sonner';

interface CreateUserModalProps {
  onClose: () => void;
  onUserCreated: (user: AdminUser) => void;
}

export function CreateUserModal({ onClose, onUserCreated }: CreateUserModalProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    role: 'user',
    status: 'active',
    avatarUrl: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const asset = await assetsApi.uploadAsset(file);
      setFormData(prev => ({ ...prev, avatarUrl: asset.url }));
      toast.success('Tải ảnh đại diện thành công');
    } catch (error) {
      toast.error('Lỗi khi tải ảnh lên');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password || !formData.fullName) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    try {
      setLoading(true);
      const res = await adminApi.createUser(formData);
      toast.success('Thêm người dùng thành công');
      onUserCreated(res);
      onClose();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Có lỗi xảy ra khi thêm người dùng';
      if (Array.isArray(msg)) {
        toast.error(msg[0]);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      {/* Overlay */}
      <div
        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 850,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '95vh'
        }}
      >
        {/* Header - Pink Background */}
        <div style={{ padding: '24px 32px', background: 'var(--adm-pink, #f43f5e)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <User size={28} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 800, margin: '0 0 6px 0', color: '#fff', letterSpacing: '-0.02em' }}>Thêm người dùng mới</h2>
              <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Tạo tài khoản, phân quyền và thiết lập ảnh đại diện.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '32px', overflowY: 'auto', background: '#fff' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 40 }}>

              {/* Left Column: Form Inputs */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Họ và tên <span style={{ color: '#f43f5e' }}>*</span></label>
                  <input
                    name="fullName" value={formData.fullName} onChange={handleChange} placeholder="VD: Nguyễn Văn A"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Email đăng nhập <span style={{ color: '#f43f5e' }}>*</span></label>
                  <input
                    name="email" type="email" value={formData.email} onChange={handleChange} placeholder="VD: nguyenvan@gmail.com"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a' }}
                    onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Số điện thoại</label>
                    <input
                      name="phone" value={formData.phone} onChange={handleChange} placeholder="0987654321"
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Mật khẩu <span style={{ color: '#f43f5e' }}>*</span></label>
                    <input
                      name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Hoa, thường, số (≥8)"
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Phân quyền</label>
                    <select
                      name="role" value={formData.role} onChange={handleChange}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    >
                      <option value="user">Người dùng (User)</option>
                      <option value="admin">Quản trị viên (Admin)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Trạng thái tài khoản</label>
                    <select
                      name="status" value={formData.status} onChange={handleChange}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 15, outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a', fontWeight: 500, cursor: 'pointer' }}
                      onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.boxShadow = '0 0 0 3px rgba(244, 63, 94, 0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }}
                    >
                      <option value="active">Hoạt động (Active)</option>
                      <option value="unverified">Chưa xác thực</option>
                      <option value="suspended">Bị khóa</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Right Column: Avatar Upload */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Ảnh đại diện (Avatar) <span style={{ color: '#f43f5e' }}>*</span></label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    flex: 1,
                    border: '2px dashed #cbd5e1',
                    borderRadius: 20,
                    background: formData.avatarUrl ? `url(${formData.avatarUrl}) center/cover` : '#f8fafc',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    overflow: 'hidden',
                    minHeight: 220
                  }}
                  onMouseOver={(e) => { if (!formData.avatarUrl) e.currentTarget.style.borderColor = '#94a3b8'; e.currentTarget.style.background = formData.avatarUrl ? `url(${formData.avatarUrl}) center/cover` : '#f1f5f9'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = formData.avatarUrl ? `url(${formData.avatarUrl}) center/cover` : '#f8fafc'; }}
                >
                  {uploading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                      <Loader2 size={36} className="animate-spin" color="#f43f5e" />
                    </div>
                  )}

                  {!formData.avatarUrl && !uploading && (
                    <>
                      <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fff', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid #f1f5f9' }}>
                        <Camera size={24} color="#f43f5e" />
                      </div>
                      <p style={{ margin: '0 0 6px 0', fontSize: 15, fontWeight: 700, color: '#334155' }}>Tải lên file hoặc kéo thả</p>
                      <p style={{ margin: 0, fontSize: 13, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>Định dạng: JPG, PNG, WEBP<br />Tối đa: 10MB</p>
                    </>
                  )}

                  {formData.avatarUrl && !uploading && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseOut={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <div style={{ background: '#fff', padding: '10px 20px', borderRadius: 30, display: 'flex', gap: 8, alignItems: 'center', fontWeight: 600, fontSize: 14, color: '#334155', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Camera size={18} /> Đổi ảnh khác
                      </div>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </div>
              </div>

            </div>

            {/* Footer Buttons */}
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid #e2e8f0', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button
                type="button" onClick={onClose}
                style={{ padding: '12px 28px', background: '#fff', color: '#475569', fontWeight: 600, borderRadius: 12, border: '1px solid #cbd5e1', cursor: 'pointer', fontSize: 15, transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
              >
                Hủy bỏ
              </button>
              <button
                type="submit" disabled={loading || uploading}
                style={{ padding: '12px 32px', background: 'var(--adm-pink, #f43f5e)', color: '#fff', fontWeight: 600, borderRadius: 12, border: 'none', cursor: (loading || uploading) ? 'not-allowed' : 'pointer', fontSize: 15, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, opacity: (loading || uploading) ? 0.7 : 1, transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)' }}
                onMouseOver={(e) => { if (!loading && !uploading) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(244, 63, 94, 0.3)'; }}
                onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 63, 94, 0.25)'; }}
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? 'Đang tạo...' : 'Tạo người dùng'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

