import React, { useState } from 'react';
import { useEditorStore } from '../store/editorStore';
import { api } from '../../../lib/api';
import { toast } from 'sonner';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  const { cardId } = useEditorStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [slug, setSlug] = useState('');

  if (!isOpen) return null;

  const handlePublish = async () => {
    if (!cardId) {
      toast.error('Vui lòng lưu thiệp trước khi xuất bản.');
      return;
    }

    setIsPublishing(true);
    try {
      // Toggle publish
      const res = await api.post(`/cards/${cardId}/publish`, { isPublic });
      setSlug(res.data.slug);
      toast.success(isPublic ? 'Đã xuất bản thiệp!' : 'Đã hủy xuất bản thiệp!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xuất bản thiệp.');
    } finally {
      setIsPublishing(false);
    }
  };

  const shareLink = slug ? `${window.location.origin}/view/${slug}` : '';

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    toast.success('Đã copy link mời!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-[400px] shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-4">Chia sẻ & Xuất bản thiệp</h3>

        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              <div className={`block w-10 h-6 rounded-full transition-colors ${isPublic ? 'bg-rose-500' : 'bg-gray-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isPublic ? 'transform translate-x-4' : ''}`}></div>
            </div>
            <div>
              <div className="font-medium text-gray-800">Công khai thiệp</div>
              <div className="text-xs text-gray-500">Bật để khách mời có thể xem bằng link</div>
            </div>
          </label>
        </div>

        {slug && isPublic && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Link chia sẻ của bạn</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareLink}
                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-600 outline-none"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {isPublishing ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Cập nhật trạng thái'
          )}
        </button>
      </div>
    </div>
  );
}
