import { useState, useEffect } from 'react';
import { CalendarDays, Heart, MessageCircle, RefreshCw, Check, EyeOff, Eye, Trash2 } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import DashboardPanel from '../components/DashboardPanel';
import { cardsApi } from '../../../api/cardsApi';
import { toast } from 'sonner';

export const Wishes = () => {
  const [wishes, setWishes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchWishes = async () => {
    try {
      setIsLoading(true);
      const data = await cardsApi.getAllWishes();
      setWishes(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách lời chúc!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleToggleApprove = async (wishId: string, currentStatus: boolean) => {
    try {
      await cardsApi.approveWish(wishId, !currentStatus);
      toast.success(currentStatus ? 'Đã ẩn lời chúc!' : 'Đã duyệt hiển thị lời chúc!');
      fetchWishes();
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
      fetchWishes();
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

  // Compute live stats
  const totalWishes = wishes.length;
  const latestWish = wishes[0];
  const uniqueCardsCount = new Set(wishes.map((w) => w.cardId)).size;

  return (
    <DashboardLayout>
      <DashboardPanel className="p-8 min-h-[75vh]">
 
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-[rgb(255,166,166)]/30">
          <div>
            <h1 className="text-2xl font-black text-[rgb(235,76,76)] font-inter">Lời Chúc Đã Nhận</h1>
            <p className="mt-1.5 text-xs text-zinc-550 font-inter font-medium">Lưu giữ những lời chúc yêu thương gửi đến vợ chồng bạn</p>
          </div>
          <button
            onClick={fetchWishes}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-[rgb(235,76,76)] hover:border-[rgb(255,166,166)] hover:bg-[rgb(255,237,199)]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>
 
        <div className="grid gap-5 md:grid-cols-3 mb-8">
          <div className="flex items-center gap-4 rounded-2xl border border-[rgb(255,166,166)]/45 bg-[rgb(255,237,199)]/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(255,237,199)] text-[rgb(235,76,76)] border border-[rgb(255,166,166)]/40 shadow-2xs">
              <MessageCircle size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số lời chúc</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{totalWishes}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Lời chúc được ghi nhận</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[rgb(255,166,166)]/40 bg-[rgb(255,237,199)]/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(255,237,199)] text-[rgb(255,112,112)] border border-[rgb(255,166,166)]/40 shadow-2xs">
              <CalendarDays size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Lời chúc mới nhất</p>
              <p className="mt-1 text-sm font-bold text-slate-800 truncate max-w-[180px]">
                {latestWish ? `${latestWish.displayName}` : 'Chưa có lời chúc'}
              </p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {latestWish ? `Gửi ngày ${formatDate(latestWish.createdAt)}` : 'Không tìm thấy người gửi'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-[rgb(255,166,166)]/40 bg-[rgb(255,237,199)]/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgb(255,237,199)] text-[rgb(255,112,112)] border border-[rgb(255,166,166)]/40 shadow-2xs">
              <Heart size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Thiệp nhận lời chúc</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{uniqueCardsCount}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Có thiệp được kết nối</p>
            </div>
          </div>
        </div>
 
        <div className="overflow-hidden rounded-2xl border border-[rgb(255,166,166)]/30 bg-white shadow-2xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(235,76,76)]" />
            </div>
          ) : wishes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[rgb(255,237,199)]/40 text-[rgb(255,112,112)] border border-[rgb(255,166,166)]/30 mb-3">
                <Heart size={20} />
              </div>
              <p className="text-sm font-bold text-zinc-750 font-inter">Không có lời chúc nào</p>
              <p className="max-w-xs text-xs text-zinc-400 font-inter font-medium leading-relaxed mt-1">
                Mọi tin nhắn chúc mừng đáng yêu từ bạn bè gửi qua thiệp sẽ tụ họp đầy đủ ở đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 text-left text-xs text-zinc-650">
                <thead className="bg-zinc-50/60 text-[10px] font-black uppercase tracking-wider text-zinc-400">
                  <tr>
                    <th className="px-6 py-4">Người gửi</th>
                    <th className="px-6 py-4">Nội dung lời chúc</th>
                    <th className="px-6 py-4">Thiệp cưới</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4 text-center">Hành động</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-100">
                  {wishes.map((wish) => (
                    <tr key={wish.id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-6 py-4 font-bold text-zinc-800 font-inter">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[rgb(255,237,199)] text-[rgb(235,76,76)] flex items-center justify-center text-xs font-black shadow-2xs overflow-hidden shrink-0">
                            {wish.avatarUrl ? (
                              <img src={wish.avatarUrl} alt={wish.displayName} className="w-full h-full object-cover" />
                            ) : (
                              wish.displayName?.charAt(0).toUpperCase() || 'K'
                            )}
                          </div>
                          <span>{wish.displayName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-600 max-w-xs truncate" title={wish.message}>
                        {wish.message}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[rgb(235,76,76)] font-semibold">{wish.card?.title || 'Không tên'}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {formatDate(wish.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleToggleApprove(wish.id, wish.isApproved)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer active:scale-95 ${wish.isApproved
                              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'
                              }`}
                            title={wish.isApproved ? 'Ẩn lời chúc' : 'Duyệt lời chúc'}
                          >
                            {wish.isApproved ? <Eye size={13} /> : <EyeOff size={13} />}
                          </button>
                          <button
                            onClick={() => handleDelete(wish.id)}
                            className="p-1.5 rounded-lg border border-red-100 text-red-500 bg-red-50/50 hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer active:scale-95"
                            title="Xóa lời chúc"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardPanel>
    </DashboardLayout>
  );
};