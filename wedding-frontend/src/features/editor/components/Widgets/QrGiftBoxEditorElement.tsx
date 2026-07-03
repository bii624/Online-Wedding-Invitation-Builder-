import React from 'react';
import type { CanvasElement } from '../../types/editor.types';
import { RedEnvelope } from './RedEnvelope';

export interface QrGiftBoxEditorElementProps {
  element: CanvasElement;
  zoom: number;
}

export function QrGiftBoxEditorElement({ element, zoom }: QrGiftBoxEditorElementProps) {
  const props = element.qrGiftBoxProps;
  if (!props) return null;

  const scaleFactor = Math.min(element.width / 120, element.height / 150);

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    opacity: props.opacity ?? 1,
    backgroundColor: props.backgroundColor || 'transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: props.alignment === 'left' ? 'flex-start' : props.alignment === 'right' ? 'flex-end' : 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
    position: 'relative',
    cursor: 'pointer',
    padding: `${8 * scaleFactor}px`,
  };

  return (
    <div style={style} title="Nhấn để xem thử">
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
    </div>
  );
}
