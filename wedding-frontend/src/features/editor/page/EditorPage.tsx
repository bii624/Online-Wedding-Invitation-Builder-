// ============================================================
// EDITOR PAGE - Main editor layout assembler
// ============================================================

import styles from '../styles/editor.module.css';
import { Header } from '../components/Header';
import { LeftToolbar } from '../components/LeftToolbar';
import { MainCanvas } from '../components/Canvas';
import { RightPanel } from '../components/RightPanel';
import { Filmstrip } from '../components/Filmstrip';
import { ImageCropModal } from '../components/ImageCropModal';
import LoadingPage from '../../../pages/Loading/Loadingpage';

import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useEditorStore } from '../store/editorStore';
import { useAuthStore } from '../../../store/authStore';
import { assetsApi } from '../../../api/assetsApi';
import type { Asset } from '../../../api/assetsApi';

const AUTO_SAVE_INTERVAL_MS = 30_000; // 30 seconds

export function EditorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isInitialized } = useAuthStore();
  const {
    selectedElement,
    deleteElement,
    duplicateElement,
    saveCanvasNow,
    loadCardData,
    loadTemplateData,
    saveTemplateNow,
    cardId,
    templateId,
    editorMode,
    isLoadingTemplate,
  } = useEditorStore();

  const [searchParams] = useSearchParams();

  // ── Load dữ liệu từ URL params ───────────────────────────
  useEffect(() => {
    if (isInitialized) {
      if (!user) {
        navigate('/login', { replace: true });
        return;
      } else if (user.role === 'admin' && !location.pathname.includes('/design/template')) {
        navigate('/login', { replace: true });
        return;
      }

      const cardIdParam = searchParams.get('id');
      const templateIdParam = searchParams.get('templateId');

      if (templateIdParam) {
        // Chế độ thiết kế template (admin)
        loadTemplateData(templateIdParam);
      } else if (cardIdParam) {
        // Chế độ thiết kế card (user)
        loadCardData(cardIdParam);
      }
    }
  }, [isInitialized, user, searchParams]);

  // ── Auto-save mỗi 30s ────────────────────────────────────
  useEffect(() => {
    if (editorMode === 'template') {
      if (!templateId) return;
      const timer = setInterval(() => saveTemplateNow(), AUTO_SAVE_INTERVAL_MS);
      return () => clearInterval(timer);
    } else {
      if (!cardId) return;
      const timer = setInterval(() => saveCanvasNow(), AUTO_SAVE_INTERVAL_MS);
      return () => clearInterval(timer);
    }
  }, [cardId, templateId, editorMode]);

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
        if (editorMode === 'template') {
          saveTemplateNow();
        } else {
          saveCanvasNow();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, deleteElement, duplicateElement, saveCanvasNow, saveTemplateNow, editorMode]);

  // ── Inject Custom Fonts ────────────────────────────────────
  const [fontsData, setFontsData] = useState<{ systemFonts: Asset[], myFonts: Asset[] }>({ systemFonts: [], myFonts: [] });

  useEffect(() => {
    if (isInitialized && user) {
      assetsApi.getFonts().then(data => setFontsData(data)).catch(err => console.error("Failed to load fonts", err));
    }
  }, [isInitialized, user]);

  useEffect(() => {
    let styleEl = document.getElementById('custom-fonts');
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = 'custom-fonts';
      document.head.appendChild(styleEl);
    }

    let css = '';
    const allFonts = [...fontsData.systemFonts, ...fontsData.myFonts];
    allFonts.forEach(font => {
      // thumbnailUrl lưu tên phông chữ gốc
      if (font.thumbnailUrl) {
        css += `
          @font-face {
            font-family: "${font.thumbnailUrl}";
            src: url("${font.url}");
            font-display: swap;
          }
        `;
      }
    });
    styleEl.innerHTML = css;
  }, [fontsData]);

  return (
    <div className={styles['editor-root']}>
      {/* ── Header ──────────────────────── */}
      <Header />

      {/* ── Main Body ───────────────────── */}
      <div className={styles['editor-body']}>
        {isLoadingTemplate ? (
          <div style={{ flex: 1 }}>
            <LoadingPage message="Đang tải mẫu..." />
          </div>
        ) : (
          <>
            {/* Left Toolbar */}
            <LeftToolbar />

            {/* Center: Canvas + Filmstrip */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <MainCanvas />
              <Filmstrip />
            </div>

            {/* Right Properties Panel */}
            <RightPanel />
          </>
        )}
      </div>

      {/* ── Modals ───────────────────────── */}
      <ImageCropModal />
    </div>
  );
}
