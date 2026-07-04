// ============================================================
// IMAGE RIGHT PANEL
// Standalone panel for editing Image element properties.
// Imported by: RightPanel.tsx
// ============================================================

import { useRef } from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { ImageProperties, BorderStyleType, PageAlignType } from '../../types/editor.types';
import {
  Section,
  Slider,
  ColorField,
  Stepper,
  ImageIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  FlipHIcon,
  FlipVIcon,
  LockIcon,
  UnlockIcon,
  ShadowIcon,
  BorderIcon,
  ScissorsIcon,
  RefreshIcon,
  EraserIcon,
  RotateIcon,
  PaletteIcon,
  LayoutIcon,
  SettingsIcon,
} from './RightPanelShared';

// ── Constants ──────────────────────────────────────────────
const BORDER_STYLES: { value: BorderStyleType; label: string }[] = [
  { value: 'none', label: 'Không' },
  { value: 'solid', label: 'Liền' },
  { value: 'dashed', label: 'Nét đứt' },
  { value: 'dotted', label: 'Chấm' },
];

// ── Props ──────────────────────────────────────────────────
interface ImageRightPanelProps {
  id: string;
  props: ImageProperties;
  elementWidth: number;
  elementHeight: number;
}

// ── Component ──────────────────────────────────────────────
export function ImageRightPanel({ id, props, elementWidth, elementHeight }: ImageRightPanelProps) {
  const {
    updateImageProp,
    updateElementSize,
    updateElementRotation,
    selectedElement,
    pushHistory,
    setCropElementId,
  } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);

  /** Generic updater: set an image prop, optionally push undo history */
  const upd = <K extends keyof ImageProperties>(
    key: K,
    val: ImageProperties[K],
    shouldPushHistory = true
  ) => {
    updateImageProp(id, key, val);
    if (shouldPushHistory) pushHistory();
  };

  // ── Replace / file change ──────────────────────────────
  const handleReplaceImage = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        upd('src', ev.target.result as string);
        upd('alt', file.name, false);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Page alignment ─────────────────────────────────────
  const handlePageAlign = (align: PageAlignType) => {
    // TODO: calculate x based on canvasWidth and element width
    console.log('Align to page:', align);
  };

  // ── Aspect-ratio locked resize ─────────────────────────
  const aspectRatio = elementHeight !== 0 ? elementWidth / elementHeight : 1;

  const handleWidthChange = (w: number) => {
    if (props.lockAspectRatio) {
      updateElementSize(id, w, Math.round(w / aspectRatio));
    } else {
      updateElementSize(id, w, elementHeight);
    }
  };

  const handleHeightChange = (h: number) => {
    if (props.lockAspectRatio) {
      updateElementSize(id, Math.round(h * aspectRatio), h);
    } else {
      updateElementSize(id, elementWidth, h);
    }
  };

  const rotation = selectedElement?.rotation ?? 0;

  return (
    <>
      {/* ── Hình ảnh – Preview & Actions ──────────────────── */}
      <Section title="Hình ảnh" icon={<ImageIcon />} defaultOpen>
        {/* Thumbnail preview */}
        <div className="rp-image-preview-box">
          {props.src ? (
            <img src={props.src} alt={props.alt} className="rp-image-preview-thumb" />
          ) : (
            <div className="rp-image-preview-empty">
              <ImageIcon />
              <span>Chưa có ảnh</span>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />

        {/* Action buttons */}
        <div className="rp-image-actions">
          <button className="rp-image-action-btn" onClick={handleReplaceImage} title="Đổi ảnh">
            <RefreshIcon />
            <span>Đổi ảnh</span>
          </button>
          <button className="rp-image-action-btn" title="Cắt ảnh" onClick={() => setCropElementId(id)}>
            <ScissorsIcon />
            <span>Cắt ảnh</span>
          </button>
        </div>

        <button className="rp-remove-bg-btn" title="Xóa nền bằng AI">
          <EraserIcon />
          Xóa nền
        </button>
        <div className="rp-field" style={{ marginBlock: 25 }}>
          <span className="rp-label">Theo trang</span>
          <div className="rp-align-page-group">
            <button className="rp-align-btn" title="Căn trái" onClick={() => handlePageAlign('left')}><AlignLeftIcon /></button>
            <button className="rp-align-btn" title="Căn giữa" onClick={() => handlePageAlign('center')}><AlignCenterIcon /></button>
            <button className="rp-align-btn" title="Căn phải" onClick={() => handlePageAlign('right')}><AlignRightIcon /></button>
          </div>
        </div>
        <Slider
          label="Độ mờ"
          value={props.opacity}
          min={0} max={1} step={0.01}
          onChange={(v) => upd('opacity', v, false)}
          onCommit={pushHistory}
          displayVal={props.opacity.toFixed(2)}

        />
      </Section>





      {/* ── Lật ảnh ──────────────────────────────────────── */}
      <Section title="Lật ảnh" icon={<FlipHIcon />} defaultOpen>
        <div className="rp-flip-group">
          <button
            id="img-flip-x"
            className={`rp-flip-btn ${props.isFlippedX ? 'active' : ''}`}
            onClick={() => upd('isFlippedX', !props.isFlippedX)}
            title="Lật ngang"
          >
            <FlipHIcon />
            <span>Ngang</span>
          </button>
          <button
            id="img-flip-y"
            className={`rp-flip-btn ${props.isFlippedY ? 'active' : ''}`}
            onClick={() => upd('isFlippedY', !props.isFlippedY)}
            title="Lật dọc"
          >
            <FlipVIcon />
            <span>Dọc</span>
          </button>
        </div>
      </Section>

      {/* ── Biến đổi (W / H / Rotation / Lock) ──────────── */}
      <Section title="Biến đổi" icon={<RotateIcon />} defaultOpen>
        <div className="rp-field">
          <span className="rp-label">Kích thước</span>
          <button
            className={`rp-lock-btn ${props.lockAspectRatio ? 'active' : ''}`}
            onClick={() => upd('lockAspectRatio', !props.lockAspectRatio)}
            title={props.lockAspectRatio ? 'Mở khóa tỉ lệ' : 'Khóa tỉ lệ'}
          >
            {props.lockAspectRatio ? <LockIcon /> : <UnlockIcon />}
          </button>
        </div>
        <div className="rp-grid-2">
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">W</span>
            <input
              type="number" className="rp-grid-input"
              value={Math.round(elementWidth)}
              min={10} max={2000}
              onChange={(e) => handleWidthChange(Number(e.target.value))}
              onBlur={pushHistory}
            />
          </div>
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">H</span>
            <input
              type="number" className="rp-grid-input"
              value={Math.round(elementHeight)}
              min={10} max={2000}
              onChange={(e) => handleHeightChange(Number(e.target.value))}
              onBlur={pushHistory}
            />
          </div>
        </div>
        <Slider
          label="Xoay"
          value={rotation}
          min={0} max={360} step={1}
          onChange={(v) => updateElementRotation(id, v)}
          onCommit={pushHistory}
          displayVal={`${Math.round(rotation)}°`}
        />
      </Section>

      {/* ── Khoảng đệm ───────────────────────────────────── */}
      <Section title="Khoảng đệm" icon={<LayoutIcon />} defaultOpen={false}>
        <div className="rp-grid-2">
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">Trên</span>
            <input type="number" className="rp-grid-input" value={props.paddingTop}
              onChange={(e) => upd('paddingTop', Number(e.target.value), false)} onBlur={pushHistory} />
          </div>
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">Phải</span>
            <input type="number" className="rp-grid-input" value={props.paddingRight}
              onChange={(e) => upd('paddingRight', Number(e.target.value), false)} onBlur={pushHistory} />
          </div>
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">Dưới</span>
            <input type="number" className="rp-grid-input" value={props.paddingBottom}
              onChange={(e) => upd('paddingBottom', Number(e.target.value), false)} onBlur={pushHistory} />
          </div>
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">Trái</span>
            <input type="number" className="rp-grid-input" value={props.paddingLeft}
              onChange={(e) => upd('paddingLeft', Number(e.target.value), false)} onBlur={pushHistory} />
          </div>
        </div>
      </Section>

      {/* ── Đường viền ───────────────────────────────────── */}
      <Section title="Đường viền" icon={<BorderIcon />} defaultOpen={false}>
        <div className="rp-field">
          <span className="rp-label">Kiểu</span>
          <div className="rp-border-style-group">
            {BORDER_STYLES.map((bs) => (
              <button
                key={bs.value}
                className={`rp-border-style-btn ${props.borderStyle === bs.value ? 'active' : ''}`}
                onClick={() => upd('borderStyle', bs.value)}
                title={bs.label}
              >
                {bs.label}
              </button>
            ))}
          </div>
        </div>
        <div className="rp-field">
          <span className="rp-label">Độ dày</span>
          <Stepper value={props.borderWidth} onChange={(v) => upd('borderWidth', v, false)} onCommit={pushHistory} min={0} max={20} />
        </div>
        <ColorField label="Màu viền" color={props.borderColor}
          onChange={(c) => upd('borderColor', c, false)} onCommit={pushHistory} />
        <div className="rp-field">
          <span className="rp-label">Bo tròn</span>
          <Stepper value={props.borderRadius} onChange={(v) => upd('borderRadius', v, false)} onCommit={pushHistory} min={0} max={200} />
        </div>
      </Section>

      {/* ── Đổ bóng ──────────────────────────────────────── */}
      <Section title="Đổ bóng" icon={<ShadowIcon />} defaultOpen={false}>
        <div className="rp-grid-2">
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">X</span>
            <input type="number" className="rp-grid-input" value={props.shadowX}
              onChange={(e) => upd('shadowX', Number(e.target.value), false)} onBlur={pushHistory} />
          </div>
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">Y</span>
            <input type="number" className="rp-grid-input" value={props.shadowY}
              onChange={(e) => upd('shadowY', Number(e.target.value), false)} onBlur={pushHistory} />
          </div>
          <div className="rp-grid-input-wrap">
            <span className="rp-grid-input-label">Mờ</span>
            <input type="number" className="rp-grid-input" value={props.shadowBlur}
              onChange={(e) => upd('shadowBlur', Number(e.target.value), false)} onBlur={pushHistory} />
          </div>
        </div>
        <ColorField label="Màu bóng" color={props.shadowColor}
          onChange={(c) => upd('shadowColor', c, false)} onCommit={pushHistory} />
      </Section>

      {/* ── Nâng cao ─────────────────────────────────────── */}
      <Section title="Nâng cao" icon={<SettingsIcon />} defaultOpen={false}>
        <div className="rp-field">
          <span className="rp-label">Fit</span>
          <select
            className="rp-select"
            value={props.objectFit}
            onChange={(e) => upd('objectFit', e.target.value as ImageProperties['objectFit'])}
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
          </select>
        </div>
        <div className="rp-field">
          <span className="rp-label">Alt text</span>
          <input
            type="text"
            className="rp-input"
            value={props.alt}
            onChange={(e) => upd('alt', e.target.value, false)}
            onBlur={pushHistory}
          />
        </div>
      </Section>
    </>
  );
}
