import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundProps } from './types';

interface DropProps {
  delay: number;
  left: number;
  speed: number;
  depth: number; // 1 = back, 2 = mid, 3 = front
}

const RainDrop = ({ delay, left, speed, depth }: DropProps) => {
  // Size, opacity, and blur change based on how "close" the raindrop is
  const isFront = depth === 3;
  const isMid = depth === 2;
  
  const widthClass = isFront ? 'w-[2px]' : isMid ? 'w-[1.5px]' : 'w-[1px]';
  const heightClass = isFront ? 'h-16 md:h-24' : isMid ? 'h-12 md:h-16' : 'h-8 md:h-10';
  const opacityClass = isFront ? 'opacity-60' : isMid ? 'opacity-40' : 'opacity-20';
  const zIndex = isFront ? 30 : isMid ? 20 : 10;
  const blurClass = depth === 1 ? 'blur-[1px]' : 'blur-none';

  return (
    <motion.div
      className={`absolute ${widthClass} ${heightClass} ${opacityClass} ${blurClass} rounded-full`}
      style={{ 
        left: `${left}%`, 
        zIndex,
        // Realistic rain streak: solid at bottom, fading to transparent at top
        background: 'linear-gradient(to top, rgba(191, 219, 254, 1), rgba(191, 219, 254, 0))',
      }}
      initial={{ top: '-10%', x: 0 }}
      animate={{ top: '120%', x: '-20px' }} // x offset creates the wind effect
      transition={{
        duration: speed,
        repeat: Infinity,
        delay,
        ease: 'linear',
      }}
    />
  );
};

const RainyDayBackground: React.FC<BackgroundProps> = () => {
  // Generate 80 raindrops with varying properties
  const raindrops = useMemo(() => 
    Array.from({ length: 80 }, (_, i) => {
      // 20% front, 30% mid, 50% back
      const depth = Math.random() > 0.8 ? 3 : Math.random() > 0.5 ? 2 : 1; 
      // Deeper drops fall slower
      const baseSpeed = depth === 3 ? 0.4 : depth === 2 ? 0.6 : 0.8;
      
      return {
        id: `rain-${i}`,
        left: Math.random() * 120 - 10, // Start slightly offscreen to account for wind slant
        delay: Math.random() * 2, // Tighter delay so it starts raining instantly
        speed: baseSpeed + Math.random() * 0.3,
        depth,
      };
    }), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-slate-900">
      {/* Deep Moody Sky Gradient */}
      <div 
        className="absolute inset-0" 
        style={{ background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 40%, #334155 100%)' }} 
      />
      
      {/* Glowing City/Moonlight Diffuse */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen" 
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(148, 163, 184, 0.15) 0%, transparent 60%)',
        }} 
      />

      {/* Lightning Flash Effect */}
      <motion.div
        className="absolute inset-0 bg-blue-200 z-0"
        animate={{
          opacity: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0.1, 0, 0.3, 0, 0, 0, 0], // Sudden quick flashes
        }}
        transition={{
          duration: 12, // Happens roughly every 12 seconds
          repeat: Infinity,
          ease: "linear",
          times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.81, 0.82, 0.83, 0.85, 0.9, 0.95, 1]
        }}
      />

      {/* Slowly drifting mist/clouds */}
      <motion.div 
        className="absolute -top-20 -left-20 w-[120%] h-[50%] bg-slate-300/5 blur-[100px] rounded-full z-10"
        animate={{ x: [0, 50, 0], y: [0, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-40 -right-20 w-[100%] h-[40%] bg-slate-400/5 blur-[100px] rounded-full z-10"
        animate={{ x: [0, -40, 0], y: [0, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* The Rain Container (slanted for wind) */}
      <div className="absolute inset-0 rotate-[10deg] scale-110 origin-top">
        {raindrops.map((drop) => (
          <RainDrop 
            key={drop.id} 
            delay={drop.delay} 
            left={drop.left} 
            speed={drop.speed} 
            depth={drop.depth} 
          />
        ))}
      </div>
    </div>
  );
};

export default RainyDayBackground;