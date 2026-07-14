import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BackgroundProps } from './types';

type CloudShape = 'standard' | 'cat' | 'heart' | 'bunny';

interface CloudProps {
  id: string;
  depth: number; // 1 = back, 2 = mid, 3 = front
  top: number;
  speed: number;
  delay: number;
  scale: number;
  shape: CloudShape;
}

const Cloud = ({ id, depth, top, speed, delay, scale, shape }: CloudProps) => {
  const isFront = depth === 3;
  const isMid = depth === 2;

  // Adjust properties based on depth for parallax effect
  const zIndex = isFront ? 30 : isMid ? 20 : 10;
  const opacity = isFront ? 0.85 : isMid ? 0.6 : 0.35;
  const blur = isFront ? 4 : isMid ? 8 : 12; // Deeper clouds are blurrier
  const color = isFront ? '#f8fafc' : isMid ? '#e2e8f0' : '#cbd5e1'; // Deeper clouds are darker/grayer

  // Render different SVG shapes based on the randomly assigned cloud type
  // The blur filter will melt these hard geometric shapes into soft fluffy clouds!
  const renderCloudShape = () => {
    switch (shape) {
      case 'cat':
        return (
          <>
            {/* Cat Body */}
            <rect x="140" y="100" width="120" height="50" rx="25" />
            <circle cx="240" cy="130" r="20" /> {/* Fluffy belly */}
            {/* Cat Head */}
            <circle cx="140" cy="90" r="35" />
            {/* Cat Ears */}
            <polygon points="115,70 120,35 140,65" />
            <polygon points="140,65 160,35 165,70" />
            {/* Curled Tail (overlapping circles) */}
            <circle cx="260" cy="120" r="12" />
            <circle cx="275" cy="105" r="10" />
            <circle cx="285" cy="85" r="10" />
          </>
        );
      case 'bunny':
        return (
          <>
            {/* Bunny Body */}
            <rect x="120" y="100" width="100" height="60" rx="30" />
            {/* Bunny Head */}
            <circle cx="220" cy="90" r="35" />
            <circle cx="240" cy="110" r="20" /> {/* Snout fluff */}
            {/* Long Ears */}
            <ellipse cx="230" cy="45" rx="12" ry="35" transform="rotate(15 230 45)" />
            <ellipse cx="205" cy="40" rx="10" ry="35" transform="rotate(-10 205 40)" />
            {/* Big Fluffy Tail */}
            <circle cx="100" cy="120" r="25" />
            <circle cx="90" cy="100" r="15" />
          </>
        );
      case 'heart':
        return (
          <>
            {/* Base Heart Structure */}
            <circle cx="160" cy="80" r="50" />
            <circle cx="240" cy="80" r="50" />
            <polygon points="115,100 200,180 285,100" />
            {/* Extra fluff to make it look like a natural cloud */}
            <circle cx="140" cy="110" r="30" />
            <circle cx="260" cy="110" r="30" />
            <circle cx="200" cy="130" r="40" />
            <circle cx="200" cy="80" r="30" />
          </>
        );
      case 'standard':
      default:
        return (
          <>
            <circle cx="150" cy="100" r="60" />
            <circle cx="230" cy="90" r="70" />
            <circle cx="300" cy="110" r="50" />
            <circle cx="100" cy="120" r="40" />
            <rect x="90" y="90" width="220" height="70" rx="35" />
          </>
        );
    }
  };

  return (
    <motion.div
      className="absolute overflow-visible pointer-events-none"
      style={{ 
        top: `${top}%`, 
        zIndex,
        width: `${400 * scale}px`,
        height: `${200 * scale}px`,
      }}
      // Start completely off-screen to the left, move completely off-screen to the right
      initial={{ x: '-100vw' }}
      animate={{ x: '100vw' }}
      transition={{
        duration: speed,
        repeat: Infinity,
        delay: delay,
        ease: 'linear',
      }}
    >
      <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible" opacity={opacity}>
        <defs>
          <filter id={`cloud-blur-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={blur} />
          </filter>
        </defs>
        
        {/* The filter group where the shapes are drawn and melted together */}
        <g filter={`url(#cloud-blur-${id})`} fill={color}>
          {renderCloudShape()}
        </g>
      </svg>
    </motion.div>
  );
};

const CloudyBackground: React.FC<BackgroundProps> = () => {
  // Generate 15 drifting clouds
  const clouds = useMemo(() => 
    Array.from({ length: 15 }, (_, i) => {
      const depth = Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1;
      const baseSpeed = depth === 3 ? 40 : depth === 2 ? 70 : 120;
      const scale = depth === 3 ? 1.2 : depth === 2 ? 0.8 : 0.5;

      // Randomly assign a cloud shape (70% standard, 10% cat, 10% bunny, 10% heart)
      const shapeRoll = Math.random();
      let shape: CloudShape = 'standard';
      if (shapeRoll > 0.9) shape = 'cat';
      else if (shapeRoll > 0.8) shape = 'bunny';
      else if (shapeRoll > 0.7) shape = 'heart';

      return {
        id: `cloud-${i}`,
        depth,
        scale: scale + (Math.random() * 0.3 - 0.15),
        delay: Math.random() * 60, // Spread them out
        top: -10 + Math.random() * 70, // Keep them in the sky
        speed: baseSpeed + Math.random() * 20,
        shape,
      };
    }), []
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-slate-300">
      {/* Base Sky Gradient */}
      <div 
        className="absolute inset-0" 
        style={{ background: 'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 40%, #e2e8f0 70%, #f1f5f9 100%)' }} 
      />
      
      {/* Hidden Sun Glow */}
      <div 
        className="absolute inset-0 mix-blend-overlay" 
        style={{
          background: 'radial-gradient(circle at 60% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%)',
        }} 
      />

      {/* Ambient Fog / Heavy Overcast Layers */}
      <motion.div 
        className="absolute -top-[20%] -left-[10%] w-[120%] h-[60%] bg-slate-100/30 blur-[120px] rounded-full z-0"
        animate={{ x: [0, 100, 0], opacity: [0.5, 0.7, 0.5] }}
        transition={{ duration: 40, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute top-[10%] -right-[20%] w-[100%] h-[50%] bg-slate-400/20 blur-[100px] rounded-full z-0"
        animate={{ x: [0, -80, 0], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Drifting Shaped Clouds */}
      {clouds.map((cloud) => (
        <Cloud 
          key={cloud.id}
          id={cloud.id}
          depth={cloud.depth} 
          scale={cloud.scale} 
          delay={cloud.delay} 
          top={cloud.top} 
          speed={cloud.speed}
          shape={cloud.shape}
        />
      ))}
    </div>
  );
};

export default CloudyBackground;