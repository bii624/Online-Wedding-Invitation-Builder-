// ============================================================
// TEXT RIGHT PANEL
// Standalone panel for editing Text element properties.
// Imported by: RightPanel.tsx
// ============================================================

import { useState } from 'react';
import { useEditorStore } from '../../store/editorStore';
import type { TextProperties, AlignType } from '../../types/editor.types';
import {
  Section,
  Slider,
  ColorField,
  Stepper,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  StrikeIcon,
  AlignLeftIcon,
  AlignCenterIcon,
  AlignRightIcon,
  AlignJustifyIcon,
  TypeIcon,
  PaletteIcon,
  LayoutIcon,
  SettingsIcon,
  LockIcon,
  UnlockIcon,
} from './RightPanelShared';
import {
  ArrowUp,
  ArrowDown,
  ArrowUpToLine,
  ArrowDownToLine,
  AlignStartVertical,
  AlignEndVertical,
  AlignCenterVertical,
  AlignCenterHorizontal,
  AlignStartHorizontal,
  AlignEndHorizontal,
} from 'lucide-react';

// ── Font list ──────────────────────────────────────────────
const FONTS = [
  'Inter', 'Playfair Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Oswald', 'Merriweather', 'Georgia', 'Arial',
  'Great Vibes', 'Dancing Script', 'Pacifico',
];

// ── Props ──────────────────────────────────────────────────
interface TextRightPanelProps {
  id: string;
  props: TextProperties;
}

