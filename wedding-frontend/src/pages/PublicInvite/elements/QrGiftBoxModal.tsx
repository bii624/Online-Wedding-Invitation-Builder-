import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      {isOpen && (
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
                backgroundColor: '#fff',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '500px',
                maxHeight: '90vh',
                overflowY: 'auto',
                pointerEvents: 'auto',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Header */}
              <div style={{ padding: '24px 24px 16px', textAlign: 'center', borderBottom: '1px solid #f1f5f9' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontFamily: 'serif', color: '#0f172a' }}>
                  {content.title || 'Hộp Quà Yêu Thương'}
                </h2>
                <p style={{ margin: '8px 0 0', fontSize: '14px', color: '#64748b' }}>
                  {content.subtitle || 'Quét QR code để gửi yêu thương trực tiếp tới:'}
                </p>
              </div>

              {/* Body */}
              <div style={{ padding: '24px', flex: 1 }}>
                {showDisclaimer && (
                  <div style={{
                    marginBottom: '20px', padding: '12px', backgroundColor: '#fef3c7', 
                    borderRadius: '8px', color: '#d97706', fontSize: '14px', fontStyle: 'italic', textAlign: 'center'
                  }}>
                    ⚠️ Đây là dữ liệu hiển thị mẫu, bạn cần thêm thông tin tài khoản QR của bạn để hiển thị thực tế.
                  </div>
                )}
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: content.accounts?.length === 2 ? 'repeat(2, 1fr)' : '1fr',
                  gap: '24px'
                }}>
                  {content.accounts?.length > 0 ? content.accounts.map((acc, index) => {
                    const isBride = acc.role === 'bride';
                    const color = isBride ? '#f43f5e' : '#3b82f6';
                    return (
                      <div key={acc.id || index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <span style={{
                          color, fontWeight: 700, fontSize: '16px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px'
                        }}>
                          {acc.label || (isBride ? 'Cô dâu' : 'Chú rể')}
                        </span>
                        
                        <div style={{
                          width: '160px', height: '160px', borderRadius: '12px', border: `2px solid ${color}`,
                          padding: '8px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          backgroundColor: '#f8fafc', overflow: 'hidden'
                        }}>
                          {acc.qrImageUrl ? (
                            <img src={acc.qrImageUrl} alt="QR Code" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ color: '#94a3b8', fontSize: '14px' }}>QR Code</span>
                          )}
                        </div>

                        <div style={{ textAlign: 'center', marginBottom: '16px', width: '100%' }}>
                          <div style={{ fontWeight: 700, color: '#334155', fontSize: '15px' }}>{acc.name || 'Tên chủ tài khoản'}</div>
                          <div style={{ color: '#64748b', fontSize: '14px', margin: '4px 0' }}>{acc.bankName || 'Ngân hàng'}</div>
                          <div style={{ color: '#64748b', fontSize: '14px', fontFamily: 'monospace' }}>{acc.accountNumber || 'Số tài khoản'}</div>
                        </div>

                        <button
                          onClick={() => handleCopy(acc.accountNumber)}
                          style={{
                            padding: '8px 16px', borderRadius: '20px', border: `1px solid ${color}`,
                            backgroundColor: copiedAccount === acc.accountNumber ? color : 'transparent',
                            color: copiedAccount === acc.accountNumber ? '#fff' : color,
                            fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s',
                            display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center'
                          }}
                        >
                          {copiedAccount === acc.accountNumber ? 'Đã sao chép ✓' : 'Sao chép số TK'}
                        </button>
                      </div>
                    );
                  }) : (
                    <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
                      Chưa có thông tin tài khoản
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '16px 24px', borderTop: '1px solid #f1f5f9' }}>
                <button
                  onClick={onClose}
                  style={{
                    width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
                    backgroundColor: '#fff', color: '#475569', fontSize: '15px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Đóng
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
