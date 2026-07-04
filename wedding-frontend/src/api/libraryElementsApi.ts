// src/api/libraryElementsApi.ts
// Public API cho user duyệt và sử dụng element từ thư viện
import axiosClient from './axiosClient';

export type ElementType = 'icon' | 'shape' | 'illustration' | 'sticker' | 'frame' | 'photo';

export interface ElementCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  _count?: { elements: number };
}

export interface LibraryElement {
  id: string;
  name: string;
  elementType: ElementType;
  categoryId: string | null;
  category?: { id: string; name: string } | null;
  tags: string[];
  fileUrl: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  isPremium: boolean;
  isRecolorable: boolean;
  usageCount: number;
  status: string;
}

export interface PaginatedElements {
  data: LibraryElement[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ElementQuery {
  search?: string;
  categoryId?: string;
  elementType?: ElementType;
  isPremium?: boolean;
  page?: number;
  limit?: number;
}

export const libraryElementsApi = {
  getCategories: async (): Promise<ElementCategory[]> => {
    const r = await axiosClient.get('/library-elements/categories');
    return r.data;
  },

  getElements: async (params?: ElementQuery): Promise<PaginatedElements> => {
    const r = await axiosClient.get('/library-elements', { params });
    return r.data;
  },

  getElementById: async (id: string): Promise<LibraryElement> => {
    const r = await axiosClient.get(`/library-elements/${id}`);
    return r.data;
  },

  recordUsage: async (id: string): Promise<void> => {
    await axiosClient.post(`/library-elements/${id}/use`);
  },
};