// ── Component ──────────────────────────────────────────────
export function TextRightPanel({ id, props }: TextRightPanelProps) {
  const [lockAspectRatio, setLockAspectRatio] = useState(false);
  const [activeTab, setActiveTab] = useState<'arrange' | 'layers'>('arrange');

  const {
    updateTextProp,
    pushHistory,
    selectedElement,
    updateElementSize,
    updateElementPosition,
    updateElementRotation,
    bringElementForward,
    sendElementBackward,
    bringElementToFront,
    sendElementToBack,
    alignElementToPage,
    selectElement,
    elements
  } = useEditorStore();

  const elementWidth = selectedElement?.width ?? 0;
  const elementHeight = selectedElement?.height ?? 0;
  const elementX = selectedElement?.x ?? 0;
  const elementY = selectedElement?.y ?? 0;
  const rotation = selectedElement?.rotation ?? 0;

  const aspectRatio = elementHeight !== 0 ? elementWidth / elementHeight : 1;

  const handleWidthChange = (w: number) => {
    if (lockAspectRatio) {
      updateElementSize(id, w, Math.round(w / aspectRatio));
    } else {
      updateElementSize(id, w, elementHeight);
    }
  };

  const handleHeightChange = (h: number) => {
    if (lockAspectRatio) {
      updateElementSize(id, Math.round(h * aspectRatio), h);
    } else {
      updateElementSize(id, elementWidth, h);
    }
  };

  const allElementsSorted = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  /** Generic updater: set a text prop, optionally push undo history */
  const upd = <K extends keyof TextProperties>(
    key: K,
    val: TextProperties[K],
    shouldPushHistory = true
  ) => {
    updateTextProp(id, key, val);
    if (shouldPushHistory) pushHistory();
  };

  const toggleBold      = () => upd('fontWeight',     props.fontWeight     === 'bold'         ? 'normal'       : 'bold');
  const toggleItalic    = () => upd('fontStyle',      props.fontStyle      === 'italic'       ? 'normal'       : 'italic');
  const toggleUnderline = () => upd('textDecoration', props.textDecoration === 'underline'    ? 'none'         : 'underline');
  const toggleStrike    = () => upd('textDecoration', props.textDecoration === 'line-through' ? 'none'         : 'line-through');

  return (
    <>
      {/* ── Kiểu chữ ────────────────────────────────────── */}
      <Section title="Kiểu chữ" icon={<TypeIcon />} defaultOpen>
        {/* Format buttons */}
        <div className="rp-field" style={{ alignItems: 'flex-start', flexDirection: 'column', gap: 8 }}>
          <div className="rp-format-group">
            <button id="fmt-bold"      className={`rp-format-btn ${props.fontWeight     === 'bold'         ? 'active' : ''}`} onClick={toggleBold}      title="In đậm"><BoldIcon /></button>
            <button id="fmt-italic"    className={`rp-format-btn ${props.fontStyle      === 'italic'       ? 'active' : ''}`} onClick={toggleItalic}    title="In nghiêng"><ItalicIcon /></button>
            <button id="fmt-underline" className={`rp-format-btn ${props.textDecoration === 'underline'    ? 'active' : ''}`} onClick={toggleUnderline} title="Gạch chân"><UnderlineIcon /></button>
            <button id="fmt-strike"    className={`rp-format-btn ${props.textDecoration === 'line-through' ? 'active' : ''}`} onClick={toggleStrike}    title="Gạch ngang"><StrikeIcon /></button>
          </div>
        </div>

        {/* Căn lề */}
        <div className="rp-field">
          <span className="rp-label">Căn lề</span>
          <div className="rp-align-group" style={{ flex: 1 }}>
            {(['left', 'center', 'right', 'justify'] as AlignType[]).map((a) => (
              <button
                key={a}
                id={`align-${a}`}
                className={`rp-align-btn ${props.textAlign === a ? 'active' : ''}`}
                onClick={() => upd('textAlign', a)}
                title={a}
              >
                {a === 'left'    && <AlignLeftIcon />}
                {a === 'center'  && <AlignCenterIcon />}
                {a === 'right'   && <AlignRightIcon />}
                {a === 'justify' && <AlignJustifyIcon />}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="rp-field">
          <span className="rp-label">Font</span>
          <select
            id="sel-font"
            className="rp-select"
            value={props.fontFamily}
            onChange={(e) => upd('fontFamily', e.target.value)}
          >
            {FONTS.map((f) => (
              <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
            ))}
          </select>
        </div>

        {/* Cỡ chữ */}
        <div className="rp-field">
          <span className="rp-label">Cỡ chữ</span>
          <Stepper value={props.fontSize} onChange={(v) => upd('fontSize', v, false)} onCommit={pushHistory} min={6} max={200} />
        </div>

        <Slider label="Giãn chữ" value={props.letterSpacing} min={-5} max={20} step={0.5}
          onChange={(v) => upd('letterSpacing', v, false)} onCommit={pushHistory}
          displayVal={`${props.letterSpacing}px`} />

        <Slider label="Chiều cao" value={props.lineHeight} min={0.8} max={3} step={0.05}
          onChange={(v) => upd('lineHeight', v, false)} onCommit={pushHistory}
          displayVal={props.lineHeight.toFixed(2)} />
      </Section>

      {/* ── Màu sắc ─────────────────────────────────────── */}
      <Section title="Màu sắc" icon={<PaletteIcon />} defaultOpen>
        <ColorField label="Màu chữ" color={props.color}
          onChange={(c) => upd('color', c, false)} onCommit={pushHistory} />
        <ColorField label="Màu nền" color={props.backgroundColor}
          onChange={(c) => upd('backgroundColor', c, false)} onCommit={pushHistory} />
        <Slider label="Độ mờ" value={props.opacity} min={0} max={1} step={0.01}
          onChange={(v) => upd('opacity', v, false)} onCommit={pushHistory}
          displayVal={props.opacity.toFixed(2)} />
      </Section>

      {/* ── Sắp xếp & Căn chỉnh ────────────────────────── */}
      <Section title="Sắp xếp & Căn chỉnh" icon={<LayoutIcon />} defaultOpen>
        <div className="rp-tabs-container mb-4" style={{ display: 'flex', borderBottom: '1px solid var(--ed-border)', paddingBottom: '8px' }}>
          <button 
            className={`rp-tab-btn ${activeTab === 'arrange' ? 'active' : ''}`}
            onClick={() => setActiveTab('arrange')}
            style={{ 
              flex: 1, 
              padding: '6px 12px', 
              background: 'none', 
              border: 'none', 
              fontWeight: 600, 
              fontSize: '13px',
              color: activeTab === 'arrange' ? 'var(--ed-accent, #f43f5e)' : 'var(--ed-text-muted)',
              borderBottom: activeTab === 'arrange' ? '2px solid var(--ed-accent, #f43f5e)' : 'none',
              cursor: 'pointer'
            }}
          >
            Sắp xếp
          </button>
          <button 
            className={`rp-tab-btn ${activeTab === 'layers' ? 'active' : ''}`}
            onClick={() => setActiveTab('layers')}
            style={{ 
              flex: 1, 
              padding: '6px 12px', 
              background: 'none', 
              border: 'none', 
              fontWeight: 600, 
              fontSize: '13px',
              color: activeTab === 'layers' ? 'var(--ed-accent, #f43f5e)' : 'var(--ed-text-muted)',
              borderBottom: activeTab === 'layers' ? '2px solid var(--ed-accent, #f43f5e)' : 'none',
              cursor: 'pointer'
            }}
          >
            Lớp
          </button>
        </div>

        {activeTab === 'arrange' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="rp-grid-2">
              <button 
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                onClick={() => bringElementForward(id)}
                title="Đưa lên một lớp"
              >
                <ArrowUp size={14} /> Lên 1 lớp
              </button>
              <button 
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                onClick={() => sendElementBackward(id)}
                title="Hạ xuống một lớp"
              >
                <ArrowDown size={14} /> Xuống 1 lớp
              </button>
              <button 
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                onClick={() => bringElementToFront(id)}
                title="Đưa lên trên cùng"
              >
                <ArrowUpToLine size={14} /> Trên cùng
              </button>
              <button 
                className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                onClick={() => sendElementToBack(id)}
                title="Hạ xuống dưới cùng"
              >
                <ArrowDownToLine size={14} /> Dưới cùng
              </button>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ed-text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Căn chỉnh trang
              </div>
              <div className="rp-grid-2">
                <button 
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  onClick={() => alignElementToPage(id, 'top')}
                >
                  <AlignStartVertical size={14} /> Căn trên
                </button>
                <button 
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  onClick={() => alignElementToPage(id, 'left')}
                >
                  <AlignStartHorizontal size={14} /> Căn trái
                </button>
                <button 
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  onClick={() => alignElementToPage(id, 'middle')}
                >
                  <AlignCenterVertical size={14} /> Giữa dọc
                </button>
                <button 
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  onClick={() => alignElementToPage(id, 'center')}
                >
                  <AlignCenterHorizontal size={14} /> Giữa ngang
                </button>
                <button 
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  onClick={() => alignElementToPage(id, 'bottom')}
                >
                  <AlignEndVertical size={14} /> Căn dưới
                </button>
                <button 
                  className="flex items-center justify-center gap-1.5 py-2 px-3 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 bg-white hover:bg-zinc-50 active:scale-95 transition-all cursor-pointer"
                  onClick={() => alignElementToPage(id, 'right')}
                >
                  <AlignEndHorizontal size={14} /> Căn phải
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--ed-text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Biến đổi
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-500 font-medium">Khóa tỉ lệ</span>
                <button
                  className={`rp-lock-btn ${lockAspectRatio ? 'active' : ''}`}
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  title={lockAspectRatio ? 'Mở khóa tỉ lệ' : 'Khóa tỉ lệ'}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid var(--ed-border)',
                    borderRadius: '6px',
                    background: lockAspectRatio ? 'var(--ed-bg-active, #fff1f2)' : '#ffffff',
                    color: lockAspectRatio ? 'var(--ed-accent, #f43f5e)' : 'var(--ed-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  {lockAspectRatio ? <LockIcon /> : <UnlockIcon />}
                </button>
              </div>
              <div className="rp-grid-2">
                <div className="rp-grid-input-wrap">
                  <span className="rp-grid-input-label">W</span>
                  <input
                    type="number" className="rp-grid-input"
                    value={Math.round(elementWidth)}
                    onChange={(e) => handleWidthChange(Number(e.target.value))}
                    onBlur={pushHistory}
                  />
                </div>
                <div className="rp-grid-input-wrap">
                  <span className="rp-grid-input-label">H</span>
                  <input
                    type="number" className="rp-grid-input"
                    value={Math.round(elementHeight)}
                    onChange={(e) => handleHeightChange(Number(e.target.value))}
                    onBlur={pushHistory}
                  />
                </div>
                <div className="rp-grid-input-wrap">
                  <span className="rp-grid-input-label">X</span>
                  <input
                    type="number" className="rp-grid-input"
                    value={Math.round(elementX)}
                    onChange={(e) => {
                      updateElementPosition(id, Number(e.target.value), elementY);
                    }}
                    onBlur={pushHistory}
                  />
                </div>
                <div className="rp-grid-input-wrap">
                  <span className="rp-grid-input-label">Y</span>
                  <input
                    type="number" className="rp-grid-input"
                    value={Math.round(elementY)}
                    onChange={(e) => {
                      updateElementPosition(id, elementX, Number(e.target.value));
                    }}
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
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
            {allElementsSorted.map((el) => {
              const isSelected = el.id === id;
              return (
                <div 
                  key={el.id}
                  onClick={() => selectElement(el.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'var(--ed-bg-hover, #f3f4f6)' : '#ffffff',
                    border: isSelected ? '1px solid var(--ed-accent, #f43f5e)' : '1px solid var(--ed-border, #e2e8f0)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  className="hover:bg-zinc-50"
                >
                  <span style={{ fontSize: '12px', fontWeight: isSelected ? 700 : 500, color: 'var(--ed-text-primary)' }}>
                    {el.type === 'text' ? `📝 ${el.textProps?.content?.substring(0, 15) || 'Văn bản'}` : el.type === 'image' ? '🖼️ Hình ảnh' : '⬟ Hình khối'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--ed-text-muted)', fontWeight: 600 }}>
                    Z: {el.zIndex}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ── Bố cục & Căn chỉnh (Padding) ─────────────────── */}
      <Section title="Khoảng đệm (Padding)" icon={<LayoutIcon />} defaultOpen={false}>
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

      {/* ── Đường viền ──────────────────────────────────── */}
      <Section title="Đường viền" icon={<SettingsIcon />} defaultOpen={false}>
        <div className="rp-field">
          <span className="rp-label">Độ dày</span>
          <Stepper value={props.borderWidth} onChange={(v) => upd('borderWidth', v, false)} onCommit={pushHistory} min={0} max={20} />
        </div>
        <ColorField label="Màu viền" color={props.borderColor}
          onChange={(c) => upd('borderColor', c, false)} onCommit={pushHistory} />
        <div className="rp-field">
          <span className="rp-label">Bo tròn</span>
          <Stepper value={props.borderRadius} onChange={(v) => upd('borderRadius', v, false)} onCommit={pushHistory} min={0} max={100} />
        </div>
      </Section>

      {/* ── Đổ bóng ─────────────────────────────────────── */}
      <Section title="Đổ bóng" icon={<SettingsIcon />} defaultOpen={false}>
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
          <span className="rp-label">Nội dung</span>
          <input
            type="text"
            className="rp-input"
            value={props.content}
            onChange={(e) => upd('content', e.target.value, false)}
            onBlur={pushHistory}
          />
        </div>
      </Section>
    </>
  );
}
