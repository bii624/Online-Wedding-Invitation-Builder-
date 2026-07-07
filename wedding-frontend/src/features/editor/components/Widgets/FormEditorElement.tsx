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
          gap: '20px',
          alignItems: 'stretch'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', pointerEvents: isEditor ? 'none' : 'auto' }}>

          <div className="flex flex-col gap-1.5">
            <input
              type="text"
              placeholder="Họ tên của bạn *"
              className="w-full px-4 py-3 rounded-xl bg-transparent outline-none transition-all duration-200 focus:shadow-[0_0_0_1px_currentColor] focus:ring-0"
              style={{
                border: `1px solid ${props.inputBorderColor}`,
                fontFamily: props.fontFamily,
                color: props.textColor,
                fontSize: `${props.fontSize}px`
              }}
            />
          </div>

          {props.showGuestType && (
            <div className="flex flex-col gap-2" style={{ fontSize: `${props.fontSize}px` }}>
              <span className="font-bold tracking-wide mb-1">Bạn là khách của <span className="font-normal opacity-70 text-[0.9em] lowercase">(chọn 1 hoặc cả 2)</span></span>

              <div className="grid grid-cols-2 gap-3">
                {/* Nhà trai (Demo UI in editor always checked for display) */}
                <div className="border rounded-xl p-3 flex flex-col gap-2 transition-all duration-300 shadow-sm" style={{ borderColor: props.textColor, backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <label className="flex items-center cursor-pointer select-none gap-2">
                    <input type="checkbox" checked={true} readOnly style={{ accentColor: props.textColor, width: 18, height: 18, cursor: 'pointer' }} />
                    <span className="font-bold">Nhà trai</span>
                  </label>

                  {props.showAttendance && (
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" checked={true} readOnly className="w-4 h-4 accent-rose-500 cursor-pointer" />
                        <span className="text-[0.9em] transition-all duration-200 font-bold">Sẽ tham dự</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" checked={false} readOnly className="w-4 h-4 accent-rose-500 cursor-pointer" />
                        <span className="text-[0.9em] transition-all duration-200 font-medium opacity-75 group-hover:opacity-100">Không thể đến</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Nhà gái (Demo UI in editor - unchecked for variety) */}
                <div className="border rounded-xl p-3 flex flex-col gap-2 transition-all duration-300 hover:shadow-sm hover:-translate-y-px" style={{ borderColor: props.inputBorderColor, backgroundColor: 'transparent', opacity: 0.65 }}>
                  <label className="flex items-center cursor-pointer select-none gap-2">
                    <input type="checkbox" checked={false} readOnly style={{ accentColor: props.textColor, width: 18, height: 18, cursor: 'pointer' }} />
                    <span className="font-bold">Nhà gái</span>
                  </label>

                  {props.showAttendance && (
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" disabled className="w-4 h-4 accent-rose-500 cursor-pointer" />
                        <span className="text-[0.9em] transition-all duration-200 font-medium">Sẽ tham dự</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer group">
                        <input type="radio" disabled className="w-4 h-4 accent-rose-500 cursor-pointer" />
                        <span className="text-[0.9em] transition-all duration-200 font-medium">Không thể đến</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <textarea
              placeholder="Lời chúc của bạn *"
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-transparent outline-none transition-all duration-200 focus:shadow-[0_0_0_1px_currentColor] focus:ring-0"
              style={{
                border: `1px solid ${props.inputBorderColor}`,
                fontFamily: props.fontFamily,
                color: props.textColor,
                fontSize: `${props.fontSize}px`,
                resize: 'none'
              }}
            />
          </div>

          <div className="flex justify-center mt-2 pb-2">
            <button
              className="w-full py-3.5 px-6 rounded-xl border-none font-bold tracking-wider uppercase transition-all duration-200 cursor-pointer hover:opacity-90 shadow-lg hover:shadow-xl"
              style={{
                backgroundColor: props.buttonBgColor,
                color: props.buttonTextColor,
                fontFamily: props.fontFamily,
                fontSize: `${props.fontSize}px`,
                boxShadow: `0 4px 14px 0 ${props.buttonBgColor}40`
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
