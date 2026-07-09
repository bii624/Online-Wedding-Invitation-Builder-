import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, Search } from 'lucide-react';
import { libraryElementsApi, type LibraryElement } from '../../../../api/libraryElementsApi';

interface LibraryPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}

export function LibraryPickerModal({ isOpen, onClose, onSelect }: LibraryPickerModalProps) {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchElements = useCallback(async () => {
    setLoading(true);
    try {
      const res = await libraryElementsApi.getElements({ page: 1, limit: 100, search });
      setElements(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => { fetchElements(); }, 300);
      return () => clearTimeout(t);
    }
  }, [isOpen, search, fetchElements]);

  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        width: '600px', maxWidth: '90%', height: '70vh',
        backgroundColor: '#fff', borderRadius: '12px',
        display: 'flex', flexDirection: 'column',
      }}>
        <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Chọn từ thư viện</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
        </div>
        <div style={{ padding: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '10px' }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Tìm kiếm element..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '8px', fontSize: '14px' }}
            />
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '16px' }}>
          {loading ? <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>Đang tải...</div> : 
            elements.map(el => (
              <div 
                key={el.id} 
                onClick={() => { onSelect(el.fileUrl); onClose(); }}
                style={{
                  border: '1px solid #e2e8f0', borderRadius: '8px', padding: '8px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px',
                  background: '#f8fafc', transition: 'all 0.2s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.borderColor = '#4f46e5')}
                onMouseOut={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
              >
                <img src={el.thumbnailUrl || el.fileUrl} alt={el.name} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            ))
          }
          {!loading && elements.length === 0 && (
            <div style={{ textAlign: 'center', gridColumn: '1 / -1', color: '#94a3b8' }}>Không tìm thấy element nào</div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
