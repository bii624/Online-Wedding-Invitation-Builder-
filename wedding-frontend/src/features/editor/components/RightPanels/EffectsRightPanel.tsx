// ==========================================================
// EFFECTS RIGHT PANEL – Animation controls for any element
// ==========================================================
import { useState, useCallback } from 'react';
import { useEditorStore } from '../../store/editorStore';
import { DEFAULT_ANIMATION_PROPS } from '../../store/editorStore';
import type { AnimationProperties } from '../../types/editor.types';
import '../../styles/EffectsRightPanel.css';

// ── Entry effect list ──────────────────────────────────────
export const ENTRY_EFFECTS: { id: string; label: string }[] = [
  { id: 'none',                label: 'Chưa chọn' },
  { id: 'bounce',              label: 'Bounce' },
  { id: 'flash',               label: 'Flash' },
  { id: 'pulse',               label: 'Pulse' },
  { id: 'rubberBand',          label: 'RubberBand' },
  { id: 'shakeX',              label: 'Shake' },
  { id: 'headShake',           label: 'HeadShake' },
  { id: 'swing',               label: 'Swing' },
  { id: 'tada',                label: 'Tada' },
  { id: 'wobble',              label: 'Wobble' },
  { id: 'jello',               label: 'Jello' },
  { id: 'heartBeat',           label: 'HeartBeat' },
  { id: 'bounceIn',            label: 'BounceIn' },
  { id: 'bounceInDown',        label: 'BounceInDown' },
  { id: 'bounceInLeft',        label: 'BounceInLeft' },
  { id: 'bounceInRight',       label: 'BounceInRight' },
  { id: 'bounceInUp',          label: 'BounceInUp' },
  { id: 'fadeIn',              label: 'FadeIn' },
  { id: 'fadeInDown',          label: 'FadeInDown' },
  { id: 'fadeInDownBig',       label: 'FadeInDownBig' },
  { id: 'fadeInLeft',          label: 'FadeInLeft' },
  { id: 'fadeInLeftBig',       label: 'FadeInLeftBig' },
  { id: 'fadeInRight',         label: 'FadeInRight' },
  { id: 'fadeInRightBig',      label: 'FadeInRightBig' },
  { id: 'fadeInUp',            label: 'FadeInUp' },
  { id: 'fadeInUpBig',         label: 'FadeInUpBig' },
  { id: 'flip',                label: 'Flip' },
  { id: 'flipInX',             label: 'FlipInX' },
  { id: 'flipInY',             label: 'FlipInY' },
  { id: 'lightSpeedInRight',   label: 'LightSpeedIn' },
  { id: 'lightSpeedInLeft',    label: 'LightSpeedInLeft' },
  { id: 'rotateIn',            label: 'RotateIn' },
  { id: 'rotateInDownLeft',    label: 'RotateInDownLeft' },
  { id: 'rotateInDownRight',   label: 'RotateInDownRight' },
  { id: 'rotateInUpLeft',      label: 'RotateInUpLeft' },
  { id: 'rotateInUpRight',     label: 'RotateInUpRight' },
  { id: 'zoomIn',              label: 'ZoomIn' },
  { id: 'zoomInDown',          label: 'ZoomInDown' },
  { id: 'zoomInLeft',          label: 'ZoomInLeft' },
  { id: 'zoomInRight',         label: 'ZoomInRight' },
  { id: 'zoomInUp',            label: 'ZoomInUp' },
  { id: 'rollIn',              label: 'RollIn' },
  { id: 'jackInTheBox',        label: 'JackInTheBox' },
  { id: 'backInDown',          label: 'BackInDown' },
  { id: 'backInLeft',          label: 'BackInLeft' },
  { id: 'backInRight',         label: 'BackInRight' },
  { id: 'backInUp',            label: 'BackInUp' },
  { id: 'slideInUp',           label: 'SlideInUp' },
  { id: 'slideInDown',         label: 'SlideInDown' },
  { id: 'slideInLeft',         label: 'SlideInLeft' },
  { id: 'slideInRight',        label: 'SlideInRight' },
];

// ── Loop effect list ───────────────────────────────────────
const LOOP_EFFECTS: { id: string; label: string }[] = [
  { id: 'none',               label: 'Không có' },
  { id: 'bay-lo-lung',        label: 'Bay lơ lửng' },
  { id: 'nay',                label: 'Nảy' },
  { id: 'nhap-nhay',          label: 'Nhấp nháy' },
  { id: 'xoay-tron',          label: 'Xoay tròn' },
  { id: 'lac',                label: 'Lắc' },
  { id: 'lac-lu',             label: 'Lắc lư' },
  { id: 'lac-lu-nhun-nhay',   label: 'Lắc lư nhún nhảy' },
];

const EASING_OPTIONS = [
  { id: 'ease',          label: 'Ease' },
  { id: 'ease-in',       label: 'Ease In' },
  { id: 'ease-out',      label: 'Ease Out' },
  { id: 'linear',        label: 'Linear' },
  { id: 'ease-in-out',   label: 'Elastic' },
];

