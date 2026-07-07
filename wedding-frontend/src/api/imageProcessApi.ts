import axiosClient from './axiosClient';

export interface ProcessImageRequest {
  image: string; // Base64 encoded image
  operation: 'remove-bg' | 'remove-object' | 'expand';
  mask?: string; // Base64 encoded mask (required for remove-object)
  expandPx?: { left: number; right: number; top: number; bottom: number };
}

export interface ProcessImageResponse {
  success: boolean;
  result?: string; // URL
  cached?: boolean;
  processingMs?: number;
  error?: string;
  code?: string;
}

export const imageProcessApi = {
  process: async (data: ProcessImageRequest): Promise<ProcessImageResponse> => {
    const r = await axiosClient.post<ProcessImageResponse>('/api/image-process', data);
    return r.data;
  },
};
