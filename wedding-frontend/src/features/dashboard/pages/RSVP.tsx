import { useState, useEffect } from 'react';
import { RefreshCw, CheckSquare, Calendar, Users, FileText, Phone } from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import DashboardPanel from '../components/DashboardPanel';
import { cardsApi } from '../../../api/cardsApi';
import { toast } from 'sonner';

export const RSVP = () => {
  const [rsvps, setRsvps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRsvps = async () => {
    try {
      setIsLoading(true);
      const data = await cardsApi.getAllRsvps();
      setRsvps(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Lỗi khi tải danh sách RSVP!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRsvps();
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

  // Stats calculation
  const totalRsvps = rsvps.length;
  const totalAttendees = rsvps
    .filter((r) => r.attending === 'yes')
    .reduce((sum, r) => sum + (r.numAttendees || 1), 0);
  const uniqueCardsCount = new Set(rsvps.map((r) => r.cardId)).size;

  return (
    <DashboardLayout>
      <DashboardPanel className="p-8 min-h-[75vh]">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-rose-100/30">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Danh Sách RSVP</h1>
            <p className="mt-1.5 text-xs text-slate-500 font-medium">Theo dõi phản hồi xác nhận tham gia tiệc cưới từ khách mời</p>
          </div>
          <button
            onClick={fetchRsvps}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-xs font-bold text-zinc-650 hover:text-rose-500 hover:border-rose-100/80 hover:bg-rose-50/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} /> Tải lại
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3 mb-8">
          <div className="flex items-center gap-4 rounded-2xl border border-rose-100/40 bg-rose-50/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-rose-500 border border-rose-100/50 shadow-2xs">
              <CheckSquare size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Số lượt phản hồi</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{totalRsvps}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Khách đã xác nhận</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-teal-100/40 bg-teal-50/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-650 border border-teal-100/50 shadow-2xs">
              <Users size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Tổng số khách tham dự</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{totalAttendees}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Xác nhận sẽ có mặt</p>
            </div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-pink-100/40 bg-pink-50/10 p-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-50 text-pink-500 border border-pink-100/50 shadow-2xs">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Thiệp nhận phản hồi</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{uniqueCardsCount}</p>
              <p className="text-xs text-slate-500 font-medium mt-1">Có thiệp được kết nối</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-rose-100/30 bg-white shadow-2xs">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500" />
            </div>
          ) : rsvps.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100/60 text-teal-500 mb-4 shadow-2xs">
                <CheckSquare size={24} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1.5">Chưa có phản hồi tham dự</h3>
              <p className="max-w-xs text-center text-xs text-slate-500 font-medium leading-relaxed">
                Dữ liệu xác nhận tham dự (Số người đi cùng, thực đơn đặc biệt) của khách mời sẽ xuất hiện ngay tại đây.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-100 text-left text-xs text-slate-600">
                <thead className="bg-slate-50/60 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-6 py-4">Khách mời</th>
                    <th className="px-6 py-4">Tham dự</th>
                    <th className="px-6 py-4">Số người</th>
                    <th className="px-6 py-4">Ghi chú</th>
                    <th className="px-6 py-4">Thiệp cưới</th>
                    <th className="px-6 py-4">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-zinc-100">
                  {rsvps.map((rsvp) => (
                    <tr key={rsvp.id} className="hover:bg-zinc-50/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">
                        <div className="space-y-0.5">
                          <span>{rsvp.guestName}</span>
                          {rsvp.phone && (
                            <span className="flex items-center gap-1 text-[11px] text-slate-500 font-normal mt-1">
                              <Phone size={11} /> {rsvp.phone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${rsvp.attending === 'yes'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : rsvp.attending === 'no'
                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                          }`}>
                          {rsvp.attending === 'yes' ? 'Tham gia' : rsvp.attending === 'no' ? 'Không tham gia' : 'Có thể'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-zinc-700">
                        {rsvp.numAttendees} người
                      </td>
                      <td className="px-6 py-4 text-zinc-500 max-w-xs truncate" title={rsvp.note || ''}>
                        {rsvp.note || <span className="text-zinc-300 font-normal italic">Không có</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-rose-500 font-semibold">{rsvp.card?.title || 'Không tên'}</span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        {formatDate(rsvp.createdAt)}
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