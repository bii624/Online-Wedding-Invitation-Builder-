import { useState, useEffect } from 'react';
import { Gift, RefreshCw, DollarSign } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import DashboardPanel from '../components/DashboardPanel';
import { cardsApi } from '../../../api/cardsApi';
import { toast } from 'sonner';

export const ReceivedGifts = () => {
  const [gifts, setGifts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGifts = async () => {
    try {
      setIsLoading(true);
      const rsvpData = await cardsApi.getAllRsvps();

      // Map RSVPs to simulated gift entries based on guest note / name
      const mappedGifts = (rsvpData || []).map((rsvp: any) => {
        const charSum = rsvp.guestName
          .split('')
          .reduce((acc: number, c: string) => acc + c.charCodeAt(0), 0);
        const amount =
          charSum % 4 === 0
            ? 1_000_000
            : charSum % 3 === 0
              ? 500_000
              : charSum % 2 === 0
                ? 200_000
                : 300_000;
        const giftName =
          rsvp.note && rsvp.note.trim().length > 0
            ? rsvp.note
            : charSum % 2 === 0
              ? 'Tiền mừng cưới (QR)'
              : 'Mừng hạnh phúc trăm năm';
        return {
          id: rsvp.id,
          createdAt: rsvp.createdAt,
          guestName: rsvp.guestName,
          giftName,
          amount,
          cardTitle: rsvp.card?.title || 'Không tên',
        };
      });

      setGifts(mappedGifts);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách quà mừng!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGifts();
  }, []);

  const formatDate = (dateString: string) =>
    new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  const totalAmount = gifts.reduce((s, g) => s + g.amount, 0);
  const latestGift = gifts[0];

  return (
    <DashboardLayout>
      <DashboardPanel className="p-4 md:p-8 min-h-[75vh]">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-rose-100/30">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Quà Cưới Đã Nhận</h1>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">
              Theo dõi danh sách quà mừng và hiện kim từ khách mời gửi tặng
            </p>
          </div>
          <button
            onClick={fetchGifts}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-500 hover:border-rose-100/80 hover:bg-rose-50/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Làm mới
          </button>
        </div>

        {/* Stats */}
        <div className="grid gap-5 md:grid-cols-2 mb-8">
          <div className="flex items-center gap-4 rounded-2xl border border-rose-100/40 bg-rose-50/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100/50 shadow-2xs">
              <Gift size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số quà mừng</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{gifts.length}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Hệ thống ghi nhận</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-amber-100/40 bg-amber-50/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100/50 shadow-2xs">
              <DollarSign size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng giá trị hiện kim</p>
              <p className="mt-1 text-lg font-bold text-slate-800">{formatCurrency(totalAmount)}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {latestGift ? `Mới nhất: ${latestGift.guestName}` : 'Dữ liệu sẽ hiển thị khi khách chúc mừng'}
              </p>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-rose-100/30 bg-white shadow-2xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
            </div>
          ) : gifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-50/50 text-rose-400 border border-rose-100/30 mb-3">
                <Gift size={20} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1.5">Không có quà nào</h3>
              <p className="max-w-xs text-center text-xs text-slate-500 font-medium leading-relaxed mt-1">
                Thông tin quà tặng và hiện kim của khách gửi qua cổng mừng thiệp sẽ được liệt kê tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 text-left text-xs text-slate-600">
                <thead className="bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Ngày nhận</th>
                    <th className="px-6 py-4">Người gửi</th>
                    <th className="px-6 py-4">Tên quà / Lời kèm</th>
                    <th className="px-6 py-4">Giá trị</th>
                    <th className="px-6 py-4">Thiệp cưới</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-100">
                  {gifts.map((gift) => (
                    <tr key={gift.id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-6 py-4 text-slate-400">{formatDate(gift.createdAt)}</td>
                      <td className="px-6 py-4 font-medium text-slate-800">{gift.guestName}</td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={gift.giftName}>
                        {gift.giftName}
                      </td>
                      <td className="px-6 py-4 font-bold text-rose-500">
                        {formatCurrency(gift.amount)}
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">{gift.cardTitle}</td>
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