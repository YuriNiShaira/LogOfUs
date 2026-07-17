import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, MapPin, Quote } from 'lucide-react';

interface CalendarMemory {
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
}

interface BookModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
  memories: CalendarMemory[];
  allMemories: Record<string, CalendarMemory[]>;
  onDateChange: (date: string) => void;
}

const BookModal: React.FC<BookModalProps> = ({
  isOpen, onClose, date, memories, allMemories, onDateChange
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const prevDateRef = useRef(date);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fullStoryRef = useRef<HTMLDivElement>(null);

  const currentMemory = memories[currentPage];
  const totalPages = memories.length;

  useEffect(() => {
    if (prevDateRef.current !== date) {
      setCurrentPage(0);
      setIsFlipping(false);
      prevDateRef.current = date;
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [date]);

  const datesWithMemories = Object.keys(allMemories)
    .filter(d => allMemories[d] && allMemories[d].length > 0)
    .sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  const currentDateIndex = datesWithMemories.indexOf(date);

  const hasNextDate = currentDateIndex !== -1 && currentDateIndex < datesWithMemories.length - 1;
  const hasPrevDate = currentDateIndex > 0;

  const canGoNext = currentPage < totalPages - 1 || hasNextDate;
  const canGoPrev = currentPage > 0 || hasPrevDate;

  const flipPage = useCallback((dir: number) => {
    if (isFlipping) return;
    setIsFlipping(true);
    setDirection(dir);

    if (dir === 1) {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
      } else if (hasNextDate) {
        const nextDate = datesWithMemories[currentDateIndex + 1];
        onDateChange(nextDate);
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      } else if (hasPrevDate) {
        const prevDate = datesWithMemories[currentDateIndex - 1];
        onDateChange(prevDate);
      }
    }

    if (scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
      }, 300);
    }

    setTimeout(() => setIsFlipping(false), 600);
  }, [isFlipping, currentPage, totalPages, hasNextDate, hasPrevDate, datesWithMemories, currentDateIndex, onDateChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isFlipping) return;
      if (e.key === 'ArrowRight' && canGoNext) flipPage(1);
      else if (e.key === 'ArrowLeft' && canGoPrev) flipPage(-1);
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFlipping, canGoNext, canGoPrev, flipPage, onClose]);

  useEffect(() => {
    if (prevDateRef.current !== date && direction === -1 && memories.length > 0) {
      setCurrentPage(memories.length - 1);
    }
  }, [memories.length, date, direction]);

  if (!currentMemory) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={onClose}
          >
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  const formattedDate = new Date(date + 'T00:00:00');

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 md:bg-black/70 md:p-6 backdrop-blur-lg md:backdrop-blur-sm"
          onClick={onClose}
        >
          {/* ========================================== */}
          {/* DESKTOP VIEW: The 3D Book Layout           */}
          {/* ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="relative hidden md:block w-full max-w-6xl"
            style={{ perspective: "2500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative overflow-visible rounded-xl bg-[#2C292A] p-2 pb-3 pr-3 shadow-[0_30px_60px_rgba(0,0,0,0.5)] dark:bg-[#1A1819]">
              <button onClick={onClose}
                className="absolute -right-4 -top-4 z-50 rounded-full bg-white p-2.5 text-gray-800 shadow-xl transition-all hover:scale-110 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-200">
                <X className="h-5 w-5" />
              </button>

              <div className="absolute -left-14 top-1/2 -translate-y-1/2 z-50">
                <button onClick={() => { if (hasPrevDate) { setDirection(-1); onDateChange(datesWithMemories[currentDateIndex - 1]); } }}
                  disabled={!hasPrevDate || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-l-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronsLeft className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold rotate-180">Prev Day</span>
                </button>
              </div>

              <div className="absolute -right-14 top-1/2 -translate-y-1/2 z-50">
                <button onClick={() => { if (hasNextDate) { setDirection(1); onDateChange(datesWithMemories[currentDateIndex + 1]); } }}
                  disabled={!hasNextDate || isFlipping}
                  className="group flex flex-col items-center gap-1 rounded-r-lg bg-[#3d3a3b] p-3 text-gray-400 transition-all hover:text-rose-400 disabled:opacity-20 disabled:cursor-not-allowed">
                  <ChevronsRight className="h-5 w-5" />
                  <span className="[writing-mode:vertical-lr] text-[10px] uppercase tracking-widest font-bold">Next Day</span>
                </button>
              </div>

              <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
              <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#F0ECE1]/50 bg-[#F0ECE1] dark:border-gray-700/50 dark:bg-gray-700" />

              {/* Book Page - REMOVED overflow-hidden to show full content */}
              <div className="light-book-page relative flex h-auto min-h-[600px] max-h-[90vh] w-full rounded bg-[#FDFBF7] dark:bg-[#FDFBF7]" style={{ perspective: "2500px", overflow: 'visible' }}>
                <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-[rgba(0,0,0,0.08)] to-transparent z-20" />
                <div className="absolute left-1/2 top-0 h-32 w-8 -translate-x-1/2 bg-[#8C2332] shadow-md z-10">
                  <div className="absolute bottom-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[16px] border-l-transparent border-r-transparent border-b-[#FDFBF7]" />
                </div>

                <AnimatePresence mode="popLayout" custom={direction}>
                  <motion.div
                    key={`${date}-${currentPage}-desktop`} custom={direction}
                    className="absolute inset-0 flex w-full h-full"
                    style={{ transformStyle: "preserve-3d", transformOrigin: "center center" }}
                    initial={{ rotateY: direction > 0 ? 90 : -90, z: 150, scale: 0.98, opacity: 0 }}
                    animate={{ rotateY: 0, z: 0, scale: 1, opacity: 1 }}
                    exit={{ rotateY: direction > 0 ? -90 : 90, z: 150, scale: 0.98, opacity: 0 }}
                    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}>
                    
                    <motion.div
                      className="pointer-events-none absolute inset-0 z-30"
                      initial={{ opacity: 0.6 }} animate={{ opacity: 0 }} exit={{ opacity: 0.6 }} transition={{ duration: 0.5 }}
                      style={{ background: direction > 0
                        ? 'linear-gradient(to right, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)'
                        : 'linear-gradient(to left, rgba(0,0,0,0.15) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.15) 100%)' }} />

                    {/* LEFT PAGE - Image */}
                    <div className="relative flex shrink-0 w-1/2 flex-col items-center justify-center p-8 md:p-12 bg-[#FDFBF7]">
                      {currentMemory.image ? (
                        <div className="polaroid-bg relative group -rotate-2 bg-white p-4 pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-0">
                          <div className="absolute -top-4 left-1/2 h-10 w-28 -translate-x-1/2 rotate-2 bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)' }} />
                          <div className="absolute -bottom-2 left-1/3 h-8 w-20 -translate-x-1/2 -rotate-2 bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm"
                            style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }} />
                          <img src={currentMemory.image} alt={currentMemory.title} className="h-80 w-72 object-cover shadow-inner md:h-[360px] md:w-[320px]" />
                          <div className="polaroid-text absolute bottom-4 left-0 right-0 text-center font-serif text-sm italic text-gray-700">
                            {currentMemory.location || "Captured moment"}
                          </div>
                        </div>
                      ) : (
                        <div className="polaroid-bg flex h-[360px] w-[320px] -rotate-2 flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white">
                          <Camera className="mb-3 h-10 w-10 text-gray-400" />
                          <span className="font-serif text-sm italic text-gray-600">No photo</span>
                        </div>
                      )}
                    </div>

                    {/* RIGHT PAGE - Content (FULL with scroll) */}
                    <div className="relative flex flex-1 w-1/2 flex-col bg-[#FDFBF7] p-8 md:p-12 md:pl-16 overflow-y-auto">
                      <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-[length:100%_32px]" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className="mb-6 flex shrink-0 justify-end">
                          <div className="text-right font-serif">
                            <p className="text-lg text-gray-800">{formattedDate.toLocaleDateString('en-US', { weekday: 'long' })},</p>
                            <p className="text-sm italic text-gray-500">{formattedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>

                        {/* Scrollable content - FULL DESCRIPTION ALWAYS VISIBLE */}
                        <div 
                          ref={fullStoryRef}
                          className="flex-1 overflow-y-auto pr-2 custom-scrollbar min-h-0"
                        >
                          <div className="space-y-4 pt-2 pb-4">
                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-800">
                              {currentMemory.title}
                              {currentMemory.is_favorite && <Heart className="ml-3 inline-block h-6 w-6 -translate-y-1 fill-[#8C2332] text-[#8C2332]" />}
                            </h2>
                            
                            <span className="inline-block rounded border border-rose-100 bg-rose-50 px-3 py-1 font-serif text-xs italic tracking-wide text-rose-700">
                              {currentMemory.memory_type.charAt(0).toUpperCase() + currentMemory.memory_type.slice(1)}
                            </span>
                            
                            {/* FULL DESCRIPTION - No truncation */}
                            <div className="relative">
                              <p className="font-serif text-base md:text-lg leading-7 md:leading-8 text-gray-700 whitespace-pre-line">
                                {currentMemory.description}
                              </p>
                            </div>

                            {/* Location */}
                            {currentMemory.location && (
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/60 border border-gray-200 rounded-full mt-2">
                                <MapPin className="h-4 w-4 text-gray-500" />
                                <span className="text-xs text-gray-500">{currentMemory.location}</span>
                              </div>
                            )}
                            
                            {/* Favorite Quote */}
                            {currentMemory.favorite_quote && (
                              <div className="border-l-4 border-rose-300 pl-4 py-2 mt-2 bg-rose-50/50 rounded-r-lg">
                                <Quote className="h-4 w-4 text-rose-300 mb-1" />
                                <p className="font-serif text-sm italic text-gray-600">"{currentMemory.favorite_quote}"</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="relative z-10 mt-auto flex shrink-0 justify-center gap-4 pt-4 pb-2 border-t border-gray-100">
                          <button 
                            onClick={() => onClose()}
                            className="font-serif text-sm italic text-rose-500 underline decoration-rose-300 underline-offset-4 transition-colors hover:text-rose-700"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <button onClick={() => flipPage(-1)} disabled={!canGoPrev || isFlipping}
                  className="absolute bottom-6 left-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-all hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="absolute bottom-8 left-1/2 z-40 -translate-x-1/2 font-serif text-xs italic text-gray-400 select-none">
                  {currentPage + 1} / {totalPages}
                </div>
                <button onClick={() => flipPage(1)} disabled={!canGoNext || isFlipping}
                  className="absolute bottom-6 right-6 z-40 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-600 shadow-md transition-all hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed">
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* ========================================== */}
          {/* MOBILE VIEW: Diary Paper App Modal         */}
          {/* ========================================== */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] flex md:hidden flex-col w-full h-[100dvh] bg-[#FDFBF7] text-gray-800 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-[#FDFBF7]/90 backdrop-blur-sm border-b border-gray-200 pt-[env(safe-area-inset-top,1rem)]">
              <div className="flex flex-col font-serif">
                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-400">
                  {formattedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </span>
                <span className="text-sm font-bold text-gray-800">
                  {formattedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 active:scale-95 transition-transform">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden pt-20 pb-32">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={`${date}-${currentPage}-mobile`} custom={direction}
                  initial={{ opacity: 0, x: direction > 0 ? 30 : -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction > 0 ? -30 : 30 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="flex flex-col min-h-full px-5"
                >
                  {/* Image */}
                  <div className="w-full mt-2 mb-6 flex justify-center">
                    {currentMemory.image ? (
                      <div className="relative bg-white p-3 pb-10 shadow-md rotate-[-1deg] max-w-[90%]">
                        <div className="absolute -top-3 left-1/2 w-16 h-6 -translate-x-1/2 bg-white/40 backdrop-blur-sm border border-white/20 rotate-2 shadow-sm" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(0,0,0,0.02) 5px, rgba(0,0,0,0.02) 10px)' }} />
                        <img src={currentMemory.image} alt={currentMemory.title} className="w-full aspect-square object-cover" />
                        <div className="absolute bottom-3 left-0 right-0 text-center font-serif text-xs italic text-gray-500">
                          {currentMemory.memory_type}
                        </div>
                      </div>
                    ) : (
                      <div className="relative bg-white p-3 pb-10 shadow-md rotate-[-1deg] w-full max-w-[80%] aspect-square flex flex-col items-center justify-center border border-gray-200">
                        <Camera className="h-10 w-10 mb-2 opacity-20 text-gray-600" />
                        <span className="font-serif text-xs italic opacity-40 text-gray-600">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Content - FULL DESCRIPTION */}
                  <div className="flex flex-col gap-4 flex-1 relative">
                    <div className="pointer-events-none absolute inset-0 -top-2 bg-[linear-gradient(transparent_27px,rgba(0,0,0,0.04)_28px)] bg-[length:100%_28px]" />

                    <div className="relative z-10 flex items-start justify-between">
                      <h2 className="font-serif text-2xl font-bold text-gray-800 leading-tight">
                        {currentMemory.title}
                      </h2>
                      {currentMemory.is_favorite && (
                        <Heart className="h-6 w-6 shrink-0 fill-rose-600 text-rose-600 ml-3" />
                      )}
                    </div>

                    {/* FULL DESCRIPTION - No truncation */}
                    <div className="relative z-10">
                      <p className="font-serif text-lg leading-[28px] text-gray-700 whitespace-pre-line">
                        {currentMemory.description}
                      </p>
                    </div>

                    {/* Location and Quote */}
                    <div className="relative z-10 space-y-4 mt-2">
                      {currentMemory.location && (
                        <div className="flex items-center gap-2 text-gray-500 text-sm font-serif italic">
                          <MapPin className="h-4 w-4" />
                          <span>{currentMemory.location}</span>
                        </div>
                      )}
                      {currentMemory.favorite_quote && (
                        <div className="p-4 rounded-r-xl border-l-2 border-rose-300 bg-rose-50/50">
                          <Quote className="h-4 w-4 text-rose-300 mb-2" />
                          <p className="font-serif italic text-gray-600 text-sm">
                            {currentMemory.favorite_quote}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Bottom Nav */}
            <div className="absolute bottom-0 left-0 right-0 p-4 pb-[env(safe-area-inset-bottom,1.5rem)] bg-gradient-to-t from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent">
              <div className="flex items-center gap-3 max-w-sm mx-auto">
                <button 
                  onClick={() => { if (hasPrevDate) { setDirection(-1); onDateChange(datesWithMemories[currentDateIndex - 1]); } else if (canGoPrev) { flipPage(-1); } }}
                  disabled={!canGoPrev || isFlipping}
                  className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm disabled:opacity-30 active:scale-95 transition-all">
                  {currentPage === 0 && hasPrevDate ? <ChevronsLeft className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                </button>

                <button 
                  onClick={() => onClose()}
                  className="flex-1 h-12 bg-[#8C2332] text-white rounded-full font-serif italic shadow-md active:scale-95 transition-transform flex items-center justify-center text-sm tracking-wide gap-2"
                >
                  Close
                </button>

                <button 
                  onClick={() => { if (currentPage === totalPages - 1 && hasNextDate) { setDirection(1); onDateChange(datesWithMemories[currentDateIndex + 1]); } else if (canGoNext) { flipPage(1); } }}
                  disabled={!canGoNext || isFlipping}
                  className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-600 shadow-sm disabled:opacity-30 active:scale-95 transition-all">
                  {currentPage === totalPages - 1 && hasNextDate ? <ChevronsRight className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
              </div>
              
              {totalPages > 1 && (
                <div className="flex justify-center gap-1.5 mt-4">
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentPage ? 'w-4 bg-[#8C2332]' : 'w-1.5 bg-gray-300'}`} />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookModal;