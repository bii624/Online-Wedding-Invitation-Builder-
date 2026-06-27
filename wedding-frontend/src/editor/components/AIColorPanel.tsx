// ============================================================
// AI COLOR PANEL - Floating color suggestions
// ============================================================

import '../styles/Filmstrip.css'; // shares same CSS file
import { useEditorStore } from '../store/editorStore';

const SparkleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

export function AIColorPanel() {
  const { aiColors, showAIColorPanel, toggleAIColorPanel, selectedElement, updateTextProp } =
    useEditorStore();

  if (!showAIColorPanel) return null;

  const handleColorClick = (hex: string) => {
    if (selectedElement?.id && selectedElement.textProps) {
      updateTextProp(selectedElement.id, 'color', hex);
    }
  };

  return (
    <div className="ai-color-panel" id="ai-color-panel">
      <div className="ai-color-header">
        <span className="ai-color-title">
          <SparkleIcon />
          AI Color
        </span>
        <button
          id="btn-close-ai-color"
          className="ai-color-close"
          onClick={toggleAIColorPanel}
          title="Đóng"
        >
          ×
        </button>
      </div>

      <div className="ai-color-grid">
        {aiColors.map((c) => (
          <div
            key={c.id}
            id={`ai-color-${c.id}`}
            className="ai-color-swatch"
            style={{ background: c.hex }}
            title={`${c.label}: ${c.hex}`}
            onClick={() => handleColorClick(c.hex)}
          />
        ))}
      </div>

      <div className="ai-color-footer">
        <button id="btn-ai-color-refresh" className="ai-color-refresh-btn">
          ↻ Gợi ý mới
        </button>
      </div>
    </div>
  );
}
