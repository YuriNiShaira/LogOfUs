import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Calendar,
  Image as ImageIcon,
  Sparkles,
  Users,
  BookOpen,
  X,
  Copy,
  Check
} from 'lucide-react';
import { cachedGet, prefetch } from '../services/api';
import Envelope from '../components/Envelope';
import TimeCounter from '../components/TimeCounter';
import YearCard from '../components/YearCard';
import StatsCard from '../components/StatsCard';
import CreateYearModal from '../components/CreateYearModal';
import RomanticBackground from '../components/RomanticBackground';
import CatsBackground from '../components/backgrounds/CatsBackground';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface Year {
  id: number;
  year_number: number;
  cover_image?: string;
  description?: string;
  memory_count?: number;
  created_at: string;
}

interface Stats {
  total_years: number;
  total_memories: number;
  favorite_memories: number;
  days_together: number;
}

const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

const LoveLetterManager = lazy(() => import('../components/LoveLetterManager'));

const LoadingSkeleton = React.memo(() => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="glass-card rounded-3xl p-6 animate-pulse">
        <div className="h-56 bg-rose-200/30 rounded-2xl mb-4"></div>
        <div className="h-6 bg-rose-200/30 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-rose-200/30 rounded w-3/4"></div>
      </div>
    ))}
  </div>
));
LoadingSkeleton.displayName = 'LoadingSkeleton';

