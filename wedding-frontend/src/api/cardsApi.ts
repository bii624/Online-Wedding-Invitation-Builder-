import axiosClient from './axiosClient';

export interface CreateCardDto {
  title: string;
  templateId?: string;
  groomName?: string;
  brideName?: string;
}

export interface QueryCardDto {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CanvasBlockPayload {
  id?: string;
  blockType: string;
  posX?: number;
  posY?: number;
  width?: number;
  height?: number;
  rotation?: number;
  zIndex?: number;
  content?: object;
  style?: object;
  isLocked?: boolean;
  isVisible?: boolean;
  sourceElementId?: string;
  sourceTemplateBlockId?: string;
}

export interface SaveCanvasPayload {
  blocks: CanvasBlockPayload[];
  background?: object;
  settings?: object;
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

  saveCanvas: async (cardId: string, payload: SaveCanvasPayload) => {
    const response = await axiosClient.post(`/cards/${cardId}/save`, payload);
    return response.data;
  },

  getCard: async (cardId: string) => {
    const response = await axiosClient.get(`/cards/${cardId}`);
    return response.data;
  },
};
