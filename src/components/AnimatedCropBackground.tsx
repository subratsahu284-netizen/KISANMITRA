import React from 'react';

export const AnimatedCropBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-40">
      {/* Gentle Sunbeam Radial Gradient */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-amber-200/40 via-emerald-100/30 to-transparent blur-3xl animate-pulse [animation-duration:8s]" />
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-emerald-200/30 via-teal-100/20 to-transparent blur-2xl animate-pulse [animation-duration:10s]" />

      {/* Floating Crop Particles */}
      <div className="absolute inset-0">
        <span
          className="absolute text-2xl opacity-60 animate-bounce [animation-duration:7s]"
          style={{ top: '15%', left: '8%' }}
        >
          🌱
        </span>
        <span
          className="absolute text-xl opacity-50 animate-bounce [animation-duration:9s]"
          style={{ top: '28%', right: '12%' }}
        >
          🍃
        </span>
        <span
          className="absolute text-2xl opacity-60 animate-bounce [animation-duration:8s]"
          style={{ top: '55%', left: '4%' }}
        >
          🌾
        </span>
        <span
          className="absolute text-xl opacity-50 animate-bounce [animation-duration:11s]"
          style={{ top: '70%', right: '8%' }}
        >
          🍅
        </span>
        <span
          className="absolute text-lg opacity-40 animate-bounce [animation-duration:10s]"
          style={{ top: '82%', left: '15%' }}
        >
          🌿
        </span>
        <span
          className="absolute text-xl opacity-50 animate-bounce [animation-duration:9s]"
          style={{ top: '40%', right: '4%' }}
        >
          🌶️
        </span>
      </div>

      {/* Swaying Crop Stalks / Wheat Field Silhouette at the Bottom */}
      <svg
        className="absolute bottom-0 left-0 right-0 w-full h-24 sm:h-32 text-emerald-600/10"
        preserveAspectRatio="none"
        viewBox="0 0 1440 180"
        fill="currentColor"
      >
        <path
          d="M0,120 C180,80 320,160 480,100 C640,40 820,140 1000,90 C1180,40 1320,130 1440,110 L1440,180 L0,180 Z"
          className="animate-pulse [animation-duration:5s]"
        />
        <path
          d="M0,140 C140,110 300,150 460,120 C620,90 780,150 940,110 C1100,70 1280,140 1440,130 L1440,180 L0,180 Z"
          className="opacity-70 animate-pulse [animation-duration:7s]"
        />
      </svg>
    </div>
  );
};
