// ============================================================
// MOBILE BOTTOM SHEET — Reusable drag-up panel for mobile editor
// ============================================================

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: ReactNode;
  children: ReactNode;
  /** Height percentage of viewport (default 55) */
  heightVh?: number;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  titleIcon,
  children,
  heightVh = 55,
}: MobileBottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="mbs-backdrop"
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.35)',
        zIndex: 800,
        display: 'flex',
        alignItems: 'flex-end',
      }}
    >
      <div
        ref={sheetRef}
        className="mbs-sheet"
        style={{
          width: '100%',
          height: `${heightVh}vh`,
          background: '#fff',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.18)',
          animation: 'mbs-slide-up 0.25s cubic-bezier(0.22,1,0.36,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: '#e2e8f0' }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '4px 20px 12px',
          borderBottom: '1px solid #f1f5f9',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 16, color: '#1e293b' }}>
            {titleIcon && <span style={{ color: '#f43f5e', display: 'flex', alignItems: 'center' }}>{titleIcon}</span>}
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32,
              borderRadius: '50%',
              background: '#f1f5f9',
              border: 'none',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, color: '#64748b',
              transition: 'all 0.15s',
            }}
          >
            x
          </button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </div>
      </div>

      <style>{`
        @keyframes mbs-slide-up {
          from { transform: translateY(100%); opacity: 0.6; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
