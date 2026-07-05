import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { QrGiftBoxContent } from '../../../features/editor/types/editor.types';

export interface QrGiftBoxModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: QrGiftBoxContent;
  isPreview?: boolean;
}

export function QrGiftBoxModal({ isOpen, onClose, content, isPreview = false }: QrGiftBoxModalProps) {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const handleCopy = (accountNumber: string) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(accountNumber);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = accountNumber;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('Copy failed', err);
      }
      document.body.removeChild(textArea);
    }
    setCopiedAccount(accountNumber);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const showDisclaimer = isPreview || !content.accounts || content.accounts.length === 0;

  return (
    <AnimatePresence>
      {isOpen && createPortal(
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(4px)',
              zIndex: 999998,
            }}
          />
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999999,
              pointerEvents: 'none',
              padding: '16px'
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{
                background: content.popupBgColor || '#EAE0D5',
                borderRadius: '16px',
                width: '100%',
                maxWidth: content.accounts?.length === 2 ? 650 : 350,
                maxHeight: '90vh',
                overflowY: 'auto',
                pointerEvents: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              {/* Header */}
              <div style={{ backgroundColor: content.popupHeaderBgColor || '#8B2929', padding: '24px 40px', textAlign: 'center', position: 'relative' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', cursor: 'pointer', color: '#fff' }}>
                  <X size={24} />
                </button>
                <div style={{ fontWeight: 700, fontSize: 22, color: content.popupHeaderTextColor || '#FFFFFF', textTransform: 'uppercase', letterSpacing: 1 }}>{content.title}</div>
                {content.subtitle && <div style={{ fontSize: 14, color: content.popupHeaderTextColor || '#FFFFFF', opacity: 0.9, marginTop: 8 }}>{content.subtitle}</div>}
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: content.accounts?.length === 2 ? 'row' : 'column', padding: 32, gap: 32 }}>
                {(content.accounts || []).map((acc) => (
                  <div key={acc.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ color: content.popupHeaderBgColor || '#8B2929', fontSize: 16, fontWeight: 500, marginBottom: 16 }}>{acc.label} - {acc.name}</div>
                    <div style={{ background: '#fff', padding: 12, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 16 }}>
                      {acc.qrImageUrl ? (
                        <img src={acc.qrImageUrl} alt="QR" style={{ width: 180, height: 180, objectFit: 'contain', borderRadius: 8 }} />
                      ) : (
                        <div style={{ width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f1f5f9', borderRadius: 8, color: '#94a3b8', fontSize: 14 }}>Không có mã QR</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'center', color: content.popupTextColor || '#4A4A4A' }}>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{acc.bankName}</div>
                      <div style={{ fontSize: 14, marginBottom: 4 }}>{acc.accountNumber}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{acc.name}</div>
                      
                      {acc.qrImageUrl && (
                        <a 
                          href={acc.qrImageUrl} 
                          download={`QR_${acc.bankName}_${acc.accountNumber}.png`} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: content.popupHeaderBgColor || '#8B2929', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                          Lưu QR
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {(!content.accounts || content.accounts.length === 0) && (
                  <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8', width: '100%' }}>
                    Chưa có thông tin tài khoản
                  </div>
                )}
              </div>
              {showDisclaimer && (
                <div style={{
                  margin: '0 32px 32px', padding: '12px', backgroundColor: '#fef3c7', 
                  borderRadius: '8px', color: '#d97706', fontSize: '14px', fontStyle: 'italic', textAlign: 'center'
                }}>
                  ⚠️ Đây là dữ liệu hiển thị mẫu, bạn cần thêm thông tin tài khoản QR của bạn để hiển thị thực tế.
                </div>
              )}
            </motion.div>
          </div>
        </>,
        document.body
      )}
    </AnimatePresence>
  );
}
