import React, { useMemo, useEffect, useRef } from 'react';
import type { CanvasElement, BackgroundProperties } from '../types/editor.types';
import { DEFAULT_ANIMATION_PROPS } from '../store/editorStore';
import { TextEditorElement } from './TextEditorElement';
import { ImageEditorElement } from './ImageEditorElement';
import { ShapeEditorElement } from './ShapeEditorElement';
import { CountdownEditorElement } from './Widgets/CountdownEditorElement';
import { MapEditorElement } from './Widgets/MapEditorElement';
import { QrGiftBoxEditorElement } from './Widgets/QrGiftBoxEditorElement';
import { CalendarEditorElement } from './Widgets/CalendarEditorElement';
import { AlbumEditorElement } from './Widgets/AlbumEditorElement';
import { FormEditorElement } from './Widgets/FormEditorElement';
import { ButtonEditorElement } from './Widgets/ButtonEditorElement';

interface CardRendererProps {
  elements: CanvasElement[];
  background: BackgroundProperties;
  canvasWidth: number;
}

function RenderedElement({ element }: { element: CanvasElement }) {
  const ap = element.animationProps ?? DEFAULT_ANIMATION_PROPS;
  const observerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = React.useState(false);

  // Loop animation CSS class
  const loopClass = useMemo(() => {
    if (!ap.loopEnabled || ap.loopEffect === 'none') return '';
    switch (ap.loopEffect) {
      case 'bay-lo-lung': return 'animate-bay-lo-lung';
      case 'nay': return 'animate-nay';
      case 'nhap-nhay': return 'animate-nhap-nhay';
      case 'xoay-tron': return 'animate-xoay-tron';
      case 'lac': return 'animate-lac';
      case 'lac-lu': return 'animate-lac-lu';
      case 'lac-lu-nhun-nhay': return 'animate-lac-lu-nhun-nhay';
      default: return '';
    }
  }, [ap.loopEnabled, ap.loopEffect]);

  // Entry animation via IntersectionObserver
  useEffect(() => {
    const observerTarget = observerRef.current;
    const el = animRef.current;
    if (!observerTarget || !el || !ap.entryEnabled || ap.entryEffect === 'none') return;

    const applyEntry = () => {
      el.style.animationDuration = `${ap.entryDuration}s`;
      el.style.animationDelay = `${ap.entryDelay}s`;
      el.style.animationTimingFunction = ap.entryEasing;
      el.classList.remove('animate__animated', `animate__${ap.entryEffect}`);
      void el.offsetHeight; // reflow
      el.classList.add('animate__animated', `animate__${ap.entryEffect}`);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Chỉ thêm hiệu ứng nếu chưa có (để lướt lên không bị áp dụng lại)
            if (!el.classList.contains(`animate__${ap.entryEffect}`)) {
              setHasTriggered(true);
              applyEntry();
            }
          } else {
            // Chỉ reset hiệu ứng khi element đi ra khỏi màn hình ở cạnh dưới (lướt lên trên)
            // entry.boundingClientRect.top > 0 thường có nghĩa là nó đang ở dưới màn hình
            const rootTop = entry.rootBounds ? entry.rootBounds.top : 0;
            if (entry.boundingClientRect.top > rootTop + window.innerHeight / 3) {
              setHasTriggered(false);
              el.classList.remove('animate__animated', `animate__${ap.entryEffect}`);
            }
          }
        });
      },
      { rootMargin: '0px 0px -40% 0px', threshold: 0 }
    );

    observer.observe(observerTarget);
    return () => {
      observer.disconnect();
      el.classList.remove('animate__animated', `animate__${ap.entryEffect}`);
    };
  }, [ap.entryEnabled, ap.entryEffect, ap.entryDuration, ap.entryDelay, ap.entryEasing]);

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    zIndex: element.zIndex,
    pointerEvents: 'none', // read-only
  };

  const innerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    opacity: (ap?.entryEnabled && ap.entryEffect !== 'none' && !hasTriggered) ? 0 : ((element as any)[`${element.type}Props`]?.opacity ?? 1),
  };

  return (
    <div ref={observerRef} style={style}>
      <div ref={animRef} className={loopClass} style={innerStyle}>
        {element.type === 'text' && <TextEditorElement element={element} zoom={100} />}
        {element.type === 'image' && <ImageEditorElement element={element} zoom={100} />}
        {element.type === 'shape' && <ShapeEditorElement element={element} zoom={100} />}
        {element.type === 'countdown' && <CountdownEditorElement element={element} zoom={100} />}
        {element.type === 'map' && <MapEditorElement element={element} zoom={100} />}
        {element.type === 'qr_code' && <QrGiftBoxEditorElement element={element} zoom={100} />}
        {element.type === 'calendar' && <CalendarEditorElement element={element} zoom={100} />}
        {element.type === 'album' && <AlbumEditorElement element={element} zoom={100} />}
        {element.type === 'form' && <FormEditorElement element={element} zoom={100} />}
        {element.type === 'button_contact' && <ButtonEditorElement element={element} zoom={100} />}
      </div>
    </div>
  );
}

export function CardRenderer({ elements, background, canvasWidth }: CardRendererProps) {
  // Sort elements by zIndex before rendering
  const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div
      className="card-renderer-container"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        background: background.type === 'solid' ? background.color :
                    background.type === 'gradient' ? `linear-gradient(${background.gradientAngle}deg, ${background.gradientFrom}, ${background.gradientTo})` :
                    background.type === 'image' ? `url(${background.imageSrc})` : '#ffffff',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {background.type === 'image' && background.imageOpacity !== undefined && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'black',
            opacity: 1 - background.imageOpacity,
            pointerEvents: 'none',
          }}
        />
      )}
      
      {sortedElements.map(element => {
        if (!(element as any).isVisible && (element as any).isVisible !== undefined) return null;
        return <RenderedElement key={element.id} element={element} />;
      })}
    </div>
  );
}
