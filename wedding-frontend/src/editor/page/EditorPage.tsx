// ============================================================
// EDITOR PAGE - Main editor layout assembler
// ============================================================

import '../styles/editor.css';
import { Header } from '../components/Header';
import { LeftToolbar } from '../components/LeftToolbar';
import { MainCanvas } from '../components/Canvas';
import { RightPanel } from '../components/RightPanel';
import { Filmstrip } from '../components/Filmstrip';
import { AIColorPanel } from '../components/AIColorPanel';
import { ImageCropModal } from '../components/ImageCropModal';

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

      {/* ── Modals ───────────────────────── */}
      <ImageCropModal />
    </div>
  );
}
