import { useState } from 'react';
import { Plus, Edit3, ToggleRight, ToggleLeft, DollarSign } from 'lucide-react';

const MOCK_PLANS = [
  { id: '1', name: 'Free', price: 0, durationDays: null, maxCards: 3, features: { remove_watermark: false, custom_domain: false, analytics: false }, isActive: true },
  { id: '2', name: 'Premium', price: 99000, durationDays: 30, maxCards: 20, features: { remove_watermark: true, custom_domain: false, analytics: true }, isActive: true },
  { id: '3', name: 'Pro', price: 299000, durationDays: 365, maxCards: null, features: { remove_watermark: true, custom_domain: true, analytics: true, priority_support: true }, isActive: true },
  { id: '4', name: 'Starter', price: 49000, durationDays: 30, maxCards: 5, features: { remove_watermark: false, analytics: false }, isActive: false },
];

const PLAN_ICON_COLORS = ['#94a3b8','#f43f5e','#6366f1','#f59e0b'];
const PLAN_BG_COLORS = ['#f8fafc','#fff1f2','#eef2ff','#fffbeb'];

function formatPrice(price: number) {
  if (price === 0) return 'Miễn phí';
  return new Intl.NumberFormat('vi-VN', { style:'currency', currency:'VND' }).format(price);
}

export function PlansPage() {
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any>(null);

  return (
    <div>
      {/* Summary cards */}
      <div className="adm-stat-grid">
        {MOCK_PLANS.map((p, i) => (
          <div key={p.id} style={{ background:'#fff', borderRadius:12, border:'1px solid var(--adm-border)', padding:'20px', boxShadow:'var(--adm-shadow)' }}>
            <div style={{ width:44, height:44, borderRadius:10, background: PLAN_BG_COLORS[i], display:'flex', alignItems:'center', justifyContent:'center', marginBottom:12 }}>
              <DollarSign size={20} color={PLAN_ICON_COLORS[i]} />
            </div>
            <div style={{ fontSize:16, fontWeight:800, color:'var(--adm-text)', marginBottom:4 }}>{p.name}</div>
            <div style={{ fontSize:20, fontWeight:800, color: PLAN_ICON_COLORS[i], marginBottom:8 }}>{formatPrice(p.price)}</div>
            <div style={{ fontSize:12, color:'var(--adm-text-muted)' }}>
              {p.durationDays ? `${p.durationDays} ngày` : 'Vĩnh viễn'} · {p.maxCards ? `${p.maxCards} thiệp` : 'Không giới hạn'}
            </div>
            <div style={{ marginTop:12 }}>
              <span className={`adm-badge ${p.isActive ? 'adm-badge-green' : 'adm-badge-gray'}`}>
                {p.isActive ? 'Đang hoạt động' : 'Tắt'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="adm-card">
        <div className="adm-card-header">
          <span className="adm-card-title">Chi tiết gói dịch vụ</span>
          <button className="adm-btn adm-btn-primary adm-btn-sm" onClick={() => { setEditingPlan(null); setShowModal(true); }}>
            <Plus size={14} /> Tạo gói mới
          </button>
        </div>
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Tên gói</th>
                <th>Giá / tháng</th>
                <th>Thời hạn</th>
                <th>Số thiệp tối đa</th>
                <th>Tính năng chính</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PLANS.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight:700 }}>{p.name}</td>
                  <td style={{ fontWeight:600, color: p.price === 0 ? 'var(--adm-success)' : 'var(--adm-pink)' }}>{formatPrice(p.price)}</td>
                  <td style={{ color:'var(--adm-text-muted)' }}>{p.durationDays ? `${p.durationDays} ngày` : 'Vĩnh viễn'}</td>
                  <td style={{ textAlign:'center', fontWeight:600 }}>{p.maxCards ?? '∞'}</td>
                  <td>
                    <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                      {Object.entries(p.features).filter(([,v])=>v).map(([k]) => (
                        <span key={k} className="adm-badge adm-badge-indigo" style={{ fontSize:10, padding:'2px 8px' }}>
                          {k.replace(/_/g,' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`adm-badge ${p.isActive ? 'adm-badge-green' : 'adm-badge-gray'}`}>
                      {p.isActive ? 'Hoạt động' : 'Tắt'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="adm-btn adm-btn-ghost adm-btn-icon" title="Chỉnh sửa" onClick={() => { setEditingPlan(p); setShowModal(true); }}>
                        <Edit3 size={14} />
                      </button>
                      <button className="adm-btn adm-btn-ghost adm-btn-icon" title={p.isActive ? 'Tắt gói' : 'Bật gói'} style={{ color: p.isActive ? 'var(--adm-warning)' : 'var(--adm-success)' }}>
                        {p.isActive ? <ToggleLeft size={14} /> : <ToggleRight size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="adm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="adm-modal-title">{editingPlan ? 'Chỉnh sửa gói' : 'Tạo gói mới'}</h3>
            <p className="adm-modal-subtitle">Cấu hình thông tin và tính năng cho gói dịch vụ</p>
            <div className="adm-form-group">
              <label className="adm-form-label">Tên gói *</label>
              <input className="adm-form-input" defaultValue={editingPlan?.name ?? ''} placeholder="VD: Premium" />
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div className="adm-form-group">
                <label className="adm-form-label">Giá (VNĐ)</label>
                <input className="adm-form-input" type="number" defaultValue={editingPlan?.price ?? 0} />
              </div>
              <div className="adm-form-group">
                <label className="adm-form-label">Thời hạn (ngày)</label>
                <input className="adm-form-input" type="number" defaultValue={editingPlan?.durationDays ?? ''} placeholder="Để trống = vĩnh viễn" />
              </div>
            </div>
            <div className="adm-form-group">
              <label className="adm-form-label">Số thiệp tối đa</label>
              <input className="adm-form-input" type="number" defaultValue={editingPlan?.maxCards ?? ''} placeholder="Để trống = không giới hạn" />
            </div>
            <div style={{ display:'flex', gap:10, justifyContent:'flex-end', marginTop:20 }}>
              <button className="adm-btn adm-btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="adm-btn adm-btn-primary">Lưu gói</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
