import React, { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const CherryBlossomPetal = ({ size, rotation, opacity, color }: { size: number; rotation: number; opacity: number; color?: string }) => {
  const petalColor = color || `rgba(255, 182, 193, ${0.6 + opacity * 0.3})`;
  
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ transform: `rotate(${rotation}deg)`, opacity }}>
      <path d="M50 15 C35 15 20 30 20 50 C20 70 35 85 50 95 C65 85 80 70 80 50 C80 30 65 15 50 15Z" fill={petalColor} stroke="rgba(255, 140, 170, 0.4)" strokeWidth="1.5" />
      <path d="M50 25 C42 30 38 40 38 50 C38 60 42 68 50 75 C58 68 62 60 62 50 C62 40 58 30 50 25Z" fill="rgba(255, 200, 210, 0.6)" />
      <line x1="50" y1="25" x2="50" y2="70" stroke="rgba(255, 100, 130, 0.3)" strokeWidth="1" />
    </svg>
  );
};

const SmallPetal = ({ size, rotation, opacity }: { size: number; rotation: number; opacity: number }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" style={{ transform: `rotate(${rotation}deg)`, opacity }}>
      <ellipse cx="30" cy="20" rx="12" ry="18" fill={`rgba(255, 182, 193, ${0.4 + opacity * 0.3})`} stroke="rgba(255, 140, 170, 0.3)" strokeWidth="1" />
    </svg>
  );
};

const RomanticBackground: React.FC = () => {
  const { theme } = useTheme();
  const [enablePetals, setEnablePetals] = useState(true);

  // Load petal setting from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setEnablePetals(settings.enablePetals !== undefined ? settings.enablePetals : true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  // Listen for storage changes (when settings update in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_settings') {
        try {
          const settings = JSON.parse(e.newValue || '{}');
          setEnablePetals(settings.enablePetals !== undefined ? settings.enablePetals : true);
        } catch {
          // ignore
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ✅ Reduced stars: 50 → 30
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

  // ✅ Only create petals if enabled
  const { largePetals, mediumPetals, smallPetals, extraPetals } = useMemo(() => {
    if (!enablePetals) {
      return { largePetals: [], mediumPetals: [], smallPetals: [], extraPetals: [] };
    }

    const petalColors = [
      'rgba(255, 182, 193, 0.7)',
      'rgba(255, 192, 203, 0.65)',
      'rgba(255, 200, 210, 0.7)',
      'rgba(255, 170, 190, 0.6)',
    ];

    const largePetals = Array.from({ length: 8 }, (_, i) => ({
      id: `large-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 15,
      duration: 18 + Math.random() * 12,
      size: 28 + Math.random() * 20,
      rotation: Math.random() * 360,
      opacity: 0.5 + Math.random() * 0.4,
      sway: 50 + Math.random() * 60,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    }));

    const mediumPetals = Array.from({ length: 12 }, (_, i) => ({
      id: `medium-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 12,
      duration: 14 + Math.random() * 10,
      size: 14 + Math.random() * 12,
      rotation: Math.random() * 360,
      opacity: 0.4 + Math.random() * 0.4,
      sway: 30 + Math.random() * 40,
      color: petalColors[Math.floor(Math.random() * petalColors.length)],
    }));

    const smallPetals = Array.from({ length: 18 }, (_, i) => ({
      id: `small-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 10,
      duration: 10 + Math.random() * 8,
      size: 6 + Math.random() * 8,
      rotation: Math.random() * 360,
      opacity: 0.3 + Math.random() * 0.3,
      sway: 15 + Math.random() * 30,
    }));

    const extraPetals = Array.from({ length: 20 }, (_, i) => ({
      id: `extra-${i}`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 18,
      duration: 8 + Math.random() * 10,
      size: 3 + Math.random() * 5,
      rotation: Math.random() * 360,
      opacity: 0.2 + Math.random() * 0.25,
      sway: 10 + Math.random() * 20,
    }));

    return { largePetals, mediumPetals, smallPetals, extraPetals };
  }, [enablePetals]);

  // If petals are disabled, only show the background gradient
  if (!enablePetals && theme !== 'dark') {
    return (
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FFE8EB 30%, #FFD9E2 60%, #FFC8D3 100%)' }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {theme === 'dark' ? (
        <>
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
        </>
      ) : (
        <>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, #FFF5F5 0%, #FFE8EB 30%, #FFD9E2 60%, #FFC8D3 100%)' }} />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-pink-100/15 to-pink-200/25" />

          {/* Sunlight glow */}
          <motion.div
            className="absolute top-0 right-0 w-100 h-100 rounded-full bg-amber-100/15 blur-3xl"
            animate={{ opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' }}
          />

          {/* Only render petals if enabled */}
          {enablePetals && (
            <>
              {/* Large petals */}
              {largePetals.map((petal) => (
                <motion.div key={petal.id} className="absolute"
                  style={{ left: petal.left, opacity: petal.opacity, zIndex: 30 }}
                  initial={{ top: '-10%', x: 0, rotate: petal.rotation }}
                  animate={{ top: '110%', x: [0, petal.sway * 0.5, -petal.sway * 0.3, 0] }}
                  transition={{
                    top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                    x: { duration: petal.duration * 0.5, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' },
                  }}>
                  <CherryBlossomPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} color={petal.color} />
                </motion.div>
              ))}

              {/* Medium petals */}
              {mediumPetals.map((petal) => (
                <motion.div key={petal.id} className="absolute"
                  style={{ left: petal.left, zIndex: 20 }}
                  initial={{ top: '-5%', x: 0, rotate: petal.rotation }}
                  animate={{ top: '110%', x: [0, -petal.sway * 0.4, petal.sway * 0.2, 0] }}
                  transition={{
                    top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                    x: { duration: petal.duration * 0.45, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' },
                  }}>
                  <CherryBlossomPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} color={petal.color} />
                </motion.div>
              ))}

              {/* Small petals */}
              {smallPetals.map((petal) => (
                <motion.div key={petal.id} className="absolute"
                  style={{ left: petal.left, zIndex: 15 }}
                  initial={{ top: '-5%', x: 0 }}
                  animate={{ top: '110%', x: [0, petal.sway * 0.3, -petal.sway * 0.2, 0] }}
                  transition={{
                    top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                    x: { duration: petal.duration * 0.4, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' },
                  }}>
                  <SmallPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} />
                </motion.div>
              ))}

              {/* Extra tiny petals */}
              {extraPetals.map((petal) => (
                <motion.div key={petal.id} className="absolute"
                  style={{ left: petal.left, zIndex: 10 }}
                  initial={{ top: '-5%', x: 0 }}
                  animate={{ top: '110%', x: [0, petal.sway * 0.2, -petal.sway * 0.1, 0] }}
                  transition={{
                    top: { duration: petal.duration, repeat: Infinity, delay: petal.delay, ease: 'linear' },
                    x: { duration: petal.duration * 0.35, repeat: Infinity, delay: petal.delay, ease: 'easeInOut' },
                  }}>
                  <SmallPetal size={petal.size} rotation={petal.rotation} opacity={petal.opacity} />
                </motion.div>
              ))}

              {/* Wind petals */}
              {[...Array(6)].map((_, i) => (
                <motion.div key={`wind-${i}`} className="absolute"
                  style={{ top: `${Math.random() * 100}%`, zIndex: 12 }}
                  initial={{ left: '-10%', rotate: Math.random() * 360 }}
                  animate={{ left: '110%', y: [0, Math.random() * 20 - 10, 0], rotate: [0, Math.random() * 180] }}
                  transition={{
                    left: { duration: 15 + Math.random() * 10, repeat: Infinity, delay: i * 2, ease: 'linear' },
                    y: { duration: 5 + Math.random() * 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'reverse' },
                    rotate: { duration: 8 + Math.random() * 5, repeat: Infinity, ease: 'linear' },
                  }}>
                  <SmallPetal size={5 + Math.random() * 10} rotation={Math.random() * 360} opacity={0.4 + Math.random() * 0.3} />
                </motion.div>
              ))}

              {/* Floating petals */}
              {[...Array(8)].map((_, i) => (
                <motion.div key={`float-${i}`} className="absolute"
                  style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, zIndex: 8 }}
                  animate={{ y: [-20, 20, -15, 20], x: [-10, 15, -8, 10], rotate: [0, 180], opacity: [0.15, 0.35, 0.15] }}
                  transition={{ duration: 14 + Math.random() * 10, repeat: Infinity, delay: i * 1.2, ease: 'easeInOut' }}>
                  <SmallPetal size={4 + Math.random() * 8} rotation={Math.random() * 360} opacity={0.2 + Math.random() * 0.3} />
                </motion.div>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default RomanticBackground;