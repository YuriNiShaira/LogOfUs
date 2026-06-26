import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../../services/api';
import type { CalendarData, CalendarMemory, RouteState } from '../types/calendar';

export const useCalendar = () => { 
  const navigate = useNavigate();
  const location = useLocation();
  const today = new Date();
  
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [direction, setDirection] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedMemories, setSelectedMemories] = useState<CalendarMemory[]>([]);
  const [isBookOpen, setIsBookOpen] = useState(false);
  const [detailMemory, setDetailMemory] = useState<CalendarMemory | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Queries
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

  // Handle navigation from book modal
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

  // Helper functions
  const getDateString = (day: number) => {
    return `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const hasMemories = (day: number): boolean => {
    const dateStr = getDateString(day);
    return !!(calendarData?.memories[dateStr] && calendarData.memories[dateStr].length > 0);
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

  const thisMonthMemories = useMemo(() => {
    if (!calendarData) return [];
    return Object.entries(calendarData.memories)
      .sort(([a], [b]) => b.localeCompare(a))
      .flatMap(([date, memories]) => memories.map(m => ({ ...m, date })));
  }, [calendarData]);

  return {
    // State
    currentMonth,
    setCurrentMonth,
    currentYear,
    setCurrentYear,
    direction,
    selectedDate,
    setSelectedDate,
    selectedMemories,
    setSelectedMemories,
    isBookOpen,
    setIsBookOpen,
    detailMemory,
    setDetailMemory,
    isDetailModalOpen,
    setIsDetailModalOpen,
    // Data
    calendarData,
    allMemoriesData,
    isLoading,
    isError,
    // Functions
    jumpToYear,
    prevMonth,
    nextMonth,
    hasMemories,
    isToday,
    handleDateClick,
    getDateString,
    getMemoriesForDate,
    thisMonthMemories
  };
};