import React from 'react';

interface RedEnvelopeProps {
  scaleFactor?: number;
  color?: string;
}

export function RedEnvelope({ scaleFactor = 1, color = 'rgb(185, 28, 28)' }: RedEnvelopeProps) {
  return (
    <div 
      className="group relative flex items-center justify-center outline-none border-none bg-transparent" 
      style={{ 
        width: 200, 
        height: 256, 
        transform: `scale(${scaleFactor})`,
        transformOrigin: 'center center',
        flexShrink: 0,
        pointerEvents: 'none'
      }}
    >
      <style>
        {`
          @keyframes redEnvFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes redEnvShake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-8deg); }
            75% { transform: rotate(8deg); }
          }
          @keyframes redEnvGlow {
            0%, 100% { opacity: 0.4; transform: scale(0.9); }
            50% { opacity: 0.8; transform: scale(1.1); }
          }
          .coin-anim-1 { animation: redEnvFloat 3s ease-in-out infinite; }
          .coin-anim-2 { animation: redEnvFloat 3s ease-in-out infinite 0.5s; }
          .coin-anim-3 { animation: redEnvFloat 3s ease-in-out infinite 1s; }
          .coin-anim-4 { animation: redEnvFloat 3s ease-in-out infinite 1.5s; }
          .coin-anim-5 { animation: redEnvFloat 3s ease-in-out infinite 2s; }
          .env-shake { animation: redEnvShake 2.5s ease-in-out infinite; transform-origin: bottom center; }
          .env-glow { animation: redEnvGlow 3s ease-in-out infinite; }
        `}
      </style>
      
      {/* Glow Background */}
      <div 
        className="env-glow absolute" 
        style={{
          inset: -40,
          background: 'radial-gradient(circle, rgba(251,191,36,0.7) 0%, rgba(251,191,36,0) 70%)',
          filter: 'blur(20px)',
          zIndex: 0
        }}
      ></div>

      <div className="envelope-wrapper relative w-full h-full flex items-center justify-center z-10">
        <div className="rounded-full coin-1 absolute coin-anim-1" style={{ width: 30.8, height: 30.8, background: 'rgb(251, 191, 36)', position: 'absolute', border: '2px solid rgb(245, 158, 11)', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', top: '5%', right: '5%' }}>
          <div className="absolute rounded-full" style={{ inset: 2, border: '2px solid rgb(253, 224, 71)', borderRadius: '50%' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 8.624, height: 8.624, backgroundColor: 'transparent', border: '2px solid rgb(217, 119, 6)', boxShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 2px inset' }}></div>
        </div>
        <div className="rounded-full coin-2 absolute coin-anim-2" style={{ width: 25.2, height: 25.2, background: 'rgb(251, 191, 36)', position: 'absolute', border: '2px solid rgb(245, 158, 11)', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', top: '20%', left: '0%' }}>
          <div className="absolute rounded-full" style={{ inset: 2, border: '2px solid rgb(253, 224, 71)', borderRadius: '50%' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 7.056, height: 7.056, backgroundColor: 'transparent', border: '2px solid rgb(217, 119, 6)', boxShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 2px inset' }}></div>
        </div>
        <div className="rounded-full coin-3 absolute coin-anim-3" style={{ width: 28, height: 28, background: 'rgb(251, 191, 36)', position: 'absolute', border: '2px solid rgb(245, 158, 11)', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', bottom: '20%', right: '0%' }}>
          <div className="absolute rounded-full" style={{ inset: 2, border: '2px solid rgb(253, 224, 71)', borderRadius: '50%' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 7.84, height: 7.84, backgroundColor: 'transparent', border: '2px solid rgb(217, 119, 6)', boxShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 2px inset' }}></div>
        </div>
        <div className="rounded-full coin-4 absolute coin-anim-4" style={{ width: 22.4, height: 22.4, background: 'rgb(251, 191, 36)', position: 'absolute', border: '2px solid rgb(245, 158, 11)', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', bottom: '8%', left: '8%' }}>
          <div className="absolute rounded-full" style={{ inset: 2, border: '2px solid rgb(253, 224, 71)', borderRadius: '50%' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 6.272, height: 6.272, backgroundColor: 'transparent', border: '2px solid rgb(217, 119, 6)', boxShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 2px inset' }}></div>
        </div>
        <div className="rounded-full coin-5 absolute coin-anim-5" style={{ width: 21, height: 21, background: 'rgb(251, 191, 36)', position: 'absolute', border: '2px solid rgb(245, 158, 11)', boxShadow: 'rgba(0, 0, 0, 0.3) 0px 1px 3px', top: '45%', right: '-5%' }}>
          <div className="absolute rounded-full" style={{ inset: 2, border: '2px solid rgb(253, 224, 71)', borderRadius: '50%' }}></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: 5.88, height: 5.88, backgroundColor: 'transparent', border: '2px solid rgb(217, 119, 6)', boxShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 2px inset' }}></div>
        </div>
        <span className="sparkle absolute text-white" style={{ top: '8%', left: '20%', fontSize: 14 }}>✦</span>
        <span className="sparkle-2 absolute text-white" style={{ bottom: '35%', right: '8%', fontSize: 11.2 }}>✦</span>
        <span className="sparkle-3 absolute text-white" style={{ top: '40%', left: '3%', fontSize: 8.4 }}>✦</span>
        <div className="envelope-body relative env-shake" style={{ width: 140, height: 196 }}>
          <div className="absolute rounded-b-lg" style={{ left: 2, right: -2, bottom: -3, height: 196, backgroundColor: color, filter: 'brightness(0.5)', borderRadius: '0.5rem' }}></div>
          <div className="absolute rounded-r-lg" style={{ top: 2, bottom: -2, right: -3, width: 140, backgroundColor: color, filter: 'brightness(0.7)', borderRadius: '0.5rem' }}></div>
          <div className="envelope-front absolute inset-0 rounded-lg overflow-hidden" style={{ backgroundColor: color, boxShadow: 'rgba(0, 0, 0, 0.3) 0px 4px 20px' }}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-radial-gradient(circle at 0px 0px, transparent 0px, transparent 11.2px, rgb(127, 29, 29) 11.2px, rgb(127, 29, 29) 11.9px)', backgroundSize: '21px 21px', backgroundPosition: '10.5px 10.5px' }}></div>
            <div className="absolute top-0 left-0 right-0" style={{ height: 4, backgroundColor: 'rgb(251, 191, 36)' }}></div>
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center shadow-lg" style={{ width: 63, height: 63, background: 'radial-gradient(circle, rgb(251, 191, 36) 0%, rgb(217, 119, 6) 100%)', border: '3px solid rgb(254, 243, 199)' }}>
              <span className="font-bold" style={{ fontSize: 30.8, color: 'rgb(185, 28, 28)', lineHeight: 1, textShadow: 'rgba(0, 0, 0, 0.2) 1px 1px 2px' }}>囍</span>
            </div>
            <svg className="absolute top-2 left-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth={2} style={{ transform: 'rotate(0deg)' }}><path d="M2 2 L2 16 L6 16 L6 6 L16 6 L16 2 Z" opacity="0.85" strokeLinecap="square" strokeLinejoin="miter"></path><path d="M6 10 L10 10 L10 6" opacity="0.85" strokeLinecap="square"></path></svg>
            <svg className="absolute top-2 right-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth={2} style={{ transform: 'rotate(90deg)' }}><path d="M2 2 L2 16 L6 16 L6 6 L16 6 L16 2 Z" opacity="0.85" strokeLinecap="square" strokeLinejoin="miter"></path><path d="M6 10 L10 10 L10 6" opacity="0.85" strokeLinecap="square"></path></svg>
            <svg className="absolute bottom-2 left-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth={2} style={{ transform: 'rotate(-90deg)' }}><path d="M2 2 L2 16 L6 16 L6 6 L16 6 L16 2 Z" opacity="0.85" strokeLinecap="square" strokeLinejoin="miter"></path><path d="M6 10 L10 10 L10 6" opacity="0.85" strokeLinecap="square"></path></svg>
            <svg className="absolute bottom-2 right-2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth={2} style={{ transform: 'rotate(180deg)' }}><path d="M2 2 L2 16 L6 16 L6 6 L16 6 L16 2 Z" opacity="0.85" strokeLinecap="square" strokeLinejoin="miter"></path><path d="M6 10 L10 10 L10 6" opacity="0.85" strokeLinecap="square"></path></svg>
          </div>
        </div>
      </div>
    </div>
  );
}
