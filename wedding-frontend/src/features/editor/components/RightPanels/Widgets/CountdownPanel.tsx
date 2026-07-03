import React, { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { CanvasElement, CountdownContent } from '../../../types/editor.types';
import { Section, Slider, LayoutIcon, BorderIcon, ShadowIcon } from '../RightPanelShared';
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

      <Section title="Khoảng đệm (Padding)" icon={<LayoutIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Trái (Left)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingLeft} onChange={(e) => handlePropChange('paddingLeft', Number(e.target.value))} />
          </div>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Trên (Top)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingTop} onChange={(e) => handlePropChange('paddingTop', Number(e.target.value))} />
          </div>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Phải (Right)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingRight} onChange={(e) => handlePropChange('paddingRight', Number(e.target.value))} />
          </div>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Dưới (Bottom)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingBottom} onChange={(e) => handlePropChange('paddingBottom', Number(e.target.value))} />
          </div>
        </div>
      </Section>

      <Section title="Đường viền" icon={<BorderIcon />}>
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="rp-label">Kiểu</span>
          <select
            className="rp-select"
            value={props.borderStyle}
            onChange={(e) => handlePropChange('borderStyle', e.target.value)}
            style={{ width: 140 }}
          >
            <option value="none">Không có</option>
            <option value="solid">Nét liền</option>
            <option value="dashed">Nét đứt</option>
            <option value="dotted">Nét chấm</option>
          </select>
        </div>

        <div className="rp-field" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Màu viền</span>
          <div
            className="rp-color-swatch-circle"
            style={{ width: 24, height: 24, borderRadius: '50%', background: props.borderColor, cursor: 'pointer', border: '1px solid var(--ed-border)' }}
            onClick={() => setShowBorderColorPicker(!showBorderColorPicker)}
          />
          {showBorderColorPicker && (
            <div style={{ position: 'absolute', top: 30, right: 0, zIndex: 10 }}>
              <CustomColorPicker
                onClose={() => setShowBorderColorPicker(false)}
                forceSolid={true}
                initialType="solid"
                initialColor={props.borderColor}
                onChange={(data) => handlePropChange('borderColor', data.color)}
                alignRight={true}
              />
            </div>
          )}
        </div>

        <Slider
          label="Độ dày"
          value={props.borderWidth}
          min={0} max={50} step={1}
          onChange={(v) => handlePropChange('borderWidth', v)}
        />
        <Slider
          label="Bo góc"
          value={props.borderRadius}
          min={0} max={100} step={1}
          onChange={(v) => handlePropChange('borderRadius', v)}
        />
      </Section>

      <Section title="Đổ bóng" icon={<ShadowIcon />}>
        <div className="rp-field" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span className="rp-label">Màu bóng</span>
          <div
            className="rp-color-swatch-circle"
            style={{ width: 24, height: 24, borderRadius: '50%', background: props.shadowColor, cursor: 'pointer', border: '1px solid var(--ed-border)' }}
            onClick={() => setShowShadowColorPicker(!showShadowColorPicker)}
          />
          {showShadowColorPicker && (
            <div style={{ position: 'absolute', top: 30, right: 0, zIndex: 10 }}>
              <CustomColorPicker
                onClose={() => setShowShadowColorPicker(false)}
                forceSolid={true}
                initialType="solid"
                initialColor={props.shadowColor}
                onChange={(data) => handlePropChange('shadowColor', data.color)}
                alignRight={true}
              />
            </div>
          )}
        </div>

        <Slider
          label="Trục X"
          value={props.shadowX}
          min={-50} max={50} step={1}
          onChange={(v) => handlePropChange('shadowX', v)}
        />
        <Slider
          label="Trục Y"
          value={props.shadowY}
          min={-50} max={50} step={1}
          onChange={(v) => handlePropChange('shadowY', v)}
        />
        <Slider
          label="Độ mờ (Blur)"
          value={props.shadowBlur}
          min={0} max={100} step={1}
          onChange={(v) => handlePropChange('shadowBlur', v)}
        />
        <Slider
          label="Độ lan (Spread)"
          value={props.shadowSpread}
          min={-50} max={50} step={1}
          onChange={(v) => handlePropChange('shadowSpread', v)}
        />
      </Section>
    </div>
  );
}
