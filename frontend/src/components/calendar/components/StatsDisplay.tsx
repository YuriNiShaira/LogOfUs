import React from 'react';
import PinNote from './PinNote';

interface StatsDisplayProps {
  totalDates: number;
  totalMemories: number;
  daysInMonth: number;
  monthName: string;
  favoriteCount: number;
  theme: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({
  totalDates,
  totalMemories,
  daysInMonth,
  monthName,
  favoriteCount,
  theme
}) => {
  return (
    <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6 justify-items-center sm:justify-center mb-8 md:mb-12">
      <PinNote 
        count={totalDates} 
        label="Memory Days" 
        bg="bg-[#eef5fb]" 
        rotate="-rotate-2" 
        theme={theme} 
      />
      <PinNote 
        count={totalMemories} 
        label="Total Entries" 
        bg="bg-[#fbf0f6]" 
        rotate="rotate-1" 
        theme={theme} 
      />
      <PinNote 
        count={daysInMonth} 
        label={`Days in ${monthName.substring(0,3)}`} 
        bg="bg-[#eafbf3]" 
        rotate="-rotate-1" 
        theme={theme} 
      />
      <PinNote 
        count={favoriteCount} 
        label="Favorites" 
        bg="bg-[#fbfce5]" 
        rotate="rotate-2" 
        theme={theme} 
      />
    </div>
  );
};

export default StatsDisplay;