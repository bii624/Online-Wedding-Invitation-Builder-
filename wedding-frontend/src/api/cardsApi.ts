import axiosClient from './axiosClient';

export interface CreateCardDto {
  title: string;
  templateId?: string;
}

export interface QueryCardDto {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const cardsApi = {
  createCard: async (data: CreateCardDto) => {
    const response = await axiosClient.post('/cards', data);
    return response.data;
  },
  
  getUserCards: async (query?: QueryCardDto) => {
    const response = await axiosClient.get('/cards', { params: query });
    return response.data;
  },

  deleteCard: async (id: string) => {
    const response = await axiosClient.delete(`/cards/${id}`);
    return response.data;
  },
};
