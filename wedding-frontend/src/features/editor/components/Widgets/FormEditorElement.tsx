import React from 'react';
import type { CanvasElement } from '../../types/editor.types';
import { DEFAULT_FORM_PROPS } from '../../store/editorStore';

interface FormEditorElementProps {
  element: CanvasElement;
  zoom: number;
}

export function FormEditorElement({ element, zoom }: FormEditorElementProps) {
  const rawProps: Partial<import('../../types/editor.types').FormContent> = element.formProps || {};
  const props = { 
    ...DEFAULT_FORM_PROPS, 
    ...rawProps, 
    padding: { ...DEFAULT_FORM_PROPS.padding, ...(rawProps.padding || {}) }, 
    border: { ...DEFAULT_FORM_PROPS.border, ...(rawProps.border || {}) }, 
    shadow: { ...DEFAULT_FORM_PROPS.shadow, ...(rawProps.shadow || {}) } 
  };

  const isEditor = true;

  const alignStyles = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  };

  const alignItems = alignStyles[props.alignment] || 'center';
  const textAlign = props.alignment;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: props.fontFamily,
        color: props.textColor,
        opacity: props.opacity,
      }}
    >
      <h2 style={{ 
        fontSize: `${props.fontSize + 10}px`, 
        fontWeight: 'bold', 
        marginBottom: '16px', 
        textTransform: 'uppercase', 
        textAlign 
      }}>
      </h2>
      
      <div 
        style={{
          flex: 1,
          backgroundColor: props.backgroundColor,
          padding: `${props.padding.top}px ${props.padding.right}px ${props.padding.bottom}px ${props.padding.left}px`,
          border: `${props.border.width}px ${props.border.style} ${props.border.color}`,
          borderRadius: props.border.radius,
          boxShadow: `${props.shadow.x}px ${props.shadow.y}px ${props.shadow.blur}px ${props.shadow.spread}px ${props.shadow.color}`,
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          alignItems: 'stretch',
          overflow: 'hidden'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', pointerEvents: isEditor ? 'none' : 'auto' }}>
          
          <input 
            type="text" 
            placeholder="Nhập tên của bạn*" 
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              borderRadius: '6px', 
              border: `1px solid ${props.inputBorderColor}`,
              backgroundColor: 'transparent',
              outline: 'none',
              fontFamily: props.fontFamily,
              color: props.textColor,
              fontSize: `${props.fontSize}px`
            }} 
          />

          {props.showGuestType && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: `${props.fontSize}px`, marginTop: '12px' }}>
              <span style={{ fontWeight: 600 }}>Bạn là:</span>
              <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1.5px solid ${props.textColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: props.textColor }} />
                  </div>
                  <input type="radio" name={`guestType_${element.id}`} style={{ display: 'none' }} />
                  Khách nhà trai
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1.5px solid ${props.textColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} />
                  <input type="radio" name={`guestType_${element.id}`} style={{ display: 'none' }} />
                  Khách nhà gái
                </label>
              </div>
            </div>
          )}

          {props.showAttendance && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: `${props.fontSize}px`, marginTop: '12px' }}>
              <span style={{ fontWeight: 600 }}>Bạn có thể tham dự không?:</span>
              <div style={{ display: 'flex', gap: '48px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1.5px solid ${props.textColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: props.textColor }} />
                  </div>
                  <input type="radio" name={`attendance_${element.id}`} style={{ display: 'none' }} />
                  Sẽ tham dự
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `1.5px solid ${props.textColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' }} />
                  <input type="radio" name={`attendance_${element.id}`} style={{ display: 'none' }} />
                  Rất tiếc không thể đến
                </label>
              </div>
            </div>
          )}

          <textarea 
            placeholder="Nhập lời chúc của bạn*" 
            rows={3}
            style={{ 
              width: '100%', 
              padding: '10px 12px', 
              borderRadius: '6px', 
              border: `1px solid ${props.inputBorderColor}`,
              backgroundColor: 'transparent',
              outline: 'none',
              fontFamily: props.fontFamily,
              color: props.textColor,
              fontSize: `${props.fontSize}px`,
              resize: 'none'
            }} 
          />
          
          <div style={{ display: 'flex', justifyContent: alignItems, marginTop: '8px' }}>
            <button 
              style={{
                backgroundColor: props.buttonBgColor,
                color: props.buttonTextColor,
                padding: '10px 24px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: props.fontFamily,
                fontSize: `${props.fontSize}px`
              }}
            >
              GỬI LỜI CHÚC
            </button>
          </div>
          
        </div>
      </div>
    </div>
  );
}
