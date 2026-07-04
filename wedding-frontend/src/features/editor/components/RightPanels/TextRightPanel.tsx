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
  PaddingSection,
  BorderSection,
  ShadowSection,
  FontField,
} from './RightPanelShared';

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

  const toggleBold = () => upd('fontWeight', props.fontWeight === 'bold' ? 'normal' : 'bold');
  const toggleItalic = () => upd('fontStyle', props.fontStyle === 'italic' ? 'normal' : 'italic');
  const toggleUnderline = () => upd('textDecoration', props.textDecoration === 'underline' ? 'none' : 'underline');
  const toggleStrike = () => upd('textDecoration', props.textDecoration === 'line-through' ? 'none' : 'line-through');

  return (
    <>
      {/* ── Kiểu chữ ────────────────────────────────────── */}
      <Section title="Kiểu chữ" icon={<TypeIcon />} defaultOpen>
        {/* Format buttons */}
        <div className="rp-field" >
          <span className="rp-label">Kiểu</span>
          <div className="rp-format-group">
            <button id="fmt-bold" className={`rp-format-btn ${props.fontWeight === 'bold' ? 'active' : ''}`} onClick={toggleBold} title="In đậm"><BoldIcon /></button>
            <button id="fmt-italic" className={`rp-format-btn ${props.fontStyle === 'italic' ? 'active' : ''}`} onClick={toggleItalic} title="In nghiêng"><ItalicIcon /></button>
            <button id="fmt-underline" className={`rp-format-btn ${props.textDecoration === 'underline' ? 'active' : ''}`} onClick={toggleUnderline} title="Gạch chân"><UnderlineIcon /></button>
            <button id="fmt-strike" className={`rp-format-btn ${props.textDecoration === 'line-through' ? 'active' : ''}`} onClick={toggleStrike} title="Gạch ngang"><StrikeIcon /></button>
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
                {a === 'left' && <AlignLeftIcon />}
                {a === 'center' && <AlignCenterIcon />}
                {a === 'right' && <AlignRightIcon />}
                {a === 'justify' && <AlignJustifyIcon />}
              </button>
            ))}
          </div>
        </div>

        {/* Font */}
        <FontField 
          fontFamily={props.fontFamily} 
          onChange={(font) => upd('fontFamily', font)} 
        />

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
      <PaddingSection
        padding={{ top: props.paddingTop, right: props.paddingRight, bottom: props.paddingBottom, left: props.paddingLeft }}
        onChange={(p) => { upd('paddingTop', p.top, false); upd('paddingRight', p.right, false); upd('paddingBottom', p.bottom, false); upd('paddingLeft', p.left, false); }}
        onCommit={pushHistory}
        defaultOpen={true}
      />

      <BorderSection
        border={{ width: props.borderWidth, style: props.borderWidth > 0 ? 'solid' : 'none', color: props.borderColor, radius: props.borderRadius }}
        onChange={(b) => {
          const newWidth = b.style === 'none' ? 0 : (b.width === 0 ? 1 : b.width);
          upd('borderWidth', newWidth, false);
          upd('borderColor', b.color, false);
          upd('borderRadius', b.radius, false);
        }}
        onCommit={pushHistory}
      />

      <ShadowSection
        shadow={{ x: props.shadowX, y: props.shadowY, blur: props.shadowBlur, spread: 0, color: props.shadowColor }}
        onChange={(s) => { upd('shadowX', s.x, false); upd('shadowY', s.y, false); upd('shadowBlur', s.blur, false); upd('shadowColor', s.color, false); }}
        onCommit={pushHistory}
      />

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
