import axiosClient from '../../api/axiosClient';

// ── Types ────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number;
  totalCards: number;
  publishedCards: number;
  activeTemplates: number;
  newUsersToday: number;
  newCardsToday: number;
}

export interface ChartDataPoint {
  date: string;
  cards: number;
  users: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: string;
  status: string;
  cardCount: number;
  createdAt: string;
  avatarUrl?: string;
}

export interface AdminCard {
  id: string;
  title: string;
  slug: string;
  status: string;
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  user: { email: string; fullName: string };
  template?: { thumbnailUrl: string };
}

export interface AdminTemplate {
  id: string;
  name: string;
  status: string;
  isPremium: boolean;
  thumbnailUrl?: string;
  usageCount: number;
  createdAt: string;
}

export interface AdminPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number | null;
  maxCards: number | null;
  features: Record<string, any>;
  isActive: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

// ── API ──────────────────────────────────────────────────
export const adminApi = {
  // Dashboard
  getStats: async (): Promise<AdminStats> => {
    const r = await axiosClient.get('/admin/stats');
    return r.data;
  },

  getGrowthChart: async (days = 7): Promise<ChartDataPoint[]> => {
    const r = await axiosClient.get('/admin/stats/growth', { params: { days } });
    return r.data;
  },

  getRecentActivity: async () => {
    const r = await axiosClient.get('/admin/stats/activity');
    return r.data;
  },

  // Users
  getUsers: async (params?: object): Promise<PaginatedResponse<AdminUser>> => {
    const r = await axiosClient.get('/admin/users', { params });
    return r.data;
  },

  getUser: async (id: string): Promise<AdminUser> => {
    const r = await axiosClient.get(`/admin/users/${id}`);
    return r.data;
  },

  updateUserStatus: async (id: string, status: string) => {
    const r = await axiosClient.patch(`/admin/users/${id}/status`, { status });
    return r.data;
  },

  updateUserRole: async (id: string, role: string) => {
    const r = await axiosClient.patch(`/admin/users/${id}/role`, { role });
    return r.data;
  },

  // Cards
  getCards: async (params?: object): Promise<PaginatedResponse<AdminCard>> => {
    const r = await axiosClient.get('/admin/cards', { params });
    return r.data;
  },

  updateCardVisibility: async (id: string, isPublic: boolean) => {
    const r = await axiosClient.patch(`/admin/cards/${id}/visibility`, { isPublic });
    return r.data;
  },

  deleteCard: async (id: string) => {
    const r = await axiosClient.delete(`/admin/cards/${id}`);
    return r.data;
  },

  // Templates
  getTemplates: async (params?: object): Promise<PaginatedResponse<AdminTemplate>> => {
    const r = await axiosClient.get('/admin/templates', { params });
    return r.data;
  },

  updateTemplateStatus: async (id: string, status: string) => {
    const r = await axiosClient.patch(`/admin/templates/${id}/status`, { status });
    return r.data;
  },

  deleteTemplate: async (id: string) => {
    const r = await axiosClient.delete(`/admin/templates/${id}`);
    return r.data;
  },

  // Plans
  getPlans: async (): Promise<AdminPlan[]> => {
    const r = await axiosClient.get('/admin/plans');
    return r.data;
  },

  createPlan: async (data: Partial<AdminPlan>) => {
    const r = await axiosClient.post('/admin/plans', data);
    return r.data;
  },

  updatePlan: async (id: string, data: Partial<AdminPlan>) => {
    const r = await axiosClient.patch(`/admin/plans/${id}`, data);
    return r.data;
  },
};
