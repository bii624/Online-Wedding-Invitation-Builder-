import React from 'react';
import type { CanvasElement } from '../../types/editor.types';
import { DEFAULT_BUTTON_CONTACT_PROPS } from '../../store/editorStore';
import { Phone } from 'lucide-react';

interface ButtonEditorElementProps {
  element: CanvasElement;
  zoom: number;
}

export function ButtonEditorElement({ element, zoom }: ButtonEditorElementProps) {
  const rawProps: Partial<import('../../types/editor.types').ButtonContactContent> = element.buttonContactProps || {};
  const props = { 
    ...DEFAULT_BUTTON_CONTACT_PROPS, 
    ...rawProps, 
    padding: { ...DEFAULT_BUTTON_CONTACT_PROPS.padding, ...(rawProps.padding || {}) }, 
    border: { ...DEFAULT_BUTTON_CONTACT_PROPS.border, ...(rawProps.border || {}) }, 
    shadow: { ...DEFAULT_BUTTON_CONTACT_PROPS.shadow, ...(rawProps.shadow || {}) } 
  };

  const isEditor = true;

  const handleClick = (e: React.MouseEvent) => {
    if (isEditor) {
      e.preventDefault();
    } else {
      if (props.phoneNumber) {
        window.location.href = 'tel:' + props.phoneNumber;
      }
    }
  };

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'stretch',
      }}
    >
      <button 
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          backgroundColor: props.backgroundColor,
          color: props.textColor,
          fontFamily: props.fontFamily,
          fontSize: `${props.fontSize}px`,
          padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
          border: `${props.border.width}px ${props.border.style} ${props.border.color}`,
          borderRadius: props.border.radius,
          boxShadow: `${props.shadow.x}px ${props.shadow.y}px ${props.shadow.blur}px ${props.shadow.spread}px ${props.shadow.color}`,
          opacity: props.opacity,
          cursor: isEditor ? 'default' : 'pointer',
          pointerEvents: isEditor ? 'none' : 'auto',
        }}
      >
        {props.showIcon && <Phone size={props.fontSize + 2} />}
        <span>{props.buttonText}</span>
      </button>
    </div>
  );
}
