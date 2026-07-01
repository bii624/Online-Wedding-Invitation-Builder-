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
