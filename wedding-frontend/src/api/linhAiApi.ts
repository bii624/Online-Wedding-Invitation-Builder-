// ============================================================
// DearLove AI — API client
// ============================================================

import axiosClient from './axiosClient';

export type EmotionState = 'neutral' | 'happy' | 'excited' | 'thinking';
export type RichItemType = 'template' | 'my-card' | 'rsvp' | 'wish';

export interface RichItem {
  type: RichItemType;
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  badge?: string;
  badgeColor?: 'green' | 'red' | 'blue' | 'gray' | 'pink';
  meta?: Record<string, string | number>;
  actionLabel?: string;
  actionUrl?: string;
}

export interface LinhChatMessage {
  role: 'user' | 'linh';
  content: string;
  emotion?: EmotionState;
  richData?: RichItem[];
}

export interface LinhChatResponse {
  emotion: EmotionState;
  response: string;
  richData?: RichItem[];
}

export const linhAiApi = {
  chat: async (query: string, history?: { role: string; content: string }[]): Promise<LinhChatResponse> => {
    const { data } = await axiosClient.post<LinhChatResponse>('/linh-ai/chat', { query, history });
    return data;
  },
};

