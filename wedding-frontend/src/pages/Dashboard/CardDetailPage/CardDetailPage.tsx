import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { cardsApi } from '../../../api/cardsApi';
import QRCode from 'react-qr-code';
import slugify from 'slugify';
import { toast } from 'sonner';
import {
  Globe,
  Lock,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  ChevronDown,
  X,
  Check,
  Eye,
  Users,
  MessageSquare,
  MailOpen,
  UserCheck,
  UserMinus,
  Download
} from 'lucide-react';
import { DashboardLayout } from '../../../features/dashboard/pages/DashboardLayout';
import { RevolvingHeartsIcon } from '../../../components/icons/emojione-revolving-hearts';

interface CardStats {
  viewCount: number;
  totalWishes: number;
  totalRsvps: number;
  totalGuestsInvited: number;
  attendingGroom: number;
  attendingBride: number;
  notAttending: number;
}

interface CardData {
  id: string;
  slug: string;
  title: string;
  isPublic: boolean;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
  settings?: any;
}

export default function CardDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [card, setCard] = useState<CardData | null>(null);
  const [stats, setStats] = useState<CardStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal / Popover states
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [showPublishDropdown, setShowPublishDropdown] = useState(false);

  // Edit Title form
  const [editTitle, setEditTitle] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugError, setSlugError] = useState('');
  const slugTimeoutRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [cardData, statsData] = await Promise.all([
        cardsApi.getCard(id!),
        cardsApi.getCardStats(id!)
      ]);
      setCard(cardData);
      setStats(statsData);
      setEditTitle(cardData.title);
      setEditSlug(cardData.slug);
    } catch (error) {
      toast.error('Không thể tải thông tin thiệp');
      navigate('/dashboard/my-cards');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (isPublic: boolean) => {
    try {
      await cardsApi.updateCard(id!, { isPublic });
      setCard((prev) => prev ? ({ ...prev, isPublic }) : prev);
      setShowPublishDropdown(false);
      toast.success('Cập nhật trạng thái thành công');
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const handleDelete = async () => {
    try {
      await cardsApi.deleteCard(id!);
      toast.success('Xoá thiệp thành công');
      navigate('/dashboard/my-cards');
    } catch (error) {
      toast.error('Xoá thiệp thất bại');
    }
  };

  const checkSlugAvailability = async (newSlug: string) => {
    if (!newSlug || !card || newSlug === card.slug) {
      setSlugError('');
      return true;
    }
    setSlugChecking(true);
    try {
      const res = await cardsApi.checkSlug(newSlug, id);
      if (!res.isAvailable) {
        setSlugError('Đường dẫn đã tồn tại');
        return false;
      } else {
        setSlugError('');
        return true;
      }
    } catch (error) {
      setSlugError('Lỗi kiểm tra đường dẫn');
      return false;
    } finally {
      setSlugChecking(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditTitle(val);
    const generatedSlug = slugify(val, { lower: true, strict: true, locale: 'vi' });
    setEditSlug(generatedSlug);

    if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current);
    slugTimeoutRef.current = setTimeout(() => {
      checkSlugAvailability(generatedSlug);
    }, 500);
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setEditSlug(val);

    if (slugTimeoutRef.current) clearTimeout(slugTimeoutRef.current);
    slugTimeoutRef.current = setTimeout(() => {
      checkSlugAvailability(val);
    }, 500);
  };

  const saveTitleSlug = async () => {
    if (slugError) return;
    try {
      await cardsApi.updateCard(id!, { title: editTitle, slug: editSlug });
      setCard((prev) => prev ? ({ ...prev, title: editTitle, slug: editSlug }) : prev);
      setShowEditTitle(false);
      toast.success('Cập nhật thành công');
    } catch (error) {
      toast.error('Cập nhật thất bại');
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/share/${card?.slug}`;
    navigator.clipboard.writeText(link);
    toast.success('Đã copy đường dẫn');
  };

  const getQRCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const svg = document.getElementById('qr-code-svg');
      if (!svg) return reject('No SVG found');
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        const centerImgSrc = card?.settings?.coverImage;
        if (centerImgSrc && ctx) {
          const centerImg = new Image();
          centerImg.crossOrigin = 'anonymous';
          centerImg.onload = () => {
            const cw = 48; // Size of center image
            const ch = 48;
            const cx = (canvas.width - cw) / 2;
            const cy = (canvas.height - ch) / 2;
            // Draw white background
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(cx - 4, cy - 4, cw + 8, ch + 8);
            // Draw image
            ctx.drawImage(centerImg, cx, cy, cw, ch);
            resolve(canvas);
          };
          centerImg.onerror = () => resolve(canvas); // resolve anyway
          centerImg.src = centerImgSrc;
        } else {
          resolve(canvas);
        }
      };
      img.onerror = reject;
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
  };

  const downloadQR = async () => {
    try {
      const canvas = await getQRCanvas();
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${card?.slug || 'thiep'}.png`;
      downloadLink.href = `${pngFile}`;
      downloadLink.click();
    } catch (err) {
      toast.error('Lỗi khi tải mã QR');
    }
  };

  const copyQR = async () => {
    try {
      const canvas = await getQRCanvas();
      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error('Lỗi tạo ảnh');
          return;
        }
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          toast.success('Đã sao chép mã QR');
        }).catch(() => {
          toast.error('Trình duyệt của bạn không hỗ trợ copy ảnh');
        });
      }, 'image/png');
    } catch (err) {
      toast.error('Lỗi khi copy mã QR');
    }
  };

  if (loading || !card || !stats) {
    return (
      <DashboardLayout>
        <div className="w-full h-full min-h-[calc(100vh-8rem)] bg-white rounded-[2rem] flex flex-col items-center justify-center border border-rose-100/60 shadow-[0_4px_20px_rgba(244,63,94,0.03)] animate-in fade-in duration-500">
          <div className="relative flex flex-col items-center space-y-4">
            <div className="absolute -top-3 w-16 h-16 border-2 border-rose-100 border-t-rose-400 rounded-full slow-spin" />
            <div className="w-10 h-10 flex items-center justify-center smooth-pulse">
              <RevolvingHeartsIcon size={40} color="#f43f5e" />
            </div>
            <div className="space-y-1 text-center pt-2.5 z-10">
              <span className="text-2xl font-poppins font-black tracking-tighter text-zinc-950 block">
                Dear<span className="text-rose-500">Love</span>
              </span>
              <p className="text-sm font-semibold text-zinc-550 tracking-wide animate-pulse">
                Đang tải chi tiết thiệp...
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const fullLink = `${window.location.origin}/share/${card.slug}`;

  return (
    <DashboardLayout>
      <div className="w-full h-full min-h-[calc(100vh-8rem)] bg-white rounded-[2.5rem] p-6 border border-[rgb(255,166,166)]/30 shadow-md shadow-[rgb(255,166,166)]/5 flex flex-col md:flex-row gap-6 animate-in fade-in duration-500">
        {/* CỘT TRÁI (30%) */}
        <div className="w-full md:w-[30%] flex flex-col gap-4">
 
          {/* Preview Container */}
          <div className="bg-slate-100 rounded-2xl overflow-hidden relative shadow-sm h-[320px] md:h-[400px] flex flex-1 group cursor-pointer border border-slate-200" onClick={() => window.open(fullLink, '_blank')}>
            {/* Lượt xem góc trên */}
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-full z-10 flex items-center gap-1 shadow-sm">
              <Globe size={14} className="text-[rgb(235,76,76)]" />
              {stats.viewCount} lượt xem
            </div>
 
            <div className="w-full h-full relative overflow-hidden">
              {card.thumbnailUrl ? (
                <div
                  className="w-full absolute top-0 left-0 transition-all ease-linear translate-y-0 group-hover:-translate-y-[calc(100%-320px)] md:group-hover:-translate-y-[calc(100%-400px)]"
                  style={{ transitionDuration: '8s' }}
                >
                  <img
                    src={card.thumbnailUrl}
                    alt="Preview"
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <span className="text-4xl mb-2">📄</span>
                  <span>Chưa có ảnh preview</span>
                </div>
              )}
            </div>
 
            {/* Nút Xem Thiệp (Overlay khi hover) */}
            <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none bg-black/10">
              <div className="bg-white/95 backdrop-blur-sm text-[rgb(235,76,76)] font-semibold px-6 py-3 rounded-full shadow-xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 border border-[rgb(255,166,166)]/40">
                <ExternalLink size={18} />
                Xem thiệp
              </div>
            </div>
          </div>
 
          {/* Thời gian */}
          <div className="flex justify-between items-center text-sm text-slate-500 px-2">
            <div>
              <p className="font-medium text-slate-400 text-xs mb-0.5">Tạo lúc</p>
              <p>{new Date(card.createdAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
            <div className="text-right">
              <p className="font-medium text-slate-400 text-xs mb-0.5">Sửa lúc</p>
              <p>{new Date(card.updatedAt).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}</p>
            </div>
          </div>
 
          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={() => setShowQRModal(true)}
              className="w-full py-2.5 bg-[rgb(235,76,76)] hover:bg-[rgb(255,112,112)] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 shadow-sm shadow-[rgb(255,166,166)]/20 text-sm"
            >
              Mã QR Thiệp
            </button>
 
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/loading?next=${encodeURIComponent(`/design?id=${card.id}`)}&message=${encodeURIComponent('Đang mở trình thiết kế...')}`)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Edit2 size={16} /> Chỉnh sửa
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Trash2 size={16} /> Xoá
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px bg-slate-100 shrink-0" />

        {/* CỘT PHẢI (70%) */}
        <div className="w-full md:w-[70%] flex flex-col gap-4 md:gap-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0">
            <div className="relative">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-800">{card.title}</h1>
                <button
                  onClick={() => setShowEditTitle(!showEditTitle)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sửa tên thiệp"
                >
                  <Edit2 size={16} />
                </button>
              </div>

              {/* Popover sửa tên inline */}
              {showEditTitle && (
                <div className="absolute top-full left-0 mt-3 w-80 bg-white border border-slate-200 shadow-xl rounded-xl p-4 z-20">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-semibold text-slate-700">Chỉnh sửa thông tin</h3>
                    <button onClick={() => setShowEditTitle(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Tên thiệp</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={handleTitleChange}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Đường dẫn (slug)</label>
                      <input
                        type="text"
                        value={editSlug}
                        onChange={handleSlugChange}
                        className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 ${slugError ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 focus:ring-rose-500'}`}
                      />
                      {slugError ? (
                        <p className="text-xs text-red-500 mt-1">{slugError}</p>
                      ) : (
                        <p className="text-xs text-slate-400 mt-1">/share/{editSlug}</p>
                      )}
                    </div>
                    <button
                      onClick={saveTitleSlug}
                      disabled={!!slugError || slugChecking}
                      className="w-full py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 text-sm mt-2"
                    >
                      Lưu thay đổi
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setShowPublishDropdown(!showPublishDropdown)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all border ${card.isPublic
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
              >
                {card.isPublic ? <Globe size={16} /> : <Lock size={16} />}
                {card.isPublic ? 'Đang công khai' : 'Bản nháp'}
                <ChevronDown size={14} className="ml-1 opacity-70" />
              </button>

              {/* Dropdown */}
              {showPublishDropdown && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl p-1 z-20">
                  <button
                    onClick={() => handleUpdateStatus(true)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 rounded-lg text-emerald-600 font-medium"
                  >
                    <Globe size={16} /> Xuất bản
                    {card.isPublic && <Check size={14} className="ml-auto" />}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(false)}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm hover:bg-slate-50 rounded-lg text-slate-600 font-medium"
                  >
                    <Lock size={16} /> Bản nháp
                    {!card.isPublic && <Check size={14} className="ml-auto" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Link Thiệp */}
          <div className="flex flex-col gap-2 shrink-0">
            <p className="text-sm font-semibold text-slate-700">Đường dẫn thiệp của bạn</p>
            <div className="flex items-center bg-slate-50 rounded-xl border border-slate-200 p-1">
              <div className="px-4 text-sm text-slate-600 truncate flex-1 font-medium select-all">
                {fullLink}
              </div>
              <button onClick={copyLink} className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-white rounded-lg transition-all" title="Copy link">
                <Copy size={16} />
              </button>
              <a href={fullLink} target="_blank" rel="noreferrer" className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-white rounded-lg transition-all ml-1" title="Mở link">
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          <hr className="border-[rgb(255,166,166)]/20 shrink-0" />
 
          {/* Thống kê tổng quan */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-slate-800">Thống kê tổng quan</h2>
              <Link to={`/dashboard/wishes?cardId=${id}`} className="text-sm font-medium text-rose-500 hover:text-rose-600 hover:underline">Chi tiết</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 
              <div className="rounded-2xl bg-white border border-[rgb(255,166,166)]/30 p-5 flex flex-col gap-3 shadow-xs transition-all duration-300 hover:shadow-sm hover:border-[rgb(255,166,166)]/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[rgb(255,237,199)] flex items-center justify-center text-[rgb(235,76,76)] shrink-0">
                    <Eye size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase line-clamp-1">Lượt xem</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-zinc-800 font-inter">{stats.viewCount}</p>
                  <p className="text-[11px] text-zinc-400 font-bold mt-1">Truy cập online</p>
                </div>
              </div>
 
              <div className="rounded-2xl bg-white border border-[rgb(255,166,166)]/30 p-5 flex flex-col gap-3 shadow-xs transition-all duration-300 hover:shadow-sm hover:border-[rgb(255,166,166)]/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[rgb(255,237,199)] flex items-center justify-center text-[rgb(255,112,112)] shrink-0">
                    <Users size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase line-clamp-1">Khách mời</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-zinc-800 font-inter">{stats.totalGuestsInvited}</p>
                  <p className="text-[11px] text-zinc-400 font-bold mt-1">Tổng nhận link</p>
                </div>
              </div>
 
              <div className="rounded-2xl bg-white border border-[rgb(255,166,166)]/30 p-5 flex flex-col gap-3 shadow-xs transition-all duration-300 hover:shadow-sm hover:border-[rgb(255,166,166)]/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[rgb(255,237,199)] flex items-center justify-center text-[rgb(255,112,112)] shrink-0">
                    <MessageSquare size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase line-clamp-1">Lời chúc</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-zinc-800 font-inter">{stats.totalWishes}</p>
                  <p className="text-[11px] text-[rgb(235,76,76)] font-bold mt-1">Lưu bút online</p>
                </div>
              </div>
 
            </div>
          </div>
 
          <hr className="border-[rgb(255,166,166)]/20 shrink-0" />
 
          {/* Thống kê người tham dự */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-bold text-slate-800">Phản hồi tham dự (RSVP)</h2>
              <Link to={`/dashboard/rsvp?cardId=${id}`} className="text-sm font-medium text-rose-500 hover:text-rose-600 hover:underline">Chi tiết</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 
              <div className="rounded-2xl bg-white border border-[rgb(255,166,166)]/30 p-5 flex flex-col gap-3 shadow-xs transition-all duration-300 hover:shadow-sm hover:border-[rgb(255,166,166)]/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[rgb(255,237,199)] flex items-center justify-center text-[rgb(255,112,112)] shrink-0">
                    <MailOpen size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase line-clamp-1">Phản hồi</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-zinc-800 font-inter">{stats.totalRsvps}</p>
                  <p className="text-[11px] text-zinc-400 font-bold mt-1">Xác nhận tham gia</p>
                </div>
              </div>
 
              <div className="rounded-2xl bg-white border border-[rgb(255,166,166)]/30 p-5 flex flex-col gap-3 shadow-xs transition-all duration-300 hover:shadow-sm hover:border-[rgb(255,166,166)]/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-6 -mt-6 w-20 h-20 rounded-full bg-[rgb(255,237,199)]/40 blur-2xl pointer-events-none" />
                <div className="flex items-center gap-2 relative z-10">
                  <div className="h-8 w-8 rounded-lg bg-[rgb(255,237,199)] flex items-center justify-center text-[rgb(235,76,76)] shrink-0">
                    <UserCheck size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase line-clamp-1">Tham dự</span>
                </div>
                <div className="relative z-10">
                  <p className="text-3xl font-black text-emerald-600 font-inter">{stats.attendingGroom + stats.attendingBride}</p>
                  <div className="flex gap-3 mt-1.5 text-[11px] font-bold text-emerald-600/80 uppercase">
                    <span>Trai: {stats.attendingGroom}</span>
                    <span>Gái: {stats.attendingBride}</span>
                  </div>
                </div>
              </div>
 
              <div className="rounded-2xl bg-white border border-[rgb(255,166,166)]/30 p-5 flex flex-col gap-3 shadow-xs transition-all duration-300 hover:shadow-sm hover:border-[rgb(255,166,166)]/60">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-[rgb(255,237,199)] flex items-center justify-center text-[rgb(235,76,76)] shrink-0">
                    <UserMinus size={18} />
                  </div>
                  <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase line-clamp-1">Vắng mặt</span>
                </div>
                <div>
                  <p className="text-3xl font-black text-[rgb(235,76,76)] font-inter">{stats.notAttending}</p>
                  <p className="text-[11px] text-zinc-400 font-bold mt-1">Không tham dự</p>
                </div>
              </div>
 
            </div>
          </div>
 
        </div>
 
        {/* MODALS */}
 
        {/* QR Modal */}
        {showQRModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(false)}>
            <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <button onClick={() => setShowQRModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
              <h3 className="text-2xl font-bold text-[rgb(235,76,76)]  mb-2">Mã QR Thiệp</h3>
              <p className="text-sm text-slate-500 mb-8 text-center">Quét mã để mở trực tiếp trên điện thoại</p>
 
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 relative flex items-center justify-center">
                <QRCode
                  id="qr-code-svg"
                  value={fullLink}
                  size={220}
                  level="H"
                  fgColor="#1e293b"
                />
                {/* Ảnh thumbnail dâu rể ở giữa */}
                {card?.settings?.coverImage && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <img
                      src={card.settings.coverImage}
                      className="w-[48px] h-[48px] object-cover rounded-xl border-4 border-white shadow-sm bg-white"
                      alt="thumbnail"
                    />
                  </div>
                )}
              </div>
 
              <div className="flex gap-3 w-full">
                <button
                  onClick={downloadQR}
                  className="flex-1 py-3 bg-[rgb(235,76,76)] hover:bg-[rgb(255,112,112)] text-white rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={18} />
                  Tải QR (PNG)
                </button>
                <button
                  onClick={copyQR}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <Copy size={18} />
                  Sao chép ảnh
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirm */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
            <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Xoá thiệp này?</h3>
              <p className="text-sm text-slate-500 mb-6">Hành động này không thể hoàn tác. Mọi dữ liệu về lời chúc, khách mời của thiệp này sẽ bị xoá vĩnh viễn.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors"
                >
                  Xóa thiệp
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
