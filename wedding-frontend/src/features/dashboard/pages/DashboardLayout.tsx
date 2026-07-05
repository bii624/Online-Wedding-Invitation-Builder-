import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { RevolvingHeartsIcon } from '../../../components/icons/emojione-revolving-hearts';
import { useAuthStore } from '../../../store/authStore';

import { NotificationPopup } from './NotificationPopup';

import {
  LayoutDashboard, Palette, MessageSquare,
  UserCheck, Gift, User, Crown, MessageCircle, Bell, Megaphone, LayoutTemplate,
  ChevronLeft, Mails, LogOut
} from 'lucide-react';

export const DashboardLayout = ({ children }: { children: React.ReactNode; title?: string; subtitle?: string }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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
        { name: 'Trình thiết kế', path: '/design', icon: Palette },
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

  return (
    <div className="flex h-screen bg-slate-50/50 font-inter text-zinc-800 select-none">
      <aside
        className={`bg-white border-r border-slate-100 flex flex-col h-full transition-all duration-350 ease-in-out shrink-0 z-30 ${isSidebarOpen ? 'w-64' : 'w-0 opacity-0 -translate-x-full overflow-hidden pointer-events-none'}`}
        style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
      >

        <div className="flex items-center justify-between px-5 h-20 shrink-0 border-b border-slate-200">
          <Link to="/dashboard/overview" className="flex items-center gap-2.5 group cursor-pointer no-underline">
            <div className="bg-rose-100 rounded-2xl w-10 h-10 flex items-center justify-center transition-transform group-hover:rotate-12">
              <RevolvingHeartsIcon size={28} color="#f43f5e" />
            </div>
            <div>
              <span className="text-[18px] font-extrabold text-slate-800 tracking-[-0.4px] block leading-tight">DearLove</span>
              <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-[0.8px] block -mt-0.5">User Panel</span>
            </div>
          </Link>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-center"
            title="Thu gọn menu"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

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
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        <header className="h-16 bg-white/90 backdrop-blur-md border-b border-rose-100/40 flex items-center justify-between px-6 shrink-0 z-10 shadow-2xs">
          <div className="flex items-center gap-3">
            {!isSidebarOpen && (
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center gap-2.5 group cursor-pointer no-underline focus:outline-none animate-in fade-in slide-in-from-left duration-300 mr-2"
                title="Mở menu chức năng"
              >
                <div className="bg-rose-50 p-1.5 rounded-lg transition-transform group-hover:rotate-12 flex items-center justify-center border border-rose-100/50 shadow-sm">
                  <RevolvingHeartsIcon size={20} color="#f43f5e" />
                </div>
                <span className="text-lg font-serif font-black text-zinc-800 tracking-tight">DearLove</span>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100/50 px-2 py-0.5 rounded-md hover:bg-rose-100/50 transition-colors ml-1 uppercase tracking-wider">
                  Menu
                </span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-rose-50/70 border border-rose-100/40 text-rose-500 px-4 py-1.5 rounded-full text-xs font-semibold shadow-2xs">
              <Megaphone size={13} className="animate-bounce font-inter" />
              <span className='font-inter'>Hệ thống tạo thiệp di động đang hoạt động tối ưu!</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-zinc-50/30 px-3 py-1.5 rounded-full border border-zinc-100/50">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-13 font-semibold text-zinc-800 font-inter ">{displayName}</span>
            </div>
            <div className="w-7 h-7 rounded-full bg-linear-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-black text-xs shadow-sm ring-2 ring-rose-100 overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                user?.fullName?.charAt(0) || 'U'
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 relative">
          {children}
        </div>
      </main>
    </div>
  );
};