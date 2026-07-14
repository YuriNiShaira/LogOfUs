import React, { useState, } from 'react';
import { AlertCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import MemoryDetailModal from '../components/MemoryDetailModal';
import {
  CalendarHeader,
  YearSelector,
  ViewModeToggle,
  StatsDisplay,
  CalendarGrid,
  TimelineView,
  useCalendar,
  monthNames,
} from '../components/calendar';
import type { ViewMode } from '../components/calendar';

interface FullMemory {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string | null;
  memory_type: string;
  is_favorite: boolean;
  location: string;
  favorite_quote?: string;
  year_id: number;
  year: number;
  created_at: string;
  updated_at: string;
}

const MemoryCalendarPage: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const today = new Date();
  
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDateMemories, setSelectedDateMemories] = useState<FullMemory[]>([]);
  const [currentMemoryIndex, setCurrentMemoryIndex] = useState(0);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [allAvailableDates, setAllAvailableDates] = useState<string[]>([]);
  const [currentDateIndex, setCurrentDateIndex] = useState(0);

  const startYear = user?.anniversary_date
    ? new Date(user.anniversary_date).getFullYear()
    : 2000;

  const {
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    calendarData,
    isLoading,
    isError,
    allMemoriesData,
    direction,
    hasMemories,
    isToday,
    jumpToYear,
    prevMonth,
    nextMonth,
    thisMonthMemories
  } = useCalendar();

  const availableYears = Array.from(
    { length: today.getFullYear() - startYear + 1 },
    (_, i) => startYear + i
  );

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const favoriteCount = calendarData 
    ? Object.values(calendarData.memories).flat().filter(m => m.is_favorite).length 
    : 0;

  const isDark = theme === 'dark';

  // Get ALL dates with memories across ALL years
  const getAllDatesWithMemories = (): string[] => {
    const allDates = Object.keys(allMemoriesData).filter(date => 
      allMemoriesData[date] && allMemoriesData[date].length > 0
    );
    return allDates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  // Navigate to a specific date
  const goToDate = async (dateStr: string) => {
    const memories = allMemoriesData[dateStr] || [];
    if (memories.length === 0) return;
    
    setSelectedDateStr(dateStr);
    const dateIdx = allAvailableDates.indexOf(dateStr);
    setCurrentDateIndex(dateIdx >= 0 ? dateIdx : 0);
    
    try {
      const memoryIds = memories.map(m => m.id);
      const fullMemoriesPromises = memoryIds.map(id => 
        api.get(`/memories/${id}/`).then(res => res.data)
      );
      const fullMemories = await Promise.all(fullMemoriesPromises);
      
      if (fullMemories && fullMemories.length > 0) {
        setSelectedDateMemories(fullMemories);
      } else {
        setSelectedDateMemories(memories as unknown as FullMemory[]);
      }
    } catch (error) {
      console.error('Error fetching full memories:', error);
      setSelectedDateMemories(memories as unknown as FullMemory[]);
    }
    
    setCurrentMemoryIndex(0);
  };

  // Handle date click - get ALL dates for navigation
  const handleDateClick = async (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const memories = allMemoriesData[dateStr] || [];
    
    if (memories.length > 0) {
      setSelectedDateStr(dateStr);
      
      // Get ALL dates with memories (across all years)
      const allDates = getAllDatesWithMemories();
      setAllAvailableDates(allDates);
      const dateIdx = allDates.indexOf(dateStr);
      setCurrentDateIndex(dateIdx >= 0 ? dateIdx : 0);
      
      try {
        const memoryIds = memories.map(m => m.id);
        const fullMemoriesPromises = memoryIds.map(id => 
          api.get(`/memories/${id}/`).then(res => res.data)
        );
        const fullMemories = await Promise.all(fullMemoriesPromises);
        
        if (fullMemories && fullMemories.length > 0) {
          setSelectedDateMemories(fullMemories);
        } else {
          setSelectedDateMemories(memories as unknown as FullMemory[]);
        }
      } catch (error) {
        console.error('Error fetching full memories:', error);
        setSelectedDateMemories(memories as unknown as FullMemory[]);
      }
      
      setCurrentMemoryIndex(0);
      setIsDetailModalOpen(true);
    }
  };

  // Navigation functions - handles both memories within a date AND dates across years
  const handleNextMemory = () => {
    const totalMemories = selectedDateMemories.length;
    
    // If there are more memories on the same date
    if (currentMemoryIndex < totalMemories - 1) {
      setCurrentMemoryIndex(prev => prev + 1);
      return;
    }
    
    // If we're on the last memory of this date, go to next date (works across years)
    if (currentDateIndex < allAvailableDates.length - 1) {
      const nextDate = allAvailableDates[currentDateIndex + 1];
      goToDate(nextDate);
    }
  };

  const handlePrevMemory = () => {
    // If there are more memories on the same date
    if (currentMemoryIndex > 0) {
      setCurrentMemoryIndex(prev => prev - 1);
      return;
    }
    
    // ✅ If we're on the first memory of this date, go to previous date (works across years)
    if (currentDateIndex > 0) {
      const prevDate = allAvailableDates[currentDateIndex - 1];
      goToDate(prevDate);
    }
  };

  // Handlers for month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(prev => prev - 1);
    }
    setCurrentMonth(prev => prev === 0 ? 11 : prev - 1);
    prevMonth();
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(prev => prev + 1);
    }
    setCurrentMonth(prev => prev === 11 ? 0 : prev + 1);
    nextMonth();
  };

  const handleYearChange = (year: number) => {
    setCurrentYear(year);
    jumpToYear(year);
  };

  const handlePrevYear = () => {
    const newYear = Math.max(startYear, currentYear - 1);
    setCurrentYear(newYear);
    jumpToYear(newYear);
  };

  const handleNextYear = () => {
    const newYear = Math.min(today.getFullYear(), currentYear + 1);
    setCurrentYear(newYear);
    jumpToYear(newYear);
  };

  const currentMemory = selectedDateMemories[currentMemoryIndex] || null;

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#fdfbf7] dark:bg-[#1a1a1a]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      <RomanticBackground />
      <Navbar />

      <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 py-6 md:py-10 pb-24 md:pb-16">
        
        <CalendarHeader theme={theme}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
            <YearSelector
              currentYear={currentYear}
              availableYears={availableYears}
              onYearChange={handleYearChange}
              onPrevYear={handlePrevYear}
              onNextYear={handleNextYear}
              theme={theme}
            />
            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              theme={theme}
            />
          </div>
        </CalendarHeader>

        <div className={`border-b-2 border-dashed my-6 md:my-8 ${isDark ? 'border-stone-700' : 'border-stone-300'}`} />

        <StatsDisplay
          totalDates={calendarData?.total_dates || 0}
          totalMemories={calendarData?.total_memories || 0}
          daysInMonth={daysInMonth}
          monthName={monthNames[currentMonth]}
          favoriteCount={favoriteCount}
          theme={theme}
        />

        {isError && (
          <div className="flex flex-col items-center justify-center py-12 text-rose-500 text-center px-4">
            <AlertCircle className="w-10 h-10 mb-3 opacity-80" />
            <p className="font-serif italic text-lg">
              We had trouble flipping the pages. Please try again later.
            </p>
          </div>
        )}

        {viewMode === 'calendar' && !isError && (
          <CalendarGrid
            currentYear={currentYear}
            currentMonth={currentMonth}
            direction={direction}
            daysInMonth={daysInMonth}
            firstDayOfMonth={firstDayOfMonth}
            hasMemories={hasMemories}
            isToday={isToday}
            onDateClick={handleDateClick}
            onPrevMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            theme={theme}
          />
        )}

        {viewMode === 'timeline' && !isError && (
          <TimelineView
            memories={thisMonthMemories}
            monthName={monthNames[currentMonth]}
            theme={theme}
          />
        )}

        {isLoading && (
          <div className="text-center py-12">
            <span className={`font-handwriting text-2xl md:text-3xl ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
              Flipping pages...
            </span>
          </div>
        )}
      </div>

      {/* MemoryDetailModal with Navigation - Using full data */}
      <MemoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedDateMemories([]);
          setCurrentMemoryIndex(0);
          setSelectedDateStr('');
          setAllAvailableDates([]);
          setCurrentDateIndex(0);
        }}
        memory={currentMemory}
        memories={selectedDateMemories}
        currentIndex={currentMemoryIndex}
        onNext={handleNextMemory}
        onPrev={handlePrevMemory}
        date={selectedDateStr || undefined}
        totalDates={allAvailableDates.length}
        currentDateIndex={currentDateIndex}
        currentDateStr={selectedDateStr}
      />
    </div>
  );
};

export default MemoryCalendarPage;