import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { slideVariants, gridGapClasses, monthNames, dayNames } from '../constants/calendarConstants';

interface CalendarGridProps {
  currentYear: number;
  currentMonth: number;
  direction: number;
  daysInMonth: number;
  firstDayOfMonth: number;
  hasMemories: (day: number) => boolean;
  isToday: (day: number) => boolean;
  onDateClick: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  theme: string;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentYear,
  currentMonth,
  direction,
  daysInMonth,
  firstDayOfMonth,
  hasMemories,
  isToday,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className={`relative rounded-sm px-3 py-4 sm:px-8 sm:py-6 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] w-full mx-auto ${isDark ? 'bg-[#262222] border border-stone-800' : 'bg-white border border-stone-200'}`}
    >
      <div className="flex items-center justify-between gap-2 mb-6 md:mb-8">
        <button 
          onClick={onPrevMonth} 
          className={`font-handwriting text-lg sm:text-xl md:text-2xl transition-colors hover:text-rose-500 z-10 ${isDark ? 'text-stone-400! hover:text-rose-400!' : 'text-stone-500'}`}
        >
          ← Prev
        </button>
        
        <div className="flex-1 overflow-hidden min-w-0">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.h3 
              key={`${currentYear}-${currentMonth}-title`}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className={`text-center text-lg truncate xs:text-xl sm:text-2xl md:text-3xl lg:text-4xl font-serif font-bold italic mx-1 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}
            >
              {monthNames[currentMonth]} {currentYear}
            </motion.h3>
          </AnimatePresence>
        </div>
        
        <button 
          onClick={onNextMonth} 
          className={`font-handwriting text-lg sm:text-xl md:text-2xl transition-colors hover:text-rose-500 z-10 ${isDark ? 'text-stone-400! hover:text-rose-400!' : 'text-stone-500'}`}
        >
          Next →
        </button>
      </div>

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={`${currentYear}-${currentMonth}-grid`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.2, ease: "easeInOut" }}
        >
          <div className={`grid grid-cols-7 ${gridGapClasses} mb-2 md:mb-4 border-b-2 border-dashed pb-2 w-full ${isDark ? 'border-stone-700' : 'border-stone-300'}`}>
            {dayNames.map((day, i) => (
              <div 
                key={day} 
                className={`text-center font-handwriting text-[13px] sm:text-sm md:text-lg lg:text-2xl ${i === 0 || i === 6 ? (isDark ? 'text-rose-400!' : 'text-rose-500') : (isDark ? 'text-stone-400!' : 'text-stone-600')}`}
              >
                <span className="hidden xs:inline">{day}</span>
                <span className="xs:hidden">{day.charAt(0)}</span>
              </div>
            ))}
          </div>

          <div className={`grid grid-cols-7 ${gridGapClasses} w-full mx-auto`}>
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square w-full h-full" />
            ))}

            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const hasMemory = hasMemories(day);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day}
                  onClick={() => onDateClick(day)}
                  disabled={!hasMemory}
                  className={`
                    relative aspect-square w-full flex flex-col items-center justify-center transition-all p-0.5 sm:p-1 gap-0.5
                    ${hasMemory ? 'cursor-pointer hover:scale-105 transition-transform duration-200' : 'cursor-default opacity-60'}
                    ${hasMemory && !isDark ? 'bg-[#fff5f5] border border-dashed border-rose-300 shadow-sm hover:shadow-md' : ''}
                    ${hasMemory && isDark ? 'bg-stone-800/80 border border-dashed border-rose-900 shadow-sm hover:shadow-md' : ''}
                    ${!hasMemory && !isDark ? 'bg-stone-50/60 border border-stone-200/60 rounded-sm' : ''}
                    ${!hasMemory && isDark ? 'bg-stone-900/40 border border-stone-800/60 rounded-sm' : ''}
                  `}
                  style={{ borderRadius: hasMemory ? '6px 3px 6px 3px' : '3px' }}
                >
                  {isTodayDate && (
                    <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-3.5 h-3.5 sm:w-5 sm:h-5 md:w-6 md:h-6 bg-rose-500 rounded-full flex items-center justify-center shadow-sm rotate-12 z-10">
                      <span className="text-white text-[7px] sm:text-[10px] md:text-xs font-bold">★</span>
                    </div>
                  )}
                  
                  <span className={`
                    font-handwriting block w-full text-center leading-none 
                    text-base sm:text-base md:text-2xl lg:text-3xl xl:text-4xl
                    font-variant-numeric tabular-nums
                    ${hasMemory ? (isDark ? 'text-rose-300!' : 'text-rose-600') : (isDark ? 'text-stone-400!' : 'text-stone-600')}
                  `}>
                    {day}
                  </span>
                  
                  {hasMemory && (
                    <Heart className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4 shrink-0 ${isDark ? 'text-rose-400 fill-rose-900/50' : 'text-rose-400 fill-rose-200'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default CalendarGrid;