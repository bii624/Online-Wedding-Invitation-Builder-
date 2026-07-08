import { Bell, Search, Settings } from 'lucide-react';
import { useAuthStore } from '../../../store/authStore';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export function AdminHeader({ title, subtitle, onMenuClick }: AdminHeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="adm-header">
      <div className="flex items-center gap-3">
        {onMenuClick && (
          <button 
            className="md:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            onClick={onMenuClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
          </button>
        )}
        <div>
          <h1 className="adm-header-title">{title}</h1>
          {subtitle && <p className="adm-header-breadcrumb">{subtitle}</p>}
        </div>
      </div>
      <div className="adm-header-right">
        {/* Search */}
        <div className="adm-desktop-only" style={{ position:'relative' }}>
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
