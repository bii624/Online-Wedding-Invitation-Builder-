import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function InAppBrowserBlocker({ children }: { children: React.ReactNode }) {
  const [isInApp, setIsInApp] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // If the path is a public view page (e.g. /thiep/something), don't block
    if (location.pathname.startsWith('/thiep/')) {
      setIsInApp(false);
      return;
    }

    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    // Check for common in-app browsers
    const inAppBrowsers = [
      'FBAN', 'FBAV', // Facebook
      'Instagram',    // Instagram
      'Zalo',         // Zalo
      'Line',         // Line
      'Viber',        // Viber
      'Twitter',      // Twitter
      'TikTok',       // TikTok
    ];

    const isMatch = inAppBrowsers.some(keyword => ua.includes(keyword));
    
    if (isMatch) {
      setIsInApp(true);
    } else {
      setIsInApp(false);
    }
  }, [location.pathname]);

  if (!isInApp) {
    return <>{children}</>;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: '#ffffff',
      zIndex: 999999,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        width: '64px',
        height: '64px',
        backgroundColor: '#fee2e2',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '24px'
      }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>
      
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '16px' }}>
        Trình duyệt không được hỗ trợ
      </h2>
      
      <p style={{ fontSize: '15px', color: '#4b5563', lineHeight: '1.5', marginBottom: '32px', maxWidth: '300px' }}>
        Để trải nghiệm tốt nhất và có thể đăng nhập, vui lòng mở liên kết này bằng trình duyệt mặc định của máy (Chrome, Safari,...).
      </p>

      <div style={{
        backgroundColor: '#f3f4f6',
        padding: '16px',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '300px',
        textAlign: 'left'
      }}>
        <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151', marginBottom: '12px' }}>Hướng dẫn mở:</p>
        <ol style={{ fontSize: '14px', color: '#4b5563', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
          <li>Nhấn vào biểu tượng <strong>dấu 3 chấm</strong> (hoặc ...) ở góc phải màn hình</li>
          <li>Chọn <strong>"Mở bằng trình duyệt"</strong> (Open in Browser) hoặc <strong>"Mở trong Chrome / Safari"</strong></li>
        </ol>
      </div>
    </div>
  );
}
