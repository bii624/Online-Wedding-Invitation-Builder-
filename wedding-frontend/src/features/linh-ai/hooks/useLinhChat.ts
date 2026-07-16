import { useState, useCallback, useRef } from 'react';
import { linhAiApi } from '../../../api/linhAiApi';
import type { LinhChatMessage, EmotionState } from '../../../api/linhAiApi';

const WELCOME_MESSAGE: LinhChatMessage = {
  role: 'linh',
  content: 'Xin chào bạn! 💕 Mình là DearLove AI — trợ lý tư vấn cưới hỏi của bạn. Bạn đang chuẩn bị cho ngày trọng đại hay cần tư vấn gì không? Mình sẵn sàng giúp bạn ngay nè! 🌸',
  emotion: 'happy',
};

export function useLinhChat() {
  const [messages, setMessages] = useState<LinhChatMessage[]>([WELCOME_MESSAGE]);
  const [emotion, setEmotion] = useState<EmotionState>('happy');
  const [isLoading, setIsLoading] = useState(false);

  // Ref to prevent duplicate requests (React Strict Mode calls effects twice in dev)
  const isRequestInFlight = useRef(false);

  const sendMessage = useCallback(async (query: string) => {
    if (!query.trim() || isLoading || isRequestInFlight.current) return;

    // Mark request in-flight immediately to block any concurrent calls
    isRequestInFlight.current = true;

    // Snapshot history BEFORE adding user message (so user message isn't sent as history)
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    // Optimistically add user message to UI
    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setIsLoading(true);
    setEmotion('thinking');

    try {
      const res = await linhAiApi.chat(query, history);
      setEmotion(res.emotion);
      setMessages((prev) => [
        ...prev,
        { role: 'linh', content: res.response, emotion: res.emotion, richData: res.richData },
      ]);
    } catch {
      setEmotion('neutral');
      setMessages((prev) => [
        ...prev,
        {
          role: 'linh',
          content: 'Xin lỗi bạn, mình đang gặp chút sự cố 😅 Bạn thử hỏi lại nhé!',
          emotion: 'neutral',
        },
      ]);
    } finally {
      setIsLoading(false);
      isRequestInFlight.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, messages]);

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setEmotion('happy');
    isRequestInFlight.current = false;
  }, []);

  return { messages, emotion, isLoading, sendMessage, clearMessages };
}
