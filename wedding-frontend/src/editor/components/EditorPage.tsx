// ============================================================
// EDITOR PAGE - Main editor layout assembler
// ============================================================

import '../styles/editor.css';
import { Header } from './Header';
import { LeftToolbar } from './LeftToolbar';
import { MainCanvas } from './Canvas';
import { RightPanel } from './RightPanel';
import { Filmstrip } from './Filmstrip';
import { AIColorPanel } from './AIColorPanel';

export function EditorPage() {
  return (
    <div className="editor-root">
      {/* ── Header ──────────────────────── */}
      <Header />

      {/* ── Main Body ───────────────────── */}
      <div className="editor-body">
        {/* Left Toolbar */}
        <LeftToolbar />

        {/* Center: Canvas + Filmstrip */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <MainCanvas />
          <Filmstrip />
        </div>

        {/* Right Properties Panel */}
        <RightPanel />
      </div>

      {/* ── Floating AI Color Panel ──────── */}
      <AIColorPanel />
    </div>
  );
}
