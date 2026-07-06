import { Link, useNavigate } from 'react-router-dom';
import { DashboardLayout } from './DashboardLayout';
import { Edit3, LayoutTemplate, Sparkles } from 'lucide-react';

export const CreateCard = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-rose-100/30 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-6 sm:p-10 min-h-[75vh]">
        <div className="max-w-4xl mx-auto py-2">

          {/* Header */}
          <div className="mb-8">

            <h1 className="text-3xl sm:text-4xl font-black text-zinc-800 font-inter tracking-tight leading-tight">
              Tạo thiệp cưới của riêng bạn
            </h1>
            <p className="mt-2.5 text-[15px] text-zinc-500 font-inter leading-relaxed max-w-xl">
              Bạn muốn thỏa sức sáng tạo từ một trang giấy trắng, hay muốn tiết kiệm thời gian với kho mẫu thiết kế sẵn của chúng tôi?
            </p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <Link
              to="/design"
              className="relative flex flex-col p-6 sm:p-8 rounded-[2rem] border border-rose-100 bg-white hover:border-rose-300 transition-all duration-300 group cursor-pointer h-full hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(244,63,94,0.15)] overflow-hidden"
            >
              <div className="absolute -top-8 -right-8 p-8 opacity-5 group-hover:opacity-[0.07] transition-opacity duration-500 group-hover:rotate-12">
                <Edit3 size={160} />
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-400 to-rose-600 text-white flex items-center justify-center mb-5 shadow-lg shadow-rose-500/25 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <Edit3 size={24} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-black text-zinc-800 font-inter mb-2 group-hover:text-rose-600 transition-colors relative z-10">Bản vẽ thiết kế trống</h3>
              <p className="text-[14px] text-zinc-500 font-inter leading-relaxed relative z-10">
                Tự do kéo thả, sắp xếp bố cục, hình ảnh và màu sắc từ đầu. Lựa chọn tuyệt vời nếu bạn muốn một chiếc thiệp độc bản mang đậm cá tính riêng.
              </p>
            </Link>

            <Link
              to="/dashboard/templates"
              className="relative flex flex-col p-6 sm:p-8 rounded-[2rem] border border-emerald-100 bg-white hover:border-emerald-300 transition-all duration-300 group cursor-pointer h-full hover:-translate-y-1 hover:shadow-[0_15px_30px_-10px_rgba(16,185,129,0.15)] overflow-hidden"
            >
              <div className="absolute -bottom-8 -right-8 p-8 opacity-5 group-hover:opacity-[0.07] transition-opacity duration-500 group-hover:-rotate-12">
                <LayoutTemplate size={160} />
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300 relative z-10">
                <LayoutTemplate size={24} strokeWidth={2} />
              </div>
              <h3 className="text-xl font-black text-zinc-800 font-inter mb-2 group-hover:text-emerald-600 transition-colors relative z-10">Chọn mẫu có sẵn</h3>
              <p className="text-[14px] text-zinc-500 font-inter leading-relaxed relative z-10">
                Khám phá bộ sưu tập hàng trăm mẫu thiệp tuyệt đẹp được thiết kế bởi chuyên gia. Tiết kiệm thời gian, chỉ cần thay đổi thông tin và xuất bản.
              </p>
            </Link>
          </div>

          {/* VIP Premium Banner */}
          <div className="relative overflow-hidden p-8 sm:p-10 rounded-[2.5rem] bg-gradient-to-r from-rose-50 to-rose-100/50 flex flex-col sm:flex-row items-center gap-8 shadow-sm border border-rose-200/60">
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
              className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-[15px] rounded-2xl transition-transform hover:scale-105 active:scale-95 shadow-xl shadow-rose-500/20 shrink-0 relative z-10"
            >
              Liên hệ tư vấn
            </a>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};
