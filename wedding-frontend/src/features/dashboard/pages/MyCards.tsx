import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { Edit3, X, Sparkles, LayoutTemplate, Mails, ChevronLeft, ChevronRight } from 'lucide-react';
import { cardsApi } from '../../../api/cardsApi';
import { toast } from 'sonner';
import { CardItem, CardItemSkeleton } from '../components/CardItem';



export const MyCards = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const totalPages = Math.ceil(cards.length / itemsPerPage);
  const currentCards = cards.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const fetchCards = async () => {
    try {
      const res = await cardsApi.getUserCards();
      setCards(res.data || res || []);
    } catch (err) {
      console.error('Error fetching cards:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await cardsApi.deleteCard(id);
      toast.success('Xóa thiệp cưới thành công!');
      fetchCards();
    } catch (err: any) {
      console.error(err);
      toast.error('Không thể xóa thiệp cưới!');
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-4xl border border-rose-100/50 shadow-[0_15px_40px_rgba(244,63,94,0.015)] p-8 min-h-[75vh]">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-rose-100/30">
          <div>
            <h1 className="text-2xl font-black text-zinc-800 font-inter">Thiệp Của Tôi</h1>
            <p className="mt-1.5 text-xs text-zinc-400 font-inter font-medium">Quản lý và phát triển thiết kế thiệp cưới di động của bạn</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/create')}
            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shadow-rose-500/10 hover:shadow-rose-500/20 cursor-pointer"
          >
            <Edit3 size={14} /> Tạo thiệp mới
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <CardItemSkeleton key={i} />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-rose-50/50 border border-rose-100/30 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-2xs">
              <Mails size={26} />
            </div>
            <h3 className="text-base font-bold text-zinc-750 font-inter mb-1">Chưa có thiệp cưới nào</h3>
            <p className="text-xs text-zinc-400 font-inter font-medium mb-6 text-center max-w-xs leading-relaxed">
              Thiết kế thiệp đầu tiên để gửi gắm thông điệp lãng mạn tới mọi khách mời của bạn.
            </p>
            <button
              onClick={() => navigate('/dashboard/create')}
              className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-sm shadow-rose-500/10 cursor-pointer"
            >
              <Edit3 size={14} /> Tạo thiệp ngay
            </button>
          </div>
        ) : (
          <div className="flex flex-col min-h-[500px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-auto">
              {currentCards.map(card => (
                <CardItem
                  key={card.id}
                  card={{
                    id: card.id,
                    title: card.title || 'Chưa có tiêu đề',
                    slug: card.slug,
                    thumbnailUrl: card.thumbnailUrl || card.settings?.coverImage || null,
                    isPublished: card.status === 'published' || card.isPublic,
                    viewCount: card.viewCount || 0,
                    updatedAt: card.updatedAt
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-rose-100/30">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={18} />
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    const isActive = currentPage === page;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                          isActive 
                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20' 
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};