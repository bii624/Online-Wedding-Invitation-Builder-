import React, { useState } from 'react';
import { LinhCharacter3D } from './LinhCharacter3D';
import { LinhChatPanel } from './LinhChatPanel';
import { useLinhChat } from '../hooks/useLinhChat';
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

      {/* Floating button with 3D character */}
      <div
        className={`linh-widget__trigger ${isOpen ? 'linh-widget__trigger--active' : ''}`}
        onClick={() => setIsOpen((o) => !o)}
        title="Hỏi DearLove AI"
      >
        <LinhCharacter3D emotion={isOpen ? emotion : 'happy'} size={72} />
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
