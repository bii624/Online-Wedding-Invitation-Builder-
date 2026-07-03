import React, { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { CanvasElement, MapContent } from '../../../types/editor.types';
import { Section, Slider, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, LayoutIcon, PaddingSection, BorderSection, ShadowSection } from '../RightPanelShared';
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

        <div className="rp-field" style={{ marginTop: 20 }}>
          <span className="rp-label">Căn chỉnh</span>
          <div className="rp-align-group" style={{ flex: 1 }}>
            <button
              className={`rp-align-btn ${props.align === 'left' ? 'active' : ''}`}
              onClick={() => handlePropChange('align', 'left')}
              title="Trái"
            >
              <AlignLeftIcon />
            </button>
            <button
              className={`rp-align-btn ${props.align === 'center' ? 'active' : ''}`}
              onClick={() => handlePropChange('align', 'center')}
              title="Giữa"
            >
              <AlignCenterIcon />
            </button>
            <button
              className={`rp-align-btn ${props.align === 'right' ? 'active' : ''}`}
              onClick={() => handlePropChange('align', 'right')}
              title="Phải"
            >
              <AlignRightIcon />
            </button>
          </div>
        </div>
      </Section>

      <PaddingSection
        padding={{ top: props.paddingTop || 0, right: props.paddingRight || 0, bottom: props.paddingBottom || 0, left: props.paddingLeft || 0 }}
        onChange={(p) => { handlePropChange('paddingTop', p.top); handlePropChange('paddingRight', p.right); handlePropChange('paddingBottom', p.bottom); handlePropChange('paddingLeft', p.left); }}
      />
      <BorderSection
        border={{ width: props.borderWidth || 0, style: props.borderStyle || 'none', color: props.borderColor || 'transparent', radius: props.borderRadius || 0 }}
        onChange={(b) => { handlePropChange('borderWidth', b.width); handlePropChange('borderStyle', b.style); handlePropChange('borderColor', b.color); handlePropChange('borderRadius', b.radius); }}
      />
      <ShadowSection
        shadow={{ x: props.shadowX || 0, y: props.shadowY || 0, blur: props.shadowBlur || 0, spread: props.shadowSpread || 0, color: props.shadowColor || 'transparent' }}
        onChange={(s) => { handlePropChange('shadowX', s.x); handlePropChange('shadowY', s.y); handlePropChange('shadowBlur', s.blur); handlePropChange('shadowSpread', s.spread); handlePropChange('shadowColor', s.color); }}
      />

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
