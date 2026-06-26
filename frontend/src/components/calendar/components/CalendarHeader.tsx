import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface CalendarHeaderProps {
  theme: string;
  children?: React.ReactNode;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ theme, children }) => {
  const navigate = useNavigate();
  const isDark = theme === 'dark';

  return (
    <div className="mb-8 md:mb-10">
      <button
        onClick={() => navigate('/dashboard')}
        className={`font-handwriting text-xl md:text-2xl flex items-center transition-colors mb-4 md:mb-6 group ${
          isDark ? 'text-stone-400 hover:text-rose-400' : 'text-stone-500 hover:text-rose-600'
        }`}
      >
        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
        Flip back to Dashboard
      </button>

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-serif italic font-bold mb-1 md:mb-2 ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
            Calendar of <span className="text-rose-500">Us</span>
          </h1>
          <p className={`text-xl md:text-2xl font-handwriting ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
            Every special day, remembered forever...
          </p>
        </div>
        {children}
      </div>
    </div>
  );
};

export default CalendarHeader;