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

  uploadCardThumbnail: async (cardId: string, blob: Blob) => {
    const formData = new FormData();
    formData.append('file', blob, 'thumbnail.webp');
    const response = await axiosClient.post(`/cards/${cardId}/thumbnail`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getCard: async (cardId: string) => {
    const response = await axiosClient.get(`/cards/${cardId}`);
    return response.data;
  },

  getAllWishes: async () => {
    const response = await axiosClient.get('/cards/wishes/all');
    return response.data;
  },

  getAllRsvps: async () => {
    const response = await axiosClient.get('/cards/rsvp/all');
    return response.data;
  },

  approveWish: async (wishId: string, isApproved: boolean) => {
    const response = await axiosClient.patch(`/cards/wishes/${wishId}/approve`, { isApproved });
    return response.data;
  },

  deleteWish: async (wishId: string) => {
    const response = await axiosClient.delete(`/cards/wishes/${wishId}`);
    return response.data;
  },

  submitRsvp: async (cardId: string, data: { guestName: string; phone?: string; attending: 'yes' | 'no' | 'maybe'; numAttendees?: number; note?: string }) => {
    const response = await axiosClient.post(`/cards/public/${cardId}/rsvp`, data);
    return response.data;
  },

  submitWish: async (cardId: string, data: { displayName: string; message: string; avatarUrl?: string }) => {
    const response = await axiosClient.post(`/cards/public/${cardId}/wishes`, data);
    return response.data;
  },
};
