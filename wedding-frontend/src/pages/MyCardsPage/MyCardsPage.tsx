import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../LandingPage/LandingPage';
import { useAuthStore } from '../../store/authStore';
import { cardsApi, type QueryCardDto } from '../../api/cardsApi';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Search, LayoutTemplate, Plus, File, Filter, MoreVertical, Edit2, Trash2, Zap, LayoutGrid, List } from 'lucide-react';
import { Button } from '../../components/button';
import { cn } from '../../lib/utils';

export const MyCardsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // -- Mouse Gradient Animation State --
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }
    return () => {
      if (container) container.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // -- Data State --
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // -- Filter State --
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Cards
  const fetchCards = async () => {
    try {
      setLoading(true);
      const query: QueryCardDto = {
        search: debouncedSearch || undefined,
        status: status || undefined,
        sortOrder,
        sortBy: 'updatedAt',
        limit: 50, // Fetch more for dashboard
      };
      const res = await cardsApi.getUserCards(query);
      setCards(res.data);
    } catch (error: any) {
      toast.error('Lỗi khi tải danh sách thiệp');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, [debouncedSearch, status, sortOrder]);

  // Create empty card
  const handleCreateEmpty = async () => {
    try {
      const card = await cardsApi.createCard({ title: 'Thiệp mới của tôi' });
      toast.success('Đã tạo thiệp!');
      navigate(`/design?id=${card.id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  // Delete card
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!window.confirm('Bạn có chắc chắn muốn xóa thiệp này?')) return;
    try {
      await cardsApi.deleteCard(id);
      toast.success('Đã xóa thiệp');
      setCards((prev) => prev.filter((c) => c.id !== id));
      setActiveDropdown(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Lỗi khi xóa thiệp');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(date);
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-x-hidden font-sans bg-white"
    >
      {/* Animated soft background blobs - Top only */}
      <div className="absolute top-0 left-0 right-0 h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[10%] w-[60vw] h-[70vh] rounded-full bg-pink-300/80 mix-blend-multiply filter blur-[110px] animate-blob-1" />
        <div className="absolute top-[10%] right-[-5%] w-[50vw] h-[60vh] rounded-full bg-purple-200/75 mix-blend-multiply filter blur-[110px] animate-blob-2" />
        <div className="absolute top-[20%] left-[20%] w-[50vw] h-[50vh] rounded-full bg-rose-300/75 mix-blend-multiply filter blur-[90px] animate-blob-3" />
      </div>

      {/* Fade to white at bottom */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-white/30 to-white pointer-events-none" />

      {/* Animated Mouse Glow - smoothed with spring */}
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-70"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(236, 72, 153, 0.12), transparent 40%)`,
          transition: "background 80ms linear",
        }}
      />

      <Header />

      <main className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto">

        {/* Search & Greeting Section */}
        <div className="flex flex-col items-center justify-center space-y-8 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800 text-center">
            Hôm nay bạn muốn thiết kế gì?
          </h1>

          <div className="relative w-full max-w-2xl group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-6 w-6 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 md:py-5 border border-slate-200 rounded-full leading-5 bg-white shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/50 focus:border-rose-500 text-lg transition-all"
              placeholder="Tìm kiếm thiết kế của bạn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>


        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-800">Thiết kế gần đây</h2>

          <div className="flex items-center gap-3">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="draft">Bản nháp</option>
              <option value="published">Đã xuất bản</option>
            </select>

            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            >
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </select>

            <div className="flex items-center bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Cards Grid/List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-rose-500"></div>
          </div>
        ) : cards.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <LayoutTemplate className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Chưa có thiết kế nào</h3>
            <p className="text-slate-400 mb-6">Bạn chưa tạo hoặc không tìm thấy thiệp nào phù hợp.</p>
            <Button onClick={handleCreateEmpty} className="bg-rose-500 hover:bg-rose-600 text-white rounded-full px-8">
              Tạo thiết kế đầu tiên
            </Button>
          </div>
        ) : (
          <div className={cn(
            "grid gap-6",
            viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4" : "grid-cols-1"
          )}>
            <AnimatePresence>
              {cards.map((card) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  key={card.id}
                  className={cn(
                    "group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 relative",
                    viewMode === 'list' ? "flex items-center h-24" : "flex flex-col"
                  )}
                  onClick={() => navigate(`/design?id=${card.id}`)}
                >
                  {/* Thumbnail Placeholder */}
                  <div className={cn(
                    "bg-slate-100 flex items-center justify-center overflow-hidden relative cursor-pointer",
                    viewMode === 'list' ? "w-32 h-full shrink-0" : "w-full aspect-[4/3]"
                  )}>
                    {card.template?.thumbnailUrl ? (
                      <img src={card.template.thumbnailUrl} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-300 group-hover:scale-110 transition-transform duration-500">
                        <Zap size={32} className="mb-2 text-rose-300" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Thiết kế trống</span>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button variant="default" className="bg-white text-rose-600 hover:bg-rose-50 rounded-full shadow-lg">
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className={cn(
                    "p-4 flex flex-col justify-between flex-1",
                    viewMode === 'list' && "flex-row items-center w-full"
                  )}>
                    <div className={cn(viewMode === 'list' && "flex-1")}>
                      <h3 className="font-semibold text-slate-800 text-base truncate group-hover:text-rose-600 transition-colors">
                        {card.title || 'Thiệp chưa đặt tên'}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        Đã sửa {formatDate(card.updatedAt)}
                      </p>
                    </div>

                    {/* Dropdown Menu */}
                    <div className="relative mt-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setActiveDropdown(activeDropdown === card.id ? null : card.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <MoreVertical size={18} />
                      </button>

                      {activeDropdown === card.id && (
                        <div className="absolute right-0 top-8 w-40 bg-white border border-slate-100 shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-rose-600 flex items-center gap-2 transition-colors"
                            onClick={() => navigate(`/design?id=${card.id}`)}
                          >
                            <Edit2 size={14} /> Chỉnh sửa
                          </button>
                          <div className="h-px bg-slate-100" />
                          <button
                            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                            onClick={(e) => handleDelete(card.id, e)}
                          >
                            <Trash2 size={14} /> Xóa thiết kế
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};
