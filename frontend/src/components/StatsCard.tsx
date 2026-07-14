import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color?: string; 
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, label, value }) => {
  // Slight random rotation for a hand-pinned note look
  const randomRotation = useMemo(() => (Math.random() * 4) - 2, []);

  // Map the specific labels to the 4 pastel colors (and their rich dark mode equivalents)
  const cardTheme = useMemo(() => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes('days') || lowerLabel.includes('photo')) {
      // Light: Soft Pink | Dark: Deep Rose
      return 'bg-[#fdf0f2] dark:bg-[#5A323D] border border-transparent dark:border-[#73404D]'; 
    }
    if (lowerLabel.includes('years') || lowerLabel.includes('core')) {
      // Light: Soft Yellow | Dark: Deep Mustard/Yellow
      return 'bg-[#fdfce8] dark:bg-[#5A502A] border border-transparent dark:border-[#736536]'; 
    }
    if (lowerLabel.includes('precious') || lowerLabel.includes('place')) {
      // Light: Soft Mint | Dark: Deep Emerald/Pine
      return 'bg-[#ebfbf7] dark:bg-[#2D5A4C] border border-transparent dark:border-[#3A7361]'; 
    }
    // Default 
    // Light: Soft Blue | Dark: Deep Navy/Slate
    return 'bg-[#eff3fe] dark:bg-[#324566] border border-transparent dark:border-[#425A85]'; 
  }, [label]);

  return (
    <motion.div
      initial={{ rotate: randomRotation, opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        scale: 1.03,
        rotate: randomRotation > 0 ? randomRotation + 1 : randomRotation - 1,
        y: -5,
        zIndex: 10,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative flex flex-col items-center justify-center p-6 pt-10 sm:p-8 sm:pt-12 w-full shadow-[0_5px_15px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_25px_rgba(0,0,0,0.12)] dark:hover:shadow-[0_15px_25px_rgba(0,0,0,0.6)] transition-all duration-300 ${cardTheme}`}
      style={{
        borderRadius: '2px', // Slight rounding so it looks like cut paper
      }}
    >
      {/* ------ Red Pushpin ------ */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-[0_3px_3px_rgba(0,0,0,0.4)] dark:drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
        <svg width="24" height="28" viewBox="0 0 24 28" className="overflow-visible">
          {/* Pin shadow on the paper */}
          <ellipse cx="12" cy="22" rx="4" ry="1.5" fill="rgba(0,0,0,0.15)" className="dark:fill-black/50" />
          {/* Needle */}
          <line x1="12" y1="12" x2="12" y2="22" stroke="#78716c" strokeWidth="2.5" strokeLinecap="round" className="dark:stroke-stone-400" />
          {/* Pin Head (Red) */}
          <circle cx="12" cy="8" r="6" fill="#e11d48" className="dark:fill-rose-600" />
          {/* Pin Highlight */}
          <circle cx="10" cy="5.5" r="2" fill="rgba(255,255,255,0.5)" />
        </svg>
      </div>

      {/* ------ Content ------ */}
      
      {/* Icon */}
      <div className="mb-4 text-gray-500 dark:text-stone-300 scale-110">
        {icon}
      </div>

      {/* Value */}
      <motion.p
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="text-4xl sm:text-5xl font-bold font-serif tracking-tighter mb-4 text-gray-900 dark:text-white"
      >
        {value.toLocaleString()}
      </motion.p>

      {/* Handwritten Label */}
      <p className="font-handwriting text-xl sm:text-2xl text-gray-700 dark:!text-stone-300">
        {label}
      </p>
      
    </motion.div>
  );
};

export default StatsCard;