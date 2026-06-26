// src/components/calendar/components/ViewModeToggle.tsx
import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import type { ViewMode } from '../types/calendar';

interface ViewModeToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  theme?: string; 
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({ viewMode, onViewModeChange }) => {
  return (
    <div className="flex gap-1 bg-black/5 dark:bg-stone-800/40 p-1 rounded-lg w-full sm:w-auto">
      <button 
        onClick={() => onViewModeChange('calendar')}
        className={`px-3 md:px-4 py-2 rounded-md font-serif font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 md:gap-2 flex-1 sm:flex-none ${
          viewMode === 'calendar'
            ? 'bg-white text-rose-600 shadow-sm dark:bg-stone-800 dark:text-rose-400'
            : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
        }`}
      >
        <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
        Calendar
      </button>
      <button 
        onClick={() => onViewModeChange('timeline')}
        className={`px-3 md:px-4 py-2 rounded-md font-serif font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 md:gap-2 flex-1 sm:flex-none ${
          viewMode === 'timeline'
            ? 'bg-white text-rose-600 shadow-sm dark:bg-stone-800 dark:text-rose-400'
            : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
        }`}
      >
        <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /> 
        Timeline
      </button>
    </div>
  );
};

export default ViewModeToggle;