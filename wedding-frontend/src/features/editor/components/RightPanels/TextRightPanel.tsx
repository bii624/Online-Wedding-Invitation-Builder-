// ============================================================
// TEXT RIGHT PANEL
// Standalone panel for editing Text element properties.
// Imported by: RightPanel.tsx
// ============================================================

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
} from './RightPanelShared';

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
  const { updateTextProp, pushHistory } = useEditorStore();

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

      {/* ── Bố cục & Căn chỉnh (Padding) ─────────────────── */}
      <Section title="Bố cục & Căn chỉnh" icon={<LayoutIcon />} defaultOpen>
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
