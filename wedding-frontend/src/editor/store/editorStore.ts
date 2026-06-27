// ============================================================
// EDITOR STORE - Zustand state management for the editor
// ============================================================

import { create } from 'zustand';
import type {
  EditorState,
  ToolType,
  CanvasElement,
  TextProperties,
} from '../types/editor.types';

const DEFAULT_TEXT_PROPS: TextProperties = {
  content: 'Nội dung',
  fontFamily: 'Playfair Display',
  fontSize: 26,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textDecoration: 'none',
  textAlign: 'center',
  color: '#1a1a2e',
  backgroundColor: 'transparent',
  opacity: 1,
  paddingTop: 12,
  paddingRight: 16,
  paddingBottom: 12,
  paddingLeft: 16,
  borderWidth: 0,
  borderColor: '#e0c4a8',
  borderRadius: 4,
  shadowX: 0,
  shadowY: 0,
  shadowBlur: 0,
  shadowColor: 'rgba(0,0,0,0.3)',
  letterSpacing: 0,
  lineHeight: 1.5,
};

const INITIAL_ELEMENTS: CanvasElement[] = [
  {
    id: 'el-1',
    type: 'text',
    x: 60,
    y: 160,
    width: 280,
    height: 60,
    zIndex: 1,
    isSelected: true,
    textProps: {
      ...DEFAULT_TEXT_PROPS,
      content: 'Nội dung',
      fontSize: 26,
    },
  },
];

interface EditorActions {
  setActiveTool: (tool: ToolType) => void;
  selectElement: (id: string | null) => void;
  addTextElement: () => void;
  updateTextProp: <K extends keyof TextProperties>(
    id: string,
    key: K,
    value: TextProperties[K]
  ) => void;
  updateElementPosition: (id: string, x: number, y: number) => void;
  updateElementSize: (id: string, width: number, height: number) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  setActiveRightTab: (tab: 'settings' | 'effects') => void;
  toggleAIColorPanel: () => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

const INITIAL_STATE: EditorState = {
  activeTool: 'text',
  selectedElement: INITIAL_ELEMENTS[0],
  elements: INITIAL_ELEMENTS,
  zoom: 100,
  showGrid: true,
  canvasWidth: 400,
  canvasHeight: 566,
  filmstripItems: Array.from({ length: 14 }, (_, i) => ({
    id: `page-${i + 1}`,
    thumbnail: '',
    label: `Trang ${i + 1}`,
    isActive: i === 0,
  })),
  aiColors: [
    { id: 'c1', hex: '#8B1A1A', label: 'Deep Red' },
    { id: 'c2', hex: '#C0392B', label: 'Crimson' },
    { id: 'c3', hex: '#E74C3C', label: 'Red' },
    { id: 'c4', hex: '#4A235A', label: 'Deep Purple' },
    { id: 'c5', hex: '#884EA0', label: 'Purple' },
    { id: 'c6', hex: '#2E4057', label: 'Navy' },
    { id: 'c7', hex: '#1A8F5D', label: 'Emerald' },
    { id: 'c8', hex: '#F4D03F', label: 'Gold' },
  ],
  activeRightTab: 'settings',
  showAIColorPanel: true,
  history: [INITIAL_ELEMENTS],
  historyIndex: 0,
};

export const useEditorStore = create<EditorState & EditorActions>((set, get) => ({
  ...INITIAL_STATE,

  setActiveTool: (tool) => set({ activeTool: tool }),

  selectElement: (id) => {
    const { elements } = get();
    const updated = elements.map((el) => ({ ...el, isSelected: el.id === id }));
    const selected = id ? updated.find((el) => el.id === id) ?? null : null;
    set({ elements: updated, selectedElement: selected });
  },

  addTextElement: () => {
    const { elements } = get();
    const id = `el-${Date.now()}`;
    const newEl: CanvasElement = {
      id,
      type: 'text',
      x: 60 + Math.random() * 100,
      y: 80 + Math.random() * 100,
      width: 280,
      height: 60,
      zIndex: elements.length + 1,
      isSelected: true,
      textProps: { ...DEFAULT_TEXT_PROPS, content: 'Văn bản mới' },
    };
    const updated = elements.map((el) => ({ ...el, isSelected: false }));
    set({
      elements: [...updated, newEl],
      selectedElement: newEl,
      activeTool: 'text',
    });
    get().pushHistory();
  },

  updateTextProp: (id, key, value) => {
    const { elements, selectedElement } = get();
    const updated = elements.map((el) => {
      if (el.id !== id || !el.textProps) return el;
      return { ...el, textProps: { ...el.textProps, [key]: value } };
    });
    const updatedSelected =
      selectedElement?.id === id
        ? updated.find((el) => el.id === id) ?? null
        : selectedElement;
    set({ elements: updated, selectedElement: updatedSelected });
  },

  updateElementPosition: (id, x, y) => {
    const { elements, selectedElement } = get();
    const updated = elements.map((el) => (el.id === id ? { ...el, x, y } : el));
    const updatedSelected =
      selectedElement?.id === id
        ? { ...selectedElement, x, y }
        : selectedElement;
    set({ elements: updated, selectedElement: updatedSelected });
  },

  updateElementSize: (id, width, height) => {
    const { elements, selectedElement } = get();
    const updated = elements.map((el) =>
      el.id === id ? { ...el, width, height } : el
    );
    const updatedSelected =
      selectedElement?.id === id
        ? { ...selectedElement, width, height }
        : selectedElement;
    set({ elements: updated, selectedElement: updatedSelected });
  },

  deleteElement: (id) => {
    const { elements } = get();
    set({
      elements: elements.filter((el) => el.id !== id),
      selectedElement: null,
    });
    get().pushHistory();
  },

  duplicateElement: (id) => {
    const { elements } = get();
    const src = elements.find((el) => el.id === id);
    if (!src) return;
    const newEl: CanvasElement = {
      ...src,
      id: `el-${Date.now()}`,
      x: src.x + 20,
      y: src.y + 20,
      zIndex: elements.length + 1,
      isSelected: true,
      textProps: src.textProps ? { ...src.textProps } : undefined,
    };
    const updated = elements.map((el) => ({ ...el, isSelected: false }));
    set({ elements: [...updated, newEl], selectedElement: newEl });
    get().pushHistory();
  },

  setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  setActiveRightTab: (tab) => set({ activeRightTab: tab }),
  toggleAIColorPanel: () => set((s) => ({ showAIColorPanel: !s.showAIColorPanel })),

  pushHistory: () => {
    const { elements, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(elements)));
    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    const elements = JSON.parse(JSON.stringify(history[newIndex]));
    set({ elements, historyIndex: newIndex, selectedElement: null });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    const elements = JSON.parse(JSON.stringify(history[newIndex]));
    set({ elements, historyIndex: newIndex, selectedElement: null });
  },
}));
