import React, { useMemo } from 'react';

const CatsBackground: React.FC = () => {
  const catStickers = useMemo(() => [
    {
      id: 'cat1',
      image: '/cat1.svg',
      left: 25,
      top: 7.3,
      size: 100,
      rotation: -5,
      opacity: 0.9,
      flip: false,
    },
    {
      id: 'cat6',
      image: '/cat6.png',
      left: 18,
      top: 7.8,
      size: 90,
      rotation: 5,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat4',
      image: '/cat4.svg',
      left: 70,
      top: 7.3,
      size: 95,
      opacity: 0.9,
      flip: false,
    },
    {
      id: 'cat5',
      image: '/cat5.svg',
      left: 88,
      top: 8,
      size: 90,
      rotation: -4,
      opacity: 0.85,
      flip: true,
    },
    {
      id: 'cat9',
      image: '/cat9.gif',
      left: 5,
      top: 45,
      size: 150,
      rotation: -8,
      opacity: 0.9,
      flip: false,
    },
  ], []);

  const walkingCats = useMemo(() => [
    {
      id: 'cat7',
      image: '/cat7.gif',
      left: 10,
      top: 85,
      size: 90,
      flip: true,
    },
    {
      id: 'cat8',
      image: '/cat8.gif',
      left: 80,
      top: 82,
      size: 95,
      flip: false,
    },
  ], []);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 10,
      }}
    >
      {/* Cat stickers */}
      {catStickers.map((cat) => (
        <div
          key={cat.id}
          style={{
            position: 'absolute',
            left: `${cat.left}%`,
            top: `${cat.top}%`,
            width: cat.size,
            height: cat.size,
            opacity: cat.opacity,
            transform: `rotate(${cat.rotation}deg) scaleX(${cat.flip ? -1 : 1})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={cat.image}
            alt="cat sticker"
            style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' }}
            draggable={false}
          />
        </div>
      ))}

      {/* Walking cats */}
      {walkingCats.map((cat) => (
        <div
          key={cat.id}
          style={{
            position: 'absolute',
            left: `${cat.left}%`,
            top: `${cat.top}%`,
            width: cat.size,
            height: cat.size,
            transform: cat.flip ? 'scaleX(-1)' : 'scaleX(1)',
          }}
        >
          <img
            src={cat.image}
            alt={`walking cat ${cat.id}`}
            style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' }}
            draggable={false}
          />
        </div>
      ))}

      {/* Paw prints */}
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={`paw-${i}`}
          style={{
            position: 'absolute',
            left: `${8 + Math.random() * 84}%`,
            top: `${10 + Math.random() * 75}%`,
            opacity: 0.06,
            width: 28,
            height: 22,
          }}
        >
          <svg viewBox="0 0 36 28" style={{ width: '100%', height: '100%' }}>
            <ellipse cx="18" cy="22" rx="14" ry="6" fill="rgba(80,70,60,0.3)" />
            <circle cx="9" cy="12" r="5" fill="rgba(80,70,60,0.3)" />
            <circle cx="18" cy="10" r="5" fill="rgba(80,70,60,0.3)" />
            <circle cx="27" cy="12" r="5" fill="rgba(80,70,60,0.3)" />
          </svg>
        </div>
      ))}
    </div>
  );
};

export default CatsBackground;