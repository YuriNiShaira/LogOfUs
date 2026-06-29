import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Camera, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

interface Memory {
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

interface MemoryDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
  onEdit?: (memory: Memory) => void;
  onReturnToBook?: () => void;
  memories?: Memory[];
  currentIndex?: number;
  onNext?: () => void;
  onPrev?: () => void;
  date?: string;
  totalDates?: number;
  currentDateIndex?: number;
  currentDateStr?: string;
}

const MemoryDetailModal: React.FC<MemoryDetailModalProps> = ({
  isOpen,
  onClose,
  memory,
  onEdit,
  memories = [],
  currentIndex = 0,
  onNext,
  onPrev,
  date,
  totalDates = 0,
  currentDateIndex = 0,
  currentDateStr = '',
}) => {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [direction, setDirection] = useState(0);
  const [prevMemoryId, setPrevMemoryId] = useState<number | null>(null);

  const splitIntoPages = (text: string, charsPerPage: number = 300) => {
    if (!text) return [''];
    
    const words = text.split(/\s+/);
    const pages: string[] = [];
    let currentPageText = '';
    
    for (const word of words) {
      const spacing = currentPageText ? ' ' : '';
      if ((currentPageText + spacing + word).length <= charsPerPage) {
        currentPageText += spacing + word;
      } else {
        if (currentPageText) {
          pages.push(currentPageText.trim());
        }
        currentPageText = word;
      }
    }
    
    if (currentPageText) {
      pages.push(currentPageText.trim());
    }
    
    return pages.length > 0 ? pages : [text];
  };

  const pages = memory ? splitIntoPages(memory.description) : [''];
  
  const totalSpreads = pages.length === 0 ? 1 : 1 + Math.ceil((pages.length - 1) / 2);
  const hasNextSpread = currentSpread < totalSpreads - 1;
  const hasPrevSpread = currentSpread > 0;
  
  const totalMemories = memories.length;
  const hasNextMemory = onNext !== undefined && typeof onNext === 'function' && currentIndex < totalMemories - 1;
  const hasPrevMemory = onPrev !== undefined && typeof onPrev === 'function' && currentIndex > 0;

  // Check if there are more dates to navigate to
  const hasNextDate = totalDates > 0 && currentDateIndex < totalDates - 1;
  const hasPrevDate = totalDates > 0 && currentDateIndex > 0;

  const canGoNext = hasNextSpread || hasNextMemory || hasNextDate;
  const canGoPrev = hasPrevSpread || hasPrevMemory || hasPrevDate;

  // Reset spread when memory changes
  useEffect(() => {
    setCurrentSpread(0);
    setIsFlipping(false);
  }, [memory?.id]);

  // Handle date change with flip animation
  useEffect(() => {
    if (prevMemoryId !== null && memory?.id !== prevMemoryId) {
      // This is a memory/date change - trigger flip animation
      setIsFlipping(true);
      setDirection(1);
      setTimeout(() => {
        setIsFlipping(false);
      }, 600);
    }
    setPrevMemoryId(memory?.id ?? null);
  }, [memory?.id, prevMemoryId]);

  // Reset prevMemoryId when modal opens
  useEffect(() => {
    if (isOpen) {
      setPrevMemoryId(memory?.id ?? null);
    }
  }, [isOpen, memory?.id]);

  const turnPage = (dir: number) => {
    if (isFlipping) return;
    
    // Going forward
    if (dir === 1) {
      if (hasNextSpread) {
        setIsFlipping(true);
        setDirection(1);
        setCurrentSpread((prev) => prev + 1);
        setTimeout(() => setIsFlipping(false), 900);
      } else if (hasNextMemory && onNext) {
        // Go to next memory - let the useEffect handle the animation
        onNext();
        setCurrentSpread(0);
        // Set a flag to trigger animation
        setDirection(1);
        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 600);
      } else if (hasNextDate && onNext) {
        // Go to next date - let the useEffect handle the animation
        onNext();
        setCurrentSpread(0);
        setDirection(1);
        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 600);
      }
      return;
    }
    
    // Going backward
    if (dir === -1) {
      if (hasPrevSpread) {
        setIsFlipping(true);
        setDirection(-1);
        setCurrentSpread((prev) => prev - 1);
        setTimeout(() => setIsFlipping(false), 900);
      } else if (hasPrevMemory && onPrev) {
        // Go to previous memory - let the useEffect handle the animation
        onPrev();
        setCurrentSpread(0);
        setDirection(-1);
        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 600);
      } else if (hasPrevDate && onPrev) {
        // Go to previous date - let the useEffect handle the animation
        onPrev();
        setCurrentSpread(0);
        setDirection(-1);
        setIsFlipping(true);
        setTimeout(() => setIsFlipping(false), 600);
      }
      return;
    }
  };

  const handleNextMemory = () => {
    if (onNext && (hasNextMemory || hasNextDate)) {
      onNext();
      setCurrentSpread(0);
      setDirection(1);
      setIsFlipping(true);
      setTimeout(() => setIsFlipping(false), 600);
    }
  };

  if (!memory) return null;
  
  const formattedDate = date ? new Date(date + 'T00:00:00') : null;
  const formattedCurrentDate = currentDateStr ? new Date(currentDateStr + 'T00:00:00') : null;

  // ==========================================
  // REALISTIC 3D BOOK FLIP VARIANTS
  // ==========================================
  const flipDuration = 0.45;

  const leftVariants = {
    enter: (dir: number) => ({
      rotateY: dir === 1 ? 90 : 0,
      zIndex: dir === 1 ? 20 : 0,
      filter: dir === 1 ? "brightness(0.6)" : "brightness(1)",
    }),
    center: (dir: number) => ({
      rotateY: 0,
      zIndex: dir === 1 ? 20 : 5,
      filter: "brightness(1)",
      transition: {
        rotateY: { duration: flipDuration, delay: dir === 1 ? flipDuration : 0, ease: "easeOut" as const },
        filter: { duration: flipDuration, delay: dir === 1 ? flipDuration : 0, ease: "easeOut" as const }
      }
    }),
    exit: (dir: number) => ({
      rotateY: dir === -1 ? 90 : 0,
      zIndex: dir === -1 ? 20 : 0,
      filter: dir === -1 ? "brightness(0.6)" : "brightness(1)",
      opacity: 1, 
      transition: {
        rotateY: { duration: flipDuration, ease: "easeIn" as const },
        filter: { duration: flipDuration, ease: "easeIn" as const },
        opacity: { duration: 0.01, delay: dir === 1 ? flipDuration * 2 : 0 }
      }
    })
  };

  const rightVariants = {
    enter: (dir: number) => ({
      rotateY: dir === -1 ? -90 : 0,
      zIndex: dir === -1 ? 20 : 0,
      filter: dir === -1 ? "brightness(0.6)" : "brightness(1)",
    }),
    center: (dir: number) => ({
      rotateY: 0,
      zIndex: dir === -1 ? 20 : 5,
      filter: "brightness(1)",
      transition: {
        rotateY: { duration: flipDuration, delay: dir === -1 ? flipDuration : 0, ease: "easeOut" as const },
        filter: { duration: flipDuration, delay: dir === -1 ? flipDuration : 0, ease: "easeOut" as const }
      }
    }),
    exit: (dir: number) => ({
      rotateY: dir === 1 ? -90 : 0,
      zIndex: dir === 1 ? 20 : 0,
      filter: dir === 1 ? "brightness(0.6)" : "brightness(1)",
      opacity: 1,
      transition: {
        rotateY: { duration: flipDuration, ease: "easeIn" as const },
        filter: { duration: flipDuration, ease: "easeIn" as const },
        opacity: { duration: 0.01, delay: dir === -1 ? flipDuration * 2 : 0 }
      }
    })
  };

  const mobileVariants = {
    enter: (direction: number) => ({ x: direction > 0 ? 30 : -30, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({ x: direction > 0 ? -30 : 30, opacity: 0 }),
  };

  // ==========================================
  // PAGE CONTENT RENDERERS
  // ==========================================
  const renderLeftContent = (index: number) => {
    if (index === 0) {
      return (
        <div className="w-full h-full flex flex-col justify-center items-center p-8 md:p-12 relative border-r border-[#E5E0D8]/40">
          {memory.image ? (
            <div className="polaroid-bg relative group -rotate-2 bg-white p-4 pb-12 shadow-[0_10px_25px_rgba(0,0,0,0.15)] transition-transform duration-500 hover:rotate-0 z-10 mt-8">
              <div
                className="absolute -top-4 left-1/2 h-10 w-28 -translate-x-1/2 rotate-2 bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm"
                style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.3) 5px, rgba(255,255,255,0.3) 10px)' }}
              />
              <div
                className="absolute -bottom-2 left-1/3 h-8 w-20 -translate-x-1/2 -rotate-2 bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm"
                style={{ backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 4px, rgba(255,255,255,0.3) 4px, rgba(255,255,255,0.3) 8px)' }}
              />
              <img
                src={memory.image}
                alt={memory.title}
                className="h-75 w-70 object-cover shadow-inner md:h-90 md:w-[320px]"
              />
            </div>
          ) : (
            <div className="flex h-90 w-[320px] -rotate-2 flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-white z-10">
              <Camera className="mb-3 h-10 w-10 text-gray-400" />
              <span className="font-serif text-sm italic text-gray-600">No photo</span>
            </div>
          )}
          
          <div className="absolute bottom-6 left-12 right-12 flex items-center justify-between z-20 pointer-events-auto">
            <button
              onClick={(e) => { e.stopPropagation(); turnPage(-1); }}
              disabled={isFlipping || !canGoPrev}
              className="group flex items-center gap-2 font-serif text-sm text-[#8C2332] hover:text-rose-900 transition-colors disabled:opacity-30 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className={`h-4 w-4 transition-transform ${canGoPrev ? 'group-hover:-translate-x-1' : ''}`} />
              <span className="text-xs uppercase tracking-widest font-semibold">
                {hasPrevSpread ? "Turn Back" : hasPrevMemory ? "Prev Memory" : "Prev Date"}
              </span>
            </button>
            {totalDates > 0 && (
              <span className="font-serif text-xs text-gray-400">
                {formattedCurrentDate?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col p-8 md:p-12 font-serif text-lg leading-8 text-gray-700 whitespace-pre-line relative border-r border-[#E5E0D8]/40">
        <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-size-[100%_32px] opacity-50" />
        
        <div className="relative z-10 flex-1 flex flex-col justify-start max-h-[380px] overflow-hidden pb-8">
          {pages[index * 2 - 1]}
        </div>
        
        <div className="absolute bottom-6 left-12 right-12 flex items-center justify-between z-20 pointer-events-auto">
          <button
            onClick={(e) => { e.stopPropagation(); turnPage(-1); }}
            disabled={isFlipping || !canGoPrev}
            className="group flex items-center gap-2 font-serif text-sm text-[#8C2332] hover:text-rose-900 transition-colors disabled:opacity-30 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${canGoPrev ? 'group-hover:-translate-x-1' : ''}`} />
            <span className="text-xs uppercase tracking-widest font-semibold">
              {hasPrevSpread ? "Turn Back" : hasPrevMemory ? "Prev Memory" : "Prev Date"}
            </span>
          </button>
          <span className="font-serif text-xs text-gray-400">{index * 2}</span>
        </div>
      </div>
    );
  };

  const renderRightContent = (index: number) => {
    const isFirst = index === 0;
    const isLastSpread = index === totalSpreads - 1;
    const showNextMemoryButton = isLastSpread && (hasNextMemory || hasNextDate);
    
    return (
      <div className="w-full h-full flex flex-col p-8 md:p-12 md:pl-16 relative border-l border-[#FDFBF7]/40">
        <div className="pointer-events-none absolute inset-0 bottom-12 top-24 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.06)_32px)] bg-size-[100%_32px]" />

        <div className="relative z-10 flex flex-col h-full pb-10">
          {isFirst && (
            <>
              <div className="mb-4 flex justify-between items-start shrink-0">
                <div>
                  {onEdit && (
                    <button onClick={() => onEdit(memory)} className="text-xs font-serif italic text-gray-400 hover:text-[#8C2332] transition-colors underline underline-offset-4">
                      Edit Entry
                    </button>
                  )}
                </div>
                <div className="text-right font-serif">
                  {formattedDate ? (
                    <>
                      <p className="text-lg text-gray-800">{formattedDate.toLocaleDateString('en-US', { weekday: 'long' })},</p>
                      <p className="text-sm italic text-gray-500">{formattedDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </>
                  ) : (
                    <p className="text-sm italic text-gray-500">A beautiful memory</p>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="font-serif text-3xl font-bold text-gray-800">
                  {memory.title}
                  {memory.is_favorite && <Heart className="ml-3 inline-block h-6 w-6 -translate-y-1 fill-[#8C2332] text-[#8C2332]" />}
                </h2>
                
                <div className="flex flex-wrap items-center gap-4">
                  <span className="inline-block rounded border border-rose-100 bg-rose-50 px-3 py-1 font-serif text-xs italic tracking-wide text-rose-700">
                    {memory.memory_type.charAt(0).toUpperCase() + memory.memory_type.slice(1)}
                  </span>
                  
                  {memory.location && (
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MapPin className="h-4 w-4" />
                      <span className="font-serif text-sm italic">{memory.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="flex-1 flex flex-col justify-start max-h-[380px] overflow-hidden py-4 font-serif text-lg leading-8 text-gray-700 whitespace-pre-line">
            {isFirst ? pages[0] : pages[index * 2]}
          </div>

          {isFirst && memory.favorite_quote && (
            <div className="space-y-4 mt-2">
              <div className="rounded-r-lg border-l-4 border-rose-300 bg-rose-50/50 py-2 pl-4">
                <p className="font-serif text-sm italic text-gray-600">"{memory.favorite_quote}"</p>
              </div>
            </div>
          )}
        </div>

        <div className="absolute bottom-6 left-16 right-12 flex items-center justify-between z-20 pointer-events-auto">
          <span className="font-serif text-xs text-gray-400">{isFirst ? 1 : index * 2 + 1}</span>
          
          <div className="flex items-center gap-2">
            {showNextMemoryButton && (
              <button
                onClick={(e) => { e.stopPropagation(); handleNextMemory(); }}
                className="group flex items-center gap-2 font-serif text-sm text-[#8C2332] hover:text-rose-900 transition-colors"
              >
                <span className="text-xs uppercase tracking-widest font-semibold">
                  {hasNextMemory ? "Next Memory" : "Next Date"}
                </span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
            {hasNextSpread && !showNextMemoryButton && (
              <button
                onClick={(e) => { e.stopPropagation(); turnPage(1); }}
                disabled={isFlipping}
                className="group flex items-center gap-2 font-serif text-sm text-[#8C2332] hover:text-rose-900 transition-colors"
              >
                <span className="text-xs uppercase tracking-widest font-semibold">Turn Page</span>
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="relative w-full max-w-5xl max-h-[95vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute -right-3 -top-3 z-50 rounded-full bg-white p-2.5 text-gray-800 shadow-2xl transition-all hover:scale-110 hover:text-rose-600 dark:bg-gray-800 dark:text-gray-200 md:-right-4 md:-top-4"
            >
              <X className="h-4 w-4 md:h-5 md:w-5" />
            </button>

            {/* ========================================== */}
            {/* DESKTOP VIEW */}
            {/* ========================================== */}
            <div className="hidden md:block">
              <div className="relative overflow-visible rounded-xl bg-[#2C292A] p-2 pb-3 pr-3 shadow-[0_40px_80px_rgba(0,0,0,0.6)] dark:bg-[#1A1819]">
                <div className="absolute bottom-1 left-2 right-2 top-2 rounded border border-[#E5E0D8]/50 bg-[#E5E0D8] dark:border-gray-700/50 dark:bg-gray-800" />
                <div className="absolute bottom-2 left-2 right-2 top-2 rounded border border-[#F0ECE1]/50 bg-[#F0ECE1] dark:border-gray-700/50 dark:bg-gray-700" />

                <div className="relative flex w-full bg-[#FDFBF7] dark:bg-[#FDFBF7] rounded min-h-125 md:min-h-150" style={{ perspective: "2500px" }}>
                  
                  <div className="pointer-events-none absolute bottom-0 left-1/2 top-0 hidden w-12 -translate-x-1/2 bg-linear-to-r from-[rgba(0,0,0,0.02)] via-[rgba(0,0,0,0.15)] to-[rgba(0,0,0,0.02)] md:block z-40" />
                  <div className="absolute left-1/2 top-0 hidden h-full w-4 -translate-x-1/2 bg-linear-to-r from-[#d9d5ce] via-[#fdfbf7] to-[#d9d5ce] md:block z-0" />

                  <div className="flex w-full flex-row relative z-10">
                    
                    {/* LEFT PAGE */}
                    <div className="relative w-1/2" style={{ perspective: "1500px" }}>
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                          key={`left-${currentSpread}-${memory?.id}`}
                          custom={direction}
                          variants={leftVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="absolute inset-0 bg-[#FDFBF7] origin-right shadow-[-10px_0_20px_rgba(0,0,0,0.05)]"
                          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                        >
                          {renderLeftContent(currentSpread)}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    {/* RIGHT PAGE */}
                    <div className="relative w-1/2" style={{ perspective: "1500px" }}>
                      <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                          key={`right-${currentSpread}-${memory?.id}`}
                          custom={direction}
                          variants={rightVariants}
                          initial="enter"
                          animate="center"
                          exit="exit"
                          className="absolute inset-0 bg-[#FDFBF7] origin-left shadow-[10px_0_20px_rgba(0,0,0,0.05)]"
                          style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
                        >
                          {renderRightContent(currentSpread)}
                        </motion.div>
                      </AnimatePresence>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* ========================================== */}
            {/* MOBILE VIEW */}
            {/* ========================================== */}
            <div className="md:hidden relative w-full max-h-[85vh] overflow-hidden rounded-2xl bg-[#FDFBF7] shadow-2xl flex flex-col">
              <div className="pointer-events-none absolute inset-0 top-32 bg-[linear-gradient(transparent_31px,rgba(0,0,0,0.04)_32px)] bg-size-[100%_32px] z-0" />

              <div className="flex-1 overflow-y-auto relative z-10 custom-scrollbar pb-6">
                {currentSpread === 0 && (
                  <div className="pt-8 px-6 pb-2 flex justify-center">
                    {memory.image ? (
                      <div className="relative bg-white p-3 pb-10 shadow-[0_8px_20px_rgba(0,0,0,0.12)] rotate-1 max-w-sm w-full transition-transform hover:rotate-0 mt-4">
                        <div
                          className="absolute -top-3 left-1/2 h-8 w-24 -translate-x-1/2 -rotate-3 bg-amber-100/70 shadow-sm border border-amber-200/50 backdrop-blur-sm z-10"
                          style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(255,255,255,0.4) 5px, rgba(255,255,255,0.4) 10px)' }}
                        />
                        <div className="relative h-64 w-full overflow-hidden rounded-sm">
                          <img src={memory.image} alt={memory.title} className="h-full w-full object-cover" />
                          {memory.is_favorite && <div className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-md backdrop-blur-sm"><Heart className="h-4 w-4 fill-[#8C2332] text-[#8C2332]" /></div>}
                        </div>
                      </div>
                    ) : (
                      <div className="relative bg-white p-3 pb-10 shadow-[0_8px_20px_rgba(0,0,0,0.12)] -rotate-1 max-w-sm w-full mt-4">
                        <div className="absolute -top-3 left-1/2 h-8 w-24 -translate-x-1/2 rotate-2 bg-rose-100/60 shadow-sm border border-rose-200/40 backdrop-blur-sm z-10" />
                        <div className="flex h-64 w-full flex-col items-center justify-center border-2 border-dashed border-gray-200 bg-gray-50">
                          <Camera className="mb-3 h-8 w-8 text-gray-300" />
                          <span className="font-serif text-sm italic text-gray-400">No photo available</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="px-6 pt-6 pb-4">
                  {currentSpread === 0 && (
                    <>
                      <div className="mb-4 flex flex-col items-center text-center">
                        <span className="inline-block rounded border border-rose-100 bg-rose-50 px-3 py-1 font-serif text-xs italic tracking-wide text-rose-700">
                          {memory.memory_type.charAt(0).toUpperCase() + memory.memory_type.slice(1)}
                        </span>
                      </div>
                      <h2 className="mb-2 text-center font-serif text-2xl font-bold text-gray-800">{memory.title}</h2>
                      
                      {memory.location && (
                        <div className="mb-6 flex justify-center items-center gap-1.5 text-gray-500">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="font-serif text-sm italic">{memory.location}</span>
                        </div>
                      )}
                    </>
                  )}

                  <div className="relative min-h-60">
                    <AnimatePresence mode="wait" custom={direction}>
                      <motion.div
                        key={`mobile-page-${currentSpread}-${memory?.id}`}
                        variants={mobileVariants}
                        custom={direction}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{ duration: 0.3 }}
                        className="font-serif text-base leading-relaxed text-gray-700 whitespace-pre-line text-justify flex flex-col gap-4"
                      >
                        {currentSpread === 0 ? <p>{pages[0]}</p> : <><p>{pages[currentSpread * 2 - 1]}</p>{pages[currentSpread * 2] && <p>{pages[currentSpread * 2]}</p>}</>}
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  <div className="flex items-center justify-between mt-8 border-t border-gray-200 pt-6">
                    <button 
                      onClick={() => turnPage(-1)} 
                      disabled={isFlipping || !canGoPrev} 
                      className="flex items-center gap-1 font-serif text-xs uppercase tracking-widest text-[#8C2332] disabled:opacity-30 disabled:text-gray-400"
                    >
                      <ChevronLeft className="h-4 w-4" /> 
                      {hasPrevSpread ? "Prev Page" : hasPrevMemory ? "Prev Memory" : "Prev Date"}
                    </button>
                    
                    <span className="font-serif text-xs text-gray-400">
                      {totalDates > 0 ? `${currentDateIndex + 1} / ${totalDates}` : `${currentSpread + 1} / ${totalSpreads}`}
                    </span>
                    
                    <button 
                      onClick={() => turnPage(1)} 
                      disabled={isFlipping || !canGoNext} 
                      className="flex items-center gap-1 font-serif text-xs uppercase tracking-widest text-[#8C2332] font-semibold disabled:opacity-30 disabled:text-gray-400"
                    >
                      {hasNextSpread ? "Next Page" : hasNextMemory ? "Next Memory" : "Next Date"} 
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200/60 bg-[#FDFBF7]/95 px-4 py-3 backdrop-blur-md z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] flex flex-col gap-3">
                <div className="flex justify-around items-center gap-4">
                  {onEdit && <button onClick={() => onEdit(memory)} className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 font-serif text-sm italic text-gray-700 transition-all hover:bg-gray-50 active:scale-95 shadow-sm">Edit Page</button>}
                  <button onClick={onClose} className="flex-1 rounded-lg bg-[#8C2332] py-2.5 font-serif text-sm italic text-white transition-all hover:bg-[#6B1A26] active:scale-95 shadow-sm">Close</button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MemoryDetailModal;