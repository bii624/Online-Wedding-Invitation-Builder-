
import { RevolvingHeartsIcon } from "./icons/emojione-revolving-hearts";
import { Footer } from "./Footer";
import {
    ArrowRight,
    LayoutTemplate,
    Menu,
    X,
    UsersRound,
    Sparkles,
    Share2,
    ChevronDown,
    Send,
    Image,
    Palette,
    Play,
    Pen,
    LogOut,
    Zap,
} from 'lucide-react';

import { useAuthStore } from '../store/authStore';
import { Button } from '../components/button';
// import "./style.css";
import { useState, useEffect } from 'react';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
import { cardsApi } from '../api/cardsApi';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleCreateCard = async () => {
        try {
            const card = await cardsApi.createCard({ title: 'Thiệp cưới của tôi' });
            toast.success('Tạo thiệp thành công!');
            navigate(`/design?id=${card.id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thiệp');
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Trang chủ', href: '/' },
        { name: 'Mẫu thiệp', href: '/templates' },
        { name: 'Thiệp đã tạo', href: '/my-cards' },
        { name: 'Đánh giá', href: '/reviews' },
        { name: 'Liên hệ', href: '/contact' },
    ];

    return (
        <header className="fixed top-0 left-0 right-0 z-100 pt-6 px-4 pointer-events-none font-sans transition-all duration-300">
            <nav className={cn(
                "mx-auto pointer-events-auto bg-white/80 backdrop-blur-xl border transition-all ease-[cubic-bezier(0.34,1.56,0.64,1)] duration-500 delay-0",
                isScrolled
                    ? 'max-w-5xl py-2 px-6 rounded-full shadow-[0_12px_40px_rgba(244,63,94,0.15)] bg-white/90 border-rose-100 translate-y-1 scale-[0.98]'
                    : 'max-w-7xl py-2 px-10 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.05)] bg-white/90 border-rose-100'
            )}>
                <div className="flex justify-between items-center h-14">
                    <div className="flex items-center gap-2.5 shrink-0 group cursor-pointer">
                        <div className="bg-rose-100 p-2 rounded-xl transition-transform group-hover:rotate-12">
                            <RevolvingHeartsIcon size={28} color="#f43f5e" />
                        </div>
                        <span className="text-2xl font-serif font-black text-zinc-800">DearLove</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={cn(
                                    "px-4 py-2 text-[15px] font-medium rounded-full transition-all flex items-center gap-1",
                                    link.href === "/" || link.name === "Trang chủ"
                                        ? "text-rose-600 font-bold bg-rose-50/50"
                                        : "text-gray-600 hover:text-gray-950 hover:bg-gray-50/50"
                                )}
                            >
                                {link.name}
                                {['Security', 'Document', 'Integration'].includes(link.name) && (
                                    <ChevronDown className="h-3.5 w-3.5 opacity-40" />
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center space-x-2 ml-auto md:ml-0">
                        {user ? (
                            <div className="flex items-center bg-white border border-zinc-200 p-1.5 rounded-full shadow-sm">
                                <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 font-bold uppercase overflow-hidden shrink-0">
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                                    ) : (
                                        user.fullName?.charAt(0) || 'U'
                                    )}
                                </div>
                                <div className="ml-2">
                                    <Button onClick={() => navigate('/dashboard/overview')} variant="default" className="rounded-full h-9 px-4 text-white shadow-none text-sm flex items-center gap-1.5 font-medium border-0">
                                        <Zap className="w-4 h-4" />
                                        Tổng quan
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link to="/login" className="block">
                                    <Button variant="ghost" className="font-semibold text-gray-600 hover:text-rose-600 text-sm md:text-base px-3 md:px-4">
                                        Đăng nhập
                                    </Button>
                                </Link>
                                <Link to="/signup" className="hidden md:inline-block">
                                    <Button
                                        variant="default"
                                        className="rounded-xl px-6 bg-rose-600/80 hover:bg-rose-700/80 text-white transition-transform group-hover:rotate-12 shadow-none">
                                        Đăng ký
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    <div className="md:hidden ml-1">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-rose-50" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                            {isMenuOpen ? <X className="h-5 w-5 text-rose-600" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden mt-4 py-4 bg-white/95 rounded-2xl border border-rose-100/60 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="space-y-1 px-4">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    to={link.href}
                                    className={cn(
                                        "flex items-center justify-between w-full px-4 py-3 text-base font-medium rounded-xl transition-colors",
                                        link.href === "/" || link.name === "Trang chủ"
                                            ? "bg-rose-50 text-rose-600 font-bold"
                                            : "text-gray-700 hover:bg-zinc-50"
                                    )}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    {link.name}
                                    <ChevronDown className="h-4 w-4 -rotate-90 opacity-30" />
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </nav>
        </header>
    );
};