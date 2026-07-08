import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { Edit3, LayoutTemplate, Sparkles } from 'lucide-react';

export const CreateCard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="bg-white/80 backdrop-blur-lg rounded-3xl border border-rose-100/30 shadow-lg p-4 sm:p-6 md:p-10 flex-1 flex flex-col">
        <div className="w-full py-4 flex-1 flex flex-col">

          {/* Header */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-3">
              <span className="text-xs uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-semibold">Tùy chọn</span>
              <span className="text-xs text-zinc-400">Chọn cách bắt đầu</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 font-inter tracking-tight leading-tight">
              Tạo thiệp cưới của riêng bạn
            </h1>
            <p className="mt-3 text-[15px] text-zinc-600 font-inter leading-relaxed max-w-2xl">
              Thỏa sức sáng tạo với trình thiết kế kéo-thả hoặc tiết kiệm thời gian với kho mẫu chuyên nghiệp — bắt đầu nhanh chóng và đẹp mắt.
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link
              to={`/loading?next=${encodeURIComponent('/design')}&message=${encodeURIComponent('Đang mở trình thiết kế...')}`}
              className="relative flex flex-col p-6 sm:p-8 rounded-2xl border border-rose-100 bg-white hover:border-rose-300 transition-all duration-300 group cursor-pointer h-full hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            >
              <div className="absolute -top-8 -right-8 p-8 opacity-5 group-hover:opacity-[0.08] transition-opacity duration-500 group-hover:rotate-12">
                <Edit3 size={160} />
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform duration-300 relative z-10">
                <Edit3 size={24} strokeWidth={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 font-inter mb-2 group-hover:text-rose-600 transition-colors relative z-10">Bản vẽ thiết kế trống</h3>
              <p className="text-sm text-zinc-600 font-inter leading-relaxed relative z-10">
                Tự do kéo-thả và tùy chỉnh mọi chi tiết. Lựa chọn cho người muốn sáng tạo hoàn toàn.
              </p>
              <span className="absolute bottom-4 right-4 text-xs text-rose-500 font-semibold z-10">Miễn phí</span>
            </Link>

            <Link
              to="/dashboard/templates"
              className="relative flex flex-col p-6 sm:p-8 rounded-2xl border border-emerald-100 bg-white hover:border-emerald-300 transition-all duration-300 group cursor-pointer h-full hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 p-8 opacity-5 group-hover:opacity-[0.08] transition-opacity duration-500 group-hover:-rotate-12">
                <LayoutTemplate size={160} />
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-105 transition-transform duration-300 relative z-10">
                <LayoutTemplate size={24} strokeWidth={2} />
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 font-inter mb-2 group-hover:text-emerald-600 transition-colors relative z-10">Chọn mẫu có sẵn</h3>
              <p className="text-sm text-zinc-600 font-inter leading-relaxed relative z-10">
                Hàng trăm mẫu chuyên nghiệp, chỉnh sửa nhanh — phù hợp cho mọi phong cách.
              </p>
              <span className="absolute bottom-4 right-4 text-xs text-emerald-600 font-semibold z-10">Nhiều mẫu</span>
            </Link>
          </div>

          {/* VIP Premium Banner */}
          <div className="relative overflow-hidden p-6 sm:p-8 md:p-10 rounded-3xl bg-gradient-to-r from-rose-50 to-rose-100/50 flex flex-col sm:flex-row items-center gap-6 sm:gap-8 shadow-md border border-rose-200/60">
            {/* Premium Gradients */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-rose-200/30 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-100/40 rounded-full blur-[60px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />
            
            <div className="w-16 h-16 rounded-[1.25rem] bg-white flex items-center justify-center text-rose-500 shrink-0 shadow-sm relative z-10 border border-rose-100">
              <Sparkles size={32} strokeWidth={2.5} />
            </div>
            
            <div className="flex-1 text-center sm:text-left relative z-10">
              <h4 className="text-xl sm:text-2xl font-black text-rose-950 font-inter mb-2 tracking-tight">Bạn muốn thiết kế độc quyền?</h4>
              <p className="text-[15px] text-rose-900/70 font-inter leading-relaxed max-w-xl">
                Sử dụng dịch vụ <span className="text-rose-700 font-bold bg-white/60 px-2 py-0.5 rounded-md mx-1 shadow-sm">Premium 1-1</span>. Đội ngũ chuyên gia của chúng tôi sẽ lắng nghe câu chuyện của bạn và phác họa nên thiết kế duy nhất trên đời.
              </p>
            </div>
            
            <a 
              href="mailto:support@dearlove.com" 
              className="px-8 py-3 bg-gradient-to-br from-rose-600 to-rose-700 text-white font-bold text-sm rounded-full transition-transform hover:scale-105 active:scale-95 shadow-lg shrink-0 relative z-10"
            >
              Liên hệ tư vấn
            </a>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};
