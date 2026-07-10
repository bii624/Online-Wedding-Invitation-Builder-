import { create } from 'zustand';
import axiosClient from '../api/axiosClient';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  avatarUrl?: string;
  phone?: string;
  currentPlanId?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isInitialized: boolean;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isInitialized: false,
  setUser: (user) => set({ user }),
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const response = await axiosClient.get('/auth/profile');
      set({ user: response.data, isInitialized: true });
    } catch (error) {
      set({ user: null, isInitialized: true });
    } finally {
      set({ isLoading: false });
    }
  },
  logout: async () => {
    try {
      await axiosClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({ user: null });
    }
  },
}));
