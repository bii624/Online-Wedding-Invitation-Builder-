// src/admin/pages/LibraryElementsPage.tsx
// Admin quản lý thư viện element: CRUD element + danh mục, upload file
import { useState, useEffect, useRef } from 'react';
import { Search, Upload, Trash2, Tag, Crown, Plus, Edit2, X, Check, FolderOpen, Eye, EyeOff, RefreshCw, Image as ImageIcon, Layers, ChevronRight } from 'lucide-react';
import { adminApi, type LibraryElement, type ElementCategory } from '../api/adminApi';
import { toast } from 'sonner';

// ── Constants ─────────────────────────────────────────────────────────────────
const ELEMENT_TYPES = ['icon', 'shape', 'illustration', 'sticker', 'frame', 'photo'] as const;
type ElementType = typeof ELEMENT_TYPES[number];

const TYPE_LABELS: Record<string, string> = {
  icon: 'Icon', shape: 'Hình khối', illustration: 'Minh họa',
  sticker: 'Sticker', frame: 'Khung', photo: 'Ảnh',
};
const TYPE_COLORS: Record<string, string> = {
  icon: 'adm-badge-indigo', shape: 'adm-badge-green',
  illustration: 'adm-badge-yellow', sticker: 'adm-badge-pink',
  frame: 'adm-badge-gray', photo: 'adm-badge-gray',
};
const TYPE_EMOJI: Record<string, string> = {
  icon: '⭐', shape: '⬟', illustration: '🎨', sticker: '✨', frame: '🖼', photo: '🖼️',
};

// Tạo slug từ tên
function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ── Element Modal ──────────────────────────────────────────────────────────────
interface ElementModalProps {
  element?: LibraryElement | null;
  categories: ElementCategory[];
  onClose: () => void;
  onSave: () => void;
}

function ElementModal({ element, categories, onClose, onSave }: ElementModalProps) {
  const isEdit = !!element;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: element?.name ?? '',
    elementType: (element?.elementType ?? 'icon') as ElementType,
    categoryId: element?.categoryId ?? '',
    tags: element?.tags?.join(', ') ?? '',
    isPremium: element?.isPremium ?? false,
    isRecolorable: element?.isRecolorable ?? false,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(element?.thumbnailUrl ?? element?.fileUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [savedElementId, setSavedElementId] = useState<string | null>(element?.id ?? null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSaveInfo = async () => {
    if (!form.name.trim()) { toast.error('Vui lòng nhập tên element'); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        elementType: form.elementType,
        categoryId: form.categoryId || undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isPremium: form.isPremium,
        isRecolorable: form.isRecolorable,
      };

      let savedEl: LibraryElement;
      if (isEdit && savedElementId) {
        savedEl = await adminApi.updateLibraryElement(savedElementId, payload);
        toast.success('Đã cập nhật element');
      } else {
        savedEl = await adminApi.createLibraryElement(payload);
        setSavedElementId(savedEl.id);
        toast.success('Đã tạo element — giờ upload file nhé!');
      }

      // Upload file nếu có chọn
      if (selectedFile && savedEl.id) {
        setUploadingFile(true);
        await adminApi.uploadLibraryElementFile(savedEl.id, selectedFile);
        toast.success('Đã upload file thành công');
        setUploadingFile(false);
      }

      onSave();
      if (!isEdit) onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Lỗi khi lưu element');
    } finally {
      setSaving(false);
      setUploadingFile(false);
    }
  };

  const handleUploadOnly = async () => {
    if (!selectedFile || !savedElementId) return;
    setUploadingFile(true);
    try {
      await adminApi.uploadLibraryElementFile(savedElementId, selectedFile);
      toast.success('Đã upload file thành công');
      setSelectedFile(null);
      onSave();
    } catch (err: any) {
      toast.error('Lỗi upload file');
    } finally {
      setUploadingFile(false);
    }
  };


  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(8px)', animation: 'adm-fade-in 0.2s ease-out'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 24, width: 780, maxWidth: '95vw',
        maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div className="adm-gradient-header" style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.25)', padding: 10, borderRadius: 14, display: 'flex' }}>
              {isEdit ? <Edit2 size={24} color="#fff" /> : <Plus size={24} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>{isEdit ? 'Chỉnh sửa Element' : 'Thêm Element mới'}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                {isEdit ? 'Cập nhật thông tin chi tiết và file element.' : 'Tạo element mới, phân loại và tải lên file.'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 12, color: '#ffffff', transition: 'all 0.2s', display: 'flex' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: 24, overflowY: 'auto', flex: 1 }}>
          {/* Two columns */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 32 }}>
            {/* Left: Thông tin */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Tên element <span style={{ color: '#ef4444' }}>*</span></label>
                <input
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a', transition: 'all 0.2s' }}
                  placeholder="VD: Hoa hồng đỏ watercolor"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(244, 63, 94, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Loại element <span style={{ color: '#ef4444' }}>*</span></label>
                  <select
                    className="adm-select"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, background: '#f8fafc', border: '1px solid #e2e8f0', height: 'auto' }}
                    value={form.elementType}
                    onChange={e => setForm(f => ({ ...f, elementType: e.target.value as ElementType }))}
                  >
                    {ELEMENT_TYPES.map(t => (
                      <option key={t} value={t}>{TYPE_EMOJI[t]} {TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Danh mục</label>
                  <select
                    className="adm-select"
                    style={{ width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 14, background: '#f8fafc', border: '1px solid #e2e8f0', height: 'auto' }}
                    value={form.categoryId}
                    onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                  >
                    <option value="">-- Không phân loại --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Từ khóa (Tags)</label>
                <input
                  style={{ width: '100%', padding: '12px 16px', border: '1px solid #e2e8f0', borderRadius: 12, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f8fafc', color: '#0f172a', transition: 'all 0.2s' }}
                  placeholder="VD: hoa, tiệc cưới, vintage"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                  onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(244, 63, 94, 0.1)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }}
                />
              </div>

              <div style={{ display: 'flex', gap: 24, marginTop: 4, background: '#f8fafc', padding: '16px 20px', borderRadius: 16, border: '1px solid #f1f5f9' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#334155' }}>
                  <input type="checkbox" checked={form.isPremium} onChange={e => setForm(f => ({ ...f, isPremium: e.target.checked }))} style={{ width: 18, height: 18, accentColor: '#f59e0b', cursor: 'pointer' }} />
                  <Crown size={16} color="#f59e0b" /> Premium
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#334155' }}>
                  <input type="checkbox" checked={form.isRecolorable} onChange={e => setForm(f => ({ ...f, isRecolorable: e.target.checked }))} style={{ width: 18, height: 18, accentColor: 'var(--adm-pink)', cursor: 'pointer' }} />
                  Đổi màu SVG
                </label>
              </div>
            </div>

            {/* Right: Upload file */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>Tệp hình ảnh / SVG <span style={{ color: '#ef4444' }}>*</span></label>

              {/* Preview */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '2px dashed #cbd5e1', borderRadius: 20,
                  height: '100%', minHeight: '260px', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  background: previewUrl ? '#f8fafc' : '#f8fafc', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--adm-pink)'; e.currentTarget.style.background = '#fff1f2'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
              >
                {previewUrl ? (
                  <>
                    <div style={{ width: '100%', height: '100%', padding: 24, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={previewUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }} />
                    </div>
                    <div style={{
                      position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      opacity: 0, transition: 'all 0.2s ease', color: '#fff', fontSize: 14, fontWeight: 600, gap: 8,
                      backdropFilter: 'blur(2px)'
                    }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                    >
                      <Upload size={18} /> Nhấn để thay đổi tệp
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: 32 }}>
                    <div style={{ background: '#fff', width: 64, height: 64, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
                      <ImageIcon size={32} color="var(--adm-pink)" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>Tải lên file hoặc kéo thả</span>
                      <span style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', lineHeight: 1.5 }}>
                        Định dạng hỗ trợ: JPG, PNG, WEBP, SVG<br />Kích thước tối đa: 10MB
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*,.svg" style={{ display: 'none' }} onChange={handleFileChange} />

              {selectedFile && (
                <div style={{ fontSize: 13, color: '#334155', background: '#f1f5f9', padding: '12px 16px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500 }}>
                  <div style={{ background: '#fff', padding: 6, borderRadius: 8, display: 'flex' }}><ImageIcon size={14} color="#64748b" /></div>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{selectedFile.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: 12 }}>{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}

              {/* Upload only button (khi đã tạo element rồi muốn upload file riêng) */}
              {isEdit && savedElementId && selectedFile && (
                <button
                  className="adm-btn"
                  style={{ fontSize: 14, padding: '12px', background: '#f1f5f9', color: '#0f172a', fontWeight: 600, border: 'none', borderRadius: 12, display: 'flex', justifyContent: 'center', gap: 8, cursor: 'pointer', transition: 'all 0.2s' }}
                  onClick={handleUploadOnly}
                  disabled={uploadingFile}
                  onMouseEnter={e => { if (!uploadingFile) e.currentTarget.style.background = '#e2e8f0'; }}
                  onMouseLeave={e => { if (!uploadingFile) e.currentTarget.style.background = '#f1f5f9'; }}
                >
                  <Upload size={16} />
                  {uploadingFile ? 'Đang tải lên...' : 'Tải lên cập nhật file mới'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '20px 32px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', display: 'flex', gap: 12, justifyContent: 'flex-end', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexShrink: 0 }}>
          <button className="adm-btn adm-btn-outline" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12, fontWeight: 600, color: '#475569', borderColor: '#cbd5e1' }} onClick={onClose}>Hủy bỏ</button>
          <button
            className="adm-btn adm-btn-primary"
            style={{ padding: '12px 32px', fontSize: 14, borderRadius: 12, fontWeight: 600, display: 'flex', gap: 8, boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)' }}
            onClick={handleSaveInfo}
            disabled={saving || uploadingFile}
          >
            {saving || uploadingFile ? (
              <><div className="adm-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Đang xử lý...</>
            ) : (
              <><Check size={16} strokeWidth={2.5} /> {isEdit ? 'Lưu thay đổi' : 'Tạo Element & Tải lên'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Category Modal ─────────────────────────────────────────────────────────────
interface CategoryModalProps {
  category?: ElementCategory | null;
  categories: ElementCategory[];
  onClose: () => void;
  onSave: () => void;
}

function CategoryModal({ category, categories, onClose, onSave }: CategoryModalProps) {
  const isEdit = !!category;
  const [form, setForm] = useState({
    name: category?.name ?? '',
    slug: category?.slug ?? '',
    parentId: category?.parentId ?? '',
  });
  const [saving, setSaving] = useState(false);

  const handleNameChange = (v: string) => {
    setForm(f => ({ ...f, name: v, slug: isEdit ? f.slug : slugify(v) }));
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error('Vui lòng nhập tên và slug'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name.trim(), slug: form.slug.trim(), parentId: form.parentId || undefined };
      if (isEdit && category) {
        await adminApi.updateElementCategory(category.id, payload);
        toast.success('Đã cập nhật danh mục');
      } else {
        await adminApi.createElementCategory(payload);
        toast.success('Đã tạo danh mục');
      }
      onSave();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Lỗi khi lưu danh mục');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '8px 12px', border: '1px solid var(--adm-border-mid)',
    borderRadius: 8, fontSize: 13, outline: 'none', boxSizing: 'border-box' as const,
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', animation: 'adm-fade-in 0.2s ease-out' }}>
      <div style={{ background: '#ffffff', borderRadius: 24, width: 460, maxWidth: '95vw', maxHeight: '90vh', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div className="adm-gradient-header" style={{
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.25)', padding: 10, borderRadius: 14, display: 'flex' }}>
              {isEdit ? <Edit2 size={24} color="#fff" /> : <Plus size={24} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>{isEdit ? 'Sửa danh mục' : 'Thêm danh mục'}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', marginTop: 4 }}>
                Phân loại các element thư viện.
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.1)', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 12, color: '#ffffff', transition: 'all 0.2s', display: 'flex' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.1)'; }}
          >
            <X size={20} strokeWidth={2.5} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 32, overflowY: 'auto', flex: 1 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Tên danh mục <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={{ ...inputStyle, padding: '12px 16px', borderRadius: 12, background: '#f8fafc', color: '#0f172a', transition: 'all 0.2s', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }} placeholder="VD: Hoa lá" value={form.name} onChange={e => handleNameChange(e.target.value)}
              onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(244, 63, 94, 0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Slug <span style={{ color: '#ef4444' }}>*</span></label>
            <input style={{ ...inputStyle, padding: '12px 16px', borderRadius: 12, background: '#f8fafc', color: '#0f172a', transition: 'all 0.2s', border: '1px solid #e2e8f0', outline: 'none', boxSizing: 'border-box' }} placeholder="hoa-la" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              onFocus={e => { e.target.style.borderColor = 'var(--adm-pink)'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 4px rgba(244, 63, 94, 0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; e.target.style.boxShadow = 'none'; }} />
          </div>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#334155', display: 'block', marginBottom: 8 }}>Danh mục cha</label>
            <select className="adm-select" style={{ width: '100%', padding: '12px 16px', borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0', height: 'auto', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} value={form.parentId} onChange={e => setForm(f => ({ ...f, parentId: e.target.value }))}>
              <option value="">-- Không có --</option>
              {categories.filter(c => c.id !== category?.id).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', padding: '20px 32px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', flexShrink: 0 }}>
          <button className="adm-btn adm-btn-outline" style={{ padding: '12px 24px', fontSize: 14, borderRadius: 12, fontWeight: 600, color: '#475569', borderColor: '#cbd5e1' }} onClick={onClose}>Hủy bỏ</button>
          <button className="adm-btn adm-btn-primary" style={{ padding: '12px 32px', fontSize: 14, borderRadius: 12, fontWeight: 600, display: 'flex', gap: 8, boxShadow: '0 4px 12px rgba(244, 63, 94, 0.25)' }} onClick={handleSave} disabled={saving}>
            {saving ? <><div className="adm-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Đang xử lý...</> : <><Check size={16} strokeWidth={2.5} /> Lưu danh mục</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export function LibraryElementsPage() {
  const [elements, setElements] = useState<LibraryElement[]>([]);
  const [categories, setCategories] = useState<ElementCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const LIMIT = 24;

  // Filters
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [premiumFilter, setPremiumFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showElementModal, setShowElementModal] = useState(false);
  const [editElement, setEditElement] = useState<LibraryElement | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editCategory, setEditCategory] = useState<ElementCategory | null>(null);
  const [showCategories, setShowCategories] = useState(false);

  // ── Data fetch ───────────────────────────────────────────────────────────────
  const fetchData = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: LIMIT };
      if (search) params.search = search;
      if (typeFilter) params.elementType = typeFilter;
      if (categoryFilter) params.categoryId = categoryFilter;
      if (premiumFilter !== '') params.isPremium = premiumFilter;
      if (statusFilter) params.status = statusFilter;

      const [elRes, catRes] = await Promise.all([
        adminApi.getLibraryElements(params),
        adminApi.getElementCategories(),
      ]);
      setElements(elRes.data);
      setTotal(elRes.pagination.total);
      setCategories(catRes);
    } catch {
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, typeFilter, categoryFilter, premiumFilter, statusFilter, page]);

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa element "${name}"? Thao tác không thể hoàn tác!`)) return;
    try {
      await adminApi.deleteLibraryElement(id);
      toast.success('Đã xóa element');
      fetchData();
    } catch {
      toast.error('Lỗi khi xóa element');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const updated = await adminApi.toggleLibraryElementStatus(id);
      toast.success(`Element đã ${updated.status === 'published' ? 'được publish' : 'chuyển về draft'}`);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      toast.error(Array.isArray(msg) ? msg[0] : msg ?? 'Lỗi đổi trạng thái');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Xóa danh mục "${name}"? Các element trong danh mục sẽ chuyển về uncategorized.`)) return;
    try {
      await adminApi.deleteElementCategory(id);
      toast.success('Đã xóa danh mục');
      fetchData();
    } catch {
      toast.error('Lỗi khi xóa danh mục');
    }
  };

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <div>
      {/* ── Page header ─────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="adm-page-title">Elements</div>
          <div className="adm-page-subtitle">
            Quản lý toàn bộ element — icon, hình khối, minh họa, sticker, khung và ảnh stock
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="adm-btn adm-btn-outline"
            onClick={() => { setShowCategories(!showCategories); }}
          >
            <FolderOpen size={14} /> Danh mục {categories.length > 0 && `(${categories.length})`}
          </button>
          <button className="adm-btn adm-btn-primary" onClick={() => { setEditElement(null); setShowElementModal(true); }}>
            <Plus size={14} /> Thêm element
          </button>
        </div>
      </div>

      {/* ── Category panel ──────────────────────────────── */}
      {showCategories && (
        <div style={{ background: '#fff', border: '1px solid var(--adm-border)', borderRadius: 12, padding: 16, marginBottom: 20, boxShadow: 'var(--adm-shadow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>📁 Quản lý danh mục</span>
            <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={() => { setEditCategory(null); setShowCategoryModal(true); }}>
              <Plus size={12} /> Thêm danh mục
            </button>
          </div>
          {categories.length === 0 ? (
            <div style={{ color: 'var(--adm-text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>
              Chưa có danh mục nào. Nhấn "Thêm danh mục" để tạo mới.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {categories.map(cat => (
                <div key={cat.id} style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: categoryFilter === cat.id ? 'var(--adm-pink-50)' : 'var(--adm-bg)',
                  border: `1px solid ${categoryFilter === cat.id ? 'var(--adm-pink-mid)' : 'var(--adm-border)'}`,
                  borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
                  transition: 'all 0.18s',
                }} onClick={() => setCategoryFilter(categoryFilter === cat.id ? '' : cat.id)}>
                  <FolderOpen size={13} color={categoryFilter === cat.id ? 'var(--adm-pink)' : 'var(--adm-text-muted)'} />
                  <span style={{ fontSize: 13, fontWeight: 500, color: categoryFilter === cat.id ? 'var(--adm-pink)' : 'var(--adm-text)' }}>
                    {cat.name}
                  </span>
                  {cat._count && (
                    <span style={{ fontSize: 10, background: categoryFilter === cat.id ? 'var(--adm-pink)' : 'var(--adm-border-mid)', color: categoryFilter === cat.id ? '#fff' : 'var(--adm-text-muted)', borderRadius: 99, padding: '1px 6px' }}>
                      {cat._count.elements}
                    </span>
                  )}
                  <button onClick={e => { e.stopPropagation(); setEditCategory(cat); setShowCategoryModal(true); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--adm-text-muted)', display: 'flex' }}>
                    <Edit2 size={11} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.id, cat.name); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: 'var(--adm-danger)', display: 'flex' }}>
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Type quick filter ────────────────────────────── */}
      {/* ── Type quick filter ────────────────────────────── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setTypeFilter('')}
          style={{ background: !typeFilter ? 'var(--adm-pink)' : '#fff', border: `1px solid ${!typeFilter ? 'var(--adm-pink)' : 'var(--adm-border-mid)'}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: !typeFilter ? '#fff' : 'var(--adm-text-muted)', cursor: 'pointer', transition: 'all 0.18s' }}>
          Tất cả ({total})
        </button>
        {ELEMENT_TYPES.map(type => (
          <button key={type} onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
            style={{ background: typeFilter === type ? 'var(--adm-pink-50)' : '#fff', border: `1px solid ${typeFilter === type ? 'var(--adm-pink-mid)' : 'var(--adm-border-mid)'}`, borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: typeFilter === type ? 'var(--adm-pink)' : 'var(--adm-text-muted)', cursor: 'pointer', transition: 'all 0.18s', display: 'flex', gap: 5, alignItems: 'center' }}>
            {TYPE_EMOJI[type]} {TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="adm-toolbar-wrap" style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--adm-border)', marginBottom: 20 }}>
        {/* Row 1: Search + count + refresh */}
        <div className="adm-toolbar-row1">
          <div className="adm-search" style={{ flex: 1 }}>
            <Search className="adm-search-icon" />
            <input placeholder="Tìm theo tên, tag..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
          <button className="adm-btn adm-btn-outline adm-btn-sm" onClick={fetchData} title="Làm mới" style={{ flexShrink: 0 }}>
            <RefreshCw size={13} />
          </button>
        </div>

        {/* Row 2: Filters */}
        <div className="adm-toolbar-row2">
          <select className="adm-select" value={premiumFilter} onChange={e => { setPremiumFilter(e.target.value); setPage(1); }}>
            <option value="">Tất cả gói</option>
            <option value="false">Free</option>
            <option value="true">Premium</option>
          </select>
          <select className="adm-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">Mọi trạng thái</option>
            <option value="published">Đã publish</option>
            <option value="draft">Draft</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--adm-text-muted)', whiteSpace: 'nowrap' }}>
            {total} kết quả
          </span>
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12, color: 'var(--adm-text-muted)' }}>
          <div className="adm-spinner" /> Đang tải...
        </div>
      ) : elements.length === 0 ? (
        <div className="adm-empty">
          <Layers size={48} strokeWidth={1} />
          <div style={{ fontWeight: 600 }}>Chưa có element nào</div>
          <div style={{ fontSize: 13 }}>Nhấn "Thêm element" để tạo element đầu tiên</div>
          <button className="adm-btn adm-btn-primary" onClick={() => { setEditElement(null); setShowElementModal(true); }}>
            <Plus size={14} /> Thêm element
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))', gap: 14 }}>
          {elements.map(el => (
            <ElementCard
              key={el.id}
              element={el}
              onEdit={() => { setEditElement(el); setShowElementModal(true); }}
              onDelete={() => handleDelete(el.id, el.name)}
              onToggleStatus={() => handleToggleStatus(el.id)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ───────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="adm-pagination" style={{ marginTop: 24 }}>
          <span>{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total}</span>
          <div className="adm-pagination-btns">
            <button className="adm-page-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const p = i + 1;
              return (
                <button key={p} className={`adm-page-btn ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              );
            })}
            <button className="adm-page-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</button>
          </div>
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {showElementModal && (
        <ElementModal
          element={editElement}
          categories={categories}
          onClose={() => setShowElementModal(false)}
          onSave={() => fetchData()}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          category={editCategory}
          categories={categories}
          onClose={() => setShowCategoryModal(false)}
          onSave={() => fetchData()}
        />
      )}
    </div>
  );
}

// ── Element Card ──────────────────────────────────────────────────────────────
interface ElementCardProps {
  element: LibraryElement;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const BG_COLORS = ['#fce7f3', '#fef3c7', '#d1fae5', '#ede9fe', '#dbeafe', '#fee2e2', '#fef9c3', '#f3e8ff'];

function ElementCard({ element, onEdit, onDelete, onToggleStatus }: ElementCardProps) {
  const [hovered, setHovered] = useState(false);
  const idx = element.name.length % BG_COLORS.length;
  const isPublished = element.status === 'published';

  return (
    <div
      style={{
        background: '#fff', borderRadius: 12, border: `1px solid ${hovered ? 'var(--adm-pink-mid)' : 'var(--adm-border)'}`,
        overflow: 'hidden', transition: 'all 0.18s', boxShadow: hovered ? 'var(--adm-shadow-md)' : 'none',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Status badge */}
      <div style={{
        position: 'absolute', top: 8, left: 8, zIndex: 2,
        fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
        background: isPublished ? '#dcfce7' : '#f1f5f9',
        color: isPublished ? '#16a34a' : '#64748b',
        letterSpacing: 0.5,
      }}>
        {isPublished ? '● LIVE' : '○ DRAFT'}
      </div>

      {/* Premium badge */}
      {element.isPremium && (
        <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
          <Crown size={14} color="#f59e0b" />
        </div>
      )}

      {/* Thumb */}
      <div style={{
        background: BG_COLORS[idx], height: 110,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        {element.thumbnailUrl || element.fileUrl ? (
          <img
            src={element.thumbnailUrl || element.fileUrl}
            alt={element.name}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
          />
        ) : (
          <span style={{ fontSize: 36 }}>{TYPE_EMOJI[element.elementType]}</span>
        )}

        {/* Hover overlay */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <button title="Sửa" onClick={onEdit}
              style={{ background: '#fff', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--adm-text)' }}>
              <Edit2 size={14} />
            </button>
            <button title={isPublished ? 'Ẩn (draft)' : 'Publish'} onClick={onToggleStatus}
              style={{ background: isPublished ? '#fff' : 'var(--adm-pink)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isPublished ? 'var(--adm-text)' : '#fff' }}>
              {isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button title="Xóa" onClick={onDelete}
              style={{ background: '#ef4444', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: '9px 11px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 5 }}>
          {element.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 4 }}>
          <span className={`adm-badge ${TYPE_COLORS[element.elementType]}`} style={{ fontSize: 9, padding: '2px 7px' }}>
            {TYPE_LABELS[element.elementType]}
          </span>
          {element.category && (
            <span style={{ fontSize: 10, color: 'var(--adm-text-muted)', display: 'flex', alignItems: 'center', gap: 2 }}>
              <FolderOpen size={9} /> {element.category.name}
            </span>
          )}
        </div>
        {element.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
            {element.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{ fontSize: 9, background: 'var(--adm-bg)', color: 'var(--adm-text-muted)', borderRadius: 4, padding: '1px 5px', display: 'flex', gap: 2, alignItems: 'center' }}>
                <Tag size={7} />{tag}
              </span>
            ))}
            {element.tags.length > 3 && (
              <span style={{ fontSize: 9, color: 'var(--adm-text-light)' }}>+{element.tags.length - 3}</span>
            )}
          </div>
        )}
        <div style={{ fontSize: 9, color: 'var(--adm-text-light)', marginTop: 5 }}>
          {element.usageCount} lượt dùng
        </div>
      </div>
    </div>
  );
}
