import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { CanvasElement } from '../../../features/editor/types/editor.types';
import { QrGiftBoxModal } from './QrGiftBoxModal';
import { RedEnvelope } from '../../../features/editor/components/Widgets/RedEnvelope';

export function QrGiftBoxPublic({ block }: { block: CanvasElement }) {
  const [isOpen, setIsOpen] = useState(false);
  const props = block.qrGiftBoxProps;
  if (!props) return null;

  const scaleFactor = Math.min(block.width / 120, block.height / 150);

  return (
    <>
      <motion.div 
        onClick={() => setIsOpen(true)}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: props.opacity ?? 1, scale: 1 }}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: props.alignment === 'left' ? 'flex-start' : props.alignment === 'right' ? 'flex-end' : 'center',
          justifyContent: 'center',
          backgroundColor: props.backgroundColor || 'transparent',
          cursor: 'pointer',
          padding: `${8 * scaleFactor}px`,
          boxSizing: 'border-box',
        }}
      >
        {props.iconUrl ? (
          <img 
            src={props.iconUrl} 
            alt="Gift Box" 
            style={{ width: '80%', height: 'auto', maxHeight: '70%', objectFit: 'contain', marginBottom: `${8 * scaleFactor}px`, pointerEvents: 'none' }} 
          />
        ) : (
          <div style={{ marginBottom: `${8 * scaleFactor}px`, pointerEvents: 'none' }}>
            <RedEnvelope scaleFactor={scaleFactor * 0.45} color={props.envelopeColor} />
          </div>
        )}
        <div style={{
          fontSize: `${12 * scaleFactor}px`,
          fontWeight: 600,
          color: '#334155',
          textAlign: props.alignment,
          width: '100%',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          pointerEvents: 'none'
        }}>
          {props.title || 'Hộp Quà QR'}
        </div>
      </motion.div>

      <QrGiftBoxModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        content={props}
        isPreview={false}
      />
    </>
  );
}
