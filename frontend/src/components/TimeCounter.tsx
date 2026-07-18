import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  addYears,
  addMonths,
  addDays,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  isValid,
} from 'date-fns';
import { Heart } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface TimeCounterProps {
  anniversaryDate: string;
}

interface TimeTogether {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// --- SVG COMPONENTS (No animation on mobile) ---
const BoySVG = ({ color, isMobile }: { color: string; isMobile: boolean }) => (
  <motion.svg
    width="45"
    height="65"
    viewBox="0 0 32 50"
    className="overflow-visible"
    style={{ color }}
    animate={!isMobile ? { y: [0, -2, 0] } : {}}
    transition={!isMobile ? { duration: 3, repeat: Infinity, ease: 'easeInOut' } : {}}
  >
    <circle cx="16" cy="10" r="7" fill="currentColor" opacity="0.85" />
    <path d="M16 18 V36" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
    <path d="M16 35 L8 48 M16 35 L24 48" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
    <path d="M16 23 L32 21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
    <path d="M16 23 L8 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
  </motion.svg>
);

const GirlSVG = ({ color, isMobile }: { color: string; isMobile: boolean }) => (
  <motion.svg
    width="45"
    height="65"
    viewBox="0 0 32 50"
    className="overflow-visible"
    style={{ color }}
    animate={!isMobile ? { y: [0, -2, 0] } : {}}
    transition={!isMobile ? { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.5 } : {}}
  >
    <circle cx="16" cy="10" r="7" fill="currentColor" opacity="0.85" />
    <path d="M16 17 L7 37 H25 Z" fill="currentColor" stroke="currentColor" strokeWidth="2" opacity="0.85" />
    <path d="M13 37 L13 48 M19 37 L19 48" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
    <path d="M16 23 L0 21" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
    <path d="M16 23 L24 32" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" opacity="0.85" />
  </motion.svg>
);

// --- MAIN COMPONENT ---
const TimeCounter: React.FC<TimeCounterProps> = ({ anniversaryDate }) => {
  const { theme } = useTheme();
  const [timeTogether, setTimeTogether] = useState<TimeTogether>({
    years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0,
  });
  const [isDateValid, setIsDateValid] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isDark = theme === 'dark';
  
  // Soft watercolor palette that harmonizes with RomanticBackground
  const brandColor    = isDark ? '#f9a8d4' : '#e11d48';
  const cardBg        = isDark ? 'bg-purple-950/30' : 'bg-white/40';
  const innerPanelBg  = isDark ? 'bg-purple-900/20' : 'bg-white/30';
  const mainBorder    = isDark ? 'border-purple-400/15' : 'border-rose-200/40';
  const headingText   = isDark ? 'text-purple-50' : 'text-rose-950';
  const subText       = isDark ? 'text-purple-300/70' : 'text-rose-800/60';
  const numberText    = isDark ? 'text-purple-200' : 'text-rose-900';
  const separatorDot  = isDark ? 'bg-purple-400' : 'bg-rose-400';

  useEffect(() => {
    const start = new Date(anniversaryDate);
    if (!isValid(start)) {
      setIsDateValid(false);
      return;
    }
    setIsDateValid(true);

    const calculateTime = () => {
      const now = new Date();
      if (now < start) {
        setTimeTogether({ years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const years = differenceInYears(now, start);
      const afterYears = addYears(start, years);
      const months = differenceInMonths(now, afterYears);
      const afterMonths = addMonths(afterYears, months);
      const days = differenceInDays(now, afterMonths);
      const afterDays = addDays(afterMonths, days);
      const remainingMs = now.getTime() - afterDays.getTime();

      setTimeTogether({
        years, months, days,
        hours: Math.floor(remainingMs / 3600000),
        minutes: Math.floor((remainingMs % 3600000) / 60000),
        seconds: Math.floor((remainingMs % 60000) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [anniversaryDate]);

  const formatNumber = (value: number) => value.toString().padStart(2, '0');

  const timeItems = [
    { label: 'Years', value: timeTogether.years },
    { label: 'Months', value: timeTogether.months },
    { label: 'Days', value: timeTogether.days },
    { label: 'Hours', value: timeTogether.hours },
    { label: 'Minutes', value: timeTogether.minutes },
    { label: 'Seconds', value: timeTogether.seconds },
  ];

  if (!isDateValid) {
    return (
      <div className={`p-8 rounded-4xl border backdrop-blur-sm text-center font-serif shadow-lg ${cardBg} ${mainBorder}`}>
        <p className={`${subText} italic`}>This page of our story is waiting for a valid date...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative overflow-visible rounded-[2.5rem] border backdrop-blur-md p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.06)] md:p-10 ${cardBg} ${mainBorder}`}
    >
      <div className="relative">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <h3 className={`text-3xl font-serif italic md:text-4xl ${headingText}`}>
            Our Beautiful Journey Together
          </h3>
          <p className={`mt-2 text-xs md:text-sm font-serif tracking-widest italic ${subText}`}>
            Every second is a newly written line.
          </p>
          <div className={`h-px w-20 mx-auto mt-4 opacity-25 ${separatorDot}`} />
        </div>

        {/* Inner Timer Panel – airy, glassy */}
        <div className={`relative mt-10 rounded-4xl border backdrop-blur-sm px-4 py-10 md:px-8 md:py-12 ${innerPanelBg} ${mainBorder}`}>
          
          {/* Faint inner dashed frame */}
          <div className={`absolute inset-2 rounded-[1.6rem] border border-dashed pointer-events-none opacity-30 ${mainBorder}`} />
          
          {/* Boy & Girl - No floating animation on mobile */}
          <div className="absolute -top-15.75 left-4 md:left-12 z-30">
            <BoySVG color={brandColor} isMobile={isMobile} />
          </div>
          <div className="absolute -top-15.75 right-4 md:right-12 z-30">
            <GirlSVG color={brandColor} isMobile={isMobile} />
          </div>

          {/* Connecting String & Heart - No pulse animation on mobile */}
          <div className="absolute -top-11.25 left-13.75 right-13.75 md:left-21.25 md:right-21.25 h-15 pointer-events-none z-20">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
              <path
                d="M0,5 Q50,35 100,5"
                fill="none"
                stroke={brandColor}
                strokeWidth="2"
                strokeLinecap="round"
                className="opacity-40"
              />
            </svg>
            <div className="absolute left-1/2 top-7 -translate-x-1/2 -translate-y-1/2">
              {!isMobile ? (
                <motion.div
                  animate={{ scale: [1, 1.15, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Heart
                    className="w-6 h-6 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                    style={{ color: brandColor }}
                  />
                </motion.div>
              ) : (
                <Heart
                  className="w-6 h-6 fill-current drop-shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                  style={{ color: brandColor }}
                />
              )}
            </div>
          </div>

          {/* Timer Grid */}
          <div className="grid grid-cols-2 gap-y-10 md:grid-cols-3 xl:grid-cols-6 relative z-10">
            {timeItems.map((item, index) => (
              <div
                key={item.label}
                className="relative flex flex-col items-center justify-center text-center"
              >
                {/* No scale animation on mobile para iwas jitter */}
                {!isMobile ? (
                  <motion.div
                    key={item.value}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight ${numberText}`}
                  >
                    {formatNumber(item.value)}
                  </motion.div>
                ) : (
                  <div className={`text-4xl sm:text-5xl md:text-6xl font-serif font-medium tracking-tight ${numberText}`}>
                    {formatNumber(item.value)}
                  </div>
                )}

                <div className={`mt-2 text-2.5 md:text-xs font-serif italic tracking-[0.15em] ${subText}`}>
                  {item.label}
                </div>

                {/* Soft separator dot */}
                {index !== timeItems.length - 1 && (
                  <div className={`absolute right-0 top-1/2 hidden h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full opacity-25 xl:block ${separatorDot}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimeCounter;