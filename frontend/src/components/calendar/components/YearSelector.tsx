import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface YearSelectorProps {
  currentYear: number;
  availableYears: number[];
  onYearChange: (year: number) => void;
  onPrevYear: () => void;
  onNextYear: () => void;
  theme: string;
}

const YearSelector: React.FC<YearSelectorProps> = ({
  currentYear,
  availableYears,
  onYearChange,
  onPrevYear,
  onNextYear,
  theme
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center justify-between sm:justify-start gap-1 md:gap-2 p-1.5 md:p-2 rounded-lg border-2 border-dashed w-full sm:w-auto ${isDark ? 'border-stone-700 bg-stone-800/50' : 'border-stone-300 bg-white/60'}`}>
      <button 
        onClick={onPrevYear} 
        className={`p-1 sm:p-1.5 rounded-md hover:bg-black/5 transition-colors ${isDark ? 'text-stone-400' : 'text-stone-600'}`}
        aria-label="Previous year"
      >
        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
      </button>
      
      <div className="relative flex items-center justify-center flex-1 sm:flex-initial px-2">
        <select
          value={currentYear}
          onChange={(e) => onYearChange(parseInt(e.target.value))}
          className={`bg-transparent font-serif font-bold text-lg md:text-xl outline-none cursor-pointer appearance-none text-center pr-4 ${isDark ? 'text-stone-200' : 'text-stone-700'}`}
        >
          {availableYears.map((year) => (
            <option key={year} value={year} className={isDark ? 'bg-stone-800' : 'bg-white'}>
              {year}
            </option>
          ))}
        </select>
        <span className="absolute right-1 pointer-events-none text-xs opacity-50">▼</span>
      </div>
      
      <button 
        onClick={onNextYear} 
        className={`p-1 sm:p-1.5 rounded-md hover:bg-black/5 transition-colors ${isDark ? 'text-stone-400' : 'text-stone-600'}`}
        aria-label="Next year"
      >
        <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
      </button>
    </div>
  );
};

export default YearSelector;