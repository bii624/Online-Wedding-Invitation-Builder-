import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icons in Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerModalProps {
  initialAddress?: string;
  initialLat?: string | number;
  initialLng?: string | number;
  onClose: () => void;
  onSave: (address: string, lat: number, lng: number) => void;
}

// Component to handle map clicks
function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (pos: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} />
  );
}

export function MapPickerModal({ initialAddress, initialLat, initialLng, onClose, onSave }: MapPickerModalProps) {
  const [address, setAddress] = useState(initialAddress || '');
  const [position, setPosition] = useState<L.LatLng | null>(
    (initialLat && initialLng) ? new L.LatLng(Number(initialLat), Number(initialLng)) : null
  );
  const [isSearching, setIsSearching] = useState(false);

  const defaultCenter: L.LatLngTuple = [21.028511, 105.804817]; // Hanoi default

  const handleSearch = async () => {
    if (!address.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const lat = Number(data[0].lat);
        const lon = Number(data[0].lon);
        setPosition(new L.LatLng(lat, lon));
      } else {
        alert('Không tìm thấy địa chỉ này!');
      }
    } catch (err) {
      console.error('Lỗi tìm kiếm địa chỉ:', err);
      alert('Có lỗi xảy ra khi tìm kiếm địa chỉ.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSave = () => {
    if (!position) {
      alert('Vui lòng chọn một vị trí trên bản đồ!');
      return;
    }
    onSave(address, position.lat, position.lng);
  };

  return (
    <>
      <style>
        {`
          @keyframes admGradientAnimation {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 999999,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px', width: '90%', maxWidth: '800px',
          height: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          {/* Header */}
          <div style={{
            padding: '24px',
            background: 'linear-gradient(-45deg, #f43f5e, #fb7185, #f43f5e, #fca5a5)',
            backgroundSize: '300% 300%',
            animation: 'admGradientAnimation 6s ease infinite',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            color: 'white'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                📍
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>Chọn vị trí trên bản đồ</h2>
                <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>Tìm kiếm địa chỉ hoặc click vào bản đồ để ghim tọa độ.</p>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.2)',
              border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'white'
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: '16px 24px', display: 'flex', gap: '12px' }}>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Nhập địa chỉ để tìm kiếm..."
              style={{ flex: 1, padding: '10px 16px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' }}
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              style={{ padding: '0 24px', borderRadius: '6px', backgroundColor: '#f43f5e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </div>

          {/* Coordinate Display */}
          {position && (
            <div style={{ padding: '0 24px 12px', fontSize: '13px', color: '#666', display: 'flex', gap: '16px' }}>
              <span><strong>Lat:</strong> {position.lat.toFixed(6)}</span>
              <span><strong>Lng:</strong> {position.lng.toFixed(6)}</span>
              <span style={{ color: '#eab308', fontStyle: 'italic' }}>* Click vào bản đồ để ghim vị trí chính xác</span>
            </div>
          )}

          {/* Map */}
          <div style={{ flex: 1, position: 'relative' }}>
            <MapContainer
              center={position || defaultCenter}
              zoom={15}
              style={{ width: '100%', height: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <LocationMarker position={position} setPosition={setPosition} />
            </MapContainer>
          </div>

          {/* Footer */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: '12px', background: '#f9fafb' }}>
            <button
              onClick={onClose}
              style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#fff', color: '#64748b', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
            >
              Hủy bỏ
            </button>
            <button
              onClick={handleSave}
              style={{ padding: '10px 24px', borderRadius: '8px', backgroundColor: '#f43f5e', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Lưu vị trí
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
