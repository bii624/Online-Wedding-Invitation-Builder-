import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { RevolvingHeartsIcon } from '../../../components/icons/emojione-revolving-hearts';
import { useAuthStore } from '../../../store/authStore';

import { NotificationPopup } from './NotificationPopup';

import {
  LayoutDashboard, Palette, MessageSquare,
  UserCheck, Gift, User, Crown, MessageCircle, Bell, Megaphone, LayoutTemplate,
  ChevronLeft, Mails, LogOut, Wallet, Home, Menu
} from 'lucide-react';

export const DashboardLayout = ({ children }: { children: React.ReactNode; title?: string; subtitle?: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

   if (user && user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const displayName = user?.fullName ? user.fullName.trim().split(/\s+/).pop() : 'User';

  const menuGroups = [
    {
      title: 'Tổng quan',
      items: [
        { name: 'Tổng quan', path: '/dashboard/overview', icon: LayoutDashboard },
        { name: 'Thiệp của tôi', path: '/dashboard/my-cards', icon: Mails },
        { name: 'Kho mẫu thiệp', path: '/dashboard/templates', icon: LayoutTemplate },
        { name: 'Tạo thiệp mới', path: '/dashboard/create', icon: Palette },
      ]
    },
    {
      title: 'Lời chúc & Quà tặng',
      items: [
        { name: 'Lời chúc', path: '/dashboard/wishes', icon: MessageSquare },
        { name: 'Xác nhận tham dự', path: '/dashboard/rsvp', icon: UserCheck },
        { name: 'Quà tặng', path: '/dashboard/gifts', icon: Gift },
      ]
    },
    {
      title: 'Tài khoản',
      items: [
        { name: 'Thông tin tài khoản', path: '/dashboard/account', icon: User },
        { name: 'Gói dịch vụ', path: '/dashboard/plan', icon: Crown },
      ]
    },
    {
      title: 'Hỗ trợ',
      items: [
        { name: 'Chia sẻ góp ý', path: '/dashboard/feedback', icon: MessageCircle },
      ]
    }
  ];

  const closeSidebar = () => setIsSidebarOpen(false);

  const SidebarContent = () => (
    <>
      {/* Logo + Close */}
      <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-slate-200">
        <Link to="/dashboard/overview" className="flex items-center gap-2.5 group cursor-pointer no-underline" onClick={closeSidebar}>
          <div className="bg-rose-100 rounded-2xl w-10 h-10 flex items-center justify-center transition-transform group-hover:rotate-12">
            <RevolvingHeartsIcon size={28} color="#f43f5e" />
          </div>
          <div>
            <span className="text-[18px] font-extrabold text-slate-800 tracking-[-0.4px] block leading-tight">DearLove</span>
            <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-[0.8px] block -mt-0.5">User Panel</span>
          </div>
        </Link>

        <button
          onClick={closeSidebar}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
          title="Thu gọn menu"
        >
          <ChevronLeft size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto custom-scrollbar-mini">
        {menuGroups.map((group, idx) => (
          <div key={idx} className="space-y-2">
            <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-[1px] mb-2">{group.title}</h3>
            <div className="space-y-1">
              {group.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={itemIdx}
                    to={item.path}
                    onClick={closeSidebar}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-all duration-200 text-sm ${isActive
                      ? 'bg-rose-50 text-rose-500 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'
                      }`}
                  >
                    <span className={isActive ? 'text-rose-500' : 'text-slate-400 transition-colors group-hover:text-slate-600'}>
                      <Icon size={18} />
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-slate-200 shrink-0 relative">
        <div className="hidden md:block">
          <NotificationPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </div>

        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-[10px]">
          <div className="w-8 h-8 rounded-lg bg-linear-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0 overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0) || 'U'
            )}
          </div>

          <div className="flex-1 min-w-0 text-left">
            <p className="text-xs font-bold text-slate-800 font-inter truncate">{displayName}</p>
            <p className="text-[10px] font-semibold text-rose-500 font-inter uppercase tracking-wide">Gói Tự Do</p>
          </div>

          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white hover:bg-slate-100 rounded-lg border border-slate-200 cursor-pointer flex items-center justify-center shrink-0"
            title="Thông báo"
          >
            <Bell size={14} />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 border border-white" />
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-3 flex items-center gap-3 px-3.5 py-3 rounded-[10px] transition-all duration-200 text-sm font-medium text-slate-600 hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
        >
          <LogOut size={17} />
          Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-50/50 font-inter text-zinc-800 select-none overflow-hidden">

      {/* ── DESKTOP SIDEBAR (md+) ─────────────────────────────── */}
      <aside
        className={`hidden md:flex bg-white border-r border-slate-100 flex-col h-full transition-all duration-300 ease-in-out shrink-0 z-30 ${isSidebarOpen ? 'md:w-64' : 'md:w-0 md:opacity-0 md:-translate-x-full md:overflow-hidden md:pointer-events-none'}`}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >
        <SidebarContent />
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY (< md) ────────────────────── */}
      <div className={`md:hidden fixed inset-0 z-50 flex ${isSidebarOpen ? '' : 'pointer-events-none'}`}>
        {/* Dark backdrop */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closeSidebar}
        />
        {/* Sidebar panel */}
        <aside
          className={`relative w-[80vw] max-w-sm bg-white flex flex-col h-full shadow-2xl transition-transform duration-300 ease-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
        >
          <SidebarContent />
        </aside>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">

        {/* Header Desktop */}
        <header className="hidden md:flex h-14 md:h-16 bg-gradient-to-r from-rose-50/70 via-rose-50/40 to-amber-50/70 backdrop-blur-md border-b border-rose-100/60 items-center justify-between px-4 md:px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            {/* Hamburger / logo toggle */}
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2 group cursor-pointer focus:outline-none shrink-0"
                title="Mở menu"
              >
                <div className="bg-rose-50 p-1.5 rounded-lg transition-transform group-hover:rotate-12 flex items-center justify-center border border-rose-100/50 shadow-sm">
                  <RevolvingHeartsIcon size={20} color="#f43f5e" />
                </div>
                <span className="hidden sm:block text-base font-serif font-black text-zinc-800 tracking-tight">DearLove</span>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Menu
                </span>
              </button>
            )}

            {/* Announcement banner */}
            <div className="hidden sm:flex items-center gap-2 bg-rose-50/70 border border-rose-100/40 text-rose-500 px-3 py-1.5 rounded-full text-xs font-semibold truncate">
              <Megaphone size={12} className="animate-bounce shrink-0" />
              <span className="truncate hidden lg:block">Hệ thống tạo thiệp di động đang hoạt động tối ưu!</span>
              <span className="truncate lg:hidden">Hệ thống đang hoạt động!</span>
            </div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-2 bg-zinc-50/30 px-2.5 py-1.5 rounded-full border border-zinc-100/50 shrink-0">
            <span className="hidden sm:block text-sm font-semibold text-zinc-800 font-inter">{displayName}</span>
            <div className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-rose-100 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
          </div>
        </header>

        {/* Header Mobile App-like */}
        <header className="md:hidden flex h-14 bg-white items-center justify-between px-4 shrink-0 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="bg-rose-50 p-1.5 rounded-lg flex items-center justify-center border border-rose-100/50 shadow-sm">
              <RevolvingHeartsIcon size={20} color="#f43f5e" />
            </div>
            <span className="text-base font-serif font-black text-zinc-800 tracking-tight">DearLove</span>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <Link to="/dashboard/plan" className="cursor-pointer hover:text-rose-500 transition-colors">
              <Wallet size={20} strokeWidth={1.5} />
            </Link>
            <Link to="/" className="cursor-pointer hover:text-rose-500 transition-colors">
              <Home size={20} strokeWidth={1.5} />
            </Link>
            <button onClick={handleLogout} className="cursor-pointer hover:text-rose-500 transition-colors">
              <LogOut size={20} strokeWidth={1.5} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 md:pb-6 relative flex flex-col">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-40 flex justify-between px-2 h-[68px] pb-safe items-center">
          <Link to="/dashboard/overview" className={`flex-1 flex flex-col items-center justify-center gap-1 ${location.pathname.includes('overview') ? 'text-rose-600' : 'text-black'}`}>
            <LayoutDashboard size={24} strokeWidth={location.pathname.includes('overview') ? 2.5 : 2} />
            <span className={`text-[11px] text-black ${location.pathname.includes('overview') ? 'font-bold' : 'font-medium'}`}>Tổng quan</span>
          </Link>
          <Link to="/dashboard/my-cards" className={`flex-1 flex flex-col items-center justify-center gap-1 ${location.pathname.includes('my-cards') ? 'text-rose-600' : 'text-black'}`}>
            <Mails size={24} strokeWidth={location.pathname.includes('my-cards') ? 2.5 : 2} />
            <span className={`text-[11px] text-black ${location.pathname.includes('my-cards') ? 'font-bold' : 'font-medium'}`}>Thiệp của tôi</span>
          </Link>

          {/* Center FAB */}
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <Link to={`/loading?next=${encodeURIComponent('/design')}&message=${encodeURIComponent('Đang mở trình thiết kế...')}`} className="absolute -top-7 flex flex-col items-center group cursor-pointer no-underline">
              <div className="w-14 h-14 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-200 group-active:scale-95 transition-transform border-[3px] border-white ring-1 ring-slate-100">
                <span className="text-3xl font-light mb-1">+</span>
              </div>
              <span className="text-[11px] font-bold text-black mt-1 uppercase tracking-tight">Tạo thiệp</span>
            </Link>
          </div>

          <button onClick={() => setIsNotificationsOpen(true)} className="flex-1 flex flex-col items-center justify-center gap-1 text-black cursor-pointer">
            <div className="relative">
              <Bell size={24} strokeWidth={2} />
            </div>
            <span className="text-[11px] text-black font-medium">Thông báo</span>
          </button>
          <button onClick={() => setIsSidebarOpen(true)} className={`flex-1 flex flex-col items-center justify-center gap-1 ${isSidebarOpen ? 'text-rose-600' : 'text-black'} cursor-pointer`}>
            <Menu size={24} strokeWidth={isSidebarOpen ? 2.5 : 2} />
            <span className={`text-[11px] text-black ${isSidebarOpen ? 'font-bold' : 'font-medium'}`}>Menu</span>
          </button>
        </nav>

        {/* Mobile Notification Popup wrapper */}
        <div className="md:hidden">
          <NotificationPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        </div>
      </main>
    </div>
  );
};