import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../services/api';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  ArrowLeft,
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import BookModal from '../components/BookModal';
import MemoryDetailModal from '../components/MemoryDetailModal'; 
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';

interface CalendarMemory {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string | null;
  memory_type: string;
  is_favorite: boolean;
  location: string;
  year_id: number;
  year: number;
}

interface CalendarData {
  memories: Record<string, CalendarMemory[]>;
  total_dates: number;
  total_memories: number;
}

interface RouteState {
  openBookModal?: boolean;
  bookDate?: string;
  memoryId?: number;
  fromBookModal?: boolean;
}

const PinNote = ({ count, label, bg, rotate, theme }: { count: number | string, label: string, bg: string, rotate: string, theme: string }) => (
  <div className={`relative ${theme === 'dark' ? 'bg-[#2a2626] border border-stone-700' : bg} p-3 sm:p-4 w-full sm:w-40 md:w-48 flex flex-col items-center justify-center rounded-sm shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${rotate} transition-transform hover:scale-105`}>
    <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-[#f96a7b] rounded-full border border-[#e55365] shadow-sm z-10" />
    <span className={`font-handwriting text-2xl sm:text-3xl md:text-4xl mt-1 leading-none ${theme === 'dark' ? 'text-stone-200' : 'text-gray-800'}`}>{count}</span>
    <span className={`text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wider text-center mt-1.5 ${theme === 'dark' ? 'text-stone-400' : 'text-gray-500'}`}>{label}</span>
  </div>
);

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 30 : -30,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 30 : -30,
    opacity: 0,
  }),
};

const gridGapClasses = "gap-1 sm:gap-2 md:gap-3";

const MemoryCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [direction, setDirection] = useState(0); 
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMemories, setSelectedMemories] = useState<CalendarMemory[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  const [isBookOpen, setIsBookOpen] = useState(false);
  
  const [detailMemory, setDetailMemory] = useState<CalendarMemory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const startYear = user?.anniversary_date
    ? new Date(user.anniversary_date).getFullYear()
    : 2000;

  const { data: calendarData, isLoading, isError } = useQuery<CalendarData>({
    queryKey: ['calendar', currentYear, currentMonth + 1],
    queryFn: () =>
      api.get(`/calendar/?year=${currentYear}&month=${currentMonth + 1}`).then(res => res.data),
  });

  const { data: allYearData } = useQuery<CalendarData>({
    queryKey: ['calendar', currentYear],
    queryFn: () => api.get(`/calendar/?year=${currentYear}`).then(res => res.data),
  });

  const allMemoriesData = useMemo(() => ({
    ...calendarData?.memories,
    ...allYearData?.memories,
  }), [calendarData, allYearData]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const availableYears = Array.from(
    { length: today.getFullYear() - startYear + 1 },
    (_, i) => startYear + i
  );

  const jumpToYear = (year: number) => {
    setDirection(year > currentYear ? 1 : -1);
    setCurrentYear(year);
    setCurrentMonth(year === today.getFullYear() ? today.getMonth() : 0);
    setSelectedDate(null);
    setSelectedMemories([]);
    setIsBookOpen(false);
  };

  const prevMonth = () => {
    setDirection(-1);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
    setSelectedDate(null);
    setSelectedMemories([]);
    setIsBookOpen(false);
  };

  const nextMonth = () => {
    setDirection(1);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
    setSelectedDate(null);
    setSelectedMemories([]);
    setIsBookOpen(false);
  };

  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const hasMemories = (day: number) => {
    const dateStr = getDateString(day);
    return calendarData?.memories[dateStr] && calendarData.memories[dateStr].length > 0;
  };

  const getMemoriesForDate = (day: number) => {
    const dateStr = getDateString(day);
    return calendarData?.memories[dateStr] || [];
  };

  const isToday = (day: number) => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const handleDateClick = (day: number) => {
    const dateStr = getDateString(day);
    const memories = getMemoriesForDate(day);
    if (memories.length > 0) {
      setSelectedDate(dateStr);
      setSelectedMemories(memories);
      setIsBookOpen(true);
    }
  };

  const thisMonthMemories = useMemo(() => {
    if (!calendarData) return [];
    return Object.entries(calendarData.memories)
      .sort(([a], [b]) => b.localeCompare(a))
      .flatMap(([date, memories]) => memories.map(m => ({ ...m, date })));
  }, [calendarData]);

  const isDark = theme === 'dark';

  useEffect(() => {
    const state = location.state as RouteState;
    if (state?.openBookModal && state.bookDate) {
      const dateStr: string = state.bookDate;
      const dateObj = new Date(dateStr + 'T00:00:00');
      const targetYear = dateObj.getFullYear();
      const targetMonth = dateObj.getMonth();

      if (currentYear !== targetYear) {
        setCurrentYear(targetYear);
        setCurrentMonth(targetMonth);
        setSelectedDate(dateStr);
        setIsBookOpen(true);
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }

      setSelectedDate(dateStr);
      setSelectedMemories(allMemoriesData[dateStr] || []);
      setIsBookOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, allMemoriesData, currentYear, navigate, location.pathname]);

  return (
    <div className="min-h-screen relative overflow-x-hidden bg-[#fdfbf7] dark:bg-[#1a1a1a]">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
        
        .bg-dotted-paper {
          background-image: radial-gradient(${isDark ? '#333' : '#e5e1d8'} 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}} />

      <RomanticBackground />
      <div className="bg-dotted-paper absolute inset-0 pointer-events-none opacity-50" />
      <Navbar />

      <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 py-6 md:py-10 pb-24 md:pb-16">
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 md:mb-10">
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

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 w-full lg:w-auto">
              <div className={`flex items-center justify-between sm:justify-start gap-1 md:gap-2 p-1.5 md:p-2 rounded-lg border-2 border-dashed w-full sm:w-auto ${isDark ? 'border-stone-700 bg-stone-800/50' : 'border-stone-300 bg-white/60'}`}>
                <button onClick={() => jumpToYear(Math.max(startYear, currentYear - 1))} className={`p-1 sm:p-1.5 rounded-md hover:bg-black/5 transition-colors ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <div className="relative flex items-center justify-center flex-1 sm:flex-initial px-2">
                  <select
                    value={currentYear}
                    onChange={(e) => jumpToYear(parseInt(e.target.value))}
                    className={`bg-transparent font-serif font-bold text-lg md:text-xl outline-none cursor-pointer appearance-none text-center pr-4 ${isDark ? 'text-stone-200' : 'text-stone-700'}`}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year} className={isDark ? 'bg-stone-800' : 'bg-white'}>{year}</option>
                    ))}
                  </select>
                  <span className="absolute right-1 pointer-events-none text-xs opacity-50">▼</span>
                </div>
                <button onClick={() => jumpToYear(Math.min(today.getFullYear(), currentYear + 1))} className={`p-1 sm:p-1.5 rounded-md hover:bg-black/5 transition-colors ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>

              <div className="flex gap-1 bg-black/5 dark:bg-stone-800/40 p-1 rounded-lg w-full sm:w-auto">
                <button onClick={() => setViewMode('calendar')}
                  className={`px-3 md:px-4 py-2 rounded-md font-serif font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 md:gap-2 flex-1 sm:flex-none ${
                    viewMode === 'calendar'
                      ? 'bg-white text-rose-600 shadow-sm dark:bg-stone-800 dark:text-rose-400'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}>
                  <CalendarIcon className="w-3.5 h-3.5 md:w-4 md:h-4" /> Calendar
                </button>
                <button onClick={() => setViewMode('timeline')}
                  className={`px-3 md:px-4 py-2 rounded-md font-serif font-bold text-xs md:text-sm transition-all flex items-center justify-center gap-1.5 md:gap-2 flex-1 sm:flex-none ${
                    viewMode === 'timeline'
                      ? 'bg-white text-rose-600 shadow-sm dark:bg-stone-800 dark:text-rose-400'
                      : 'text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200'
                  }`}>
                  <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" /> Timeline
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        <div className={`border-b-2 border-dashed my-6 md:my-8 ${isDark ? 'border-stone-700' : 'border-stone-300'}`} />

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:gap-6 justify-items-center sm:justify-center mb-8 md:mb-12">
          <PinNote count={calendarData?.total_dates || 0} label="Memory Days" bg="bg-[#eef5fb]" rotate="-rotate-2" theme={theme} />
          <PinNote count={calendarData?.total_memories || 0} label="Total Entries" bg="bg-[#fbf0f6]" rotate="rotate-1" theme={theme} />
          <PinNote count={daysInMonth} label={`Days in ${monthNames[currentMonth].substring(0,3)}`} bg="bg-[#eafbf3]" rotate="-rotate-1" theme={theme} />
          <PinNote count={calendarData ? Object.values(calendarData.memories).flat().filter(m => m.is_favorite).length : 0} label="Favorites" bg="bg-[#fbfce5]" rotate="rotate-2" theme={theme} />
        </motion.div>

        {isError && (
          <div className="flex flex-col items-center justify-center py-12 text-rose-500 text-center px-4">
             <AlertCircle className="w-10 h-10 mb-3 opacity-80" />
             <p className="font-serif italic text-lg">We had trouble flipping the pages. Please try again later.</p>
          </div>
        )}

        {viewMode === 'calendar' && !isError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className={`relative rounded-sm px-3 py-4 sm:px-8 sm:py-6 md:p-10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] w-full mx-auto ${isDark ? 'bg-[#262222] border border-stone-800' : 'bg-white border border-stone-200'}`}
          >
            <div className="flex items-center justify-between gap-2 mb-6 md:mb-8">
              <button onClick={prevMonth} className={`font-handwriting text-lg sm:text-xl md:text-2xl transition-colors hover:text-rose-500 z-10 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
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
              <button onClick={nextMonth} className={`font-handwriting text-lg sm:text-xl md:text-2xl transition-colors hover:text-rose-500 z-10 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
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
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                    <div key={day} className={`text-center font-handwriting text-[13px] sm:text-sm md:text-lg lg:text-2xl ${i === 0 || i === 6 ? 'text-rose-500' : (isDark ? 'text-stone-400' : 'text-stone-600')}`}>
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
                      <motion.button
                        key={day}
                        whileHover={hasMemory ? { scale: 1.04, rotate: isTodayDate ? 0 : 1 } : {}}
                        whileTap={hasMemory ? { scale: 0.96 } : {}}
                        onClick={() => handleDateClick(day)}
                        disabled={!hasMemory}
                        className={`
                          relative aspect-square w-full flex flex-col items-center justify-center transition-all p-0.5 sm:p-1 gap-0.5
                          ${hasMemory ? 'cursor-pointer' : 'cursor-default opacity-60'}
                          ${hasMemory && !isDark ? 'bg-[#fff5f5] border border-dashed border-rose-300 shadow-sm' : ''}
                          ${hasMemory && isDark ? 'bg-stone-800/80 border border-dashed border-rose-900 shadow-sm' : ''}
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
                        
                        <span className={`font-handwriting block w-full text-center leading-none text-base sm:text-base md:text-2xl lg:text-3xl xl:text-4xl ${hasMemory ? (isDark ? 'text-rose-300' : 'text-rose-600') : (isDark ? 'text-stone-600' : 'text-stone-400')}`}>
                          {day}
                        </span>
                        
                        {hasMemory && (
                          <Heart className={`w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-4 md:h-4 shrink-0 ${isDark ? 'text-rose-400 fill-rose-900/50' : 'text-rose-400 fill-rose-200'}`} />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        )}

        {viewMode === 'timeline' && !isError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto mt-4 sm:mt-8">
            <h3 className={`text-2xl sm:text-3xl md:text-4xl font-handwriting text-center mb-6 md:mb-10 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              Clippings from {monthNames[currentMonth]}
            </h3>

            {thisMonthMemories.length === 0 ? (
              <div className={`text-center py-12 md:py-16 border-2 border-dashed rounded-sm px-4 ${isDark ? 'border-stone-700 bg-[#262222]' : 'border-stone-300 bg-white/50'}`}>
                <BookOpen className={`w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 opacity-50 ${isDark ? 'text-stone-500' : 'text-stone-400'}`} />
                <p className={`font-serif italic text-base md:text-xl ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>No entries torn out for this month yet...</p>
              </div>
            ) : (
              <div className={`relative border-l-2 border-dashed ml-4 sm:ml-6 md:ml-8 pl-6 sm:pl-8 md:pl-12 space-y-8 md:space-y-12 pb-8 ${isDark ? 'border-stone-700' : 'border-stone-300'}`}>
                {thisMonthMemories.map((memory: any, index: number) => {
                  const memDate = new Date(memory.date + 'T00:00:00');
                  return (
                    <motion.div
                      key={memory.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative group animate-none"
                    >
                      <div className={`absolute -left-[32px] sm:-left-[41px] md:-left-[55px] top-5 w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 rounded-full border-2 sm:border-4 shadow-sm z-10 ${isDark ? 'bg-stone-900 border-rose-900' : 'bg-white border-rose-300'}`} />

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
                              <img src={memory.image} alt={memory.title} className="w-full h-full object-cover rounded-sm border border-stone-200 dark:border-stone-700 shadow-sm" />
                              <div className="absolute -bottom-1.5 -right-1.5 bg-white dark:bg-stone-800 px-2 py-0.5 rounded shadow border border-stone-200 dark:border-stone-700 font-handwriting text-base md:text-xl text-stone-800 dark:text-stone-200 rotate-[-6deg]">
                                {memDate.getDate()} {monthNames[memDate.getMonth()].substring(0,3)}
                              </div>
                            </div>
                          ) : (
                            <div className={`w-full sm:w-24 h-20 sm:h-24 shrink-0 rounded-sm flex flex-row sm:flex-col items-center justify-center gap-2 sm:gap-0 border-2 border-dashed ${isDark ? 'border-stone-700 bg-stone-800/50' : 'border-stone-300 bg-stone-50'}`}>
                              <span className={`text-2xl sm:text-3xl md:text-4xl font-serif font-bold ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>{memDate.getDate()}</span>
                              <span className={`font-handwriting text-lg md:text-xl ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>{monthNames[memDate.getMonth()].substring(0,3)}</span>
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h5 className={`text-lg sm:text-xl md:text-2xl font-serif font-bold leading-tight mb-1 md:mb-2 break-words ${isDark ? 'text-stone-200' : 'text-stone-800'}`}>
                              {memory.title}
                            </h5>
                            <p className={`font-handwriting text-base sm:text-lg md:text-xl line-clamp-3 sm:line-clamp-2 break-words ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                              {memory.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <span className={`font-handwriting text-2xl md:text-3xl ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>Flipping pages...</span>
          </div>
        )}
      </div>

      <BookModal
        isOpen={isBookOpen}
        onClose={() => setIsBookOpen(false)}
        date={selectedDate || ''}
        memories={selectedMemories}
        allMemories={allMemoriesData}
        onNavigate={(yearId, memoryId) => navigate(`/year/${yearId}`, { state: { memoryId, fromBookModal: true, bookDate: selectedDate } })}
        onDateChange={(newDate) => {
          setSelectedDate(newDate);
          setSelectedMemories(allMemoriesData[newDate] || []);
        }}
      />

      <MemoryDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailMemory(null);
        }}
        memory={detailMemory}
      />
    </div>
  );
};

export default MemoryCalendarPage;