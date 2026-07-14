import { useState, useCallback, useRef } from 'react';
import { linhAiApi } from '../../../api/linhAiApi';
import type { LinhChatMessage, EmotionState } from '../../../api/linhAiApi';

export function useLinhChat() {
  const [messages, setMessages] = useState<LinhChatMessage[]>([
    {
      role: 'linh',
      content: 'Xin chào! Mình là DearLove AI 💕 Mình có thể tư vấn về thiệp cưới, kế hoạch cưới, hoặc trả lời bất kỳ câu hỏi nào về đám cưới của bạn. Hỏi mình nhé!',
      emotion: 'happy',
    },
  ]);
  const [emotion, setEmotion] = useState<EmotionState>('happy');
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading) return;

    const history = messages.map(m => ({ role: m.role, content: m.content }));

    // Add user message
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const res = await linhAiApi.chat(query, history);
      setEmotion(res.emotion);
      setMessages((prev) => [
        ...prev,
        { role: 'linh', content: res.response, emotion: res.emotion },
      ]);
    } catch {
      setEmotion('neutral');
      setMessages((prev) => [
        ...prev,
        {
          role: 'linh',
          content: 'Xin lỗi, DearLove AI đang gặp sự cố. Bạn thử lại sau nhé!',
          emotion: 'neutral',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: 'linh',
        content: 'Xin chào! Mình là DearLove AI 💕 Mình có thể tư vấn về thiệp cưới, kế hoạch cưới, hoặc trả lời bất kỳ câu hỏi nào về đám cưới của bạn. Hỏi mình nhé!',
        emotion: 'happy',
      },
    ]);
    setEmotion('happy');
  }, []);

  return { messages, emotion, isLoading, sendMessage, clearMessages };
}
