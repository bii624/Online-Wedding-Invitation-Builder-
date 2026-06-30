// ============================================================
// APP ROOT - Routes to Editor
// ============================================================

import { EditorPage } from './editor/page/EditorPage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
// import HomePage from "./pages/HomePage/HomePage";
import ResetPasswordPage from "./pages/PasswordPage/ResetPasswordPage";
import LoadingPage from "./pages/Loading/Loadingpage";
import Templates from "./pages/Templates/Templates";
// import CreatedCards from "./pages/CreatedCards/CreatedCards";
import InvitationShow from "./pages/InvitationShow/InvitationShow";
import Reviews from "./pages/Reviews/Reviews";
import Contact from "./pages/Contact/Contact";
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { MyCardsPage } from './pages/MyCardsPage/MyCardsPage';

// Dashboard imports
import { Overview } from './features/dashboard/Overview';
import { MyCards } from './features/dashboard/MyCards';
import { Wishes } from './features/dashboard/Wishes';
import { RSVP } from './features/dashboard/RSVP';
import { ReceivedGifts } from './features/dashboard/ReceivedGifts';
import { AccountProfile } from './features/dashboard/AccountProfile';
import { MyPlan } from './features/dashboard/MyPlan';
import { PaymentQR } from './features/dashboard/Paymentqr';
import { Feedback } from './features/dashboard/Feedback';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        <Route path="/design" element={<EditorPage />} />
        {/* Redirect root to /design for convenience */}
        {/* <Route path="/" element={<Navigate to="/design" replace />} /> */}

        <Route path="/templates" element={<Templates />} />
        {/* <Route path="/created-cards" element={<CreatedCards />} /> */}
        <Route path="/show/:id" element={<InvitationShow />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-cards" element={<MyCardsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* <Route path="/home" element={<HomePage />} /> */}
        <Route path="/loading" element={<LoadingPage />} />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="/dashboard/overview" element={<Overview />} />
        <Route path="/dashboard/my-cards" element={<MyCards />} />
        <Route path="/dashboard/templates" element={<Templates />} />
        <Route path="/dashboard/wishes" element={<Wishes />} />
        <Route path="/dashboard/rsvp" element={<RSVP />} />
        <Route path="/dashboard/gifts" element={<ReceivedGifts />} />
        <Route path="/dashboard/account" element={<AccountProfile />} />
        <Route path="/dashboard/plan" element={<MyPlan />} />
        <Route path="/dashboard/payment-qr" element={<PaymentQR />} />
        <Route path="/dashboard/feedback" element={<Feedback />} />
      </Routes>

    </BrowserRouter>
  );
}

export default App;
