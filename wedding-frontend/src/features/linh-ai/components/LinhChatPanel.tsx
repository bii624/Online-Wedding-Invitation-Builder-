import React, { useRef, useEffect } from 'react';
import type { LinhChatMessage, EmotionState } from '../../../api/linhAiApi';
import './LinhChatPanel.css';

interface LinhChatPanelProps {
  messages: LinhChatMessage[];
  isLoading: boolean;
  emotion: EmotionState;
  onSend: (query: string) => void;
  onClose: () => void;
  onClear: () => void;
}

const QUICK_QUESTIONS = [
  '💍 Thiệp của tôi có bao nhiêu RSVP?',
  '💐 Kế hoạch cưới 12 tháng trước',
  '💰 Chi phí tổ chức tiệc cưới?',
  '📸 Mẹo chụp ảnh cưới đẹp?',
];

const emotionEmoji: Record<EmotionState, string> = {
  neutral: '🎀',
  happy: '😊',
  excited: '✨',
  thinking: '🤔',
};

export function LinhChatPanel({
  messages,
  isLoading,
  emotion,
  onSend,
  onClose,
  onClear,
}: LinhChatPanelProps) {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="linh-panel">
      {/* Header */}
      <div className="linh-panel__header">
        <div className="linh-panel__header-info">
          <span className="linh-panel__emotion">{emotionEmoji[emotion]}</span>
          <div>
            <div className="linh-panel__name">DearLove AI</div>
            <div className="linh-panel__status">Chuyên gia tư vấn cưới hỏi</div>
          </div>
        </div>
        <div className="linh-panel__actions">
          <button onClick={onClear} className="linh-panel__btn-icon" title="Xoá lịch sử">🗑️</button>
          <button onClick={onClose} className="linh-panel__btn-icon" title="Đóng">✕</button>
        </div>
      </div>

      {/* Messages */}
      <div className="linh-panel__messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`linh-msg linh-msg--${msg.role}`}
          >
            {msg.role === 'linh' && (
              <div className="linh-msg__avatar">{emotionEmoji[msg.emotion || 'happy']}</div>
            )}
            <div className="linh-msg__bubble">{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="linh-msg linh-msg--linh">
            <div className="linh-msg__avatar">🤔</div>
            <div className="linh-msg__bubble linh-msg__bubble--typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick questions */}
      {messages.length <= 1 && (
        <div className="linh-panel__quick">
          {QUICK_QUESTIONS.map((q) => (
            <button key={q} className="linh-panel__quick-btn" onClick={() => onSend(q.replace(/^.*? /, ''))}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form className="linh-panel__input-row" onSubmit={handleSubmit}>
        <input
          className="linh-panel__input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Hỏi DearLove AI về đám cưới của bạn..."
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="linh-panel__send"
          disabled={isLoading || !input.trim()}
        >
          ➤
        </button>
      </form>
    </div>
  );
}
