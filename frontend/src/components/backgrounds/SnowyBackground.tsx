import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundProps } from './types';

interface SnowflakeProps {
  id: string;
  left: number;
  delay: number;
  duration: number;
  depth: number; // 1 = back, 2 = mid, 3 = front
}

const Snowflake = ({ left, delay, duration, depth }: SnowflakeProps) => {
  const isFront = depth === 3;
  const isMid = depth === 2;

  // Parallax sizing and blurring
  // Front snowflakes are large and blurred (close to camera)
  // Back snowflakes are tiny and dim
  const size = isFront ? 8 + Math.random() * 6 : isMid ? 4 + Math.random() * 3 : 2 + Math.random() * 2;
  const blur = isFront ? 'blur-[3px]' : depth === 1 ? 'blur-[1px]' : 'blur-none';
  const opacity = isFront ? 0.9 : isMid ? 0.6 : 0.3;
  const zIndex = isFront ? 30 : isMid ? 20 : 10;

  // Swirling wind distance based on depth
  const sway = isFront ? 100 : isMid ? 60 : 30;

  return (
    <motion.div
      className={`absolute rounded-full bg-white ${blur}`}
      style={{ 
        left: `${left}%`,
        width: `${size}px`, 
        height: `${size}px`,
        opacity,
        zIndex,
        boxShadow: isFront ? `0 0 ${size * 2}px rgba(255,255,255,0.8)` : 'none',
      }}
      initial={{ top: '-10%', x: 0 }}
      animate={{ 
        top: '110%', 
        x: [0, sway, -sway, 0], // Natural sweeping wind pattern
      }}
      transition={{
        top: { duration, repeat: Infinity, delay, ease: 'linear' },
        x: { duration: duration * 0.8, repeat: Infinity, delay, ease: 'easeInOut' },
      }}
    />
  );
};

const SnowyBackground: React.FC<BackgroundProps> = () => {
  // Generate 100 snowflakes with 3D parallax depth
  const snowflakes = useMemo(() => 
    Array.from({ length: 100 }, (_, i) => {
      // 15% front, 35% mid, 50% back
      const depthRoll = Math.random();
      const depth = depthRoll > 0.85 ? 3 : depthRoll > 0.5 ? 2 : 1;
      
      // Deeper snow falls slower
      const baseDuration = depth === 3 ? 6 : depth === 2 ? 10 : 15;

      return {
        id: `snow-${i}`,
        left: Math.random() * 120 - 10, // Wider spread to account for wind sway
        delay: Math.random() * -20, // Negative delay so the screen is already full of snow on load
        duration: baseDuration + Math.random() * 5,
        depth,
      };
    }), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-slate-200">
      {/* 1. Deep Winter Sky Gradient */}
      <div 
        className="absolute inset-0" 
        style={{ background: 'linear-gradient(180deg, #64748b 0%, #94a3b8 40%, #cbd5e1 70%, #f1f5f9 100%)' }} 
      />
      
      {/* 2. Moonlight / Cold Atmospheric Glow */}
      <div 
        className="absolute inset-0 mix-blend-overlay" 
        style={{
          background: 'radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.6) 0%, transparent 60%)',
        }} 
      />

      {/* 3. Rolling Winter Mist / Freezing Fog */}
      <motion.div 
        className="absolute -top-[10%] -left-[20%] w-[150%] h-[60%] bg-white/20 blur-[100px] rounded-full z-0 pointer-events-none"
        animate={{ x: [0, 100, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 45, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[20%] -right-[20%] w-[120%] h-[50%] bg-slate-100/30 blur-[80px] rounded-full z-0 pointer-events-none"
        animate={{ x: [0, -80, 0], opacity: [0.2, 0.5, 0.2] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 10 }}
      />

      {/* 4. Frosty Snowbank Horizon Reflection */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none" 
        style={{ background: 'linear-gradient(0deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.2) 50%, transparent 100%)' }} 
      />
      
      {/* 5. The Parallax Snowstorm */}
      {snowflakes.map((flake) => (
        <Snowflake 
          key={flake.id} 
          id={flake.id}
          left={flake.left}
          delay={flake.delay}
          duration={flake.duration}
          depth={flake.depth}
        />
      ))}
    </div>
  );
};

export default SnowyBackground;