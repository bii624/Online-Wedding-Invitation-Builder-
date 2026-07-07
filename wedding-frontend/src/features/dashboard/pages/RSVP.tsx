import { useState, useEffect, useMemo } from 'react';
import { RefreshCw, CheckSquare, Calendar, Users, Heart, Phone, ChevronDown, Search, ChevronLeft, ChevronRight, Filter, ArrowUpDown } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import DashboardPanel from '../components/DashboardPanel';
import { cardsApi } from '../../../api/cardsApi';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

export const RSVP = () => {
  const [searchParams] = useSearchParams();
  const initialCardId = searchParams.get('cardId') || 'all';
  const [cards, setCards] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>(initialCardId);
  const [isLoading, setIsLoading] = useState(true);

  // Table states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sideFilter, setSideFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [cardsData, rsvpsData] = await Promise.all([
        cardsApi.getUserCards({ limit: 100 }), // Get all cards
        cardsApi.getAllRsvps()
      ]);
      setCards(cardsData?.data || cardsData || []);
      setRsvps(rsvpsData || []);

      // Auto-select first card if 'all' is selected and we have cards
      if (initialCardId === 'all' && (cardsData?.data?.length || cardsData?.length)) {
        const firstCardId = (cardsData?.data || cardsData)[0].id;
        setSelectedCardId(firstCardId);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải dữ liệu RSVP!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  // Lọc RSVP theo thiệp
  const filteredByCard = useMemo(() => {
    if (selectedCardId === 'all') return rsvps;
    return rsvps.filter((r) => r.cardId === selectedCardId);
  }, [rsvps, selectedCardId]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sideFilter, sortBy, selectedCardId]);

  // Stats calculation cho thiệp đang chọn
  const stats = useMemo(() => {
    let totalRsvps = 0;
    let totalAttendees = 0;
    let groomAttendees = 0;
    let brideAttendees = 0;
    let notAttending = 0;

    filteredByCard.forEach((r) => {
      totalRsvps += 1;
      if (r.attending === 'yes') {
        const count = r.numAttendees || 1;
        totalAttendees += count;

        // Tính phe nhà trai/gái (từ khách được gán (guest.side) hoặc khách vãng lai tự điền (side))
        const side = r.guest?.side || r.side || 'both';
        if (side === 'groom') groomAttendees += count;
        else if (side === 'bride') brideAttendees += count;
      } else if (r.attending === 'no') {
        notAttending += r.numAttendees || 1;
      }
    });

    return { totalRsvps, totalAttendees, groomAttendees, brideAttendees, notAttending };
  }, [filteredByCard]);

  // Process data for Table (Search, Filter, Sort)
  const processedRsvps = useMemo(() => {
    let result = [...filteredByCard];

    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(r =>
        (r.guestName && r.guestName.toLowerCase().includes(lower)) ||
        (r.phone && r.phone.includes(lower)) ||
        (r.note && r.note.toLowerCase().includes(lower))
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.attending === statusFilter);
    }

    if (sideFilter !== 'all') {
      result = result.filter(r => {
        const side = r.guest?.side || r.side || 'both';
        return side === sideFilter;
      });
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === 'name_asc') return (a.guestName || '').localeCompare(b.guestName || '');
      return 0;
    });

    return result;
  }, [filteredByCard, searchTerm, statusFilter, sideFilter, sortBy]);

  // Pagination calculation
  const totalPages = Math.ceil(processedRsvps.length / itemsPerPage);
  const paginatedRsvps = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedRsvps.slice(start, start + itemsPerPage);
  }, [processedRsvps, currentPage]);

  return (
    <DashboardLayout>
      <DashboardPanel className="p-8 min-h-[75vh]">

        {/* HEADER & FILTER */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 mb-8 pb-6 border-b border-rose-100/30">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quản lý Khách mời (RSVP)</h1>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">Kiểm soát lượng khách xác nhận tham dự theo từng thiệp cưới</p>
          </div>

          <div className="flex items-center gap-3 w-full xl:w-auto">
            {/* CARD SELECTOR */}
            <div className="relative flex-1 sm:min-w-[280px] group z-10">
              {/* Premium Glow Effect */}
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

        {/* THỐNG KÊ CHI TIẾT */}
        <div className="grid gap-5 md:grid-cols-4 mb-8">
          <div className="flex flex-col justify-center rounded-2xl border border-rose-100/40 bg-rose-50/20 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider">Tổng xác nhận</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600">
                <CheckSquare size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-800">{stats.totalAttendees}</p>
              <p className="text-xs text-slate-500 font-medium">người đi</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Từ {stats.totalRsvps} lượt phản hồi</p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-sky-100/60 bg-sky-50/30 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Nhà Trai</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                <Users size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-800">{stats.groomAttendees}</p>
              <p className="text-xs text-slate-500 font-medium">khách</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Sẽ tham dự</p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-pink-100/60 bg-pink-50/30 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">Nhà Gái</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                <Heart size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-800">{stats.brideAttendees}</p>
              <p className="text-xs text-slate-500 font-medium">khách</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Sẽ tham dự</p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-zinc-200/60 bg-zinc-50/50 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Không tham gia</p>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-200 text-slate-600">
                <Users size={14} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-extrabold text-slate-800">{stats.notAttending}</p>
              <p className="text-xs text-slate-500 font-medium">khách</p>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">Từ chối tham dự</p>
          </div>
        </div>

        {/* BỘ LỌC BẢNG (SEARCH, FILTER, SORT) */}
        <div className="flex flex-col xl:flex-row gap-2.5 mb-6 bg-zinc-50/70 p-2 rounded-xl border border-zinc-100/80">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Tìm theo tên khách, sđt, ghi chú..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-transparent bg-white !text-[12px] !font-normal !text-slate-500 focus:border-rose-300 focus:ring-2 focus:ring-rose-100/50 outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                <Filter size={14} />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-auto h-9 pl-8 pr-7 rounded-lg border border-transparent bg-white !text-[12px] !font-normal !text-slate-500 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100/50 appearance-none cursor-pointer shadow-sm transition-all hover:bg-slate-50"
              >
                <option value="all">Mọi trạng thái</option>
                <option value="yes">Tham gia</option>
                <option value="no">Không tham gia</option>
                <option value="maybe">Có thể</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                <Users size={14} />
              </div>
              <select
                value={sideFilter}
                onChange={(e) => setSideFilter(e.target.value)}
                className="w-full sm:w-auto h-9 pl-8 pr-7 rounded-lg border border-transparent bg-white !text-[12px] !font-normal !text-slate-500 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100/50 appearance-none cursor-pointer shadow-sm transition-all hover:bg-slate-50"
              >
                <option value="all">Mọi phe</option>
                <option value="groom">Nhà trai</option>
                <option value="bride">Nhà gái</option>
                <option value="both">Chung</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
            <div className="relative flex-1 sm:flex-none">
              <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown size={14} />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto h-9 pl-8 pr-7 rounded-lg border border-transparent bg-white !text-[12px] !font-normal !text-slate-500 outline-none focus:border-rose-300 focus:ring-2 focus:ring-rose-100/50 appearance-none cursor-pointer shadow-sm transition-all hover:bg-slate-50"
              >
                <option value="newest">Mới nhất</option>
                <option value="oldest">Cũ nhất</option>
                <option value="name_asc">Tên A-Z</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* BẢNG RSVP CHI TIẾT */}
        <div className="overflow-hidden rounded-2xl border border-rose-100/40 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
            </div>
          ) : processedRsvps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-zinc-50/30">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-zinc-100 text-zinc-400 mb-4 shadow-sm">
                <Calendar size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-700 mb-1.5">Chưa có khách nào xác nhận</h3>
              <p className="max-w-xs text-center text-xs text-slate-500 font-medium leading-relaxed">
                Khi khách mời gửi phản hồi tham dự thông qua link thiệp cưới, danh sách sẽ xuất hiện tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 text-left font-inter">
                <thead className="bg-zinc-50/80 border-b border-zinc-100 text-[11px] font-black uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-6 py-4 whitespace-nowrap">Khách mời</th>
                    <th className="px-6 py-4 whitespace-nowrap">Phân loại</th>
                    <th className="px-6 py-4 whitespace-nowrap">Xác nhận</th>
                    <th className="px-6 py-4 whitespace-nowrap">Số người</th>
                    <th className="px-6 py-4">Ghi chú</th>
                    {selectedCardId === 'all' && <th className="px-6 py-4 whitespace-nowrap">Thiệp</th>}
                    <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-50/80">
                  {paginatedRsvps.map((rsvp) => {
                    const rsvpSide = rsvp.guest?.side || rsvp.side || 'both';
                    return (
                      <tr key={rsvp.id} className="hover:bg-rose-50/30 transition-colors group">
                        <td className="px-6 py-5">
                          <div className="font-semibold text-zinc-800 text-[14px] tracking-tight">{rsvp.guestName}</div>
                          {rsvp.phone && (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 mt-1">
                              <Phone size={12} className="text-zinc-400" /> {rsvp.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          {rsvpSide === 'groom' && <span className="inline-flex items-center rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-medium text-sky-700 ring-1 ring-inset ring-sky-600/20 shadow-2xs">Nhà trai</span>}
                          {rsvpSide === 'bride' && <span className="inline-flex items-center rounded-lg bg-pink-50 px-2.5 py-1 text-[11px] font-medium text-pink-700 ring-1 ring-inset ring-pink-600/20 shadow-2xs">Nhà gái</span>}
                          {rsvpSide === 'both' && <span className="inline-flex items-center rounded-lg bg-zinc-100 px-2.5 py-1 text-[11px] font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/20 shadow-2xs">Chung</span>}
                        </td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-medium ${rsvp.attending === 'yes'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60 shadow-sm'
                            : rsvp.attending === 'no'
                              ? 'bg-rose-50 text-rose-600 border border-rose-200/60 shadow-sm'
                              : 'bg-amber-50 text-amber-600 border border-amber-200/60 shadow-sm'
                            }`}>
                            {rsvp.attending === 'yes' ? 'Tham gia' : rsvp.attending === 'no' ? 'Không tham gia' : 'Có thể'}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="font-medium text-zinc-700 text-sm">{rsvp.numAttendees} <span className="text-[11px] text-zinc-400 font-normal">khách</span></div>
                        </td>
                        <td className="px-6 py-5">
                          {rsvp.note ? (
                            <p className="text-[13px] font-medium text-zinc-600 max-w-[240px] truncate" title={rsvp.note}>
                              {rsvp.note}
                            </p>
                          ) : (
                            <span className="text-xs text-zinc-300 italic">...</span>
                          )}
                        </td>
                        {selectedCardId === 'all' && (
                          <td className="px-6 py-5">
                            <span className="text-[11px] font-medium text-rose-600 bg-rose-50 px-2.5 py-1.5 rounded-lg border border-rose-100/50 shadow-2xs">{rsvp.card?.title || 'Không tên'}</span>
                          </td>
                        )}
                        <td className="px-6 py-5">
                          <span className="text-xs font-medium text-zinc-400">
                            {formatDate(rsvp.createdAt)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PHÂN TRANG */}
        {totalPages > 1 && !isLoading && processedRsvps.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 px-2">
            <p className="text-sm text-slate-500 font-medium">
              Hiển thị <span className="font-bold text-slate-700">{(currentPage - 1) * itemsPerPage + 1}</span> đến <span className="font-bold text-slate-700">{Math.min(currentPage * itemsPerPage, processedRsvps.length)}</span> trong tổng số <span className="font-bold text-slate-700">{processedRsvps.length}</span> kết quả
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-slate-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronLeft size={16} />
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }).map((_, i) => {
                  // Hiển thị tối đa 5 trang gần nhất
                  if (
                    i === 0 ||
                    i === totalPages - 1 ||
                    (i >= currentPage - 2 && i <= currentPage)
                  ) {
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentPage(i + 1)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold transition-all ${currentPage === i + 1
                          ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20 border-rose-500'
                          : 'border border-zinc-200 bg-white text-slate-600 hover:bg-zinc-50 shadow-sm'
                          }`}
                      >
                        {i + 1}
                      </button>
                    );
                  } else if (
                    i === currentPage - 3 ||
                    i === currentPage + 1
                  ) {
                    return <span key={i} className="flex h-9 w-4 items-center justify-center text-slate-400">...</span>;
                  }
                  return null;
                })}
              </div>

              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 bg-white text-slate-600 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </DashboardPanel>
    </DashboardLayout>
  );
};