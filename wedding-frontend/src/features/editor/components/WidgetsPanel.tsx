import React from 'react';
import { useEditorStore } from '../store/editorStore';
import type { CanvasElementType } from '../types/editor.types';
import { ChevronLeft, Calendar, Clock, MapPin, Mail, Gift, Image, ClipboardList, Phone } from 'lucide-react';
import '../styles/LeftToolbar.css';

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const WIDGETS = [
  { id: 'calendar', name: 'Lịch', icon: Calendar, implemented: true },
  { id: 'countdown', name: 'Đếm ngược', icon: Clock, implemented: true },
  { id: 'map', name: 'Bản đồ', icon: MapPin, implemented: true },
  { id: 'guest_name', name: 'Tên khách mời', icon: Mail, implemented: false },
  { id: 'qr_code', name: 'Hộp quà QR', icon: Gift, implemented: true },
  { id: 'gallery', name: 'Album Ảnh', icon: Image, implemented: true },
  { id: 'rsvp_form', name: 'Form tham dự', icon: ClipboardList, implemented: true },
  { id: 'contact_button', name: 'Nút liên hệ', icon: Phone, implemented: true },
];

export function WidgetsPanel({ onClose }: { onClose: () => void }) {
  const { addCountdownElement, addMapElement, addQrCodeElement, addCalendarElement, addAlbumElement, addFormElement, addButtonContactElement } = useEditorStore();

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
    } else if (id === 'calendar') {
      addCalendarElement();
      onClose();
    } else if (id === 'gallery') {
      addAlbumElement();
      onClose();
    } else if (id === 'rsvp_form') {
      addFormElement();
      onClose();
    } else if (id === 'contact_button') {
      addButtonContactElement();
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
        <button className="panel-collapse-btn" onClick={onClose} title="Thu gọn">
          <ChevronLeft size={16} />
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
                borderRadius: '12px',
                padding: '20px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: widget.implemented ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: widget.implemented ? 1 : 0.6,
                position: 'relative',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02)',
              }}
              onMouseEnter={(e) => {
                if (widget.implemented) {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.borderColor = '#fda4af'; // rose-300
                  e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(244, 63, 94, 0.1), 0 4px 6px -2px rgba(244, 63, 94, 0.05)';
                  const iconWrap = e.currentTarget.querySelector('.widget-panel-icon-wrap') as HTMLElement;
                  if (iconWrap) {
                    iconWrap.style.background = 'linear-gradient(135deg, #f43f5e, #fb7185)';
                    iconWrap.style.color = '#ffffff';
                    iconWrap.style.transform = 'scale(1.1) rotate(5deg)';
                    iconWrap.style.boxShadow = '0 8px 16px -3px rgba(244, 63, 94, 0.3)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (widget.implemented) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.02)';
                  const iconWrap = e.currentTarget.querySelector('.widget-panel-icon-wrap') as HTMLElement;
                  if (iconWrap) {
                    iconWrap.style.background = 'linear-gradient(135deg, #fff1f2, #ffe4e6)';
                    iconWrap.style.color = '#e11d48';
                    iconWrap.style.transform = 'scale(1) rotate(0deg)';
                    iconWrap.style.boxShadow = '0 4px 6px -1px rgba(225, 29, 72, 0.05)';
                  }
                }
              }}
            >
              <div 
                className="widget-panel-icon-wrap" 
                style={{ 
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #fff1f2, #ffe4e6)',
                  color: '#e11d48',
                  boxShadow: '0 4px 6px -1px rgba(225, 29, 72, 0.05)',
                  marginBottom: '12px', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <widget.icon size={26} strokeWidth={1.75} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#334155', textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
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
