import React, { useState } from 'react';
import { useEditorStore } from '../../../store/editorStore';
import type { AlbumContent } from '../../../types/editor.types';
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
  ImageIcon,
  PaletteIcon
} from '../RightPanelShared';
import { X } from 'lucide-react';
import { AssetPickerModal } from '../../Widgets/AssetPickerModal';

interface AlbumRightPanelProps {
  id: string;
  props: AlbumContent;
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div 
      className={`w-10 h-5 rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-rose-500' : 'bg-gray-300'}`}
      onClick={() => onChange(!checked)}
    >
      <div className={`w-3 h-3 bg-white rounded-full shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </div>
  );
}

export function AlbumRightPanel({ id, props }: AlbumRightPanelProps) {
  const { updateAlbumProps, pushHistory } = useEditorStore();
  const [showAssetPicker, setShowAssetPicker] = useState(false);

  const upd = <K extends keyof AlbumContent>(key: K, value: AlbumContent[K]) => {
    updateAlbumProps(id, { [key]: value });
    pushHistory();
  };

  const handleAddImages = () => setShowAssetPicker(true);

  const handleSelectAssets = (urls: string[]) => {
    upd('images', [...props.images, ...urls]);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...props.images];
    newImages.splice(index, 1);
    upd('images', newImages);
  };

  const handleClearAll = () => {
    upd('images', []);
  };

  return (
    <div className="right-panel-scroll">
      <Section title="Thiết lập Ảnh" icon={<ImageIcon />} defaultOpen>
        <div className="flex flex-col gap-4">
          
          {/* Quản lý ảnh */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800">Ảnh đã chọn <span className="text-gray-500 font-normal">({props.images.length} ảnh)</span></span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleClearAll}
                className="flex-1 py-2 px-3 border border-rose-500 text-rose-500 rounded-lg text-sm font-medium hover:bg-rose-50 transition-colors"
              >
                Xóa tất cả
              </button>
              <button 
                onClick={handleAddImages}
                className="flex-1 py-2 px-3 bg-rose-500 text-white rounded-lg text-sm font-medium hover:bg-rose-600 transition-colors"
              >
                Thêm ảnh
              </button>
            </div>

            {/* Danh sách ảnh */}
            <div className="flex flex-wrap gap-2 mt-2">
              {props.images.length === 0 ? (
                <div className="w-full py-6 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg text-gray-400">
                  <div className="mb-2 opacity-50 w-6 h-6"><ImageIcon /></div>
                  <span className="text-xs">Chưa chọn ảnh nào</span>
                </div>
              ) : (
                props.images.map((img, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-md overflow-hidden border border-gray-200 group">
                    <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Hiển thị ảnh nhỏ</span>
              <Toggle checked={props.showThumbnails} onChange={(v) => upd('showThumbnails', v)} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Nút Next/Prev</span>
              <Toggle checked={props.showNavButtons} onChange={(v) => upd('showNavButtons', v)} />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Fullscreen viewer</span>
              <Toggle checked={props.enableFullscreen} onChange={(v) => upd('enableFullscreen', v)} />
            </div>
          </div>

          {/* Kiểu hiển thị */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px', marginTop: '4px' }}>
            <span className="text-sm font-semibold text-gray-800" style={{ display: 'block', marginBottom: '8px' }}>Kiểu hiển thị</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '8px' }}>
              {[
                { id: '3d', name: '3D Flow' },
                { id: 'flat', name: 'Trượt phẳng' },
                { id: 'grid', name: 'Lưới ảnh' },
                { id: 'collage', name: 'Collage' },
                { id: 'slideshow', name: 'Trình chiếu' }
              ].map((s) => {
                const isActive = props.sliderStyle === s.id || (!props.sliderStyle && s.id === '3d');
                return (
                  <button
                    key={s.id}
                    className={`rp-border-style-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      upd('sliderStyle', s.id as any);
                    }}
                    style={{
                      padding: '6px 2px',
                      fontSize: '11px',
                      borderRadius: '6px',
                      border: isActive ? '1.5px solid var(--ed-primary, #F95E5A)' : '1px solid var(--ed-border, #e2e8f0)',
                      background: isActive ? 'var(--ed-primary-light, #fee2e2)' : 'transparent',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      color: isActive ? 'var(--ed-primary, #F95E5A)' : '#475569',
                      transition: 'all 0.2s',
                    }}
                  >
                    {s.name}
                  </button>
                );
              })}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Hiệu ứng & Delay (chỉ hiện khi là Trình chiếu) */}
          {props.sliderStyle === 'slideshow' && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Hiệu ứng chuyển</span>
                <select 
                  className="border border-gray-300 rounded-md text-sm px-2 py-1 outline-none focus:border-rose-400"
                  value={props.effectType}
                  onChange={(e) => upd('effectType', e.target.value as any)}
                >
                  <option value="fade">Fade</option>
                  <option value="slide">Slide</option>
                  <option value="zoom">Zoom</option>
                </select>
              </div>

              <div className="rp-field">
                <Slider 
                  label="Độ trễ (s)" 
                  value={props.delay} 
                  min={1} max={10} step={0.5} 
                  onChange={(v) => upd('delay', v)} 
                />
              </div>

              <hr className="border-gray-200" />
            </>
          )}

          <div className="rp-field">
            <span className="rp-label">Căn chỉnh</span>
            <div className="rp-align-group" style={{ flex: 1 }}>
              <button 
                className={`rp-align-btn ${props.alignment === 'left' ? 'active' : ''}`} 
                onClick={() => upd('alignment', 'left')}
              >
                <AlignLeftIcon />
              </button>
              <button 
                className={`rp-align-btn ${props.alignment === 'center' ? 'active' : ''}`} 
                onClick={() => upd('alignment', 'center')}
              >
                <AlignCenterIcon />
              </button>
              <button 
                className={`rp-align-btn ${props.alignment === 'right' ? 'active' : ''}`} 
                onClick={() => upd('alignment', 'right')}
              >
                <AlignRightIcon />
              </button>
            </div>
          </div>

        </div>
      </Section>

      {/* Style Section */}
      <Section title="Cài đặt giao diện" icon={<PaletteIcon />}>
        <ColorField 
          label="Màu nền" 
          color={props.backgroundColor} 
          onChange={(c) => upd('backgroundColor', c)} 
        />
      </Section>

      <PaddingSection padding={props.padding} onChange={(p) => upd('padding', p)} />
      <BorderSection border={props.border} onChange={(b) => upd('border', b)} />
      <ShadowSection shadow={props.shadow} onChange={(s) => upd('shadow', s)} />

      <AssetPickerModal 
        isOpen={showAssetPicker} 
        onClose={() => setShowAssetPicker(false)} 
        onSelect={handleSelectAssets} 
      />
    </div>
  );
}
