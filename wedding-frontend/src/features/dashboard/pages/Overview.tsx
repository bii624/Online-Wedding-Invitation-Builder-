import { Link } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
// DashboardPanel removed for Overview to use full-width layout
import { Crown, Sparkles, ArrowRight, Sparkle, ArrowUpRight } from 'lucide-react';
import FloatingBackgroundHearts from '../../../components/FloatingBackgroundHearts';
import { useAuthStore } from '../../../store/authStore';
import { useState, useEffect } from 'react';
import { cardsApi } from '../../../api/cardsApi';
import { assetsApi } from '../../../api/assetsApi';
import mockupImage from '../../../assets/images/mockup-thiep-cuoi-online-1.webp';
// --- Custom Icon Components ---

interface CustomIconProps {
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  background?: string;
  opacity?: number;
  rotation?: number;
  shadow?: number;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  padding?: number;
}

const Clipboard2HeartFillIcon = ({
  size = 24,
  color = 'currentColor',
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0
}: CustomIconProps) => {
  const baseViewBox = 16;
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = baseViewBox + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      style={{
        opacity,
        color,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <g fill="currentColor" fillRule="evenodd"><path d="M10.058.501a.5.5 0 0 0-.5-.501h-2.98c-.276 0-.5.225-.5.501A.5.5 0 0 1 5.582 1a.497.497 0 0 0-.497.497V2a.5.5 0 0 0 .5.5h4.968a.5.5 0 0 0 .5-.5v-.503A.497.497 0 0 0 10.555 1a.5.5 0 0 1-.497-.499" /><path d="M4.174 1h-.57a1.5 1.5 0 0 0-1.5 1.5v12a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5v-12a1.5 1.5 0 0 0-1.5-1.5h-.642q.084.236.085.5V2c0 .828-.668 1.5-1.492 1.5H5.581A1.496 1.496 0 0 1 4.09 2v-.5q.001-.264.085-.5Zm3.894 5.482c1.656-1.673 5.795 1.254 0 5.018c-5.795-3.764-1.656-6.69 0-5.018" /></g>
    </svg>
  );
};

const ImageSizeSelectActualIcon = ({
  size = 24,
  color = 'currentColor',
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0
}: CustomIconProps) => {
  const baseViewBox = 24;
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = baseViewBox + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      style={{
        opacity,
        color,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <path fill="currentColor" d="M21 3H3C2 3 1 4 1 5v14a2 2 0 0 0 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2M5 17l3.5-4.5l2.5 3l3.5-4.5l4.5 6z" />
    </svg>
  );
};

const PeopleEye16FilledIcon = ({
  size = 24,
  color = 'currentColor',
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0
}: CustomIconProps) => {
  const baseViewBox = 16;
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = baseViewBox + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      style={{
        opacity,
        color,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <path fill="currentColor" d="M11.5 8c2.761 0 4.5 2.3 4.5 3.5c0 1.182-1.739 3.5-4.5 3.5S7 12.7 7 11.5C7 10.318 8.736 8 11.5 8m.957 1.19a2.501 2.501 0 1 0-1.915 4.622a2.501 2.501 0 0 0 1.915-4.622M7.5 8q.322.001.613.097q-.313.226-.582.478a5.5 5.5 0 0 0-1.097 1.406C6.18 10.451 6 10.983 6 11.5c0 .443.13.913.354 1.371c-.43.084-.886.129-1.354.129c-1.175 0-2.27-.272-3.089-.77C1.091 11.73.5 10.965.5 10a2 2 0 0 1 2-2zm4 2a1.5 1.5 0 1 1 0 2.999a1.5 1.5 0 0 1 0-2.999M5 1.5A2.75 2.75 0 1 1 5 7a2.75 2.75 0 0 1 0-5.5m6.502.997a2.252 2.252 0 1 1 0 4.503a2.252 2.252 0 0 1 0-4.503" />
    </svg>
  );
};

const TemplateFilledIcon = ({
  size = 24,
  color = '#000000',
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0
}: CustomIconProps) => {
  const baseViewBox = 24;
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = baseViewBox + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      style={{
        opacity,
        color,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <path fill="currentColor" d="M22 2H2v6h20zm0 8H11v12h11zM9 22V10H2v12z" />
    </svg>
  );
};

const HeartWhiteSuitSmallIcon = ({
  size = 24,
  color = '#000000',
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0
}: CustomIconProps) => {
  const baseViewBox = 10;
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = baseViewBox + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      style={{
        opacity,
        color,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <path fill="currentColor" d="M8 5H7v1h1Zm0 0h1V2H8ZM3 8h1V7H3ZM2 7h1V6H2ZM1 6h1V5H1Zm3 3h1V8H4ZM0 5h1V2H0Zm5 3h1V7H5Zm1-1h1V6H6ZM1 2h2V1H1Zm2 1h1V2H3Zm1 1h1V3H4Zm1-1h1V2H5Zm1-1h2V1H6Zm0 0" />
    </svg>
  );
};

const FolderPeople24FilledIcon = ({
  size = 24,
  color = '#000000',
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0
}: CustomIconProps) => {
  const baseViewBox = 24;
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = baseViewBox + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      style={{
        opacity,
        color,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <path fill="currentColor" d="M2 8V6.25A3.25 3.25 0 0 1 5.25 3h2.879a2.25 2.25 0 0 1 1.59.659l1.531 1.53L8.659 7.78a.75.75 0 0 1-.53.22zm0 1.5v8.25A3.25 3.25 0 0 0 5.25 21h5.866A4.3 4.3 0 0 1 11 20a3 3 0 0 1 2.333-2.925a3 3 0 1 1 5.05-2.905A2.5 2.5 0 0 1 22 13.5V8.75a3.25 3.25 0 0 0-3.25-3.25h-5.69L9.72 8.841a2.25 2.25 0 0 1-1.591.659zM15.5 17a2 2 0 1 0 0-4a2 2 0 0 0 0 4m0 6c2.567 0 3.5-1.52 3.5-3a2 2 0 0 0-2-2h-3a2 2 0 0 0-2 2c0 1.48.933 3 3.5 3m4.007-1.022q.234.021.493.022c2.2 0 3-1.216 3-2.4a1.6 1.6 0 0 0-1.6-1.6h-2.164c.475.53.764 1.232.764 2c0 .656-.144 1.35-.493 1.978M22 15.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0" />
    </svg>
  );
};

const PersonSupport16FilledIcon = ({
  size = 24,
  color = '#000000',
  background = 'transparent',
  opacity = 1,
  rotation = 0,
  shadow = 0,
  flipHorizontal = false,
  flipVertical = false,
  padding = 0
}: CustomIconProps) => {
  const baseViewBox = 16;
  const transforms = [];
  if (rotation !== 0) transforms.push(`rotate(${rotation}deg)`);
  if (flipHorizontal) transforms.push('scaleX(-1)');
  if (flipVertical) transforms.push('scaleY(-1)');

  const viewBoxSize = baseViewBox + (padding * 2);
  const viewBoxOffset = -padding;
  const viewBox = `${viewBoxOffset} ${viewBoxOffset} ${viewBoxSize} ${viewBoxSize}`;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      width={size}
      height={size}
      style={{
        opacity,
        color,
        transform: transforms.join(' ') || undefined,
        filter: shadow > 0 ? `drop-shadow(0 ${shadow}px ${shadow * 2}px rgba(0,0,0,0.3))` : undefined,
        backgroundColor: background !== 'transparent' ? background : undefined
      }}
    >
      <path fill="currentColor" d="m6.527 10.782l-.001-.003l-.19-.062a5 5 0 0 1-2.284-1.649a5 5 0 1 1 8.924-3.567c.027.275-.2.499-.476.499s-.497-.225-.53-.499a4 4 0 1 0-5.285 4.278a1.5 1.5 0 1 1-.158 1.003m-.793.775a6 6 0 0 1-2.482-1.889A1.5 1.5 0 0 0 3 10.5v.5c0 1.971 1.86 4 5 4s5-2.029 5-4v-.5A1.5 1.5 0 0 0 11.5 9H10a2.5 2.5 0 1 1-4.266 2.557M11 6c0-.914-.409-1.733-1.054-2.283a3 3 0 1 0-3.518 4.84A2.5 2.5 0 0 1 8 7.999a2.5 2.5 0 0 1 1.572.556A3 3 0 0 0 11 6" />
    </svg>
  );
};

// --- End Custom Icon Components ---

export const Overview = () => {
  const { user } = useAuthStore();
  const displayName = user?.fullName ? user.fullName.trim().split(/\s+/).pop() : 'bạn';

  const [cards, setCards] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cardsRes = await cardsApi.getUserCards();
        const assetsRes = await assetsApi.getAssets();
        setCards(cardsRes.data || cardsRes || []);
        setAssets(assetsRes || []);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const isPro = user?.currentPlanId === '00000000-0000-0000-0000-000000000002';
  const isPremium = user?.currentPlanId === 'premium-mock-id';

  const limits = {
    photos: isPremium ? 9999 : (isPro ? 100 : 10),
    cards: isPremium ? 9999 : (isPro ? 5 : 1),
    visitors: isPremium ? 999999 : (isPro ? 5000 : 300)
  };

  const imageAssetsCount = assets.filter(asset => asset.type === 'image').length;
  const activeCardsCount = cards.filter(card => card.status === 'published').length;
  const totalViews = cards.reduce((sum, card) => sum + (card.viewCount || 0), 0);

  const photoPercent = Math.min(100, Math.round((imageAssetsCount / limits.photos) * 100)) || 0;
  const cardPercent = Math.min(100, Math.round((activeCardsCount / limits.cards) * 100)) || 0;
  const visitorPercent = Math.min(100, Math.round((totalViews / limits.visitors) * 100)) || 0;

  // SVG dash offset values based on 138 circumference (2 * PI * 22)
  const photoOffset = 138 - (138 * photoPercent) / 100;
  const cardOffset = 138 - (138 * cardPercent) / 100;
  const visitorOffset = 138 - (138 * visitorPercent) / 100;

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes bannerGradientShift {
          0%   { background-position: 0%   50%; }
          25%  { background-position: 50%  100%; }
          50%  { background-position: 100% 50%; }
          75%  { background-position: 50%  0%; }
          100% { background-position: 0%   50%; }
        }
        @keyframes shimmerDrift {
          0%   { transform: translateX(-100%) skewX(-12deg); opacity: 0; }
          40%  { opacity: 1; }
          100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
        }
        .moving-gradient-card {
          background: linear-gradient(
            135deg,
            rgba(255, 228, 230, 0.80),
            rgba(255, 241, 242, 0.70),
            rgba(255, 255, 255, 0.95),
            rgba(254, 243, 199, 0.50),
            rgba(255, 237, 213, 0.55),
            rgba(243, 232, 255, 0.35),
            rgba(255, 255, 255, 0.95),
            rgba(255, 228, 230, 0.80)
          ) !important;
          background-size: 400% 400% !important;
          animation: bannerGradientShift 16s ease infinite !important;
        }
        .moving-gradient-card .shimmer-bar {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.55) 50%,
            transparent 100%
          );
          width: 40%;
          animation: shimmerDrift 5s ease-in-out infinite;
          animation-delay: 1.5s;
          pointer-events: none;
          z-index: 1;
        }
      `}} />
      <div className="w-full space-y-8 animate-in fade-in duration-500 flex flex-col flex-1">

        {/* Welcome Banner Card */}
        <div className="relative rounded-[2.5rem] moving-gradient-card border border-rose-100/70 p-8 md:p-10 text-zinc-800 shadow-[0_15px_40px_rgba(244,63,94,0.02)] mt-8">

          {/* Background layer clipped to border radius */}
          <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
            {/* Shimmer sweep layer */}
            <div className="shimmer-bar" aria-hidden="true" />
            {/* Floating background elements */}
            <div className="absolute inset-0 -z-10 opacity-15">
              <FloatingBackgroundHearts />
            </div>
            <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-rose-100/30 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 h-72 w-72 rounded-full bg-amber-100/20 blur-3xl pointer-events-none" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-8">
            <div className="space-y-6 flex-1 lg:max-w-[60%] xl:max-w-[65%]">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100/60 px-3.5 py-1.5 text-[10px] font-black tracking-wider uppercase text-rose-500 shadow-2xs">
                <Sparkles size={11} className="text-amber-500 animate-pulse" /> KHÔNG GIAN THIẾT KẾ CỦA BẠN
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-black font-inter tracking-tight leading-tight text-zinc-900">
                  Chào {displayName}!
                </h1>
                <p className="text-zinc-500 text-sm font-inter font-medium max-w-lg leading-relaxed">
                  Bạn đang sử dụng <span className="text-rose-500 font-bold">Gói trải nghiệm tự do</span>. Hãy thỏa sức sáng tạo và lan tỏa yêu thương qua những tấm thiệp cưới di động đẹp hoàn hảo nhất.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  to={`/loading?next=${encodeURIComponent('/design')}&message=${encodeURIComponent('Đang mở trình thiết kế...')}`}

                  className="flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 px-6 py-3.5 font-bold text-white shadow-md shadow-rose-500/10 hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 transition-all duration-300 font-inter text-xs group"
                >
                  <span>Tạo thiệp mới ngay</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/dashboard/plan"
                  className="flex items-center gap-2 rounded-full bg-white hover:bg-zinc-50 border border-zinc-200 px-6 py-3.5 font-bold text-zinc-650 shadow-2xs hover:shadow-xs active:scale-95 transition-all duration-300 font-inter text-xs"
                >
                  <span>Nâng cấp gói dịch vụ</span>
                </Link>
              </div>
            </div>
          </div>

          {/* MOCKUP IMAGE CONTAINER */}
          <div className="hidden lg:block absolute right-0 bottom-0 top-[-200px] w-1/2 overflow-hidden rounded-br-[2.5rem] pointer-events-none z-20">
            <style>{`
              @keyframes float-mockup {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-15px); }
              }
              .animate-float-mockup {
                animation: float-mockup 4s ease-in-out infinite;
              }
            `}</style>
            <img
              src={mockupImage}
              alt="Welcome banner"
              className="absolute right-4 xl:right-15 -bottom-33 w-[260px] xl:w-[320px] object-contain object-bottom drop-shadow-[0_20px_40px_rgba(0,0,0,0.2)] animate-float-mockup"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Link to={`/loading?next=${encodeURIComponent('/design')}&message=${encodeURIComponent('Đang mở trình thiết kế...')}`} className="rounded-4xl bg-white/80 backdrop-blur-sm border border-rose-100/60 p-6 flex items-center justify-between shadow-sm shadow-rose-50/20 shadow-inner transition-all duration-300 hover:shadow-md hover:border-rose-200 cursor-pointer block hover:no-underline">

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-500">
                  <ImageSizeSelectActualIcon size={18} color="currentColor" />
                </div>
                <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase">Kho lưu trữ ảnh</span>
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-800 mt-1 font-inter">
                  {imageAssetsCount} <span className="text-sm font-semibold text-zinc-400">/ {isPremium ? '∞' : limits.photos} tệp</span>
                </p>
                <p className="text-[11px] text-zinc-400 font-bold mt-1">Đã tối ưu bộ nhớ</p>
              </div>
            </div>

            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className="stroke-zinc-100" strokeWidth="3" fill="transparent" />
                <circle cx="28" cy="28" r="22" className="stroke-rose-500" strokeWidth="3.5" fill="transparent" strokeDasharray="138" strokeDashoffset={isPremium ? 0 : photoOffset} strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-black text-zinc-700">{isPremium ? '100%' : `${photoPercent}%`}</span>
            </div>
          </Link>

          <Link to="/dashboard/my-cards" className="rounded-4xl bg-white/80 backdrop-blur-sm border border-rose-100/60 p-6 flex items-center justify-between shadow-sm shadow-rose-50/20 shadow-inner transition-all duration-300 hover:shadow-md hover:border-rose-200 cursor-pointer block hover:no-underline">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500">
                  <Clipboard2HeartFillIcon size={18} color="currentColor" />
                </div>
                <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase">Thiệp kích hoạt</span>
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-800 mt-1 font-inter">
                  {activeCardsCount} <span className="text-sm font-semibold text-zinc-400">/ {isPremium ? '∞' : `0${limits.cards}`} thiệp</span>
                </p>
                <p className="text-[11px] text-pink-500 font-bold mt-1">Trạng thái: Sẵn sàng</p>
              </div>
            </div>

            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className="stroke-zinc-100" strokeWidth="3" fill="transparent" />
                <circle cx="28" cy="28" r="22" className="stroke-pink-500" strokeWidth="3.5" fill="transparent" strokeDasharray="138" strokeDashoffset={isPremium ? 0 : cardOffset} strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-black text-zinc-700">{isPremium ? '100%' : `${cardPercent}%`}</span>
            </div>
          </Link>

          <Link to="/dashboard/my-cards" className="rounded-4xl bg-white/80 backdrop-blur-sm border border-rose-100/60 p-6 flex items-center justify-between shadow-sm shadow-rose-50/20 shadow-inner transition-all duration-300 hover:shadow-md hover:border-rose-200 cursor-pointer block hover:no-underline">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                  <PeopleEye16FilledIcon size={18} color="currentColor" />
                </div>
                <span className="text-xs font-bold text-zinc-500 tracking-wide font-inter uppercase">Khách ghé thăm</span>
              </div>
              <div>
                <p className="text-3xl font-black text-zinc-800 mt-1 font-inter">
                  {totalViews} <span className="text-sm font-semibold text-zinc-400">/ {isPremium ? '∞' : limits.visitors} lượt</span>
                </p>
                <p className="text-[11px] text-zinc-400 font-bold mt-1">Reset sau 30 ngày</p>
              </div>
            </div>

            {/* Circular Progress Gauge */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" className="stroke-zinc-100" strokeWidth="3" fill="transparent" />
                <circle cx="28" cy="28" r="22" className="stroke-amber-400" strokeWidth="3.5" fill="transparent" strokeDasharray="138" strokeDashoffset={isPremium ? 0 : visitorOffset} strokeLinecap="round" />
              </svg>
              <span className="absolute text-xs font-black text-zinc-700">{isPremium ? '100%' : `${visitorPercent}%`}</span>
            </div>
          </Link>

        </div>

        {/* Quick Nav area */}
        <div className="rounded-[2.5rem] bg-white/85 backdrop-blur-sm border border-rose-100/50 p-6 shadow-sm shadow-rose-50/20 shadow-inner">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-zinc-800 font-inter">Khu vực điều hướng nhanh</h3>
            <span className="text-xs font-bold text-rose-400 bg-rose-50 px-3 py-1 rounded-full border border-rose-100/50">LỐI TẮT TIỆN ÍCH</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {[
              { icon: TemplateFilledIcon, label: 'Kho Mẫu Thiệp', path: '/dashboard/templates', color: 'text-rose-500 bg-rose-50 border-rose-100/50' },
              { icon: HeartWhiteSuitSmallIcon, label: 'Lời Chúc', path: '/dashboard/wishes', color: 'text-pink-500 bg-pink-50 border-pink-100/50' },
              { icon: FolderPeople24FilledIcon, label: 'Khách RSVP', path: '/dashboard/rsvp', color: 'text-rose-600 bg-rose-50/50 border-rose-100/30' },
              { icon: Crown, label: 'Nâng Cấp VIP', path: '/dashboard/plan', color: 'text-amber-600 bg-amber-50 border-amber-100/50' },
              { icon: PersonSupport16FilledIcon, label: 'Hỗ Trợ', path: '/dashboard/feedback', color: 'text-purple-600 bg-purple-50 border-purple-100/50' },
            ].map((item, idx) => (
              <Link
                key={idx}
                to={item.path}
                className="flex flex-col items-center justify-center p-5 rounded-[1.75rem] border border-zinc-100 bg-zinc-50/30 hover:bg-white hover:border-rose-200 hover:shadow-md transition-all duration-300 group"
              >
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-3 border ${item.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon size={24} color="currentColor" />
                </div>
                <span className="text-sm font-bold text-zinc-700 font-inter group-hover:text-rose-600 transition-colors">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-4xl bg-rose-50/40 backdrop-blur-sm border border-rose-100/40 p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm shadow-rose-50/20 shadow-inner">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
              <Sparkle size={20} className="animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-zinc-800 font-inter">Mách nhỏ để thiết kế thiệp đẹp</h4>
              <p className="text-xs text-zinc-500 font-inter">Hãy chuẩn bị các hình ảnh cưới chất lượng cao (tỷ lệ 4:3 hoặc 16:9) để chèn vào thiệp trông sắc nét nhất!</p>
            </div>
          </div>
          <Link
            to="/dashboard/templates"
            className="text-xs font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 hover:underline font-inter"
          >
            Xem kho mẫu ngay <ArrowUpRight size={14} />
          </Link>
        </div>

      </div>
    </DashboardLayout>
  );
};