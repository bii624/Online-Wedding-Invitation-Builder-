// ============================================================
// RIGHT PANEL SHARED - Shared UI primitives & icons
// Used by: TextRightPanel.tsx, ImageRightPanel.tsx, RightPanel.tsx
// ============================================================

import { useState } from 'react';

// ── Icons (exported so panels can use them directly) ───────
export const BoldIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 4h8a4 4 0 010 8H6z" /><path d="M6 12h9a4 4 0 010 8H6z" /></svg>;
export const ItalicIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>;
export const UnderlineIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 3v7a6 6 0 0012 0V3" /><line x1="4" y1="21" x2="20" y2="21" /></svg>;
export const StrikeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M17.3 12H6.7" /><path d="M8 7c0-1.7 1.3-3 4-3s4 1.3 4 3" /><path d="M16 17c0 1.7-1.3 3-4 3s-4-1.3-4-3" /></svg>;
export const AlignLeftIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>;
export const AlignCenterIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="6" y1="12" x2="18" y2="12" /><line x1="4" y1="18" x2="20" y2="18" /></svg>;
export const AlignRightIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="6" y1="18" x2="21" y2="18" /></svg>;
export const AlignJustifyIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></svg>;
export const TypeIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></svg>;
export const PaletteIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1v-1.5c0-.41-.33-.75-.75-.75H12c-.83 0-1.5-.67-1.5-1.5S11.17 16 12 16c1.93 0 3.5-1.57 3.5-3.5C15.5 8.36 14.1 2 12 2z" /></svg>;
export const LayoutIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" /></svg>;
export const SettingsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 010 14.14M4.93 19.07A10 10 0 014.93 4.93" /><path d="M15.54 8.46a5 5 0 010 7.07M8.46 15.54A5 5 0 018.46 8.46" /></svg>;
export const ChevronDownIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>;
export const CursorIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M4 4l7.07 17 2.51-7.39L21 11.07z" /></svg>;
export const ImageIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>;
export const FlipHIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18" /><path d="M9 5L3 12l6 7" /><path d="M15 5l6 7-6 7" /></svg>;
export const FlipVIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 3v18" /><path d="M5 9l7-6 7 6" /><path d="M5 15l7 6 7-6" /></svg>;
export const LockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" /></svg>;
export const UnlockIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 019.9-1" /></svg>;
export const ShadowIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="14" height="14" rx="2" /><rect x="7" y="7" width="14" height="14" rx="2" opacity="0.4" /></svg>;
export const BorderIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
export const ScissorsIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><line x1="20" y1="4" x2="8.12" y2="15.88" /><line x1="14.47" y1="14.48" x2="20" y2="20" /><line x1="8.12" y1="8.12" x2="12" y2="12" /></svg>;
export const RefreshIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" /></svg>;
export const EraserIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 20H7L3 16l13-13 7 7-3 10z" /><path d="M7 20l3-3" /></svg>;
export const RotateIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21.5 2v6h-6" /><path d="M21.34 15.57a10 10 0 11-.57-8.38" /></svg>;

// ── Section (collapsible) ──────────────────────────────────
export interface SectionProps {
  title: string;
  icon: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}
export function Section({ title, icon, defaultOpen = true, children }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="right-section">
      <div className="right-section-header" onClick={() => setOpen((o) => !o)}>
        <span className="right-section-title">
          {icon}
          {title}
        </span>
        <span className={`right-section-chevron ${open ? 'open' : ''}`}>
          <ChevronDownIcon />
        </span>
      </div>
      {open && <div className="right-section-body">{children}</div>}
    </div>
  );
}

// ── Slider ─────────────────────────────────────────────────
export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  displayVal?: string;
}
export function Slider({ label, value, min = 0, max = 1, step = 0.01, onChange, onCommit, displayVal }: SliderProps) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className="rp-field" >
      <span className="rp-label" style={{ marginTop: "10px" }}>{label}</span>
      <div className="rp-slider-wrap">
        <input
          type="range"
          className="rp-slider"
          min={min} max={max} step={step}
          value={value}
          style={{ '--pct': `${pct}%`, marginTop: "10px" } as React.CSSProperties}
          onChange={(e) => onChange(Number(e.target.value))}
          onMouseUp={onCommit}
          onTouchEnd={onCommit}
        />
        <span className="rp-slider-val">{displayVal ?? value.toFixed(2)}</span>
      </div>
    </div>
  );
}

// ── ColorField ─────────────────────────────────────────────
export interface ColorFieldProps {
  label: string;
  color: string;
  onChange: (c: string) => void;
  onCommit?: () => void;
}
export function ColorField({ label, color, onChange, onCommit }: ColorFieldProps) {
  const isTransparent = color === 'transparent';
  return (
    <div className="rp-color-field">
      <span className="rp-color-label">{label}</span>
      <div className="rp-color-swatch-wrap">
        <div
          className={`rp-color-swatch ${isTransparent ? 'rp-color-transparent' : ''}`}
          style={!isTransparent ? { background: color } : {}}
        >
          <input
            type="color"
            value={isTransparent ? '#ffffff' : color}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onCommit}
          />
        </div>
        <span className="rp-color-hex">
          {isTransparent ? 'Trong suốt' : color.toUpperCase()}
        </span>
      </div>
    </div>
  );
}

