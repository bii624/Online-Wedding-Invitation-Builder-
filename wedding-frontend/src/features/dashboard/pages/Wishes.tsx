import { useState, useEffect, useMemo } from 'react';
import { 
  RefreshCw, Check, Trash2, Search, 
  ChevronDown, MoreHorizontal, Heart, MessageCircle
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { cardsApi } from '../../../api/cardsApi';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

// Utility for stop words (vietnamese common words to exclude from tag cloud)
const stopWords = new Set(['và', 'là', 'của', 'có', 'cho', 'với', 'không', 'những', 'một', 'để', 'như', 'khi', 'các', 'thì', 'ở', 'đã', 'sẽ', 'lại', 'rằng', 'trong', 'từ', 'cũng', 'đến', 'được', 'này', 'người', 'nhiều', 'làm', 'phải', 'anh', 'em', 'chúc', 'hai', 'bạn', 'gia', 'đình', 'trăm', 'năm', 'hạnh', 'phúc', 'rất', 'nha', 'nhé', 'luôn']);

export const Wishes = () => {
  const [wishes, setWishes] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchParams] = useSearchParams();
  const initialCardId = searchParams.get('cardId') || 'all';
  const [selectedCardId, setSelectedCardId] = useState<string>(initialCardId);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'hidden'>('all');
  const [sideFilter, setSideFilter] = useState<'all' | 'groom' | 'bride' | 'none'>('all');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [wishesData, cardsData, rsvpsData] = await Promise.all([
        cardsApi.getAllWishes(),
        cardsApi.getUserCards(),
        cardsApi.getAllRsvps(),
      ]);
      setWishes(wishesData || []);
      // getUserCards returns { data: [], total } or just []
      const cardsList = Array.isArray(cardsData) ? cardsData : (cardsData?.data || []);
      setCards(cardsList);
      setRsvps(rsvpsData || []);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải dữ liệu!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (wishId: string, isApproved: boolean) => {
    try {
      await cardsApi.approveWish(wishId, isApproved);
      toast.success(isApproved ? 'Đã duyệt hiển thị lời chúc!' : 'Đã ẩn lời chúc!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Không thể cập nhật trạng thái lời chúc!');
    }
  };

  const handleDelete = async (wishId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lời chúc này?')) return;
    try {
      await cardsApi.deleteWish(wishId);
      toast.success('Đã xóa lời chúc!');
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error('Không thể xóa lời chúc!');
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // --- Derive helpers ---
  // Backend returns: { ..., guest: { side: 'groom'|'bride'|null }, isApproved, isHidden }
  const getSide = (w: any): string => w.guest?.side || w.side || 'none';
  const isPending = (w: any): boolean => !w.isApproved && !w.isHidden;
  const isHiddenWish = (w: any): boolean => w.isHidden === true;
  const isApprovedWish = (w: any): boolean => w.isApproved === true;

  // Filter by card first
  const wishesByCard = useMemo(() => {
    if (selectedCardId === 'all') return wishes;
    return wishes.filter((w) => w.cardId === selectedCardId || w.card?.id === selectedCardId);
  }, [wishes, selectedCardId]);

  // Compute Statistics
  const stats = useMemo(() => {
    const totalWishes = wishesByCard.length;
    const uniqueGuests = new Set(wishesByCard.map((w) => w.displayName)).size;
    const approvedCount = wishesByCard.filter(isApprovedWish).length;
    const hiddenCount = wishesByCard.filter(isHiddenWish).length;
    const pendingCount = wishesByCard.filter(isPending).length;
    
    const groomCount = wishesByCard.filter(w => getSide(w) === 'groom').length;
    const brideCount = wishesByCard.filter(w => getSide(w) === 'bride').length;
    const bothCount = wishesByCard.filter(w => getSide(w) === 'both' || getSide(w) === 'none').length;

    return {
      totalWishes,
      uniqueGuests,
      approvedCount,
      hiddenCount,
      pendingCount,
      groomCount,
      brideCount,
      bothCount
    };
  }, [wishesByCard]);

  // Compute Keywords
  const topKeywords = useMemo(() => {
    const wordCounts: Record<string, number> = {};
    wishesByCard.forEach(w => {
      if (!w.message) return;
      const words = w.message.toLowerCase().replace(/[.,!?()[\]{}"']/g, '').split(/\s+/);
      for (let i = 0; i < words.length - 1; i++) {
        if (!words[i] || !words[i+1]) continue;
        const bigram = `${words[i]} ${words[i+1]}`;
        if (['hạnh phúc', 'trăm năm', 'yêu thương', 'bền vững', 'con cái', 'gia đình', 'mãi mãi', 'sức khỏe', 'thuận hòa', 'phú quý'].includes(bigram)) {
            wordCounts[bigram] = (wordCounts[bigram] || 0) + 1;
        }
      }
      words.forEach((word: string) => {
        if (word.length > 2 && !stopWords.has(word)) {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
      });
    });
    return Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(entry => entry[0]);
  }, [wishesByCard]);

  // Filter Data
  const filteredWishes = useMemo(() => {
    return wishesByCard.filter(w => {
      const matchSearch = (w.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (w.message || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchStatus = true;
      if (statusFilter === 'approved') matchStatus = isApprovedWish(w);
      if (statusFilter === 'hidden') matchStatus = isHiddenWish(w);
      if (statusFilter === 'pending') matchStatus = isPending(w);

      let matchSide = true;
      const wSide = getSide(w);
      if (sideFilter === 'groom') matchSide = wSide === 'groom';
      if (sideFilter === 'bride') matchSide = wSide === 'bride';
      if (sideFilter === 'none') matchSide = wSide === 'none';

      return matchSearch && matchStatus && matchSide;
    });
  }, [wishesByCard, searchTerm, statusFilter, sideFilter]);


  return (
    <DashboardLayout>
      <div className="bg-white rounded-4xl border border-rose-100/50 shadow-[0_15px_40px_rgba(244,63,94,0.015)] p-8 min-h-[75vh]">
        
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 pb-6 border-b border-rose-100/30">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý lời chúc</h1>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">Lưu giữ những lời chúc yêu thương gửi đến vợ chồng bạn</p>
          </div>
          
          <div className="flex items-center gap-3 w-full xl:w-auto">
            {/* Card Selector */}
            <div className="relative flex-1 sm:min-w-[280px] group z-10">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-200 to-pink-200 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
              <label className="absolute -top-2.5 left-4 px-2 bg-white text-[10px] font-bold text-rose-500 uppercase tracking-wider z-20">
                Thiệp đang xem
              </label>
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className="relative w-full h-12 pl-5 pr-12 rounded-xl border border-rose-200 bg-rose-50/50 text-[15px] font-bold text-rose-700 outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-100/80 appearance-none cursor-pointer transition-all shadow-sm"
              >
                <option value="all" className="text-slate-700 font-semibold bg-white">Tất cả thiệp cưới</option>
                {cards.map(card => (
                  <option key={card.id} value={card.id} className="text-slate-700 font-semibold bg-white">{card.title}</option>
                ))}
              </select>
              <ChevronDown size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-400 pointer-events-none z-20" />
            </div>

            <button
              onClick={fetchData}
              disabled={isLoading}
              className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-600 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50/50 active:scale-95 transition-all cursor-pointer disabled:opacity-50 shadow-sm relative z-10"
              title="Tải lại"
            >
              <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* TOP STATS */}
        <div className="grid gap-5 md:grid-cols-4 mb-8">
          <div className="flex flex-col justify-center rounded-2xl border border-rose-100/40 bg-rose-50/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Tổng lời chúc</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <MessageCircle size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.totalWishes}</h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Từ {stats.uniqueGuests} khách</p>
          </div>
          
          <div className="flex flex-col justify-center rounded-2xl border border-emerald-100/60 bg-emerald-50/30 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Đã duyệt hiển thị</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <Check size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.approvedCount}</h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              {stats.totalWishes > 0 ? Math.round((stats.approvedCount / stats.totalWishes) * 100) : 0}% tổng số
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-amber-100/60 bg-amber-50/30 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Chờ duyệt</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <MoreHorizontal size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.pendingCount}</h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">mới hôm nay: {stats.pendingCount}</p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-slate-200/60 bg-slate-50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Đã ẩn</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-200 text-slate-700">
                <Trash2 size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <h3 className="text-3xl font-extrabold text-slate-800">{stats.hiddenCount}</h3>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">spam / không phù hợp</p>
          </div>
        </div>

        {/* MIDDLE SECTION */}
        <div className="grid gap-5 md:grid-cols-2 mb-8">
          
          {/* Lời chúc theo bên họ */}
          <div className="rounded-2xl border border-rose-100/40 bg-white p-6 shadow-sm">
            <h3 className="text-[13px] font-bold text-slate-800 mb-6 font-inter">Lời chúc theo bên họ</h3>
            
            <div className="space-y-4">
              {/* Row: Nhà trai */}
              <div className="flex items-center gap-4">
                <div className="w-20 text-[13px] font-semibold text-slate-600">Nhà trai</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${stats.totalWishes > 0 ? (stats.groomCount / stats.totalWishes) * 100 : 0}%` }}></div>
                </div>
                <div className="w-8 text-right text-[13px] font-bold text-slate-800">{stats.groomCount}</div>
              </div>

              {/* Row: Nhà gái */}
              <div className="flex items-center gap-4">
                <div className="w-20 text-[13px] font-semibold text-slate-600">Nhà gái</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 rounded-full transition-all duration-500" style={{ width: `${stats.totalWishes > 0 ? (stats.brideCount / stats.totalWishes) * 100 : 0}%` }}></div>
                </div>
                <div className="w-8 text-right text-[13px] font-bold text-slate-800">{stats.brideCount}</div>
              </div>

              {/* Row: Cả hai */}
              <div className="flex items-center gap-4">
                <div className="w-20 text-[13px] font-semibold text-slate-600">Cả hai</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full transition-all duration-500" style={{ width: `${stats.totalWishes > 0 ? (stats.bothCount / stats.totalWishes) * 100 : 0}%` }}></div>
                </div>
                <div className="w-8 text-right text-[13px] font-bold text-slate-800">{stats.bothCount}</div>
              </div>

            </div>

            <div className="h-px bg-rose-100/50 my-5"></div>
            
            <div className="space-y-4">
              {/* Row: Chờ duyệt */}
              <div className="flex items-center gap-4">
                <div className="w-20 text-[13px] font-semibold text-slate-600">Chờ duyệt</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${stats.totalWishes > 0 ? (stats.pendingCount / stats.totalWishes) * 100 : 0}%` }}></div>
                </div>
                <div className="w-8 text-right text-[13px] font-bold text-slate-800">{stats.pendingCount}</div>
              </div>

              {/* Row: Đã duyệt */}
              <div className="flex items-center gap-4">
                <div className="w-20 text-[13px] font-semibold text-slate-600">Đã duyệt</div>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${stats.totalWishes > 0 ? (stats.approvedCount / stats.totalWishes) * 100 : 0}%` }}></div>
                </div>
                <div className="w-8 text-right text-[13px] font-bold text-slate-800">{stats.approvedCount}</div>
              </div>
            </div>
          </div>

          {/* Từ khóa xuất hiện nhiều */}
          <div className="rounded-2xl border border-rose-100/40 bg-white p-6 shadow-sm flex flex-col">
            <h3 className="text-[13px] font-bold text-slate-800 mb-5 font-inter">Từ khóa xuất hiện nhiều</h3>
            
            <div className="flex flex-wrap gap-2.5 mb-auto">
              {topKeywords.length > 0 ? topKeywords.map((word, idx) => (
                <span key={idx} className="px-3.5 py-1.5 bg-rose-50/50 border border-rose-100 text-rose-600 rounded-full text-xs font-semibold shadow-sm">
                  {word}
                </span>
              )) : (
                 <span className="text-sm text-slate-400 font-medium italic">Chưa có đủ dữ liệu</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-6 pt-4 border-t border-rose-100/50 font-medium">
              Dựa trên {stats.totalWishes} lời chúc — cập nhật tự động
            </p>
          </div>

        </div>

        {/* BOTTOM SECTION: List & Filters */}
        <div className="rounded-2xl border border-rose-100/40 bg-white shadow-sm flex-1 flex flex-col overflow-hidden mb-6">
          
          <div className="p-5 border-b border-rose-100/40 bg-rose-50/10">
            <h3 className="text-sm font-bold text-slate-800 mb-4 font-inter">Danh sách lời chúc</h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm theo tên hoặc nội dung..." 
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
                />
              </div>

              {/* Side Filter Dropdown */}
              <div className="relative min-w-[180px]">
                <select 
                  value={sideFilter}
                  onChange={(e) => setSideFilter(e.target.value as any)}
                  className="w-full appearance-none px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="all">Tất cả bên họ</option>
                  <option value="groom">Nhà trai</option>
                  <option value="bride">Nhà gái</option>
                  <option value="none">Thiệp chung</option>
                </select>
                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2 mt-5">
              <button 
                onClick={() => setStatusFilter('pending')}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${statusFilter === 'pending' ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Chờ duyệt ({stats.pendingCount})
              </button>
              <button 
                onClick={() => setStatusFilter('approved')}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${statusFilter === 'approved' ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Đã duyệt ({stats.approvedCount})
              </button>
              <button 
                onClick={() => setStatusFilter('hidden')}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${statusFilter === 'hidden' ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-500/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Đã ẩn ({stats.hiddenCount})
              </button>
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-[13px] font-bold transition-all border ${statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800 shadow-md shadow-slate-800/20' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                Tất cả
              </button>
            </div>
          </div>

          {/* Cards List */}
          <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 min-h-[300px]">
            {isLoading ? (
               <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
               </div>
            ) : filteredWishes.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-rose-300 border border-rose-100 shadow-sm mb-4">
                    <Heart size={24} />
                  </div>
                  <p className="text-base font-bold text-slate-800">Không có lời chúc nào</p>
                  <p className="text-sm text-slate-500 mt-1">Chưa tìm thấy lời chúc phù hợp với bộ lọc hiện tại.</p>
                </div>
            ) : (
              <div className="space-y-4">
                {filteredWishes.map(wish => (
                  <div key={wish.id} className="bg-white border border-rose-100/60 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-rose-200 transition-all">
                    
                    {/* Card Header */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${isApprovedWish(wish) ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : isPending(wish) ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-slate-400'}`}></div>
                        <h4 className="font-bold text-slate-800 text-[15px]">{wish.displayName}</h4>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                          getSide(wish) === 'groom' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                          getSide(wish) === 'bride' ? 'bg-pink-50 text-pink-600 border border-pink-100' :
                          'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {getSide(wish) === 'groom' ? 'Nhà trai' : getSide(wish) === 'bride' ? 'Nhà gái' : 'Thiệp chung'}
                        </span>
                        {(() => {
                          const matchingRsvp = rsvps.find(r => r.cardId === wish.cardId && r.guestName?.toLowerCase() === wish.displayName?.toLowerCase());
                          if (!matchingRsvp) return null;
                          const isAttending = matchingRsvp.attending === 'yes';
                          return (
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${isAttending ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                              {isAttending ? 'Sẽ tham dự' : 'Không tham dự'}
                            </span>
                          );
                        })()}
                        {wish.card && selectedCardId === 'all' && (
                          <span className="px-2 py-0.5 bg-slate-50 border border-slate-200 text-slate-500 rounded-md text-[10px] font-medium">{wish.card.title}</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 font-medium whitespace-nowrap ml-4">
                        {formatDate(wish.createdAt)}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="mb-5 pl-5">
                      <p className="text-[14px] leading-relaxed text-slate-600 font-medium whitespace-pre-wrap">
                        {wish.message}
                      </p>
                    </div>

                    {/* Card Footer (Actions) */}
                    <div className="flex flex-wrap gap-2.5">
                       <button
                         onClick={() => updateStatus(wish.id, true)}
                         className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                           wish.isApproved 
                           ? 'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
                           : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50' 
                         }`}
                       >
                         {wish.isApproved ? <Check size={14} className="text-emerald-500" /> : null}
                         Duyệt hiển thị
                       </button>
                       <button
                         onClick={() => updateStatus(wish.id, false)}
                         className={`px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                           !wish.isApproved
                           ? 'bg-amber-50 border-amber-200 text-amber-600'
                           : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                         }`}
                       >
                         Ẩn / Chờ duyệt
                       </button>
                       
                       <button
                          onClick={() => handleDelete(wish.id)}
                          className="ml-auto p-2 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 transition-all hover:text-rose-600"
                          title="Xóa lời chúc"
                        >
                          <Trash2 size={16} />
                        </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>

      </div>
    </DashboardLayout>
  );
};