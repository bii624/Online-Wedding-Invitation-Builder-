import { useState, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { useEditorStore } from '../store/editorStore';
import '../styles/CustomColorPicker.css';

interface CustomColorPickerProps {
  onClose: () => void;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, opacity: number) {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length >= 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }
  return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
}

export function CustomColorPicker({ onClose }: CustomColorPickerProps) {
  const { canvasBackground, updateCanvasBackground, recentColors, addRecentColor } = useEditorStore();
  const [tab, setTab] = useState<'solid' | 'gradient'>(canvasBackground.type === 'gradient' ? 'gradient' : 'solid');
  
  // States for Solid
  const [solidHex, setSolidHex] = useState('#ffffff');
  const [solidOpacity, setSolidOpacity] = useState(100);

  // States for Gradient
  const [gradStop, setGradStop] = useState<'from' | 'to'>('from');
  const [gradFromHex, setGradFromHex] = useState('#ffffff');
  const [gradToHex, setGradToHex] = useState('#000000');
  const [gradAngle, setGradAngle] = useState(90);

  // Initialize from store
  useEffect(() => {
    if (canvasBackground.type === 'solid') {
      const col = canvasBackground.color || '#ffffff';
      if (col.startsWith('#')) {
        setSolidHex(col.slice(0, 7));
      }
    } else if (canvasBackground.type === 'gradient') {
      setGradFromHex(canvasBackground.gradientFrom || '#ffffff');
      setGradToHex(canvasBackground.gradientTo || '#000000');
      setGradAngle(canvasBackground.gradientAngle || 90);
    }
  }, [canvasBackground]);

  // Update store in real-time
  useEffect(() => {
    if (tab === 'solid') {
      const newColor = hexToRgba(solidHex, solidOpacity);
      updateCanvasBackground({ type: 'solid', color: newColor });
    } else {
      updateCanvasBackground({
        type: 'gradient',
        gradientFrom: gradFromHex,
        gradientTo: gradToHex,
        gradientAngle: gradAngle
      });
    }
  }, [solidHex, solidOpacity, gradFromHex, gradToHex, gradAngle, tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSolidChange = (newHex: string) => {
    setSolidHex(newHex);
  };

  const handleGradientChange = (newHex: string) => {
    if (gradStop === 'from') setGradFromHex(newHex);
    else setGradToHex(newHex);
  };

  const handleClose = () => {
    if (tab === 'solid') {
      addRecentColor(hexToRgba(solidHex, solidOpacity));
    } else {
      addRecentColor(gradFromHex);
      addRecentColor(gradToHex);
    }
    onClose();
  };

  return (
    <div className="custom-color-picker-wrapper">
      <div className="ccp-header">
        <div className="ccp-tabs">
          <button className={`ccp-tab ${tab === 'solid' ? 'active' : ''}`} onClick={() => setTab('solid')}>Màu đồng nhất</button>
          <button className={`ccp-tab ${tab === 'gradient' ? 'active' : ''}`} onClick={() => setTab('gradient')}>Màu gradient</button>
        </div>
        <button className="ccp-close" onClick={handleClose}>&times;</button>
      </div>

      <div className="ccp-body">
        {tab === 'solid' ? (
          <div className="ccp-content">
            <HexColorPicker color={solidHex} onChange={handleSolidChange} />
            <div className="ccp-inputs">
              <div className="ccp-input-group">
                <label>Hex</label>
                <input type="text" value={solidHex} onChange={(e) => setSolidHex(e.target.value)} />
              </div>
              <div className="ccp-input-group">
                <label>Độ trong suốt (%)</label>
                <input type="number" min="0" max="100" value={solidOpacity} onChange={(e) => setSolidOpacity(Number(e.target.value))} />
              </div>
            </div>
          </div>
        ) : (
          <div className="ccp-content">
            <div className="ccp-gradient-stops">
              <button 
                className={`ccp-stop-btn ${gradStop === 'from' ? 'active' : ''}`}
                style={{ backgroundColor: gradFromHex }}
                onClick={() => setGradStop('from')}
              ></button>
              <div className="ccp-gradient-preview" style={{ background: `linear-gradient(90deg, ${gradFromHex}, ${gradToHex})` }}></div>
              <button 
                className={`ccp-stop-btn ${gradStop === 'to' ? 'active' : ''}`}
                style={{ backgroundColor: gradToHex }}
                onClick={() => setGradStop('to')}
              ></button>
            </div>
            
            <HexColorPicker 
              color={gradStop === 'from' ? gradFromHex : gradToHex} 
              onChange={handleGradientChange} 
            />

            <div className="ccp-inputs">
              <div className="ccp-input-group">
                <label>Hex</label>
                <input 
                  type="text" 
                  value={gradStop === 'from' ? gradFromHex : gradToHex} 
                  onChange={(e) => handleGradientChange(e.target.value)} 
                />
              </div>
              <div className="ccp-input-group">
                <label>Góc xoay (độ)</label>
                <input 
                  type="number" 
                  min="0" max="360" 
                  value={gradAngle} 
                  onChange={(e) => setGradAngle(Number(e.target.value))} 
                />
              </div>
            </div>
          </div>
        )}

        <div className="ccp-recent">
          <p>Màu trong thiết kế</p>
          <div className="ccp-recent-list">
            {recentColors.map((c, i) => (
              <button 
                key={i} 
                className="ccp-recent-item" 
                style={{ backgroundColor: c }}
                onClick={() => updateCanvasBackground({ type: 'solid', color: c })}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
