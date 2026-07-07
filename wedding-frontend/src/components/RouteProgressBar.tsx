import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Thin top progress bar that animates on every route change.
 * Inspired by NProgress — no external dependency needed.
 */
export function RouteProgressBar() {
  const location = useLocation();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevPath = useRef<string>(location.pathname);

  const clearTimers = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  };

  useEffect(() => {
    // Skip on first render (same path)
    if (prevPath.current === location.pathname + location.search) return;
    prevPath.current = location.pathname + location.search;

    clearTimers();

    // Start: show bar at 10%
    setProgress(10);
    setVisible(true);

    // Increment gradually to ~85%
    let current = 10;
    const increment = () => {
      if (current < 85) {
        const step = current < 50 ? 8 : current < 75 ? 3 : 1;
        current = Math.min(current + step, 85);
        setProgress(current);
        timerRef.current = setTimeout(increment, 120 + Math.random() * 80);
      }
    };
    timerRef.current = setTimeout(increment, 100);

    // Complete after a short delay simulating route render
    const completeTimer = setTimeout(() => {
      setProgress(100);
      // Fade out after completion
      timerRef.current = setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 400);
    }, 350);

    return () => {
      clearTimers();
      clearTimeout(completeTimer);
    };
  }, [location.pathname, location.search]);

  if (!visible && progress === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        height: '3px',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #f43f5e, #ec4899, #f43f5e)',
          backgroundSize: '200% 100%',
          animation: 'progressShimmer 1.2s linear infinite',
          transition: progress === 100
            ? 'width 0.15s ease-out, opacity 0.3s ease'
            : 'width 0.2s ease-out',
          opacity: visible ? 1 : 0,
          borderRadius: '0 2px 2px 0',
          boxShadow: '0 0 10px rgba(244, 63, 94, 0.6), 0 0 4px rgba(244, 63, 94, 0.4)',
        }}
      />
      <style>{`
        @keyframes progressShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
