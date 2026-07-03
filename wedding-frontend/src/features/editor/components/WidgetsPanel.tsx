import React from 'react';
import { useEditorStore } from '../store/editorStore';
import type { CanvasElementType } from '../types/editor.types';
import '../styles/LeftToolbar.css';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WIDGETS = [
  { id: 'calendar', name: 'Lịch', icon: '📅', implemented: false },
  { id: 'countdown', name: 'Đếm ngược', icon: '⏰', implemented: true },
  { id: 'map', name: 'Bản đồ', icon: '📍', implemented: true },
  { id: 'guest_name', name: 'Tên khách mời', icon: '💌', implemented: false },
  { id: 'special_effect', name: 'Hiệu ứng đặc biệt', icon: '✨', implemented: false },
  { id: 'envelope_effect', name: 'Hiệu ứng phong bì', icon: '📬', implemented: false },
  { id: 'qr_code', name: 'Hộp quà QR', icon: '🎁', implemented: true },
  { id: 'video_embed', name: 'Nhúng Video', icon: '🎥', implemented: false },
  { id: 'gallery', name: 'Album Ảnh', icon: '🖼️', implemented: false },
  { id: 'carousel', name: 'Carousel', icon: '🎠', implemented: false },
  { id: 'video_background', name: 'Video Nền', icon: '🎬', implemented: false },
  { id: 'rsvp_form', name: 'Form tham dự', icon: '📋', implemented: false },
  { id: 'custom_form', name: 'Biểu mẫu tùy chỉnh', icon: '📝', implemented: false },
  { id: 'contact_button', name: 'Nút liên hệ', icon: '📞', implemented: false },
  { id: 'reminder', name: 'Thêm lời nhắc', icon: '🔔', implemented: false },
];

export function WidgetsPanel({ onClose }: { onClose: () => void }) {
  const { addCountdownElement, addMapElement, addQrCodeElement } = useEditorStore();

  const handleAddWidget = (id: string) => {
    if (id === 'countdown') {
      addCountdownElement();
      onClose();
    } else if (id === 'map') {
      addMapElement();
      onClose();
    } else if (id === 'qr_code') {
      addQrCodeElement();
      onClose();
    }
  };

  return (
    <div className="lt-image-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column' }}>
      <div className="lt-image-panel-header">
        <span className="lt-image-panel-title">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 18, height: 18, marginRight: 8 }}>
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" />
          </svg>
          Tiện ích
        </span>
        <button className="lt-panel-close-btn" onClick={onClose} title="Đóng">
          <CloseIcon />
        </button>
      </div>

      <div style={{ padding: '16px', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px'
        }}>
          {WIDGETS.map((widget) => (
            <div
              key={widget.id}
              onClick={() => widget.implemented && handleAddWidget(widget.id)}
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: widget.implemented ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: widget.implemented ? 1 : 0.5,
                position: 'relative',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
              onMouseEnter={(e) => {
                if (widget.implemented) {
                  e.currentTarget.style.transform = 'scale(1.02)';
                  e.currentTarget.style.borderColor = '#fda4af'; // rose-300
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)';
                }
              }}
              onMouseLeave={(e) => {
                if (widget.implemented) {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                }
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{widget.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#334155', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
                {widget.name}
              </div>

              {!widget.implemented && (
                <div style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-6px',
                  backgroundColor: '#94a3b8',
                  color: 'white',
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap'
                }}>
                  Sắp ra mắt
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
