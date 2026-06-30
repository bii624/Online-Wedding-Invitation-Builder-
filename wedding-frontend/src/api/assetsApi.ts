import axiosClient from './axiosClient';

export interface Asset {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'audio';
  url: string;
  thumbnailUrl: string | null;
  fileSize: number;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  createdAt: string;
}

export const assetsApi = {
  getAssets: async (): Promise<Asset[]> => {
    const response = await axiosClient.get('/assets');
    return response.data;
  },

  uploadAsset: async (file: File): Promise<Asset> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosClient.post('/assets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteAsset: async (id: string): Promise<{ message: string }> => {
    const response = await axiosClient.delete(`/assets/${id}`);
    return response.data;
  },
};
