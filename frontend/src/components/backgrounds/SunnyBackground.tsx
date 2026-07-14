import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundProps } from './types';

interface GodRayProps {
  angle: number;
  width: number;
  length: number;
  delay: number;
  duration: number;
}

const GodRay = ({ angle, width, length, delay, duration }: GodRayProps) => (
  <motion.div
    className="absolute top-0 right-0 origin-top-right mix-blend-overlay"
    style={{
      width: `${width}vw`,
      height: `${length}vh`,
      transform: `rotate(${angle}deg) translate(20%, -20%)`,
      background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0) 100%)',
      filter: 'blur(12px)',
    }}
    animate={{ opacity: [0.3, 0.7, 0.3] }}
    transition={{ duration, repeat: Infinity, delay, ease: 'easeInOut' }}
  />
);

interface DustMoteProps {
  id: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

const DustMote = ({ left, top, size, duration, delay }: DustMoteProps) => (
  <motion.div
    className="absolute rounded-full bg-white mix-blend-screen pointer-events-none"
    style={{
      left: `${left}%`,
      top: `${top}%`,
      width: `${size}px`,
      height: `${size}px`,
      boxShadow: `0 0 ${size * 2}px ${size / 2}px rgba(255, 255, 255, 0.8)`,
    }}
    initial={{ opacity: 0, y: 0, x: 0 }}
    animate={{ 
      opacity: [0, 0.6, 0], 
      y: [-20, -100], 
      x: [0, Math.random() * 40 - 20] 
    }}
    transition={{
      duration,
      repeat: Infinity,
      delay,
      ease: 'easeInOut'
    }}
  />
);

const SunnyBackground: React.FC<BackgroundProps> = () => {
  // Generate sweeping god rays
  const godRays = useMemo(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: `ray-${i}`,
      angle: -20 + (i * 15), // Fan out from the top right
      width: 15 + Math.random() * 20,
      length: 120 + Math.random() * 40,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 6,
    })), []
  );

  // Generate floating dust motes (bokeh effect)
  const dustMotes = useMemo(() => 
    Array.from({ length: 25 }, (_, i) => ({
      id: `mote-${i}`,
      left: Math.random() * 100,
      top: 20 + Math.random() * 80, // Mostly mid-to-low screen drifting up
      size: 2 + Math.random() * 6,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 10,
    })), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-sky-200">
      {/* 1. Deep Blue to Golden Horizon Sky Gradient */}
      <div 
        className="absolute inset-0" 
        style={{ background: 'linear-gradient(180deg, #38bdf8 0%, #7dd3fc 40%, #bae6fd 70%, #fef08a 100%)' }} 
      />
      
      {/* 2. Horizon Haze (creates atmospheric depth) */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-1/2" 
        style={{ background: 'linear-gradient(0deg, rgba(255,253,240,0.6) 0%, transparent 100%)' }} 
      />

      {/* 3. Massive Ambient Sun Glow (Bleeds across the whole sky) */}
      <motion.div
        className="absolute -top-[40%] -right-[20%] w-[120%] h-[120%] rounded-full mix-blend-screen"
        style={{
          background: 'radial-gradient(circle, rgba(253, 224, 71, 0.4) 0%, rgba(253, 224, 71, 0.1) 40%, transparent 70%)',
        }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* 4. God Rays (Volumetric Light Beams) */}
      {godRays.map((ray) => (
        <GodRay key={ray.id} {...ray} />
      ))}

      {/* 5. The Physical Sun */}
      <div className="absolute -top-10 -right-10 w-64 h-64">
        {/* Sun Corona (Soft glowing edge) */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle, #f59e0b 0%, #fbbf24 40%, transparent 70%)',
            filter: 'blur(20px)',
          }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Sun Core (Blinding white/yellow center) */}
        <div 
          className="absolute inset-12 rounded-full bg-white shadow-[0_0_60px_30px_rgba(255,255,255,0.8)]"
          style={{ filter: 'blur(4px)' }}
        />
      </div>

      {/* 6. Floating Dust Motes / Bokeh Particles */}
      {dustMotes.map((mote) => (
        <DustMote key={mote.id} {...mote} />
      ))}

      {/* 7. Subtle High-Altitude Cirrus Clouds */}
      <motion.div 
        className="absolute top-[10%] left-[10%] w-[40%] h-[10%] bg-white/20 blur-[40px] rounded-full z-0"
        animate={{ x: [0, 50, 0] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[30%] -left-[10%] w-[50%] h-[15%] bg-white/10 blur-[50px] rounded-full z-0"
        animate={{ x: [0, 80, 0] }}
        transition={{ duration: 60, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />
    </div>
  );
};

export default SunnyBackground;