import React, { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { CanvasElement, MapContent } from '../../../types/editor.types';
import { Section, Slider, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, LayoutIcon, BorderIcon, ShadowIcon } from '../RightPanelShared';
import { CustomColorPicker } from '../../CustomColorPicker';
import { MapPickerModal } from '../../Widgets/MapPickerModal';

export interface MapRightPanelProps {
  element: CanvasElement;
}

export function MapRightPanel({ element }: MapRightPanelProps) {
  const props = element.mapProps;
  const updateMapProps = useEditorStore((state) => state.updateMapProps);
  const [showBorderColorPicker, setShowBorderColorPicker] = useState(false);
  const [showShadowColorPicker, setShowShadowColorPicker] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  if (!props) return null;

  const handlePropChange = <K extends keyof MapContent>(key: K, value: MapContent[K]) => {
    updateMapProps(element.id, { [key]: value });
  };

  return (
    <div className="rp-panel">
      <Section title="Cài đặt Bản đồ" icon={<LayoutIcon />}>
        <div className="rp-field" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span className="rp-label" style={{ whiteSpace: 'nowrap', margin: 0 }}>Địa chỉ & Tọa độ</span>

          <button
            className="rp-btn"
            style={{ flex: 1, padding: '8px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f43f5e', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, gap: '6px' }}
            onClick={() => setShowMapModal(true)}
            title="Chọn trên bản đồ"
          >
            Chọn địa chỉ
          </button>
        </div>

        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
          <span className="rp-label">Tỉ lệ Zoom</span>
          <input
            type="number"
            className="rp-input"
            style={{ width: 120 }}
            value={props.zoomLevel ?? 15}
            onChange={(e) => handlePropChange('zoomLevel', Number(e.target.value))}
            min={1}
            max={20}
          />
        </div>

        <div style={{ marginTop: 16 }}>
          <Slider
            label="Độ mờ"
            value={props.opacity ?? 1}
            min={0}
            max={1}
            step={0.01}
            onChange={(v) => handlePropChange('opacity', v)}
          />
        </div>

        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
          <span className="rp-label">Căn chỉnh</span>
          <div style={{ display: 'flex', gap: 4 }}>
            <button
              className={`rp-icon-btn ${props.align === 'left' ? 'active' : ''}`}
              onClick={() => handlePropChange('align', 'left')}
              title="Trái"
            >
              <AlignLeftIcon />
            </button>
            <button
              className={`rp-icon-btn ${props.align === 'center' ? 'active' : ''}`}
              onClick={() => handlePropChange('align', 'center')}
              title="Giữa"
            >
              <AlignCenterIcon />
            </button>
            <button
              className={`rp-icon-btn ${props.align === 'right' ? 'active' : ''}`}
              onClick={() => handlePropChange('align', 'right')}
              title="Phải"
            >
              <AlignRightIcon />
            </button>
          </div>
        </div>
      </Section>

      <Section title="Khoảng đệm (Padding)" icon={<LayoutIcon />}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Trái (Left)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingLeft ?? 0} onChange={(e) => handlePropChange('paddingLeft', Number(e.target.value))} />
          </div>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Trên (Top)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingTop ?? 0} onChange={(e) => handlePropChange('paddingTop', Number(e.target.value))} />
          </div>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Phải (Right)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingRight ?? 0} onChange={(e) => handlePropChange('paddingRight', Number(e.target.value))} />
          </div>
          <div className="rp-field">
            <span className="rp-label" style={{ fontSize: 11 }}>Dưới (Bottom)</span>
            <input type="number" className="rp-input" style={{ width: '100%' }} value={props.paddingBottom ?? 0} onChange={(e) => handlePropChange('paddingBottom', Number(e.target.value))} />
          </div>
        </div>
      </Section>

      <Section title="Đường viền" icon={<BorderIcon />}>
        <div className="rp-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="rp-label">Kiểu</span>
          <select
            className="rp-select"
            value={props.borderStyle || 'none'}
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
          value={props.borderWidth ?? 0}
          min={0} max={50} step={1}
          onChange={(v) => handlePropChange('borderWidth', v)}
        />
        <Slider
          label="Bo góc"
          value={props.borderRadius ?? 0}
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
          value={props.shadowX ?? 0}
          min={-50} max={50} step={1}
          onChange={(v) => handlePropChange('shadowX', v)}
        />
        <Slider
          label="Trục Y"
          value={props.shadowY ?? 0}
          min={-50} max={50} step={1}
          onChange={(v) => handlePropChange('shadowY', v)}
        />
        <Slider
          label="Độ mờ (Blur)"
          value={props.shadowBlur ?? 0}
          min={0} max={100} step={1}
          onChange={(v) => handlePropChange('shadowBlur', v)}
        />
        <Slider
          label="Độ lan (Spread)"
          value={props.shadowSpread ?? 0}
          min={-50} max={50} step={1}
          onChange={(v) => handlePropChange('shadowSpread', v)}
        />
      </Section>

      {showMapModal && (
        <MapPickerModal
          initialAddress={props.address}
          initialLat={props.lat}
          initialLng={props.lng}
          onClose={() => setShowMapModal(false)}
          onSave={(address, lat, lng) => {
            updateMapProps(element.id, { address, lat: lat.toString(), lng: lng.toString() });
            setShowMapModal(false);
          }}
        />
      )}
    </div>
  );
}
