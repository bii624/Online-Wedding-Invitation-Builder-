// ============================================================
// RIGHT PANEL - Orchestrator (layout + routing only)
// All property panels live in ./panels/:
//   panels/TextRightPanel.tsx
//   panels/ImageRightPanel.tsx
//   panels/RightPanelShared.tsx
// ============================================================

import '../styles/RightPanel.css';
import 'animate.css';
import '../styles/animations.css';
import { useEditorStore } from '../store/editorStore';
import { CursorIcon, Slider } from './RightPanels/RightPanelShared';
import { TextRightPanel } from './RightPanels/TextRightPanel';
import { ImageRightPanel } from './RightPanels/ImageRightPanel';
import { ShapeRightPanel } from './RightPanels/ShapeRightPanel';
import { EffectsRightPanel } from './RightPanels/EffectsRightPanel';
import { CountdownPanel } from './RightPanels/Widgets/CountdownPanel';
import { MapRightPanel } from './RightPanels/Widgets/MapRightPanel';
import { QrGiftBoxPanel } from './RightPanels/Widgets/QrGiftBoxPanel';
import { CalendarPanel } from './RightPanels/Widgets/CalendarPanel';
import { AlbumRightPanel } from './RightPanels/Widgets/AlbumRightPanel';
import { FormRightPanel } from './RightPanels/Widgets/FormRightPanel';
import { ButtonRightPanel } from './RightPanels/Widgets/ButtonRightPanel';
import { SlidersHorizontal, Wand2 } from 'lucide-react';




// ── Tool placeholder ───────────────────────────────────────
function ToolPlaceholderPanel({ toolName, description, icon }: {
  toolName: string; description: string; icon: string;
}) {
  return (
    <div className="right-panel-empty">
      <div style={{ fontSize: 32 }}>{icon}</div>
      <p style={{ fontWeight: 600, color: 'var(--ed-text-primary)', fontSize: 13 }}>{toolName}</p>
      <p>{description}</p>
    </div>
  );
}

// ── Empty state (Global Settings) ────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 24, textAlign: 'center', color: '#94a3b8' }}>
      <div>
        <CursorIcon />
        <p style={{ fontSize: 13, marginTop: 12 }}>Chọn một đối tượng trên canvas để chỉnh sửa thuộc tính</p>
      </div>
    </div>
  );
}

// ── Global Settings Panel ──────────────────────────────────────────
function GlobalSettingsPanel() {
  const { autoScroll, autoScrollSpeed, setAutoScroll, setAutoScrollSpeed, pushHistory } = useEditorStore();

  return (
    <div style={{ padding: '24px 20px', borderTop: '1px solid var(--ed-border)' }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--ed-text-primary)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Wand2 size={18} /> Cài đặt hiệu ứng chung
      </h3>

      <div className="prop-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="prop-label" style={{ margin: 0 }}>Tự động cuộn trang</span>
        <label className="switch">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          <span className="slider round" style={{ color: '#f43f5e' }}></span>
        </label>
      </div>

      {autoScroll && (
        <div className="prop-row" style={{ marginTop: 16 }}>
          <Slider
            label="Tốc độ cuộn"
            value={autoScrollSpeed}
            min={10} max={100} step={1}
            onChange={(v) => setAutoScrollSpeed(v)}
            onCommit={pushHistory}
            displayVal={`${autoScrollSpeed}%`}
          />
        </div>
      )}
    </div>
  );
}

