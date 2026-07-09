// ============================================================
// Linh AI — API client
// ============================================================

import axiosClient from './axiosClient';

export type EmotionState = 'neutral' | 'happy' | 'excited' | 'thinking';

export interface LinhChatMessage {
  role: 'user' | 'linh';
  content: string;
  emotion?: EmotionState;
}

export interface LinhChatResponse {
  emotion: EmotionState;
  response: string;
}

export const linhAiApi = {
  chat: async (query: string, history?: { role: string; content: string }[]): Promise<LinhChatResponse> => {
    const { data } = await axiosClient.post<LinhChatResponse>('/linh-ai/chat', { query, history });
    return data;
  },
};
