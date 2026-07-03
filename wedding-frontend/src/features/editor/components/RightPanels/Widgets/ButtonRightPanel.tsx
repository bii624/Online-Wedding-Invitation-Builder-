import React from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { ButtonContactContent } from '../../../types/editor.types';
import {
  Section,
  Slider,
  ColorField,
  LayoutIcon,
  PaletteIcon,
  PaddingSection,
  BorderSection,
  ShadowSection,
} from '../../RightPanels/RightPanelShared';

const fonts = [
  'Arial', 'Inter', 'Playfair Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Oswald', 'Merriweather', 'Georgia',
  'Great Vibes', 'Dancing Script', 'Pacifico',
];

interface ButtonRightPanelProps {
  id: string;
}

export function ButtonRightPanel({ id }: ButtonRightPanelProps) {
  const { elements, updateButtonContactProps } = useEditorStore();
  
  const element = elements.find((el) => el.id === id);
  if (!element || element.type !== 'button_contact' || !element.buttonContactProps) {
    return null;
  }

  const props = element.buttonContactProps;

  const handlePropChange = <K extends keyof ButtonContactContent>(key: K, value: ButtonContactContent[K]) => {
    updateButtonContactProps(element.id, { [key]: value });
  };

  return (
    <div className="rp-panel">
      <Section title="Thiết lập nút" icon={<LayoutIcon />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#3f3f46' }}>Số điện thoại</span>
            <input
              type="tel"
              className="rp-input"
              value={props.phoneNumber}
              onChange={(e) => handlePropChange('phoneNumber', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#3f3f46' }}>Nội dung nút</span>
            <input
              type="text"
              className="rp-input"
              value={props.buttonText}
              onChange={(e) => handlePropChange('buttonText', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="rp-label">Hiển thị Icon</span>
            <label className="rp-switch" style={{ display: 'flex', alignItems: 'center', background: props.showIcon ? '#f43f5e' : '#e4e4e7', borderRadius: '14px', cursor: 'pointer', position: 'relative', width: '76px', height: '24px' }}>
              <input 
                type="checkbox" 
                checked={props.showIcon} 
                onChange={(e) => handlePropChange('showIcon', e.target.checked)} 
                style={{ opacity: 0, position: 'absolute', zIndex: -1 }}
              />
              {props.showIcon && <span style={{ color: 'white', fontSize: '11px', position: 'absolute', left: '8px', fontWeight: 600 }}>Hiển thị</span>}
              {!props.showIcon && <span style={{ color: '#71717a', fontSize: '11px', position: 'absolute', right: '8px', fontWeight: 600 }}>Ẩn</span>}
              <span style={{ 
                width: '20px', 
                height: '20px', 
                background: 'white', 
                borderRadius: '50%', 
                position: 'absolute', 
                left: props.showIcon ? 'calc(100% - 22px)' : '2px',
                top: '2px',
                transition: 'all 0.2s ease',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}></span>
            </label>
          </div>

        </div>
      </Section>

      <Section title="Cài đặt giao diện" icon={<PaletteIcon />}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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

          <ColorField label="Màu chữ" color={props.textColor} onChange={(c) => handlePropChange('textColor', c)} />
          <ColorField label="Màu nền" color={props.backgroundColor} onChange={(c) => handlePropChange('backgroundColor', c)} />
        </div>
      </Section>

      <PaddingSection padding={props.padding} onChange={(p) => handlePropChange('padding', p)} />
      <BorderSection border={props.border} onChange={(b) => handlePropChange('border', b)} />
      <ShadowSection shadow={props.shadow} onChange={(s) => handlePropChange('shadow', s)} />
    </div>
  );
}
