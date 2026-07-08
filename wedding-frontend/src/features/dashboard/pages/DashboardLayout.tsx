import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { RevolvingHeartsIcon } from '../../../components/icons/emojione-revolving-hearts';
import { useAuthStore } from '../../../store/authStore';
import { BsEnvelopePaperHeart } from "react-icons/bs";
import { NotificationPopup } from './NotificationPopup';

import {
  LayoutDashboard, Palette, MessageSquare,
  UserCheck, Gift, User, Crown, MessageCircle, Bell, Megaphone, LayoutTemplate,
  ChevronLeft, LogOut, Search, Heart
} from 'lucide-react';

export const DashboardLayout = ({ children }: { children: React.ReactNode; title?: string; subtitle?: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
        { name: 'Thiệp của tôi', path: '/dashboard/my-cards', icon: BsEnvelopePaperHeart },
        { name: 'Kho mẫu thiệp', path: '/dashboard/templates', icon: LayoutTemplate },
        { name: 'Tạo thiệp mới', path: '/dashboard/create', icon: Palette },
      ]
    },
    {
      title: 'Lời chúc & Quà tặng',
      items: [
        { name: 'Lời chúc', path: '/dashboard/wishes', icon: Heart },
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

  return (
    <div className="flex h-screen bg-liner-to-br from-rose-100/60 via-white/60 to-amber-100/60 font-poppins text-zinc-800 select-none">
      <aside
        className={`bg-white/45 backdrop-blur-xl border border-[rgb(255,166,166)]/30 flex flex-col h-[calc(100vh-2rem)] shadow-lg transition-all duration-350 ease-in-out shrink-0 z-[999] my-4 ml-8 rounded-[2.25rem] ${isSidebarOpen ? 'w-56 opacity-100' : 'w-0 opacity-0 -translate-x-full overflow-hidden pointer-events-none ml-0 my-0 border-none'}`}
      >
        <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-[rgb(255,166,166)]/30">
          <Link to="/" className="flex items-center gap-2 group cursor-pointer no-underline">
            <div className="bg-[rgb(253,205,209)] p-1.5 rounded-lg transition-transform group-hover:rotate-12 flex items-center justify-center border border-[rgb(255,166,166)]/30">
              <RevolvingHeartsIcon size={20} color="#f43f5e" />
            </div>
            <span className="text-lg font-serif font-black text-[rgb(235, 76, 76)] tracking-tight">DearLove</span>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-[rgb(235, 76, 76)] hover:bg-[rgb(255,237,199)]/45 border border-transparent hover:border-[rgb(255,166,166)]/30 transition-all cursor-pointer flex items-center justify-center"
            title="Thu gọn menu"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-6 overflow-y-auto">
          {menuGroups.map((group, idx) => (
            <div key={idx} className="space-y-2">
              <h3 className="px-3 text-[10px] font-black text-[rgb(255,112,112)] uppercase tracking-wider">{group.title}</h3>
              <div className="space-y-1">
                {group.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={itemIdx}
                      to={item.path}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-sm font-semibold border ${isActive
                        ? 'bg-rose-50 border-[rgb(255,166,166)]/40 text-rose-500 shadow-2xs'
                        : 'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                        }`}
                    >
                      <Icon size={17} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 shrink-0 relative">
          <NotificationPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
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
              title="Thông báo">
              <Bell size={14} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-rose-500 border border-white" />
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-200 text-xs font-bold text-zinc-500 hover:bg-[rgb(255,237,199)]/30 hover:text-[rgb(235,76,76)] border border-transparent hover:border-[rgb(255,166,166)]/30 cursor-pointer"
          >
            <LogOut size={17} />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
      <header className="h-16 bg-transparent backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-10 shadow-none">
          {/* Header Left: Sidebar Trigger & Search Bar */}
          <div className="flex items-center gap-3 flex-1">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2.5 group cursor-pointer no-underline focus:outline-none animate-in fade-in slide-in-from-left duration-300 mr-2"
                title="Mở menu chức năng"
              >
                <div className="bg-[rgb(253,205,209)] p-1.5 rounded-lg transition-transform group-hover:rotate-12 flex items-center justify-center border border-[rgb(255,166,166)]/30 shadow-sm">
                  <RevolvingHeartsIcon size={20} color="rgb(235, 76, 76)" />
                </div>
                <span className="text-lg font-serif font-black text-[rgb(235, 76, 76)] tracking-tight">DearLove</span>
                <span className="text-[10px] font-bold text-[rgb(235, 76, 76)] bg-[rgb(253,205,209)] border border-[rgb(255,166,166)]/40 px-2 py-0.5 rounded-md hover:bg-[rgb(255,237,199)]/80 transition-colors ml-1 uppercase tracking-wider">
                  Menu
                </span>
              </button>
            )}
            
          </div>

          {/* Header Right: Megaphone status & Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 bg-[rgb(255,237,199)]/40 border border-[rgb(255,166,166)]/30 text-[rgb(235,76,76)] px-4 py-1.5 rounded-full text-[10px] font-bold shadow-2xs">
              <Megaphone size={12} className="animate-bounce" />
              <span>Hệ thống tạo thiệp di động đang hoạt động tối ưu!</span>
            </div>

            {/* Notifications */}
            <div className="flex items-center gap-3 bg-[rgb(255,237,199)]/20 border border-[rgb(255,166,166)]/30 p-1.5 rounded-full shadow-2xs relative">
              <NotificationPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />

              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-zinc-500 hover:text-[rgb(235,76,76)] transition-colors hover:bg-[rgb(255,237,199)]/35 rounded-full cursor-pointer flex items-center justify-center shrink-0 border border-transparent hover:border-[rgb(255,166,166)]/30 bg-white"
                title="Thông báo"
              >
                <Bell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[rgb(235,76,76)] border border-white" />
              </button>

              <div className="w-[1px] h-5 bg-[rgb(255,166,166)]/30" />

              <div className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-rose-100 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative">
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};