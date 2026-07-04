import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../../../store/authStore';
import { assetsApi } from '../../../../api/assetsApi';
import type { Asset } from '../../../../api/assetsApi';
import { X, UploadCloud, Check } from 'lucide-react';
import { toast } from 'sonner';

interface FontPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (fontFamily: string) => void;
  currentFont?: string;
}

const DEFAULT_FONTS = [
  'Inter', 'Playfair Display', 'Roboto', 'Open Sans', 'Lato', 'Montserrat',
  'Poppins', 'Raleway', 'Oswald', 'Merriweather', 'Georgia', 'Arial',
  'Great Vibes', 'Dancing Script', 'Pacifico',
];

export function FontPickerModal({ isOpen, onClose, onSelect, currentFont }: FontPickerModalProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'system' | 'my'>('system');
  const [systemFonts, setSystemFonts] = useState<Asset[]>([]);
  const [myFonts, setMyFonts] = useState<Asset[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFonts = async () => {
    try {
      const data = await assetsApi.getFonts();
      setSystemFonts(data.systemFonts);
      setMyFonts(data.myFonts);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách phông chữ');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchFonts();
      // Admin luôn ở tab system, không có tab my
      if (isAdmin) setActiveTab('system');
    }
  }, [isOpen, isAdmin]);

  if (!isOpen) return null;

  const handleSelect = (fontFamily: string) => {
    onSelect(fontFamily);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    let hasError = false;

    for (const file of Array.from(files)) {
      try {
        // Admin tải lên font hệ thống, user tải lên font cá nhân
        await assetsApi.uploadFont(file, isAdmin);
      } catch (err: any) {
        toast.error(`Lỗi tải lên ${file.name}: ${err.response?.data?.message || err.message}`);
        hasError = true;
      }
    }

    if (!hasError) toast.success('Tải lên phông chữ thành công!');
    setIsUploading(false);
    fetchFonts(); // refresh list

    // Inject the new fonts so they are immediately available for preview
    const data = await assetsApi.getFonts();
    const allFonts = [...data.systemFonts, ...data.myFonts];
    let styleEl = document.getElementById('custom-fonts');
    if (styleEl) {
      let css = '';
      allFonts.forEach(font => {
        if (font.thumbnailUrl) {
          css += `@font-face { font-family: "${font.thumbnailUrl}"; src: url("${font.url}"); font-display: swap; }`;
        }
      });
      styleEl.innerHTML = css;
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Chọn Phông Chữ</h3>
          <button onClick={onClose} style={closeBtnStyle}><X size={20} /></button>
        </div>

        {!isAdmin && (
          <div style={tabsStyle}>
            <button
              style={activeTab === 'system' ? activeTabBtnStyle : inactiveTabBtnStyle}
              onClick={() => setActiveTab('system')}
            >
              Phông chữ hệ thống
            </button>
            <button
              style={activeTab === 'my' ? activeTabBtnStyle : inactiveTabBtnStyle}
              onClick={() => setActiveTab('my')}
            >
              Phông chữ của tôi
            </button>
          </div>
        )}

        <div style={contentStyle}>
          {/* Upload Area */}
          {(isAdmin || activeTab === 'my') && (
            <div
              style={uploadAreaStyle}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <UploadCloud size={32} color="#64748b" style={{ marginBottom: '8px' }} />
              <p style={{ margin: 0, fontWeight: 500, color: '#334155' }}>
                {isUploading ? 'Đang tải lên...' : 'Nhấn để tải lên phông chữ mới'}
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                Hỗ trợ .ttf, .otf, .woff, .woff2 (tối đa 20MB)
              </p>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".ttf,.otf,.woff,.woff2,application/x-font-ttf,application/font-woff,application/font-woff2"
                multiple
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </div>
          )}

          {/* List of Fonts */}
          <div style={fontListStyle}>
            {activeTab === 'system' && (
              <>
                <div style={sectionTitleStyle}>Phông chữ cơ bản</div>
                {DEFAULT_FONTS.map(font => (
                  <button
                    key={font}
                    style={{ ...fontItemStyle, ...(currentFont === font ? activeFontItemStyle : {}) }}
                    onClick={() => handleSelect(font)}
                  >
                    <span style={{ fontFamily: font, fontSize: '18px', color: '#1e293b' }}>{font}</span>
                    {currentFont === font && <Check size={16} color="#4f46e5" />}
                  </button>
                ))}

                {systemFonts.length > 0 && <div style={sectionTitleStyle}>Phông chữ tùy chỉnh</div>}
                {systemFonts.map(font => (
                  <button
                    key={font.id}
                    style={{ ...fontItemStyle, ...(currentFont === font.thumbnailUrl ? activeFontItemStyle : {}) }}
                    onClick={() => handleSelect(font.thumbnailUrl || font.id)}
                  >
                    <span style={{ fontFamily: font.thumbnailUrl || 'sans-serif', fontSize: '18px', color: '#1e293b' }}>
                      {font.thumbnailUrl}
                    </span>
                    {currentFont === font.thumbnailUrl && <Check size={16} color="#4f46e5" />}
                  </button>
                ))}
              </>
            )}

            {activeTab === 'my' && !isAdmin && (
              <>
                {myFonts.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>
                    Bạn chưa có phông chữ nào. Hãy tải lên!
                  </p>
                )}
                {myFonts.map(font => (
                  <button
                    key={font.id}
                    style={{ ...fontItemStyle, ...(currentFont === font.thumbnailUrl ? activeFontItemStyle : {}) }}
                    onClick={() => handleSelect(font.thumbnailUrl || font.id)}
                  >
                    <span style={{ fontFamily: font.thumbnailUrl || 'sans-serif', fontSize: '18px', color: '#1e293b' }}>
                      {font.thumbnailUrl}
                    </span>
                    {currentFont === font.thumbnailUrl && <Check size={16} color="#4f46e5" />}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Styles ──
const overlayStyle: React.CSSProperties = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999,
  display: 'flex', alignItems: 'center', justifyContent: 'center'
};
const modalStyle: React.CSSProperties = {
  width: '400px', maxWidth: '90%', maxHeight: '80vh',
  backgroundColor: '#fff', borderRadius: '12px',
  display: 'flex', flexDirection: 'column',
  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
};
const headerStyle: React.CSSProperties = {
  padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  borderBottom: '1px solid #e2e8f0'
};
const closeBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', padding: '4px',
  display: 'flex', alignItems: 'center', color: '#64748b'
};
const tabsStyle: React.CSSProperties = {
  display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc'
};
const activeTabBtnStyle: React.CSSProperties = {
  flex: 1, padding: '12px', border: 'none', background: '#fff',
  borderBottom: '2px solid #4f46e5', color: '#4f46e5', fontWeight: 600,
  cursor: 'pointer'
};
const inactiveTabBtnStyle: React.CSSProperties = {
  flex: 1, padding: '12px', border: 'none', background: 'transparent',
  borderBottom: '2px solid transparent', color: '#64748b', fontWeight: 500,
  cursor: 'pointer'
};
const contentStyle: React.CSSProperties = {
  padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px'
};
const uploadAreaStyle: React.CSSProperties = {
  border: '2px dashed #cbd5e1', borderRadius: '8px', padding: '24px 16px',
  textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc',
  transition: 'all 0.2s', display: 'flex', flexDirection: 'column', alignItems: 'center'
};
const fontListStyle: React.CSSProperties = {
  display: 'flex', flexDirection: 'column', gap: '8px'
};
const sectionTitleStyle: React.CSSProperties = {
  fontSize: '13px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase',
  marginTop: '8px', marginBottom: '4px'
};
const fontItemStyle: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0',
  background: '#fff', cursor: 'pointer', textAlign: 'left',
  transition: 'all 0.2s'
};
const activeFontItemStyle: React.CSSProperties = {
  borderColor: '#4f46e5', background: '#eef2ff'
};
