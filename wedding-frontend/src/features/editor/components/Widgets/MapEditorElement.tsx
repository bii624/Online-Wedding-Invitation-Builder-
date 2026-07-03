import React from 'react';
import type { CanvasElement } from '../../types/editor.types';

export interface MapEditorElementProps {
  element: CanvasElement;
  zoom: number;
}

export function MapEditorElement({ element, zoom }: MapEditorElementProps) {
  const props = element.mapProps;
  if (!props) return null;

  // Render iframe using address or coordinates
  const query = (props.lat && props.lng) ? `${props.lat},${props.lng}` : props.address;
  const encodedQuery = encodeURIComponent(query || 'Hà Nội');
  const iframeSrc = `https://maps.google.com/maps?width=100%25&height=100%25&hl=${props.language || 'vi'}&q=${encodedQuery}&t=&z=${props.zoomLevel ?? 15}&ie=UTF8&iwloc=B&output=embed`;

  // Apply visual styling
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    opacity: props.opacity ?? 1,
    paddingTop: `${props.paddingTop ?? 0}px`,
    paddingRight: `${props.paddingRight ?? 0}px`,
    paddingBottom: `${props.paddingBottom ?? 0}px`,
    paddingLeft: `${props.paddingLeft ?? 0}px`,
    borderWidth: `${props.borderWidth ?? 0}px`,
    borderColor: props.borderColor || 'transparent',
    borderRadius: `${props.borderRadius ?? 0}px`,
    borderStyle: (props.borderStyle || 'none') as any,
    boxShadow: `${props.shadowX ?? 0}px ${props.shadowY ?? 0}px ${props.shadowBlur ?? 0}px ${props.shadowSpread ?? 0}px ${props.shadowColor || 'transparent'}`,
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    display: 'flex',
    justifyContent: props.align === 'left' ? 'flex-start' : props.align === 'right' ? 'flex-end' : 'center',
    alignItems: 'center',
  };

  return (
    <div style={style}>
      <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: `${props.borderRadius ?? 0}px`, overflow: 'hidden' }}>
        <iframe
          src={iframeSrc}
          width="100%"
          height="100%"
          style={{ border: 0, pointerEvents: 'none' }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Map"
        />
      </div>
      {/* Lớp phủ trong suốt: chặn event chuột để có thể drag-drop trên canvas mà không bị iframe ăn click */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, cursor: 'move', backgroundColor: 'rgba(0,0,0,0)', userSelect: 'none' }} draggable={false} />
    </div>
  );
}
