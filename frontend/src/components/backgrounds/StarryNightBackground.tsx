// src/components/backgrounds/StarryNightBackground.tsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundProps } from './types';

const StarryNightBackground: React.FC<BackgroundProps> = () => {
  const stars = useMemo(() => 
    Array.from({ length: 30 }, (_, i) => ({
      id: `star-${i}`,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      size: 1 + Math.random() * 2,
      opacity: 0.4 + Math.random() * 0.6,
      duration: 3 + Math.random() * 4,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #0d0a1a 0%, #1a1030 30%, #2d1a30 60%, #1a1020 100%)' }} />

      {stars.map((star) => (
        <motion.div
          key={star.id}
          className="absolute rounded-full"
          style={{
            top: star.top, left: star.left,
            width: `${star.size}px`, height: `${star.size}px`,
            backgroundColor: '#f0d0ff',
            boxShadow: `0 0 ${3 + Math.random() * 5}px ${1 + Math.random() * 2}px rgba(200, 150, 255, 0.5)`,
          }}
          animate={{ opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5], scale: [1, 1.2, 1] }}
          transition={{ duration: star.duration, repeat: Infinity, delay: star.delay, ease: 'easeInOut' }}
        />
      ))}

      {Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={`big-star-${i}`}
          className="absolute rounded-full"
          style={{
            top: `${10 + Math.random() * 80}%`, left: `${10 + Math.random() * 80}%`,
            width: '2px', height: '2px',
            backgroundColor: '#ffb7c5',
            boxShadow: '0 0 10px 3px rgba(255, 183, 197, 0.5), 0 0 20px 5px rgba(200, 150, 255, 0.3)',
          }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 2, 1] }}
          transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3, ease: 'easeInOut' }}
        />
      ))}
    </div>
  );
};

export default StarryNightBackground;