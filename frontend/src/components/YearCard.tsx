import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CalendarDays, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface YearCardProps {
  year: {
    id: number;
    year_number: number;
    cover_image?: string;
    description?: string;
    memory_count?: number;
  };
  onClick: () => void;
}

const YearCard: React.FC<YearCardProps> = ({ year, onClick }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';

  const getDateRange = () => {
    if (!user?.anniversary_date) return null;
    const anniversary = new Date(user.anniversary_date);
    if (isNaN(anniversary.getTime())) return null;

    if (year.year_number === 0) {
      const end = new Date(anniversary);
      end.setDate(end.getDate() - 1);
      return { start: null, end };
    }
    const start = new Date(anniversary);
    start.setFullYear(start.getFullYear() + (year.year_number - 1));
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return { start, end };
  };

  const dateRange = getDateRange();
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Palette based on your original styling
  const paperBg = isDark ? 'bg-[#1a050f]' : 'bg-[#FFFAF0]';
  const layerBg = isDark ? 'bg-[#2a0815]' : 'bg-white';
  const borderColor = isDark ? 'border-rose-900/60' : 'border-rose-200/80';
  const displayVol = year.year_number === 0 ? '0' : year.year_number;

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 250, damping: 25 }}
      className="relative group cursor-pointer w-full max-w-sm mx-auto"
      onClick={onClick}
    >
      {/* Paper Grain Texture */}
      <style>{`
        .journal-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Floating Ambient Glow */}
      <div className={`absolute -inset-4 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 ${
        isDark ? 'bg-rose-900/20' : 'bg-rose-300/30'
      }`} />

      {/* Stacked Back Page (Fans out more on hover) */}
      <div className={`absolute inset-0 rounded-2xl border origin-bottom-left rotate-2 translate-x-2 translate-y-2 shadow-sm group-hover:rotate-6 group-hover:translate-x-5 group-hover:translate-y-3 transition-all duration-500 ease-out ${layerBg} ${borderColor}`}>
        <div className="absolute inset-0 opacity-[0.04] journal-grain mix-blend-multiply dark:mix-blend-overlay rounded-2xl pointer-events-none" />
      </div>

      {/* Stacked Middle Page (Fans out slightly on hover) */}
      <div className={`absolute inset-0 rounded-2xl border origin-bottom-left -rotate-1 translate-x-0.5 shadow-sm group-hover:rotate-3 group-hover:translate-x-3 group-hover:translate-y-1 transition-all duration-500 ease-out ${paperBg} ${borderColor}`}>
        <div className="absolute inset-0 opacity-[0.04] journal-grain mix-blend-multiply dark:mix-blend-overlay rounded-2xl pointer-events-none" />
      </div>

      {/* Main Card (The Book Cover) */}
      <div className={`relative overflow-hidden rounded-2xl border shadow-lg dark:shadow-[0_15px_30px_rgba(0,0,0,0.5)] group-hover:shadow-2xl transition-all duration-500 z-10 flex flex-col ${paperBg} ${borderColor}`}>
        
        {/* Book Binding/Spine visual on the left edge */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-linear-to-r from-black/20 to-transparent z-30 pointer-events-none mix-blend-overlay" />

        {/* Top Cover Area */}
        <div className="relative h-80 w-full overflow-hidden">
          {year.cover_image ? (
            <img
              src={year.cover_image}
              alt={year.year_number === 0 ? 'Prequel' : `Year ${year.year_number}`}
              className="w-full h-full object-cover object-center scale-100 group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
            />
          ) : (
            <div className={`relative w-full h-full flex flex-col items-center justify-center ${isDark ? 'bg-[#15040c]' : 'bg-rose-50/50'}`}>
              <BookOpen className={`w-16 h-16 stroke-[1] mb-4 ${isDark ? 'text-rose-900/50' : 'text-rose-200'}`} />
            </div>
          )}

          {/* Gradients to ensure text is ALWAYS readable */}
          <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-90" />
          
          {/* Top Badge: Volume */}
          <div className="absolute top-5 left-5 z-20">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/10 dark:bg-black/30 backdrop-blur-md rounded-full border border-white/20 shadow-lg">
              <Sparkles className="w-3.5 h-3.5 text-rose-300" />
              <span className="text-xs font-bold text-white tracking-[0.2em] uppercase font-sans">
                Vol {displayVol}
              </span>
            </div>
          </div>

          {/* Large Watermark Number behind the title */}
          <div className="absolute -bottom-4 right-4 z-10 pointer-events-none select-none">
            <span className="text-[120px] font-serif font-black text-white/10 dark:text-white/5 leading-none">
              {displayVol}
            </span>
          </div>

          {/* Title & DATES */}
          <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col pl-4 border-l-2 border-rose-400/50">
            <h2 className="text-white text-3xl sm:text-4xl font-serif font-medium leading-tight drop-shadow-lg mb-2">
              {year.description || (year.year_number === 0 ? 'Before We Were Official' : `The Story of Year ${year.year_number}`)}
            </h2>
            
            {/* Elegant Date Range Display */}
            {dateRange && (
              <p className="text-rose-100/90 font-serif italic text-sm sm:text-base tracking-wide">
                {dateRange.start
                  ? `${formatDate(dateRange.start)} — ${formatDate(dateRange.end)}`
                  : `All dates before ${formatDate(dateRange.end)}`}
              </p>
            )}
          </div>
        </div>

        {/* Footer Bar */}
        <div className={`px-6 py-5 border-t flex items-center justify-between ${
          isDark ? 'bg-[#110307]/90 border-rose-900/60' : 'bg-white/80 border-rose-100'
        }`}>
          
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <CalendarDays className="w-5 h-5 opacity-80" />
            <span className="text-sm font-semibold tracking-wide font-sans uppercase">
              {year.memory_count || 0} {year.memory_count === 1 ? 'Date Inside' : 'Dates Inside'}
            </span>
          </div>

          {/* Call to Action */}
          <motion.div
            whileHover={{ x: 5 }}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] font-sans font-bold text-rose-700 dark:text-rose-300"
          >
            <span>Open Volume</span>
            <span className="text-lg leading-none">→</span>
          </motion.div>
          
        </div>
      </div>
    </motion.div>
  );
};

export default YearCard;