// ── Toggle Switch ──────────────────────────────────────────
function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      className={`erp-toggle ${checked ? 'on' : ''}`}
      onClick={() => onChange(!checked)}
    />
  );
}

// ── Slider with number input ───────────────────────────────
function SliderInput({
  label, value, min, max, step, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="erp-row">
      <span className="erp-label">{label}</span>
      <div className="erp-slider-wrap">
        <input
          type="range" className="erp-slider"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
        <input
          type="number" className="erp-number"
          min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        />
      </div>
    </div>
  );
}

// ── Effects picker modal ───────────────────────────────────
function EffectPickerModal({
  currentEffect, onSelect, onClose,
}: {
  currentEffect: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="erp-modal-backdrop" onClick={onClose}>
      <div className="erp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="erp-modal-header">
          <span>Chọn hiệu ứng</span>
          <button className="erp-modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="erp-modal-grid">
          {ENTRY_EFFECTS.map((ef) => (
            <div
              key={ef.id}
              className={`erp-effect-item ${currentEffect === ef.id ? 'selected' : ''}`}
              onMouseEnter={() => setHovered(ef.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => { onSelect(ef.id); onClose(); }}
            >
              <div
                className={`erp-effect-preview ${
                  hovered === ef.id && ef.id !== 'none'
                    ? `animate__animated animate__${ef.id}`
                    : ''
                }`}
              />
              <span className="erp-effect-label">{ef.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main EffectsRightPanel ─────────────────────────────────
export function EffectsRightPanel({ elementId }: { elementId: string }) {
  const { selectedElement, updateAnimationProps } = useEditorStore();
  const [showPicker, setShowPicker] = useState(false);

  const ap: AnimationProperties = selectedElement?.animationProps ?? DEFAULT_ANIMATION_PROPS;

  const update = useCallback(
    (props: Partial<AnimationProperties>) => updateAnimationProps(elementId, props),
    [elementId, updateAnimationProps]
  );

  const currentEntryLabel = ENTRY_EFFECTS.find((e) => e.id === ap.entryEffect)?.label ?? 'Chưa chọn';

  return (
    <div className="erp-root">
      {showPicker && (
        <EffectPickerModal
          currentEffect={ap.entryEffect}
          onSelect={(id) => update({ entryEffect: id })}
          onClose={() => setShowPicker(false)}
        />
      )}

      {/* ── Section: Hiệu ứng xuất hiện ─────────────────── */}
      <div className="erp-section">
        <div className="erp-section-header">
          <span className="erp-section-title">Hiệu ứng chuyển động</span>
        </div>

        <div className="erp-row">
          <span className="erp-label">Bật hiệu ứng chuyển động</span>
          <Toggle checked={ap.entryEnabled} onChange={(v) => update({ entryEnabled: v })} />
        </div>

        {ap.entryEnabled && (
          <>
            <div className="erp-row">
              <span className="erp-label">Hiệu ứng</span>
              <button className="erp-preview-btn" title="Xem trước" onClick={() => setShowPicker(true)}>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/></svg>
              </button>
            </div>
            <div className="erp-row">
              <button className="erp-effect-selector" onClick={() => setShowPicker(true)}>
                <span>{currentEntryLabel}</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
              </button>
            </div>

            <SliderInput label="Thời gian (s)" value={ap.entryDuration} min={0.1} max={5} step={0.1} onChange={(v) => update({ entryDuration: v })} />
            <SliderInput label="Độ trễ (s)"   value={ap.entryDelay}    min={0}   max={5} step={0.1} onChange={(v) => update({ entryDelay: v })} />

            <div className="erp-row">
              <span className="erp-label">Kiểu chuyển động</span>
              <select
                className="erp-select"
                value={ap.entryEasing}
                onChange={(e) => update({ entryEasing: e.target.value })}
              >
                {EASING_OPTIONS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* ── Section: Chuyển động liên tục ───────────────── */}
      <div className="erp-section">
        <div className="erp-section-header">
          <span className="erp-section-title">Chuyển động liên tục</span>
        </div>

        <div className="erp-row">
          <span className="erp-label">Bật chuyển động liên tục</span>
          <Toggle checked={ap.loopEnabled} onChange={(v) => update({ loopEnabled: v })} />
        </div>

        {ap.loopEnabled && (
          <>
            <div className="erp-row">
              <span className="erp-label">Hiệu ứng</span>
              <select
                className="erp-select"
                value={ap.loopEffect}
                onChange={(e) => update({ loopEffect: e.target.value })}
              >
                {LOOP_EFFECTS.map((o) => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>

            <SliderInput label="Thời gian (s)" value={ap.loopDuration} min={0.2} max={10} step={0.1} onChange={(v) => update({ loopDuration: v })} />
            <SliderInput label="Độ trễ (s)"   value={ap.loopDelay}    min={0}   max={5}  step={0.1} onChange={(v) => update({ loopDelay: v })} />
          </>
        )}
      </div>
    </div>
  );
}
