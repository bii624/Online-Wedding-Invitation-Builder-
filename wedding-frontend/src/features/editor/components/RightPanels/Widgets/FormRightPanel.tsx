import React from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { FormContent } from '../../../types/editor.types';
import {
  Section,
  Slider,
  ColorField,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  LayoutIcon,
  PaddingSection,
  BorderSection,
  ShadowSection,
} from '../RightPanelShared';

export function FormRightPanel({ id }: { id: string }) {
  const { elements, updateFormProps } = useEditorStore();
  const element = elements.find((el) => el.id === id);
  const props = element?.formProps;

  if (!element || !props) return null;

  const handlePropChange = <K extends keyof FormContent>(key: K, value: FormContent[K]) => {
    updateFormProps(id, { [key]: value });
  };

  const fonts = [
    'Arial', 'Helvetica', 'Times New Roman', 'Courier New', 'Georgia',
    'Verdana', 'Tahoma', 'Trebuchet MS', 'Playfair Display', 'Lora',
    'Merriweather', 'Great Vibes', 'Dancing Script'
  ];

  return (
    <div className="right-panel-scroll">
      <Section title="Cài đặt biểu mẫu" icon={<LayoutIcon />} defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="rp-field">
            <span className="rp-label">Khách nhà trai / nhà gái</span>
            <input
              type="checkbox"
              checked={props.showGuestType}
              onChange={(e) => handlePropChange('showGuestType', e.target.checked)}
              style={{ accentColor: '#f43f5e', width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
          <div className="rp-field">
            <span className="rp-label">Sẽ tham dự / Không thể đến</span>
            <input
              type="checkbox"
              checked={props.showAttendance}
              onChange={(e) => handlePropChange('showAttendance', e.target.checked)}
              style={{ accentColor: '#f43f5e', width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </Section>

      <Section title="Cài đặt giao diện" icon={<LayoutIcon />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {/* Căn chỉnh */}
          <div className="rp-field">
            <span className="rp-label">Căn chỉnh</span>
            <div className="rp-align-group" style={{ flex: 1 }}>
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  className={`rp-align-btn ${props.alignment === align ? 'active' : ''}`}
                  onClick={() => handlePropChange('alignment', align)}
                >
                  {align === 'left' && <AlignLeftIcon />}
                  {align === 'center' && <AlignCenterIcon />}
                  {align === 'right' && <AlignRightIcon />}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="rp-field">
            <span className="rp-label">Font</span>
            <select
              className="rp-input"
              value={props.fontFamily}
              onChange={(e) => handlePropChange('fontFamily', e.target.value)}
              style={{ width: '120px' }}
            >
              {fonts.map(f => <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>)}
            </select>
          </div>

          {/* Cỡ chữ */}
          <div className="rp-field">
            <span className="rp-label">Cỡ chữ</span>
            <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e4e4e7', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                onClick={() => handlePropChange('fontSize', Math.max(8, props.fontSize - 1))}
                style={{ padding: '4px 8px', backgroundColor: '#f4f4f5', cursor: 'pointer', border: 'none' }}
              >-</button>
              <input
                type="number"
                value={props.fontSize}
                onChange={(e) => handlePropChange('fontSize', Number(e.target.value))}
                style={{ width: '40px', textAlign: 'center', border: 'none', outline: 'none', padding: '4px' }}
              />
              <button
                onClick={() => handlePropChange('fontSize', Math.min(72, props.fontSize + 1))}
                style={{ padding: '4px 8px', backgroundColor: '#f4f4f5', cursor: 'pointer', border: 'none' }}
              >+</button>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Colors */}
          <ColorField label="Màu chữ" color={props.textColor} onChange={(c) => handlePropChange('textColor', c)} />
          <ColorField label="Màu nền" color={props.backgroundColor} onChange={(c) => handlePropChange('backgroundColor', c)} />
          <ColorField label="Màu viền Input" color={props.inputBorderColor} onChange={(c) => handlePropChange('inputBorderColor', c)} />
          <ColorField label="Màu nút gửi" color={props.buttonBgColor} onChange={(c) => handlePropChange('buttonBgColor', c)} />
          <ColorField label="Màu chữ nút gửi" color={props.buttonTextColor} onChange={(c) => handlePropChange('buttonTextColor', c)} />

          <hr className="border-gray-200" />

          {/* Opacity */}
          <Slider
            label="Độ mờ"
            min={0}
            max={1}
            step={0.01}
            value={props.opacity}
            onChange={(val) => handlePropChange('opacity', val)}
          />
        </div>
      </Section>

      <PaddingSection padding={props.padding} onChange={(p) => handlePropChange('padding', p)} />
      <BorderSection border={props.border} onChange={(b) => handlePropChange('border', b)} />
      <ShadowSection shadow={props.shadow} onChange={(s) => handlePropChange('shadow', s)} />
    </div>
  );
}
