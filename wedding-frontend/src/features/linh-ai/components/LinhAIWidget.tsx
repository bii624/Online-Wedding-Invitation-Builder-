import React, { useState } from 'react';
import { LinhChatPanel } from './LinhChatPanel';
import { useLinhChat } from '../hooks/useLinhChat';
import chatbotAIAvatar from '../../../assets/images/chatbotAIAvatar.png';
import './LinhAIWidget.css';

export function LinhAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, emotion, isLoading, sendMessage, clearMessages } = useLinhChat();

  return (
    <div className="linh-widget">
      {/* Chat panel */}
      <div className={`linh-widget__panel ${isOpen ? 'linh-widget__panel--open' : ''}`}>
        <LinhChatPanel
          messages={messages}
          isLoading={isLoading}
          emotion={emotion}
          onSend={sendMessage}
          onClose={() => setIsOpen(false)}
          onClear={clearMessages}
        />
      </div>

      {/* Floating button with image character */}
      <div
        className={`linh-widget__trigger ${isOpen ? 'linh-widget__trigger--active' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        title="Hỏi DearLove AI"
      >
        <div style={{ width: 72, height: 72, borderRadius: '50%', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', flexShrink: 0 }}>
          <img src={chatbotAIAvatar} alt="DearLove AI" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} />
        </div>
        {!isOpen && (
          <div className="linh-widget__badge">
            <span>💬</span>
          </div>
        )}
        <div className="linh-widget__label">DearLove AI</div>
      </div>
    </div>
  );
}
