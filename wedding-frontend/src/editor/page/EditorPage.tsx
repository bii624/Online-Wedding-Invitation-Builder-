// ============================================================
// EDITOR PAGE - Main editor layout assembler
// ============================================================

import styles from '../styles/editor.module.css';
import { Header } from '../components/Header';
import { LeftToolbar } from '../components/LeftToolbar';
import { MainCanvas } from '../components/Canvas';
import { RightPanel } from '../components/RightPanel';
import { Filmstrip } from '../components/Filmstrip';
import { AIColorPanel } from '../components/AIColorPanel';
import { ImageCropModal } from '../components/ImageCropModal';

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';

const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds

export function EditorPage() {
  const {
    selectedElement,
    deleteElement,
    duplicateElement,
    saveCanvasNow,
    loadCardData,
    cardId,
  } = useEditorStore();

  const [searchParams] = useSearchParams();

  // ── Load card từ URL ?id=<uuid> ──────────────────────────
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      loadCardData(id);
    }
  }, []);

  // ── Auto-save mỗi 30s ────────────────────────────────────
  useEffect(() => {
    if (!cardId) return;

    const timer = setInterval(() => {
      saveCanvasNow();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [cardId]);

  // ── Keyboard shortcuts ────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (!selectedElement) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteElement(selectedElement.id);
      }

      // Allow Ctrl+C or Ctrl+D (or Cmd) to duplicate
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'c' || e.key.toLowerCase() === 'd')) {
        e.preventDefault();
        duplicateElement(selectedElement.id);
      }

      // Ctrl+S → save ngay lập tức
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCanvasNow();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, duplicateElement, saveCanvasNow]);

  return (
    <div className={styles['editor-root']}>
      {/* ── Header ──────────────────────── */}
      <Header />

      {/* ── Main Body ───────────────────── */}
      <div className={styles['editor-body']}>
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