const FloatingHearts = React.memo(() => (
  <div className="flex justify-center gap-1 mt-3">
    {[...Array(3)].map((_, i) => (
      <motion.div 
        key={i} 
        animate={{ scale: [1, 1.2, 1] }} 
        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
      >
        <Heart className="w-3 h-3 text-rose-400/40 fill-current" />
      </motion.div>
    ))}
  </div>
));
FloatingHearts.displayName = 'FloatingHearts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const [isCreateYearModalOpen, setIsCreateYearModalOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_years: 0,
    total_memories: 0,
    favorite_memories: 0,
    days_together: 0,
  });
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [enableCats, setEnableCats] = useState(true);

  const { data: yearsData, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      const [yearsResponse, statsResponse] = await Promise.all([
        cachedGet('/years/'),
        cachedGet('/stats/'),
      ]);
      
      return {
        years: Array.isArray(yearsResponse) ? yearsResponse : yearsResponse.results || [],
        stats: statsResponse,
      };
    },
    staleTime: 60000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  useEffect(() => {
    if (yearsData?.years && yearsData.years.length > 0) {
      const firstYearId = yearsData.years[0]?.id;
      if (firstYearId) {
        prefetch(`/years/${firstYearId}/`);
      }
    }
  }, [yearsData]);

  const years = useMemo(() => yearsData?.years || [], [yearsData]);
  
  useEffect(() => {
    if (yearsData?.stats) {
      setStats(yearsData.stats);
    }
  }, [yearsData]);

  const fetchInviteCode = useCallback(async () => {
    if (!user?.has_partner) {
      try {
        const response = await cachedGet('/auth/invite-code/');
        setInviteCode(response.invite_code);
      } catch (error) {
        console.error('Error fetching invite code:', error);
      }
    }
  }, [user]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('user_settings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setEnableCats(settings.enableCats !== undefined ? settings.enableCats : true);
      } catch (e) {}
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user_settings') {
        try {
          const settings = JSON.parse(e.newValue || '{}');
          setEnableCats(settings.enableCats !== undefined ? settings.enableCats : true);
        } catch {}
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    if (!user?.has_partner) {
      fetchInviteCode();
    }
    if (!isLoading) {
      setInitialLoading(false);
    }
  }, [fetchInviteCode, user, isLoading]);

  const copyInviteCode = useCallback(async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success('Invite code copied! Share it with your partner 💕');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy code');
    }
  }, [inviteCode]);

  const handleOpenInviteModal = useCallback(() => setShowInviteModal(true), []);
  const handleCloseInviteModal = useCallback(() => setShowInviteModal(false), []);
  const handleOpenCreateYearModal = useCallback(() => setIsCreateYearModalOpen(true), []);
  const handleCloseCreateYearModal = useCallback(() => setIsCreateYearModalOpen(false), []);
  
  const handleYearClick = useCallback((yearId: number) => {
    navigate(`/year/${yearId}`);
    prefetch(`/years/${yearId}/`);
  }, [navigate]);

  const statsCardsData = useMemo(() => [
    { icon: <Calendar className="w-6 h-6" />, label: "Days Together", value: stats.days_together, color: "from-love-red to-romantic-red" },
    { icon: <BookOpen className="w-6 h-6" />, label: "Years of Love", value: stats.total_years, color: "from-romantic-red to-deep-pink" },
    { icon: <ImageIcon className="w-6 h-6" />, label: "Precious Memories", value: stats.total_memories, color: "from-cherry-blossom to-love-red" },
    { icon: <Heart className="w-6 h-6" />, label: "Favorite Moments", value: stats.favorite_memories, color: "from-love-red to-cherry-blossom" },
  ], [stats]);

  const showEmptyState = !isLoading && years.length === 0;
  const showYearsGrid = !isLoading && years.length > 0;
  const isDarkMode = theme === 'dark';

  if (initialLoading && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-rose-300 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-serif text-rose-500 italic">Loading your love story...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Dancing+Script:wght@500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
        .font-script { font-family: 'Dancing Script', cursive; }
        .font-cormorant { font-family: 'Cormorant Garamond', serif; }
        
        .gallery-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .gallery-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .gallery-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(225, 29, 72, 0.3);
          border-radius: 10px;
        }
        .dark .gallery-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(225, 29, 72, 0.4);
        }
        .gallery-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(225, 29, 72, 0.6);
        }
      `}} />

      <RomanticBackground />
      {enableCats && <CatsBackground />}
      <Navbar />

      {/* CHANGED: Wide container for the whole dashboard */}
      <div className="max-w-[90rem] mx-auto relative z-10 px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Welcome Header */}
        <div className="mb-8 sm:mb-12 relative max-w-7xl mx-auto">
          {user && !user.has_partner && (
            <div className="absolute right-0 top-0 hidden md:block">
              <button
                onClick={handleOpenInviteModal}
                className={`px-4 sm:px-5 py-2 rounded-lg border-2 border-dashed flex items-center gap-2 shadow-sm font-serif italic transition-colors ${
                  isDarkMode 
                    ? 'bg-[#2a2626] border-stone-700 text-rose-300 hover:border-rose-900' 
                    : 'bg-[#fcfbf7] border-rose-200 text-rose-600 hover:bg-rose-50'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-xs sm:text-sm font-bold">Invite Partner</span>
              </button>
            </div>
          )}

          <div className="text-center">
            <h1 className={`flex flex-wrap items-end justify-center gap-2 sm:gap-4 mb-2 ${
              isDarkMode ? 'text-rose-50' : 'text-rose-950'
            }`}>
              <span className="text-3xl sm:text-4xl md:text-[3.25rem] font-cormorant italic mb-1 md:mb-2 tracking-widest">
                Welcome,
              </span>
              <span className="text-gradient-love font-script text-5xl sm:text-6xl md:text-7xl font-bold leading-none tracking-wide pr-2">
                {user?.display_name || 'Love'}
              </span>
            </h1>
            
            <p className={`text-base sm:text-lg md:text-xl font-serif italic tracking-wide mt-3 sm:mt-4 ${isDarkMode ? 'text-rose-200/80' : 'text-rose-800/70'}`}>
              Turn moments into memories. 
              <span className="block sm:inline sm:ml-2 font-handwriting text-xl sm:text-2xl text-rose-500 dark:text-rose-400 opacity-90">
                One entry at a time.
              </span>
            </p>
            
            <div className="flex justify-center mt-4 sm:mt-6 mb-2">
              <div className="w-24 sm:w-32 h-px bg-linear-to-r from-transparent via-rose-300 to-transparent opacity-60" />
            </div>
          </div>

          {user && !user.has_partner && (
            <div className="mt-4 sm:mt-6 flex justify-center md:hidden">
              <button
                onClick={handleOpenInviteModal}
                className={`px-4 sm:px-5 py-2 rounded-lg border-2 border-dashed flex items-center gap-2 shadow-sm font-serif italic transition-colors ${
                  isDarkMode 
                    ? 'bg-[#2a2626] border-stone-700 text-rose-300' 
                    : 'bg-[#fcfbf7] border-rose-200 text-rose-600'
                }`}
              >
                <Heart className="w-4 h-4 fill-current" />
                <span className="text-xs sm:text-sm font-bold">Invite Partner</span>
              </button>
            </div>
          )}
        </div>

        {/* Time Counter */}
        <div className="mb-8 sm:mb-12 max-w-7xl mx-auto">
          <TimeCounter anniversaryDate={user?.anniversary_date || '2024-01-01'} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-7xl mx-auto">
          {statsCardsData.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>

        {/* Envelope */}
        <div className="mb-12 sm:mb-16 max-w-7xl mx-auto">
          <Envelope />
        </div>

        {/* The Archive / Shadow Box Display Case */}
        <div>
          <h2 className={`text-3xl sm:text-4xl font-serif text-center mb-8 tracking-wide ${isDarkMode ? 'text-rose-100' : 'text-rose-950'}`}>
            <span className="text-gradient-soft">The Memory Archive</span>
            <div className="h-px bg-linear-to-r from-transparent via-rose-300 to-transparent mx-auto mt-3 sm:mt-4 w-25" />
          </h2>

          {isLoading ? (
            <LoadingSkeleton />
          ) : showYearsGrid && (
            <>
              {/* CHANGED: Let the frame use the wide space, bounded slightly so it doesn't touch edges on ultra-wide */}
              <div className="w-full max-w-[85rem] mx-auto px-2 sm:px-4">
                
                {/* 1. Outer Luxurious Casing */}
                <div className={`relative p-3 sm:p-5 lg:p-6 rounded-[2.5rem] sm:rounded-[3.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all ${
                  isDarkMode 
                    ? 'bg-linear-to-br from-[#382825] via-[#1a1110] to-[#0a0605] border border-[#523b36]' 
                    : 'bg-linear-to-br from-[#f0e6d3] via-[#e3d1b8] to-[#d4bca0] border border-[#f5ecd9]'
                }`}>
                  
                  {/* 2. Inner Metallic Bevel (Rose Gold / Brass) */}
                  <div className={`relative p-2 sm:p-4 rounded-[1.8rem] sm:rounded-[2.8rem] border-[3px] shadow-inner ${
                    isDarkMode ? 'border-[#8c6b5d]/60 bg-[#140e0d]' : 'border-[#d4a39a]/70 bg-[#faf6f0]'
                  }`}>
                    
                    {/* Brass Title Plate */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 rounded-sm shadow-md border z-20" style={{
                      background: isDarkMode ? 'linear-gradient(to right, #a67c52, #e3c4a8, #a67c52)' : 'linear-gradient(to right, #d4a39a, #f7dfdb, #d4a39a)',
                      borderColor: isDarkMode ? '#5c432b' : '#b38279'
                    }}>
                      <span className={`text-[10px] sm:text-xs font-sans font-bold tracking-[0.3em] uppercase ${isDarkMode ? 'text-[#382618]' : 'text-[#5e3831]'}`}>
                        Our Volumes
                      </span>
                      {/* Tiny screws for the plate */}
                      <div className={`absolute top-1/2 -translate-y-1/2 left-2 w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#5c432b]' : 'bg-[#b38279]'}`} />
                      <div className={`absolute top-1/2 -translate-y-1/2 right-2 w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#5c432b]' : 'bg-[#b38279]'}`} />
                    </div>

                    {/* 3. Deep Recessed Backdrop (Velvet or Parchment) */}
                    <div className={`relative rounded-[1.2rem] sm:rounded-[2.2rem] overflow-hidden shadow-[inset_0_20px_50px_rgba(0,0,0,0.4)] pt-8 ${
                      isDarkMode 
                        ? 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#361e23] via-[#1a0f12] to-[#0a0507]' 
                        : 'bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ffffff] via-[#f7f3ec] to-[#e8dec9]'
                    }`}>
                      
                      {/* Corner Ornaments */}
                      <div className={`absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 rounded-tl-xl opacity-40 pointer-events-none ${isDarkMode ? 'border-rose-300' : 'border-rose-800'}`} />
                      <div className={`absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 rounded-tr-xl opacity-40 pointer-events-none ${isDarkMode ? 'border-rose-300' : 'border-rose-800'}`} />
                      <div className={`absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 rounded-bl-xl opacity-40 pointer-events-none ${isDarkMode ? 'border-rose-300' : 'border-rose-800'}`} />
                      <div className={`absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 rounded-br-xl opacity-40 pointer-events-none ${isDarkMode ? 'border-rose-300' : 'border-rose-800'}`} />

                      {/* 4. Scrollable Content Area */}
                      <div 
                        className="gallery-scrollbar overflow-y-auto px-4 sm:px-8 lg:px-12 py-8"
                        style={{ 
                          height: '700px',
                          maskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)',
                          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 5%, black 95%, transparent)'
                        }}
                      >
                        <div className="relative">
                          {/* CHANGED: Strictly limited to 3 columns max, but widened the gaps heavily for larger screens */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-16 gap-x-8 sm:gap-x-12 lg:gap-x-16 xl:gap-x-20 pb-10">
                            {years.map((year: Year) => (
                              <div key={year.id} className="relative group flex justify-center pt-6">
                                {/* Spotlight reflecting inside the glass case */}
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-32 bg-white/20 dark:bg-rose-400/10 blur-[40px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none z-0" />
                                
                                {/* The Bound Volume */}
                                <YearCard 
                                  year={year as any} 
                                  onClick={() => handleYearClick(year.id)} 
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Year Button outside the frame */}
              <div className="mt-12 sm:mt-16 text-center flex justify-center">
                <button
                  onClick={handleOpenCreateYearModal}
                  className={`relative overflow-hidden group px-6 sm:px-10 py-3 sm:py-4 rounded-full border shadow-lg transition-all ${
                    isDarkMode
                      ? 'bg-[#2a0815] border-rose-900/80 hover:bg-[#4c0519]/80 hover:border-rose-700 shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                      : 'bg-[#FFFAF0] border-rose-200 hover:bg-white hover:border-rose-300 shadow-[0_8px_20px_rgba(225,29,72,0.1)]'
                  }`}
                >
                  <div className={`absolute inset-1.5 border border-dashed rounded-full opacity-50 pointer-events-none ${isDarkMode ? 'border-rose-900' : 'border-rose-200'}`} />
                  
                  <span className={`relative z-10 flex items-center gap-2 sm:gap-3 font-serif uppercase tracking-[0.15em] sm:tracking-[0.2em] text-[10px] sm:text-xs font-bold ${isDarkMode ? 'text-rose-200' : 'text-rose-800'}`}>
                    <Sparkles className={`w-3 h-3 sm:w-4 sm:h-4 transform group-hover:scale-110 transition-transform ${isDarkMode ? 'text-rose-400' : 'text-rose-400'}`} />
                    Place a New Volume
                    <Sparkles className={`w-3 h-3 sm:w-4 sm:h-4 transform group-hover:scale-110 transition-transform ${isDarkMode ? 'text-rose-400' : 'text-rose-400'}`} />
                  </span>
                </button>
              </div>
            </>
          )}

          {showEmptyState && (
            <div className="text-center py-12 sm:py-16">
              <div className="animate-pulse">
                <Heart className="w-16 sm:w-20 h-16 sm:h-20 text-rose-300/50 mx-auto mb-4 sm:mb-6" />
              </div>
              <h3 className={`text-xl sm:text-2xl font-serif mb-2 sm:mb-3 ${isDarkMode ? 'text-rose-200' : 'text-rose-800'}`}>
                The Display Case is Empty
              </h3>
              <p className={`mb-6 sm:mb-8 font-serif italic text-sm sm:text-base ${isDarkMode ? 'text-rose-300/70' : 'text-rose-700/60'}`}>
                Create your first volume to begin capturing beautiful memories together.
              </p>
              
              <button
                onClick={handleOpenCreateYearModal}
                className={`relative overflow-hidden group px-6 sm:px-8 py-3 rounded-full border shadow-md transition-all ${
                  isDarkMode
                    ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
                    : 'bg-rose-950 border-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_4px_15px_rgba(136,19,55,0.25)]'
                }`}
              >
                <div className="absolute inset-1 border border-dashed rounded-full opacity-30 pointer-events-none border-rose-200" />
                <span className="relative z-10 flex items-center gap-2 font-serif uppercase tracking-widest text-xs">
                  Place the First Volume <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-300" />
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 sm:mt-20 text-center pb-6 sm:pb-8">
          <p className={`font-serif italic text-xs sm:text-sm ${isDarkMode ? 'text-rose-300/60' : 'text-rose-700/50'}`}>
            "Forever is composed of nows" — Emily Dickinson
          </p>
          <FloatingHearts />
        </div>
      </div>

      <CreateYearModal 
        isOpen={isCreateYearModalOpen} 
        onClose={handleCloseCreateYearModal} 
      />
      
      <Suspense fallback={<LoadingFallback />}>
        <LoveLetterManager />
      </Suspense>

      {/* Invite Code Modal */}
      {showInviteModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
          onClick={handleCloseInviteModal}
        >
          <div
            className={`relative w-full max-w-sm rounded-xl p-6 sm:p-8 shadow-2xl ${
              isDarkMode ? 'bg-[#262222] border border-stone-800' : 'bg-[#fffdfa] border border-stone-200'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 sm:w-20 h-5 sm:h-6 opacity-90 backdrop-blur-md z-10 shadow-sm rotate-2 ${
              isDarkMode ? 'bg-stone-600/60' : 'bg-rose-200/70'
            }`} />
            
            <button 
              onClick={handleCloseInviteModal} 
              className={`absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full transition-colors ${
                isDarkMode ? 'text-stone-400 hover:bg-stone-800' : 'text-stone-400 hover:bg-stone-100'
              }`}
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="text-center mt-2 mb-4 sm:mb-6">
              <div className="flex justify-center mb-2 sm:mb-3">
                <div className={`p-2 sm:p-3 rounded-full border-2 border-dashed ${isDarkMode ? 'border-rose-900/50 bg-rose-900/20' : 'border-rose-200 bg-rose-50'}`}>
                  <Users className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? 'text-rose-300' : 'text-rose-500'}`} />
                </div>
              </div>
              <h3 className={`text-3xl sm:text-4xl font-serif font-bold italic mb-1 sm:mb-2 ${isDarkMode ? 'text-rose-200' : 'text-rose-600'}`}>
                Invitation
              </h3>
              <p className={`font-serif text-xs sm:text-sm px-2 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
                Share this secret code with your partner so they can join your diary.
              </p>
            </div>

            <div 
              onClick={copyInviteCode}
              className={`cursor-pointer group relative p-4 sm:p-6 rounded-lg border-2 border-dashed text-center transition-all ${
                isDarkMode 
                  ? 'border-stone-700 bg-stone-800/50 hover:border-rose-500/50 hover:bg-stone-800' 
                  : 'border-stone-300 bg-stone-50 hover:border-rose-300 hover:bg-rose-50/50'
              }`}
              title="Click to copy"
            >
              <span className={`font-mono text-2xl sm:text-3xl tracking-[0.2em] sm:tracking-[0.25em] font-bold ${isDarkMode ? 'text-stone-200' : 'text-stone-700'}`}>
                {inviteCode || '...'}
              </span>
              
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                copied 
                  ? 'opacity-100 bg-emerald-500 text-white shadow-md transform -translate-y-1' 
                  : 'opacity-0 group-hover:opacity-100 bg-stone-200 text-stone-600 transform translate-y-0'
              }`}>
                {copied ? 'Copied!' : 'Click to copy'}
              </div>
            </div>

            <div className="mt-6 sm:mt-8 flex gap-2 sm:gap-3">
              <button 
                onClick={handleCloseInviteModal} 
                className={`flex-1 py-2.5 sm:py-3 rounded-lg font-serif font-bold transition-colors ${
                  isDarkMode ? 'bg-stone-800 text-stone-300 hover:bg-stone-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Close
              </button>
              <button 
                onClick={copyInviteCode} 
                className="flex-1 py-2.5 sm:py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-serif font-bold shadow-md hover:shadow-lg transition-all flex justify-center items-center gap-2"
              >
                {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                {copied ? 'Copied' : 'Copy Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;