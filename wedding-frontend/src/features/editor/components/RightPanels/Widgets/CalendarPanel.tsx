import React, { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { CanvasElement } from '../../../types/editor.types';
import { Section, Slider, LayoutIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, PaddingSection, BorderSection, ShadowSection } from '../RightPanelShared';
import { CustomColorPicker } from '../../CustomColorPicker';
import { DEFAULT_CALENDAR_PROPS } from '../../../store/editorStore';

export interface CalendarPanelProps {
  element: CanvasElement;
}

export function CalendarPanel({ element }: CalendarPanelProps) {
  const { updateCalendarProps, activeRightTab } = useEditorStore();

  // Local state for color pickers
  const [showTextColorPicker, setShowTextColorPicker] = useState(false);
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [showPrimaryColorPicker, setShowPrimaryColorPicker] = useState(false);
  const [showSecondaryColorPicker, setShowSecondaryColorPicker] = useState(false);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);

  const rawProps: Partial<import('../../../types/editor.types').CalendarContent> = element.calendarProps || {};
  const props = { ...DEFAULT_CALENDAR_PROPS, ...rawProps, padding: { ...DEFAULT_CALENDAR_PROPS.padding, ...(rawProps.padding || {}) }, border: { ...DEFAULT_CALENDAR_PROPS.border, ...(rawProps.border || {}) }, shadow: { ...DEFAULT_CALENDAR_PROPS.shadow, ...(rawProps.shadow || {}) } };

  const handlePropChange = (key: keyof typeof props, value: any) => {
    updateCalendarProps(element.id, { [key]: value });
  };

  const handleNestedPropChange = (group: 'padding' | 'border' | 'shadow', key: string, value: any) => {
    updateCalendarProps(element.id, {
      [group]: { ...props[group], [key]: value }
    });
  };

  if (activeRightTab === 'effects') {
    return (
      <div className="right-panel-scroll">
        <Section title="Hiệu ứng hoạt hình" icon={<LayoutIcon />} defaultOpen>
          <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="rp-label">Animation trái tim</span>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="toggle-heart-anim" 
                checked={true} // Default is true for Framer Motion continuous pulse
                readOnly
              />
              <label htmlFor="toggle-heart-anim"></label>
            </div>
          </div>
          <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 8 }}>
            Trái tim sẽ tự động nhịp đập liên tục (pulse).
          </p>
        </Section>
      </div>
    );
  }

  return (
    <div className="right-panel-scroll">
      {/* SECTION 1: Thiết lập lịch */}
      <Section title="Thiết lập lịch" icon={<LayoutIcon />} defaultOpen>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="rp-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
            <span className="rp-label">Chọn ngày</span>
            <input 
              type="date" 
              className="rp-input" 
              value={props.primaryDate} 
              onChange={(e) => handlePropChange('primaryDate', e.target.value)} 
              style={{ width: '100%' }} 
            />
          </div>

          <div className="rp-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label htmlFor="show-two-dates" className="rp-label" style={{ cursor: 'pointer', margin: 0 }}>Hiển thị 2 ngày</label>
            <input 
              type="checkbox" 
              id="show-two-dates" 
              checked={props.showTwoDates} 
              onChange={(e) => {
                handlePropChange('showTwoDates', e.target.checked);
                if (!e.target.checked) handlePropChange('secondaryDate', null);
              }} 
            />
          </div>

          {props.showTwoDates && (
            <div style={{ padding: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="rp-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                <span className="rp-label" style={{ fontSize: 12 }}>Ngày thứ 2</span>
                <input 
                  type="date" 
                  className="rp-input" 
                  value={props.secondaryDate || ''} 
                  onChange={(e) => handlePropChange('secondaryDate', e.target.value)} 
                  style={{ width: '100%' }} 
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="rp-label" style={{ fontSize: 12 }}>Tên ngày 1</span>
                  <input 
                    type="text" 
                    className="rp-input" 
                    value={props.groomSideLabel} 
                    onChange={(e) => handlePropChange('groomSideLabel', e.target.value)} 
                    style={{ width: '100%' }} 
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span className="rp-label" style={{ fontSize: 12 }}>Tên ngày 2</span>
                  <input 
                    type="text" 
                    className="rp-input" 
                    value={props.brideSideLabel} 
                    onChange={(e) => handlePropChange('brideSideLabel', e.target.value)} 
                    style={{ width: '100%' }} 
                  />
                </div>
              </div>

              <div className="rp-field" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="rp-label" style={{ fontSize: 12 }}>Màu ngày 2</span>
                <div
                  onClick={() => setShowSecondaryColorPicker(!showSecondaryColorPicker)}
                  style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: props.secondaryColor, border: '1px solid #ccc', cursor: 'pointer' }}
                />
                {showSecondaryColorPicker && (
                  <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 10 }}>
                    <CustomColorPicker
                      initialColor={props.secondaryColor}
                      onChange={(c) => handlePropChange('secondaryColor', c.color)}
                      onClose={() => setShowSecondaryColorPicker(false)}
                      alignRight={true}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rp-field" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
            <span className="rp-label">Giao diện</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%' }}>
              {[1, 2, 3].map(id => (
                <div 
                  key={id}
                  onClick={() => handlePropChange('templateId', id)}
                  style={{
                    height: '60px',
                    backgroundColor: '#fff',
                    border: props.templateId === id ? '2px solid #f43f5e' : '1px solid #e2e8f0',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: '#64748b', fontWeight: 600
                  }}
                >
                  Mẫu {id}
                </div>
              ))}
            </div>
          </div>

          <div className="rp-field">
            <span className="rp-label">Căn chỉnh</span>
            <div className="rp-align-group" style={{ flex: 1 }}>
              {(['left', 'center', 'right'] as const).map(align => (
                <button
                  key={align}
                  className={`rp-align-btn ${props.alignment === align ? 'active' : ''}`}
                  onClick={() => handlePropChange('alignment', align)}
                >
                  {align === 'left' ? <AlignLeftIcon /> : align === 'center' ? <AlignCenterIcon /> : <AlignRightIcon />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* SECTION 2: Cài đặt giao diện */}
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
            >-</button>
            <input
              type="number"
              value={props.fontSize}
              onChange={(e) => handlePropChange('fontSize', Math.max(8, Math.min(72, Number(e.target.value))))}
              style={{ width: 40, height: 24, border: 'none', textAlign: 'center', borderLeft: '1px solid var(--ed-border)', borderRight: '1px solid var(--ed-border)' }}
            />
            <button
              onClick={() => handlePropChange('fontSize', Math.min(72, props.fontSize + 1))}
              style={{ width: 24, height: 24, background: 'transparent', border: 'none', cursor: 'pointer' }}
            >+</button>
          </div>
        </div>

        {/* Colors */}
        {[{ label: 'Màu chữ', key: 'textColor', state: showTextColorPicker, setter: setShowTextColorPicker },
          { label: 'Màu nền', key: 'backgroundColor', state: showBgColorPicker, setter: setShowBgColorPicker },
          { label: 'Màu chính', key: 'primaryColor', state: showPrimaryColorPicker, setter: setShowPrimaryColorPicker }
        ].map(item => (
          <div key={item.key} className="rp-field" style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
            <span className="rp-label">{item.label}</span>
            <div
              onClick={() => item.setter(!item.state)}
              style={{
                width: 24, height: 24, borderRadius: '50%',
                backgroundColor: (props as any)[item.key] || 'transparent',
                border: '1px solid #ccc', cursor: 'pointer',
                backgroundImage: (props as any)[item.key] === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : undefined,
                backgroundSize: '8px 8px', backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px'
              }}
            />
            {item.state && (
              <div style={{ position: 'absolute', right: 0, top: 32, zIndex: 10 }}>
                <CustomColorPicker
                  initialColor={(props as any)[item.key]}
                  onChange={(c) => handlePropChange(item.key as any, c.color)}
                  onClose={() => item.setter(false)}
                  alignRight={true}
                />
              </div>
            )}
          </div>
        ))}

        <div style={{ marginTop: 16 }}>
          <Slider label="Độ mờ" value={props.opacity} min={0} max={1} step={0.01} onChange={(v) => handlePropChange('opacity', v)} />
        </div>
      </Section>

      {/* SECTION 3: Khoảng đệm */}
      <PaddingSection padding={props.padding} onChange={(p) => handlePropChange('padding', p)} />
      <BorderSection border={props.border} onChange={(b) => handlePropChange('border', b)} />
      <ShadowSection shadow={props.shadow} onChange={(s) => handlePropChange('shadow', s)} />
    </div>
  );
}
