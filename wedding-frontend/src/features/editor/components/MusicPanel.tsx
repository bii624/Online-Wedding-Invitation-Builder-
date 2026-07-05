import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '../store/editorStore';
import type { MusicProperties } from '../types/editor.types';
import '../styles/MusicPanel.css';
import { assetsApi } from '../../../api/assetsApi';
import { toast } from 'sonner';
import { ChevronLeft } from 'lucide-react';

// ── Icons ──────────────────────────────────────────────────
const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const MusicIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>
);
const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
  </svg>
);
const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
  </svg>
);

// ── Mock Library ───────────────────────────────────────────
const LIBRARY_MUSICS: MusicProperties[] = [
  { id: 'lib-1', name: 'Nhạc Piano Lãng Mạn', src: 'https://cdn.pixabay.com/download/audio/2021/11/25/audio_91b3cb39e9.mp3', duration: 150, source: 'library', autoPlay: true, loop: true, volume: 0.5 },
  { id: 'lib-2', name: 'Giai điệu đám cưới vui tươi', src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3', duration: 210, source: 'library', autoPlay: true, loop: true, volume: 0.5 },
  { id: 'lib-3', name: 'Nhẹ nhàng acoustic', src: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_245e3f9a74.mp3', duration: 180, source: 'library', autoPlay: true, loop: true, volume: 0.5 },
];

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// ============================================================
export function MusicPanel({ onClose }: { onClose: () => void }) {
  const { music, setMusic, uploadedMusics, addUploadedMusic, removeUploadedMusic, fetchUploadedAssets } = useEditorStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchUploadedAssets();
  }, [fetchUploadedAssets]);

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.addEventListener('timeupdate', () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });
    audio.addEventListener('ended', () => {
      setPlayingId(null);
      setProgress(0);
    });
    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    };
  }, []);

  const handlePlayDemo = (item: MusicProperties) => {
    if (!audioRef.current) return;

    if (playingId === item.id) {
      // Pause
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      // Play new
      audioRef.current.src = item.src;
      audioRef.current.play().catch(e => console.error("Error playing audio demo:", e));
      setPlayingId(item.id);
      setProgress(0);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      toast.error('File nhạc quá lớn. Vui lòng chọn file dưới 15MB.');
      return;
    }

    setIsUploading(true);
    try {
      const asset = await assetsApi.uploadAsset(file);
      const newMusic: MusicProperties = {
        id: asset.id,
        name: file.name.replace(/\.[^/.]+$/, ""),
        src: asset.url,
        duration: asset.durationMs ? asset.durationMs / 1000 : 0,
        source: 'uploaded',
        autoPlay: true,
        loop: true,
        volume: 0.5
      };
      addUploadedMusic(newMusic);
      toast.success('Tải nhạc lên thành công');
    } catch (error: any) {
      console.error('Lỗi tải nhạc:', error);
      const msg = error.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || error.message || 'Tải nhạc thất bại');
      toast.error(errorText);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await assetsApi.deleteAsset(id);
      removeUploadedMusic(id);
      toast.success('Xóa nhạc thành công');
    } catch (error: any) {
      console.error('Lỗi khi xóa nhạc:', error);
      const msg = error.response?.data?.message;
      const errorText = Array.isArray(msg) ? msg[0] : (msg || error.message || 'Xóa nhạc thất bại');
      toast.error(errorText);
    }
  };

  // Helper to render an item row
  const renderItem = (item: MusicProperties) => {
    const isPlaying = playingId === item.id;
    const isSelected = music?.id === item.id;

    return (
      <div key={item.id} className="mp-item">
        <button
          className="mp-icon-btn"
          onClick={() => handlePlayDemo(item)}
          title={isPlaying ? "Dừng nghe thử" : "Nghe thử"}
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>

        <div className="mp-item-info">
          <span className="mp-item-name" title={item.name}>{item.name}</span>
          <span className="mp-item-duration">{item.duration ? formatDuration(item.duration) : '--:--'}</span>
          {isPlaying && (
            <div className="mp-item-progress-wrap">
              <div className="mp-item-progress" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="mp-item-actions">
          {item.source === 'uploaded' && (
            <button
              className="mp-icon-btn danger"
              onClick={() => handleDelete(item.id)}
              title="Xoá bài này"
            >
              <TrashIcon />
            </button>
          )}
          <button
            className="mp-use-btn"
            disabled={isSelected}
            onClick={() => setMusic(item)}
          >
            {isSelected ? "Đang dùng" : "Dùng bài này"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="music-panel">
      {/* Collapse button centered vertically on outer right border */}
      <button className="panel-collapse-btn" onClick={onClose} title="Thu gọn">
        <ChevronLeft size={16} />
      </button>

      <div className="mp-header">
        <h3>Nhạc nền</h3>
      </div>

      <div className="mp-scroll-content">

        {/* Active Music Block */}
        {music && (
          <div className="mp-active-block">
            <div className="mp-active-title">Nhạc đang chọn</div>
            <div className="mp-active-row">
              <div className="mp-icon-btn" style={{ cursor: 'default' }}>
                <MusicIcon />
              </div>
              <div className="mp-active-name" title={music.name}>{music.name}</div>
              <button
                className="mp-icon-btn danger"
                onClick={() => setMusic(null)}
                title="Bỏ chọn"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}

        {/* Upload */}
        <button className="mp-upload-btn" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
          <UploadIcon />
          {isUploading ? 'Đang tải lên...' : 'Tải nhạc lên (Max 15MB)'}
        </button>
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />

        {/* My Music */}
        {uploadedMusics.length > 0 && (
          <div className="mp-section">
            <div className="mp-section-title">Nhạc của tôi</div>
            <div className="mp-list">
              {uploadedMusics.map(renderItem)}
            </div>
          </div>
        )}

        {/* Library Music */}
        <div className="mp-section">
          <div className="mp-section-title">Nhạc có sẵn</div>
          <div className="mp-list">
            {LIBRARY_MUSICS.map(renderItem)}
          </div>
        </div>

      </div>
    </div>
  );
}
