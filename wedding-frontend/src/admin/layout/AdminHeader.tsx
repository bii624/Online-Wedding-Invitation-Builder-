import { Bell, Search, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export function AdminHeader({ title, subtitle }: AdminHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="adm-header">
      <div>
        <h1 className="adm-header-title">{title}</h1>
        {subtitle && <p className="adm-header-breadcrumb">{subtitle}</p>}
      </div>

      <div className="adm-header-right">
        {/* Search */}
        <div style={{ position:'relative' }}>
          <Search size={14} style={{ position:'absolute', left:10, top:'50%', transform:'translateY(-50%)', color:'var(--adm-text-muted)' }} />
          <input
            placeholder="Tìm kiếm..."
            style={{
              padding:'7px 12px 7px 30px',
              border:'1px solid var(--adm-border-mid)',
              borderRadius:'var(--adm-radius-sm)',
              fontSize:13,
              background:'#fff',
              color:'var(--adm-text)',
              outline:'none',
              width:200,
            }}
          />
        </div>

        {/* Notifications */}
        <button className="adm-header-icon-btn">
          <Bell size={16} />
          <span style={{
            position:'absolute', top:6, right:6,
            width:6, height:6, background:'var(--adm-pink)',
            borderRadius:'50%', border:'1.5px solid #fff'
          }} />
        </button>

        {/* Settings */}
        <button className="adm-header-icon-btn">
          <Settings size={16} />
        </button>

        {/* Avatar */}
        <div className="adm-header-avatar" title={user?.fullName ?? 'Admin'}>
          {user?.fullName?.charAt(0) ?? 'A'}
        </div>
      </div>
    </header>
  );
}
