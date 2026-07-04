import axiosClient from './axiosClient';

export interface TemplateListParams {
  category?: string;
  page?: number;
  limit?: number;
}

export interface TemplateItem {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl?: string;
  isPremium: boolean;
  useCount: number;
  category?: {
    name: string;
    slug: string;
  };
}

export interface TemplateListResponse {
  items: TemplateItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const templatesApi = {
  getTemplates: async (params?: TemplateListParams): Promise<TemplateListResponse> => {
    const res = await axiosClient.get('/templates', { params });
    return res.data;
  },

  getFeaturedTemplates: async (): Promise<TemplateItem[]> => {
    const res = await axiosClient.get('/templates/featured');
    return res.data;
  },

  getTemplateById: async (id: string) => {
    const res = await axiosClient.get(`/templates/${id}`);
    return res.data;
  },
};
