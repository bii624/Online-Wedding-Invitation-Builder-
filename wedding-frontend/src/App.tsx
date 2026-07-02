// ============================================================
// APP ROOT - Routes
// ============================================================

import { EditorPage } from './editor/page/EditorPage';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import SignupPage from "./pages/SignupPage/SignupPage";
import ResetPasswordPage from "./pages/PasswordPage/ResetPasswordPage";
import LoadingPage from "./pages/Loading/Loadingpage";
import { Toaster } from 'sonner';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import { MyCardsPage } from './pages/MyCardsPage/MyCardsPage';

// Dashboard
import { Overview } from './features/dashboard/Overview';
import { MyCards as MyCardsDashboard } from './features/dashboard/MyCards';
import { Wishes } from './features/dashboard/Wishes';
import { RSVP } from './features/dashboard/RSVP';
import { ReceivedGifts } from './features/dashboard/ReceivedGifts';
import { AccountProfile } from './features/dashboard/AccountProfile';
import { MyPlan } from './features/dashboard/MyPlan';
import { PaymentQR } from './features/dashboard/Paymentqr';
import { Feedback } from './features/dashboard/Feedback';

// Admin
import { AdminLayout } from './admin/layout/AdminLayout';
import { DashboardPage } from './admin/pages/DashboardPage';
import { UsersListPage } from './admin/pages/UsersListPage';
import { CardsListPage } from './admin/pages/CardsListPage';
import { TemplatesListPage } from './admin/pages/TemplatesListPage';
import { PlansPage } from './admin/pages/PlansPage';
import { LibraryElementsPage } from './admin/pages/LibraryElementsPage';
import { TemplateCategoriesPage } from './admin/pages/TemplateCategoriesPage';
import { ModerationPage } from './admin/pages/ModerationPage';
import Templates from './pages/Templates/Templates';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Toaster richColors position="top-center" />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/my-cards" element={<MyCardsPage />} />
        <Route path="/design" element={<EditorPage />} />
        <Route path="/design/template" element={<EditorPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/loading" element={<LoadingPage />} />

        {/* Dashboard routes - using feature components */}
        <Route path="/dashboard" element={<Navigate to="/dashboard/overview" replace />} />
        <Route path="/dashboard/overview" element={<Overview />} />
        <Route path="/dashboard/my-cards" element={<MyCardsDashboard />} />
        <Route path="/dashboard/templates" element={<Templates />} />
        <Route path="/dashboard/wishes" element={<Wishes />} />
        <Route path="/dashboard/rsvp" element={<RSVP />} />
        <Route path="/dashboard/gifts" element={<ReceivedGifts />} />
        <Route path="/dashboard/account" element={<AccountProfile />} />
        <Route path="/dashboard/plan" element={<MyPlan />} />
        <Route path="/dashboard/payment-qr" element={<PaymentQR />} />
        <Route path="/dashboard/feedback" element={<Feedback />} />

        {/* Admin routes — protected by AdminLayout guard */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UsersListPage />} />
          <Route path="cards" element={<CardsListPage />} />
          <Route path="templates" element={<TemplatesListPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="elements" element={<LibraryElementsPage />} />
          <Route path="categories" element={<TemplateCategoriesPage />} />
          <Route path="moderation" element={<ModerationPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
