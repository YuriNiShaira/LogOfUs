import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

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
      left: 69,
      top: 7.3,
      size: 95,
      opacity: 0.9,
      flip: false,
    },
    {
      id: 'cat5',
      image: '/cat5.svg',
      left: 47.5,
      top: 7.8,
      size: 90,
      rotation: -4,
      opacity: 0.85,
      flip: true,
    },
    {
      id: 'cat9',
      image: '/cat9.gif',
      left: 16.5,
      top: 32.1,
      size: 200,
      rotation: -8,
      opacity: 0.9,
      flip: false,
    },
    {
      id: 'cat11',
      image: '/cat11.gif',
      left: 11.1,
      top: 24.8,
      size: 85,
      rotation: 3,
      opacity: 0.85,
      flip: true,
    },
    {
      id: 'cat12',
      image: '/cat12.png',
      left: 80,
      top: 24.4,
      size: 100,
      rotation: 0,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat13',
      image: '/cat13.png',
      left: 55,
      top: 57.6,
      size: 100,
      rotation: 4,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat14',
      image: '/cat14.png',
      left: 55,
      top: 24.7,
      size: 75,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat15',
      image: '/cat15.png',
      left: 30.7,
      top: 41,
      size: 250,
      rotation: 2,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat16',
      image: '/cat16.png',
      left: 72,
      top: 24.3,
      size: 100,
      rotation: 0,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat17',
      image: '/cat17.png',
      left: 70,
      top: 47.4,
      size: 150,
      rotation: 0,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat18',
      image: '/cat18.png',
      left: 45,
      top: 88,
      size: 150,
      rotation: 2,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat19',
      image: '/cat19.png',
      left: 2,
      top: 40,
      size: 200,
      rotation: 3,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat26',
      image: '/cat26.png',
      left: 77,
      top: 56.5,
      size: 150,
      rotation: 0,
      opacity: 0.85,
      flip: true,
    },
    {
      id: 'cat30',
      image: '/cat30.png',
      left: 94,
      top: 85,
      size: 150,
      rotation: -90,
      opacity: 0.85,
      flip: true,
    },
  ], []);

  // TOP LAYER CATS - cats 20-25 (always on top, scrollable)
  const topLayerCats = useMemo(() => [
    {
      id: 'cat20',
      image: '/cat20.png',
      left: 88.7,
      top: -1,
      size: 190,
      rotation: 0,
      opacity: 0.85,
      flip: true,
    },
    {
      id: 'cat21',
      image: '/cat21.png',
      left: 27.8,
      top: 25.2,
      size: 200,
      rotation: 1,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat22',
      image: '/cat22.png',
      left: 50,
      top: 92.8,
      size: 100,
      rotation: -2,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat23',
      image: '/cat23.png',
      left: -1,
      top: -2,
      size: 230,
      rotation: 180,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat24',
      image: '/cat24.png',
      left: 76,
      top: 8.6,
      size: 140,
      rotation: -4,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat25',
      image: '/cat25.png',
      left: 14,
      top: 56.4,
      size: 130,
      rotation: 0,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat27',
      image: '/cat27.png',
      left: 30,
      top: 57,
      size: 130,
      rotation: 4,
      opacity: 0.8,
      flip: true,
    },
    {
      id: 'cat28',
      image: '/cat28.png',
      left: 54,
      top: 88.9,
      size: 85,
      rotation: -2,
      opacity: 0.85,
      flip: false,
    },
    {
      id: 'cat29',
      image: '/cat29.png',
      left: 73,
      top: 35.2,
      size: 95,
      rotation: 0,
      opacity: 0.8,
      flip: true,
    },
  ], []);

  // Walking cats with motion animation
  const walkingCats = useMemo(() => [
    {
      id: 'cat7',
      image: '/cat7.gif',
      direction: 'left-to-right' as const,
      yPercent: 97.4,
      speed: 25,
      size: 90,
      flip: true,
      delay: 0,
    },
    {
      id: 'cat8',
      image: '/cat8.gif',
      direction: 'right-to-left' as const,
      yPercent: 96.8,
      speed: 22,
      size: 95,
      flip: true,
      delay: 3,
    },
    {
      id: 'cat10',
      image: '/cat10.gif',
      direction: 'right-to-left' as const,
      yPercent: 97,
      speed: 28,
      size: 130,
      flip: false,
      delay: 1.5,
    },
  ], []);

  return (
    <>
      {/* Main layer - cats 1-19 and 26-30 */}
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
        {/* Cat stickers (static) */}
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

        {/* Walking cats - crossing paths with animation */}
        {walkingCats.map((cat) => {
          const isRightToLeft = cat.direction === 'right-to-left';
          const startX = isRightToLeft ? 110 : -10;
          const endX = isRightToLeft ? -10 : 110;
          
          return (
            <motion.div
              key={cat.id}
              style={{
                position: 'absolute',
                top: `${cat.yPercent}%`,
                width: cat.size,
                height: cat.size,
                transform: cat.flip ? 'scaleX(-1)' : 'scaleX(1)',
              }}
              initial={{ left: `${startX}%` }}
              animate={{ left: `${endX}%` }}
              transition={{
                left: {
                  duration: cat.speed,
                  repeat: Infinity,
                  delay: cat.delay,
                  ease: 'linear',
                },
              }}
            >
              <img
                src={cat.image}
                alt={`walking cat ${cat.id}`}
                style={{ width: '100%', height: '100%', objectFit: 'contain', userSelect: 'none' }}
                draggable={false}
              />
            </motion.div>
          );
        })}

        {/* Paw prints (static) */}
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

      {/* TOP LAYER - Cats 20-25 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          zIndex: 9999, 
        }}
      >
        {topLayerCats.map((cat) => (
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
      </div>
    </>
  );
};

export default CatsBackground;