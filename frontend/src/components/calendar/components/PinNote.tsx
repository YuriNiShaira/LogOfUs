import React from 'react';

interface PinNoteProps {
  count: number | string;
  label: string;
  bg: string;
  rotate: string;
  theme: string;
}

const PinNote: React.FC<PinNoteProps> = ({ count, label, bg, rotate, theme }) => {
  const isDark = theme === 'dark';
  
  return (
    <div className={`relative ${isDark ? 'bg-[#2a2626] border border-stone-700' : bg} p-3 sm:p-4 w-full sm:w-40 md:w-48 flex flex-col items-center justify-center rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${rotate} transition-transform hover:scale-105`}>
      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f96a7b] rounded-full border border-[#e55365] shadow-sm z-10" />
      
      {/* Added !text-white to override the .dark .font-handwriting CSS rule */}
      <span className={`font-handwriting text-2xl sm:text-3xl md:text-4xl mt-1 leading-none ${isDark ? '!text-white' : 'text-gray-800'}`}>
        {count}
      </span>
      
      <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-center mt-1.5 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
        {label}
      </span>
    </div>
  );
};

export default PinNote;