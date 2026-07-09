import React, { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { CanvasElement, CountdownContent } from '../../../types/editor.types';
import { Section, Slider, TypeIcon, LayoutIcon, PaddingSection, BorderSection, ShadowSection } from '../RightPanelShared';
import { CustomColorPicker } from '../../CustomColorPicker';

export interface CountdownPanelProps {
  element: CanvasElement;
}

export function CountdownPanel({ element }: CountdownPanelProps) {
  const { updateCountdownProps } = useEditorStore();

  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showFrameColorPicker, setShowFrameColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);

  const props = element.countdownProps;
  if (!props) return null;

  const handlePropChange = <K extends keyof CountdownContent>(key: K, value: CountdownContent[K]) => {
    updateCountdownProps(element.id, { [key]: value });
  };

  return (
    <div className="right-panel-scroll">
      <Section title="Cài đặt thời gian" icon={<LayoutIcon />}>
        {/* Date Picker */}
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="rp-label">Ngày</span>
          <input
            type="date"
            className="rp-input"
            value={props.targetDate}
            onChange={(e) => handlePropChange('targetDate', e.target.value)}
            style={{ width: 140 }}
          />
        </div>

        {/* Time Picker */}
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Giờ</span>
          <input
            type="time"
            className="rp-input"
            value={props.targetTime}
            onChange={(e) => handlePropChange('targetTime', e.target.value)}
            style={{ width: 140 }}
          />
        </div>

        {/* Direction */}
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Hướng hiển thị</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--ed-border)',
                backgroundColor: props.direction === 'horizontal' ? '#f43f5e' : 'transparent',
                color: props.direction === 'horizontal' ? '#fff' : 'inherit',
                cursor: 'pointer',
                fontSize: 12
              }}
              onClick={() => handlePropChange('direction', 'horizontal')}
            >
              Ngang
            </button>
            <button
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--ed-border)',
                backgroundColor: props.direction === 'vertical' ? '#f43f5e' : 'transparent',
                color: props.direction === 'vertical' ? '#fff' : 'inherit',
                cursor: 'pointer',
                fontSize: 12
              }}
              onClick={() => handlePropChange('direction', 'vertical')}
            >
              Dọc
            </button>
          </div>
        </div>

        {/* Language */}
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Ngôn ngữ</span>
          <div style={{ display: 'flex', gap: 12 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="language"
                checked={props.language === 'vi'}
                onChange={() => handlePropChange('language', 'vi')}
              />
              Tiếng Việt
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="radio"
                name="language"
                checked={props.language === 'en'}
                onChange={() => handlePropChange('language', 'en')}
              />
              Tiếng Anh
            </label>
          </div>
        </div>

        {/* Spacing */}
        <Slider
          label="Khoảng cách (px)"
          value={props.spacing}
          min={0} max={100} step={1}
          onChange={(v) => handlePropChange('spacing', v)}
        />
      </Section>

      <Section title="Cài đặt giao diện" icon={<LayoutIcon />}>
        {/* Font */}
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="rp-label">Font chữ</span>
          <select
            className="rp-select"
            value={props.font}
            onChange={(e) => handlePropChange('font', e.target.value)}
            style={{ width: 140 }}
          >
            <option value="Arial">Arial</option>
            <option value="Times New Roman">Times New Roman</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Cormorant">Cormorant</option>
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
          </select>
        </div>

        {/* Font Size */}
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Cỡ chữ</span>
          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--ed-border)', borderRadius: 4 }}>
            <button
              onClick={() => handlePropChange('fontSize', Math.max(8, props.fontSize - 1))}
              style={{ width: 24, height: 24, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              -
            </button>
            <input
              type="number"
              value={props.fontSize}
              onChange={(e) => handlePropChange('fontSize', Math.max(8, Math.min(72, Number(e.target.value))))}
              style={{ width: 40, height: 24, border: 'none', textAlign: 'center', borderLeft: '1px solid var(--ed-border)', borderRight: '1px solid var(--ed-border)' }}
            />
            <button
              onClick={() => handlePropChange('fontSize', Math.min(72, props.fontSize + 1))}
              style={{ width: 24, height: 24, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >
              +
            </button>
          </div>
        </div>

        {/* Text Color */}
        <div className="rp-field" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Màu chữ</span>
          <div
            className="rp-color-swatch-circle"
            style={{ width: 24, height: 24, borderRadius: '50%', background: props.textColor, cursor: 'pointer', border: '1px solid var(--ed-border)' }}
            onClick={() => setShowTextColorPicker(!showTextColorPicker)}
          />
          {showTextColorPicker && (
            <div style={{ position: 'absolute', top: 30, right: 0, zIndex: 10 }}>
              <CustomColorPicker
                onClose={() => setShowTextColorPicker(false)}
                forceSolid={true}
                initialType="solid"
                initialColor={props.textColor}
                onChange={(data) => handlePropChange('textColor', data.color)}
                alignRight={true}
              />
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="rp-field" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Màu nền</span>
          <div
            className="rp-color-swatch-circle"
            style={{ width: 24, height: 24, borderRadius: '50%', background: props.backgroundColor, cursor: 'pointer', border: '1px solid var(--ed-border)' }}
            onClick={() => setShowBgColorPicker(!showBgColorPicker)}
          />
          {showBgColorPicker && (
            <div style={{ position: 'absolute', top: 30, right: 0, zIndex: 10 }}>
              <CustomColorPicker
                onClose={() => setShowBgColorPicker(false)}
                forceSolid={true}
                initialType="solid"
                initialColor={props.backgroundColor}
                onChange={(data) => handlePropChange('backgroundColor', data.color)}
                alignRight={true}
              />
            </div>
          )}
        </div>

        {/* Opacity */}
        <Slider
          label="Độ mờ"
          value={props.opacity}
          min={0} max={1} step={0.01}
          onChange={(v) => handlePropChange('opacity', v)}
        />
      </Section>

      <PaddingSection
        padding={{ top: props.paddingTop, right: props.paddingRight, bottom: props.paddingBottom, left: props.paddingLeft }}
        onChange={(p) => { handlePropChange('paddingTop', p.top); handlePropChange('paddingRight', p.right); handlePropChange('paddingBottom', p.bottom); handlePropChange('paddingLeft', p.left); }}
      />
      <BorderSection
        border={{ width: props.borderWidth, style: props.borderStyle, color: props.borderColor, radius: props.borderRadius }}
        onChange={(b) => { handlePropChange('borderWidth', b.width); handlePropChange('borderStyle', b.style); handlePropChange('borderColor', b.color); handlePropChange('borderRadius', b.radius); }}
      />
      <ShadowSection
        shadow={{ x: props.shadowX, y: props.shadowY, blur: props.shadowBlur, spread: props.shadowSpread, color: props.shadowColor }}
        onChange={(s) => { handlePropChange('shadowX', s.x); handlePropChange('shadowY', s.y); handlePropChange('shadowBlur', s.blur); handlePropChange('shadowSpread', s.spread); handlePropChange('shadowColor', s.color); }}
      />
    </div>
  );
}
