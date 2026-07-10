import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RevolvingHeartsIcon } from "../../components/icons/emojione-revolving-hearts";
import { useAuthStore } from "../../store/authStore";

interface LoadingPageProps {
  message?: string;
}

export default function LoadingPage({ message = "Đang tải dữ liệu ..." }: LoadingPageProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isInitialized } = useAuthStore();

  const explicitNext = searchParams.get("next");
  const token = searchParams.get("token");
  const refresh = searchParams.get("refresh");

  useEffect(() => {
    // If there's a token in the URL (from OAuth redirect), save it to localStorage
    if (token) {
      localStorage.setItem("access_token", token);
    }
    if (refresh) {
      localStorage.setItem("refresh_token", refresh);
    }
    
    // Check if we need to clean up URL params without refreshing
    if (token || refresh) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete("token");
      newUrl.searchParams.delete("refresh");
      window.history.replaceState({}, document.title, newUrl.toString());
    }

    if (explicitNext) {
      const timer = window.setTimeout(() => {
        navigate(explicitNext, { replace: true });
      }, 1200);
      return () => window.clearTimeout(timer);
    }

    // Trường hợp không có next → chờ auth rồi redirect về dashboard
    if (!isInitialized) return;
    let defaultTarget = "/dashboard/overview";
    if (user?.role === "admin") {
      defaultTarget = "/admin";
    }
    const target = defaultTarget;
    const timer = window.setTimeout(() => {
      navigate(target, { replace: true });
    }, 1400);
    return () => window.clearTimeout(timer);
  }, [navigate, explicitNext, user, isInitialized]);

  const pageMessage = searchParams.get("message") || message;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-6 select-none font-poppins">
      


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
            {pageMessage}
          </p>
        </div>
      </div>
      
    </div>
  );
}