// ── Stepper ────────────────────────────────────────────────
export interface StepperProps {
  value: number;
  onChange: (v: number) => void;
  onCommit?: () => void;
  min?: number;
  max?: number;
}
export function Stepper({ value, onChange, onCommit, min = 1, max = 200 }: StepperProps) {
  return (
    <div className="rp-stepper">
      <button
        className="rp-stepper-btn"
        onClick={() => { onChange(Math.max(min, value - 1)); onCommit?.(); }}
      >−</button>
      <input
        type="number"
        className="rp-stepper-input"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(Number(e.target.value))}
        onBlur={onCommit}
      />
      <button
        className="rp-stepper-btn"
        onClick={() => { onChange(Math.min(max, value + 1)); onCommit?.(); }}
      >+</button>
    </div>
  );
}

// ── Padding Section (Shared) ──────────────────────────────
export interface PaddingProps {
  top: number;
  right: number;
  bottom: number;
  left: number;
}
export interface PaddingSectionProps {
  padding: PaddingProps;
  onChange: (padding: PaddingProps) => void;
  onCommit?: () => void;
  defaultOpen?: boolean;
}
export function PaddingSection({ padding, onChange, onCommit, defaultOpen = false }: PaddingSectionProps) {
  return (
    <Section title="Khoảng đệm" icon={<LayoutIcon />} defaultOpen={defaultOpen}>
      <div className="rp-grid-2">
        <div className="rp-grid-input-wrap">
          <span className="rp-grid-input-label">Trên</span>
          <input type="number" className="rp-grid-input" value={padding.top}
            onChange={(e) => onChange({ ...padding, top: Number(e.target.value) })} onBlur={onCommit} />
        </div>
        <div className="rp-grid-input-wrap">
          <span className="rp-grid-input-label">Phải</span>
          <input type="number" className="rp-grid-input" value={padding.right}
            onChange={(e) => onChange({ ...padding, right: Number(e.target.value) })} onBlur={onCommit} />
        </div>
        <div className="rp-grid-input-wrap">
          <span className="rp-grid-input-label">Dưới</span>
          <input type="number" className="rp-grid-input" value={padding.bottom}
            onChange={(e) => onChange({ ...padding, bottom: Number(e.target.value) })} onBlur={onCommit} />
        </div>
        <div className="rp-grid-input-wrap">
          <span className="rp-grid-input-label">Trái</span>
          <input type="number" className="rp-grid-input" value={padding.left}
            onChange={(e) => onChange({ ...padding, left: Number(e.target.value) })} onBlur={onCommit} />
        </div>
      </div>
    </Section>
  );
}

// ── Border Section (Shared) ──────────────────────────────
export interface BorderProps {
  width: number;
  style: string;
  color: string;
  radius: number;
}
export interface BorderSectionProps {
  border: BorderProps;
  onChange: (border: BorderProps) => void;
  onCommit?: () => void;
  defaultOpen?: boolean;
}
export function BorderSection({ border, onChange, onCommit, defaultOpen = false }: BorderSectionProps) {
  return (
    <Section title="Đường viền" icon={<BorderIcon />} defaultOpen={defaultOpen}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="rp-field">
          <span className="rp-label">Kiểu viền</span>
          <select
            className="rp-input"
            value={border.style}
            onChange={(e) => { onChange({ ...border, style: e.target.value }); onCommit?.(); }}
          >
            <option value="none">Không viền</option>
            <option value="solid">Nét liền</option>
            <option value="dashed">Nét đứt</option>
            <option value="dotted">Chấm bi</option>
          </select>
        </div>
        {border.style !== 'none' && (
          <>
            <Slider label="Độ dày" value={border.width} min={0} max={20} onChange={(v) => onChange({ ...border, width: v })} onCommit={onCommit} />
            <ColorField label="Màu viền" color={border.color} onChange={(c) => onChange({ ...border, color: c })} onCommit={onCommit} />
          </>
        )}
        <Slider label="Bo góc" value={border.radius} min={0} max={100} onChange={(v) => onChange({ ...border, radius: v })} onCommit={onCommit} />
      </div>
    </Section>
  );
}

// ── Shadow Section (Shared) ──────────────────────────────
export interface ShadowProps {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
}
export interface ShadowSectionProps {
  shadow: ShadowProps;
  onChange: (shadow: ShadowProps) => void;
  onCommit?: () => void;
  defaultOpen?: boolean;
}
export function ShadowSection({ shadow, onChange, onCommit, defaultOpen = false }: ShadowSectionProps) {
  return (
    <Section title="Đổ bóng" icon={<ShadowIcon />} defaultOpen={defaultOpen}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Slider label="Trục X" value={shadow.x} min={-50} max={50} onChange={(v) => onChange({ ...shadow, x: v })} onCommit={onCommit} />
        <Slider label="Trục Y" value={shadow.y} min={-50} max={50} onChange={(v) => onChange({ ...shadow, y: v })} onCommit={onCommit} />
        <Slider label="Độ nhòe" value={shadow.blur} min={0} max={100} onChange={(v) => onChange({ ...shadow, blur: v })} onCommit={onCommit} />
        <Slider label="Độ lan" value={shadow.spread} min={-50} max={50} onChange={(v) => onChange({ ...shadow, spread: v })} onCommit={onCommit} />
        <ColorField label="Màu bóng" color={shadow.color} onChange={(c) => onChange({ ...shadow, color: c })} onCommit={onCommit} />
      </div>
    </Section>
  );
}
