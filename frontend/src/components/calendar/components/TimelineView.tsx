import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import type { CalendarMemory } from '../types/calendar';
import { monthNames } from '../constants/calendarConstants';

interface TimelineViewProps {
  memories: (CalendarMemory & { date: string })[];
  monthName: string;
  theme: string;
}

const TimelineView: React.FC<TimelineViewProps> = ({ memories, monthName, theme }) => {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  if (memories.length === 0) {
    return (
      <div className={`text-center py-12 md:py-16 border-2 border-dashed rounded-sm px-4 ${isDark ? 'border-stone-700 bg-[#262222]' : 'border-stone-300 bg-white/50'}`}>
        <BookOpen className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
        <p className={`font-serif italic text-base md:text-xl ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
          No entries torn out for this month yet...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto mt-4 sm:mt-8">
      {/* Added !text-stone-300 here */}
      <h3 className={`text-2xl sm:text-3xl md:text-4xl font-handwriting text-center mb-6 md:mb-10 ${isDark ? '!text-stone-300' : 'text-stone-600'}`}>
        Clippings from {monthName}
      </h3>

      <div className={`relative border-l-2 border-dashed ml-4 sm:ml-6 md:ml-8 pl-6 sm:pl-8 md:pl-12 space-y-8 md:space-y-12 pb-8 ${isDark ? 'border-stone-700' : 'border-stone-300'}`}>
        {memories.map((memory, index) => {
          const memDate = new Date(memory.date + 'T00:00:00');
          return (
            <motion.div
              key={memory.id}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="relative group animate-none"
            >
              <div className={`absolute -left-8 sm:-left-10 md:-left-14 top-5 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 sm:border-4 shadow-sm z-10 ${isDark ? 'bg-stone-900 border-rose-900' : 'bg-white border-rose-300'}`} />

              <div 
                onClick={() => navigate(`/year/${memory.year_id}`)}
                className={`relative p-4 md:p-6 rounded-sm shadow-md cursor-pointer transition-all hover:scale-[1.01] ${
                  isDark ? 'bg-[#2a2626] border border-stone-700' : 'bg-white border border-stone-200'
                } ${index % 2 === 0 ? 'rotate-[0.5deg]' : '-rotate-[0.5deg]'}`}
              >
                <div className={`absolute -top-2.5 left-1/2 -translate-x-1/2 w-12 h-4 md:w-16 md:h-6 opacity-80 backdrop-blur-sm z-10 ${
                  index % 2 === 0 ? 'bg-rose-200/60 -rotate-1' : 'bg-stone-200/60 rotate-1'
                } ${isDark ? 'brightness-75' : ''}`} />

                <div className="flex flex-col sm:flex-row gap-4 md:gap-5">
                  {memory.image ? (
                    <div className="relative shrink-0 w-full sm:w-24 h-44 sm:h-24">
                      <img 
                        src={memory.image} 
                        alt={memory.title} 
                        className="w-full h-full object-cover rounded-sm border border-stone-200 dark:border-stone-700 shadow-sm" 
                      />
                      {/* Added dark:!text-stone-200 here */}
                      <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-stone-800 px-2 py-0.5 rounded shadow border border-stone-200 dark:border-stone-700 font-handwriting text-base md:text-xl text-stone-800 dark:!text-stone-200 -rotate-6">
                        {memDate.getDate()} {monthNames[memDate.getMonth()].substring(0,3)}
                      </div>
                    </div>
                  ) : (
                    <div className={`w-full sm:w-24 h-20 sm:h-24 shrink-0 rounded-sm flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 border-2 border-dashed ${isDark ? 'border-stone-700 bg-stone-800/50' : 'border-stone-300 bg-stone-50'}`}>
                      <span className={`text-2xl sm:text-3xl md:text-4xl font-serif font-bold ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>
                        {memDate.getDate()}
                      </span>
                      {/* Added !text-stone-400 here */}
                      <span className={`font-handwriting text-lg md:text-xl ${isDark ? '!text-stone-400' : 'text-stone-500'}`}>
                        {monthNames[memDate.getMonth()].substring(0,3)}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h5 className={`text-lg sm:text-xl md:text-2xl font-serif font-bold leading-tight mb-1 md:mb-2 break-words ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                      {memory.title}
                    </h5>
                    {/* Added !text-stone-400 here */}
                    <p className={`font-handwriting text-base sm:text-lg md:text-xl line-clamp-3 sm:line-clamp-2 break-words ${isDark ? '!text-stone-400' : 'text-stone-600'}`}>
                      {memory.description}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;