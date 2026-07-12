import React, { useState, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'sonner';
import { X, Crop, RefreshCw, Copy, ExternalLink, Check } from 'lucide-react';
import { AssetPickerModal } from './Widgets/AssetPickerModal';
import { ThumbnailCropModal } from './Widgets/ThumbnailCropModal';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const { cardId } = useEditorStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [publishedSlug, setPublishedSlug] = useState('');
  const [copied, setCopied] = useState(false);

  // States based on the design
  const [title, setTitle] = useState('Thiệp Cưới');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [currentSettings, setCurrentSettings] = useState<any>({});

  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);

  // Reset on open
  useEffect(() => {
    if (isOpen) {
      setPublishedSlug('');
      setCopied(false);
    }
  }, [isOpen]);

  // Fetch current card details when modal opens
  useEffect(() => {
    if (isOpen && cardId) {
      axiosClient.get(`/cards/${cardId}`).then(res => {
        if (res.data) {
          setTitle(res.data.title || 'Thiệp Cưới');
          setSlug(res.data.slug || '');
          setIsPublic(res.data.isPublic ?? true);
          const settings = res.data.settings || {};
          setCurrentSettings(settings);
          setCoverImage(settings.coverImage || '');
          setDescription(settings.description || '');
        }
      }).catch(() => {});
    }
  }, [isOpen, cardId]);

  if (!isOpen) return null;

  const publicUrl = publishedSlug ? `${window.location.origin}/share/${publishedSlug}` : '';

  const handleCopy = () => {
    if (!publicUrl) return;
    navigator.clipboard.writeText(publicUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handlePublish = async () => {
    if (!cardId) {
      toast.error('Vui lòng lưu thiệp trước khi xuất bản.');
      return;
    }
    setIsPublishing(true);
    try {
      const res = await axiosClient.patch(`/cards/${cardId}`, {
        isPublic,
        title,
        status: 'published',
        settings: { ...currentSettings, coverImage, description }
      });
      const newSlug = res.data?.slug || slug;
      setPublishedSlug(newSlug);
      toast.success('🎉 Đã xuất bản thiệp thành công!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xuất bản thiệp.');
    } finally {
      setIsPublishing(false);
    }
  };



  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20
        }}
        onClick={onClose}
      >
      <div
        style={{
          background: '#fff',
          borderRadius: 24,
          width: '100%',
          maxWidth: 600,
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Pink Gradient Background */}
        <div style={{
          padding: '24px 32px',
          background: 'linear-gradient(135deg, var(--adm-pink, #f43f5e), #fb7185)',
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>Xuất bản thiệp</h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>

          {/* ── PUBLISHED SUCCESS VIEW ── */}
          {publishedSlug ? (
            <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', margin: '0 0 8px 0' }}>Thiệp đã được xuất bản!</h3>
              <p style={{ color: '#64748b', fontSize: 14, margin: '0 0 24px 0' }}>Chia sẻ đường link dưới đây cho khách mời của bạn</p>

              {/* Link box */}
              <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
                <span style={{ flex: 1, padding: '12px 16px', fontSize: 14, color: '#334155', fontWeight: 500, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {publicUrl}
                </span>
                <button onClick={handleCopy} title="Copy link"
                  style={{ padding: '12px 16px', background: copied ? '#10b981' : '#f43f5e', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, transition: 'background 0.2s', flexShrink: 0 }}>
                  {copied ? <><Check size={14} /> Đã copy!</> : <><Copy size={14} /> Sao chép</>}
                </button>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 12 }}>
                <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, background: 'linear-gradient(135deg, #f43f5e, #fb7185)', color: '#fff', fontWeight: 700, fontSize: 15, textDecoration: 'none', boxShadow: '0 4px 12px rgba(244,63,94,0.25)' }}>
                  <ExternalLink size={16} /> Xem thiệp
                </a>
                <button onClick={onClose}
                  style={{ flex: 1, padding: '12px 24px', borderRadius: 12, border: '1px solid #e2e8f0', background: '#fff', color: '#475569', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            <>
          {/* Section 1: Tiêu đề & ảnh */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 16 }}>Tiêu đề & ảnh khi chia sẻ thiệp</h3>


            <div style={{ display: 'flex', gap: 24 }}>
              {/* Thumbnail Area */}
              <div style={{
                width: 220,
                height: 140,
                backgroundColor: '#f1f5f9',
                borderRadius: 16,
                position: 'relative',
                overflow: 'hidden',
                flexShrink: 0,
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundImage: coverImage ? `url(${coverImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!coverImage && <span style={{ color: '#94a3b8', fontSize: 13, fontWeight: 500 }}>Chưa có ảnh bìa</span>}

                {/* Floating action buttons */}
                <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
                  <button
                    title="Cắt ảnh"
                    onClick={() => coverImage ? setShowCropModal(true) : toast.error('Vui lòng chọn ảnh bìa trước khi cắt')}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: '#f43f5e', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Crop size={14} />
                  </button>
                  <button
                    title="Đổi ảnh"
                    onClick={() => setShowAssetPicker(true)}
                    style={{ width: 28, height: 28, borderRadius: '50%', background: '#f43f5e', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>

              {/* Title & Description Inputs */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tiêu đề thiệp..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 15,
                    outline: 'none',
                    fontWeight: 500,
                    color: '#1e293b'
                  }}
                />
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả thiệp..."
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 15,
                    outline: 'none',
                    minHeight: 80,
                    resize: 'none',
                    color: '#475569'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: URL */}
          <div style={{ marginBottom: 32 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#334155', marginBottom: 16 }}>Tùy chỉnh URL thiệp</h3>

            <div style={{ display: 'flex', borderRadius: 12, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', color: '#475569', fontWeight: 500, fontSize: 15 }}>
                {window.location.origin}/share/
              </div>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="duong-dan-thiep"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: 'none',
                  fontSize: 15,
                  outline: 'none',
                  color: '#1e293b',
                  fontWeight: 500
                }}
              />
            </div>
            <p style={{ margin: '8px 0 0 0', fontSize: 13, color: '#94a3b8' }}>
              *Xuất bản thiệp để mọi người có thể xem thiệp trực tiếp qua URL.
            </p>
          </div>

          {/* Footer actions */}
          <div style={{ display: 'flex', gap: 12, borderTop: '1px solid #f1f5f9', paddingTop: 24 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px 24px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
                background: '#fff',
                color: '#475569',
                fontWeight: 600,
                fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Đóng
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '12px 32px',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #f43f5e, #fb7185)',
                color: '#fff',
                fontWeight: 600,
                fontSize: 15,
                cursor: isPublishing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 4px 12px rgba(244, 63, 94, 0.2)'
              }}
            >
              {isPublishing ? 'Đang xử lý...' : '🚀 Xuất bản'}
            </button>
          </div>
        </> /* else close */
        )} {/* ternary close */}
        </div>
      </div>
      </div>

      <AssetPickerModal
        isOpen={showAssetPicker}
        onClose={() => setShowAssetPicker(false)}
        multiple={false}
        onSelect={(urls) => {
          if (urls.length > 0) setCoverImage(urls[0]);
          setShowAssetPicker(false);
        }}
      />
      
      {cardId && showCropModal && coverImage && (
        <ThumbnailCropModal
          isOpen={showCropModal}
          onClose={() => setShowCropModal(false)}
          imageUrl={coverImage}
          cardId={cardId}
          onCropSuccess={(url) => setCoverImage(url)}
        />
      )}
    </>
  );
}