// ── Main Right Panel ───────────────────────────────────────
export function RightPanel() {
  const { activeRightTab, setActiveRightTab, selectedElement, activeTool } = useEditorStore();

  const renderSettingsContent = () => {
    // ── Image element selected → ImageRightPanel ──────────
    if (selectedElement?.type === 'text' && selectedElement.textProps) {
      return (
        <>
          <div className="right-panel-hint">Nhấp vào văn bản để chỉnh sửa nội dung</div>
          <TextRightPanel id={selectedElement.id} props={selectedElement.textProps} />
        </>
      );
    }

    if (selectedElement?.type === 'image' && selectedElement.imageProps) {
      return (
        <ImageRightPanel
          id={selectedElement.id}
          props={selectedElement.imageProps}
          elementWidth={selectedElement.width}
          elementHeight={selectedElement.height}
        />
      );
    }

    if (selectedElement?.type === 'shape') {
      return <ShapeRightPanel element={selectedElement} activeTab={activeRightTab} />;
    }

    if (selectedElement?.type === 'countdown') {
      return <CountdownPanel element={selectedElement} />;
    }

    if (selectedElement?.type === 'map') {
      return <MapRightPanel element={selectedElement} />;
    }

    if (selectedElement?.type === 'qr_code') {
      return <QrGiftBoxPanel element={selectedElement} />;
    }

    if (selectedElement?.type === 'calendar') {
      return <CalendarPanel element={selectedElement} />;
    }

    if (selectedElement?.type === 'album' && selectedElement.albumProps) {
      return <AlbumRightPanel id={selectedElement.id} props={selectedElement.albumProps} />;
    }

    if (selectedElement?.type === 'form') {
      return <FormRightPanel id={selectedElement.id} />;
    }

    if (selectedElement?.type === 'button_contact') {
      return <ButtonRightPanel id={selectedElement.id} />;
    }

    // ── Nothing selected: show tool-specific guidance ─────
    if (!selectedElement) {
      switch (activeTool) {
        case 'image': return <ToolPlaceholderPanel toolName="Hình ảnh" description="Kéo thả ảnh vào canvas hoặc tải ảnh lên để chỉnh sửa thuộc tính tại đây." icon="🖼️" />;
        case 'background': return <ToolPlaceholderPanel toolName="Hình nền" description="Chọn màu, gradient hoặc ảnh làm nền cho canvas của bạn." icon="🎨" />;
        case 'stock': return <ToolPlaceholderPanel toolName="Tài nguyên Stock" description="Tìm kiếm và chèn ảnh stock chất lượng cao từ thư viện." icon="🔍" />;
        case 'music': return <ToolPlaceholderPanel toolName="Nhạc nền" description="Thêm nhạc nền cho thiệp cưới của bạn." icon="🎵" />;
        case 'widgets': return <ToolPlaceholderPanel toolName="Tiện ích" description="Chèn các tiện ích như đếm ngược, bản đồ, RSVP..." icon="🧩" />;
        case 'templates': return <ToolPlaceholderPanel toolName="Mẫu thiết kế" description="Chọn mẫu để bắt đầu thiết kế nhanh hơn." icon="📋" />;
        case 'effects': return <ToolPlaceholderPanel toolName="Hiệu ứng" description="Thêm hiệu ứng động và chuyển đổi cho thiệp." icon="✨" />;
        case 'presets': return <ToolPlaceholderPanel toolName="Bộ cài sẵn" description="Áp dụng các bộ cài sẵn cho toàn bộ thiết kế." icon="🎛️" />;
        default: return <EmptyState />;
      }
    }

    return <EmptyState />;
  };

  return (
    <aside className="editor-right-panel" aria-label="Thuộc tính">
      {/* Tabs */}
      <div className="right-panel-tabs">
        <button
          id="tab-settings"
          className={`right-panel-tab ${activeRightTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveRightTab('settings')}
        >
          <SlidersHorizontal size={16} /> Cài đặt
        </button>
        <button
          id="tab-effects"
          className={`right-panel-tab ${activeRightTab === 'effects' ? 'active' : ''}`}
          onClick={() => setActiveRightTab('effects')}
        >
          <Wand2 size={16} /> Hiệu ứng
        </button>
      </div>

      {/* Content */}
      <div className="right-panel-content">
        {activeRightTab === 'settings'
          ? renderSettingsContent()
          : selectedElement
            ? <EffectsRightPanel elementId={selectedElement.id} />
            : <EmptyState />
        }
      </div>

      {/* Always visible Global Settings at bottom (only in effects tab) */}
      {activeRightTab === 'effects' && <GlobalSettingsPanel />}
    </aside>
  );
}
