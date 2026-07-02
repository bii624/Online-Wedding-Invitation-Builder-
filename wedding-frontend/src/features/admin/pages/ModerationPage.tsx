import { useState } from 'react';
import { Check, X, Trash2, AlertTriangle, Heart } from 'lucide-react';

const MOCK_WISHES = [
  { id: '1', content: 'Chúc đôi uyên ương trăm năm hạnh phúc, mãi mãi yêu nhau!', cardTitle: 'Thiệp Lan & Minh', guestName: 'Nguyễn Văn An', createdAt: '2025-05-01 10:30', isApproved: false, isReported: false },
  { id: '2', content: 'Nội dung vi phạm cần xét duyệt', cardTitle: 'Thiệp Hương & Sơn', guestName: 'Ẩn danh', createdAt: '2025-05-02 14:15', isApproved: false, isReported: true },
  { id: '3', content: 'Mãi yêu nhau nhé hai bạn, chúc phát tài phát lộc!', cardTitle: 'Thiệp Nam & Hà', guestName: 'Trần Thị Bích', createdAt: '2025-05-03 09:00', isApproved: false, isReported: false },
  { id: '4', content: 'Spam spam spam...', cardTitle: 'Thiệp Lan & Minh', guestName: 'Khách lạ', createdAt: '2025-05-03 11:22', isApproved: false, isReported: true },
];

export function ModerationPage() {
  const [filter, setFilter] = useState<'all'|'reported'>('all');

  const filtered = filter === 'reported'
    ? MOCK_WISHES.filter(w => w.isReported)
    : MOCK_WISHES;

  return (
    <div>
      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Chờ duyệt', value: MOCK_WISHES.filter(w=>!w.isApproved).length, color: '#f59e0b', bg: '#fffbeb', icon: <AlertTriangle size={24} color="#f59e0b" /> },
          { label: 'Bị báo cáo', value: MOCK_WISHES.filter(w=>w.isReported).length, color: '#ef4444', bg: '#fef2f2', icon: <AlertTriangle size={24} color="#ef4444" /> },
          { label: 'Đã duyệt', value: 0, color: '#10b981', bg: '#f0fdf4', icon: <Check size={24} color="#10b981" /> },
        ].map(s => (
          <div key={s.label} className="adm-stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '24px', background: '#fff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: 'none' }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: 26, fontWeight: 800, color: '#1e293b', lineHeight: 1.1, marginBottom: 4 }}>{s.value}</span>
              <span style={{ fontSize: 14, color: '#64748b', fontWeight: 600 }}>{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--adm-bg)', borderRadius:10, padding:4, width:'fit-content' }}>
        {[['all','Tất cả'],['reported','Bị báo cáo 🚨']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v as any)}
            style={{ padding:'6px 16px', borderRadius:8, border:'none', background: filter===v ? '#fff' : 'transparent', fontWeight: filter===v ? 600 : 500, fontSize:13, color: filter===v ? 'var(--adm-text)' : 'var(--adm-text-muted)', cursor:'pointer', boxShadow: filter===v ? 'var(--adm-shadow)' : 'none', transition:'all 0.18s' }}>
            {l}
          </button>
        ))}
      </div>

      {/* Wishes list */}
      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
        {filtered.map(w => (
          <div key={w.id} className="adm-card" style={{ border: w.isReported ? '1px solid #fca5a5' : '1px solid var(--adm-border)' }}>
            <div style={{ padding:'16px 20px' }}>
              {w.isReported && (
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:10, padding:'6px 12px', background:'var(--adm-danger-bg)', borderRadius:8 }}>
                  <AlertTriangle size={13} color="var(--adm-danger)" />
                  <span style={{ fontSize:12, color:'var(--adm-danger)', fontWeight:600 }}>Bị báo cáo vi phạm</span>
                </div>
              )}
              <div style={{ display:'flex', alignItems:'flex-start', gap:14 }}>
                <div className="adm-user-avatar" style={{ flexShrink:0 }}>{w.guestName?.charAt(0) || 'G'}</div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                    <span style={{ fontWeight:600, fontSize:13 }}>{w.guestName}</span>
                    <span style={{ fontSize:11, color:'var(--adm-text-muted)' }}>•</span>
                    <span style={{ fontSize:11, color:'var(--adm-text-muted)' }}>Thiệp: <b>{w.cardTitle}</b></span>
                    <span style={{ fontSize:11, color:'var(--adm-text-muted)', marginLeft:'auto' }}>{w.createdAt}</span>
                  </div>
                  <p style={{ fontSize:14, color:'var(--adm-text)', margin:0, lineHeight:1.6, background:'var(--adm-bg)', padding:'10px 14px', borderRadius:8 }}>"{w.content}"</p>
                </div>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', gap:8, marginTop:14, paddingLeft:50 }}>
                <button className="adm-btn adm-btn-primary adm-btn-sm">
                  <Check size={13} /> Duyệt
                </button>
                <button className="adm-btn adm-btn-outline adm-btn-sm">
                  <X size={13} /> Ẩn
                </button>
                <button className="adm-btn adm-btn-danger-ghost adm-btn-sm" style={{ marginLeft:'auto' }}>
                  <Trash2 size={13} /> Xóa
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="adm-empty">
          <Check size={40} color="var(--adm-success)" />
          <p style={{ fontWeight:600 }}>Không có nội dung nào cần xét duyệt</p>
        </div>
      )}
    </div>
  );
}
