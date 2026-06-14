import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Trash2, Sparkles, Calendar, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

interface YearHeaderProps {
  year: number;
  description?: string;
  onDeleteYear: () => void;
  onEditYear: () => void; 
}

const YearHeader: React.FC<YearHeaderProps> = ({ year, description, onDeleteYear, onEditYear }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const getDateRange = () => {
    if (!user?.anniversary_date) return null;
    const anniversary = new Date(user.anniversary_date);
    if (isNaN(anniversary.getTime())) return null;
    
    if (year === 0) {
      const end = new Date(anniversary);
      end.setDate(end.getDate() - 1);
      return { start: null, end };
    }
    const start = new Date(anniversary);
    start.setFullYear(start.getFullYear() + (year - 1));
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return { start, end };
  };

  const dateRange = getDateRange();
  const isPrequel = year === 0;

  return (
    <div className="mb-12 w-full">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-8 px-2 text-xs uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">
        <button 
          onClick={() => navigate('/dashboard')} 
          className="flex items-center gap-2 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex gap-4">
          <button 
            onClick={onEditYear} 
            className="flex items-center gap-2 hover:text-rose-500 dark:hover:text-rose-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" /> Edit Chapter
          </button>
          <button 
            onClick={onDeleteYear} 
            className="flex items-center gap-2 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Remove Chapter
          </button>
        </div>
      </div>

      {/* Main Header Box */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full p-8 border shadow-sm flex items-center gap-8 relative ${
          isDark 
            ? 'bg-[#1e1a1b] border-gray-800' 
            : 'bg-[#fffaf6] border-gray-200'
        }`}
      >
        {/* Logo/Icon */}
        <div className={`hidden sm:flex shrink-0 w-20 h-20 rounded-full shadow-inner border items-center justify-center ${
          isDark 
            ? 'bg-black border-gray-800' 
            : 'bg-white border-gray-100'
        }`}>
          <img src="/favicon.svg" alt="LogOfUs" className="w-10 h-10" />
        </div>

        {/* Text Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2 text-rose-500 dark:text-rose-400 uppercase tracking-[0.2em] text-2.5 font-bold">
            <Sparkles className="w-3 h-3" />
            {isPrequel ? 'Prequel' : `Volume ${year}`}
          </div>

          <h1 className={`text-4xl md:text-5xl font-serif tracking-tight ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            {description || (isPrequel ? "The Beginning" : `Our ${year}th Year`)}
          </h1>

          <div className={`flex items-center gap-2 font-serif italic text-sm ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}>
            <Calendar className="w-3.5 h-3.5" />
            {dateRange && (
              <span>
                {dateRange.start 
                  ? `${dateRange.start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} — ${dateRange.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                  : `Before ${dateRange.end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
                }
              </span>
            )}
          </div>
        </div>

        {/* Accent Bar */}
        <div className={`absolute right-0 top-0 bottom-0 w-2 ${
          isDark ? 'bg-rose-800/50' : 'bg-rose-200/50'
        }`} />
      </motion.div>
    </div>
  );
};

export default YearHeader;