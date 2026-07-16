import React, { useRef, useEffect } from 'react';
import type { LinhChatMessage, EmotionState } from '../../../api/linhAiApi';
import chatbotAIAvatar from '../../../assets/images/chatbotAIAvatar.png';
import { RichCards } from './RichCards';
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
  { icon: '📋', label: 'RSVP thiệp của tôi', query: 'Thiệp cưới của tôi có bao nhiêu người đã RSVP?' },
  { icon: '📅', label: 'Kế hoạch 12 tháng', query: 'Lập kế hoạch cưới chi tiết cho 12 tháng chuẩn bị' },
  { icon: '💰', label: 'Ước tính chi phí', query: 'Chi phí tổ chức đám cưới 200 khách khoảng bao nhiêu?' },
  { icon: '🌸', label: 'Gợi ý hoa cưới', query: 'Gợi ý các loại hoa phù hợp cho đám cưới mùa hè' },
  { icon: '👗', label: 'Chọn váy cưới', query: 'Mẹo chọn váy cưới phù hợp với vóc dáng' },
  { icon: '📸', label: 'Mẹo chụp ảnh cưới', query: 'Mẹo để có bộ ảnh cưới đẹp và ý nghĩa' },
];

/**
 * Simple Markdown renderer: supports **bold**, *italic*, bullet lists, numbered lists, headings.
 */
function parseInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={idx}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={idx}>{part.slice(1, -1)}</em>;
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function renderMarkdown(text: string): React.ReactNode {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const trimmed = lines[i].trim();

    if (!trimmed) { i++; continue; }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(<li key={i}>{parseInline(lines[i].trim().replace(/^\d+\.\s/, ''))}</li>);
        i++;
      }
      elements.push(<ol key={`ol-${i}`} className="md-list">{items}</ol>);
      continue;
    }

    // Bullet list
    if (/^[-•*]\s/.test(trimmed)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-•*]\s/.test(lines[i].trim())) {
        items.push(<li key={i}>{parseInline(lines[i].trim().replace(/^[-•*]\s/, ''))}</li>);
        i++;
      }
      elements.push(<ul key={`ul-${i}`} className="md-list">{items}</ul>);
      continue;
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      elements.push(<p key={i} className="md-heading-3">{parseInline(trimmed.slice(4))}</p>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<p key={i} className="md-heading-2">{parseInline(trimmed.slice(3))}</p>);
    } else {
      elements.push(<p key={i} className="md-para">{parseInline(trimmed)}</p>);
    }
    i++;
  }

  return <>{elements}</>;
}

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

  const doSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); doSend(); };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); doSend(); }
  };

  const emotionLabel: Record<EmotionState, string> = {
    neutral: 'Đang trả lời...',
    happy: 'Sẵn sàng tư vấn 💕',
    excited: 'Đang hào hứng ✨',
    thinking: 'Đang suy nghĩ 🤔',
  };

  return (
    <div className="linh-panel">
      {/* Header */}
      <div className="linh-panel__header">
        <div className="linh-panel__header-info">
          <img src={chatbotAIAvatar} alt="DearLove AI" className="linh-panel__avatar-img" />
          <div>
            <div className="linh-panel__name">DearLove AI</div>
            <div className="linh-panel__status">{emotionLabel[emotion]}</div>
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
          <div key={i} className="linh-msg-group">
            <div className={`linh-msg linh-msg--${msg.role}`}>
              {msg.role === 'linh' && (
                <img src={chatbotAIAvatar} alt="AI" className="linh-msg__avatar" />
              )}
              <div className="linh-msg__bubble">
                {msg.role === 'linh' ? renderMarkdown(msg.content) : msg.content}
              </div>
            </div>
            {msg.role === 'linh' && msg.richData && msg.richData.length > 0 && (
              <div className="linh-msg-group__rich">
                <RichCards items={msg.richData} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="linh-msg linh-msg--linh">
            <img src={chatbotAIAvatar} alt="AI" className="linh-msg__avatar" />
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
            <button
              key={q.label}
              className="linh-panel__quick-btn"
              onClick={() => onSend(q.query)}
              disabled={isLoading}
            >
              <span className="linh-panel__quick-icon">{q.icon}</span>
              {q.label}
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
          onKeyDown={handleKeyDown}
          placeholder="Hỏi DearLove AI... (Enter để gửi)"
          disabled={isLoading}
          autoComplete="off"
        />
        <button
          type="submit"
          className="linh-panel__send"
          disabled={isLoading || !input.trim()}
          title="Gửi"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

