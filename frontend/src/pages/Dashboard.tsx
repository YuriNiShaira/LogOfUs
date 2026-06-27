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

// Loading fallback for lazy components
const LoadingFallback = () => (
  <div className="flex justify-center items-center p-8">
    <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

// Lazy load heavy components
const LoveLetterManager = lazy(() => import('../components/LoveLetterManager'));

// Memoized components
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

  // OPTIMIZATION: Use cachedGet for faster loading
  const { data: yearsData, isLoading } = useQuery({
    queryKey: ['dashboard-data'],
    queryFn: async () => {
      // Use cachedGet with parallel fetching
      const [yearsResponse, statsResponse] = await Promise.all([
        cachedGet('/years/'),
        cachedGet('/stats/'),
      ]);
      
      return {
        years: Array.isArray(yearsResponse) ? yearsResponse : yearsResponse.results || [],
        stats: statsResponse,
      };
    },
    staleTime: 60000, // 1 minute cache
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  // OPTIMIZATION: Prefetch next page data
  useEffect(() => {
    // Prefetch first year's data if available
    if (yearsData?.years && yearsData.years.length > 0) {
      const firstYearId = yearsData.years[0]?.id;
      if (firstYearId) {
        prefetch(`/years/${firstYearId}/`);
      }
    }
  }, [yearsData]);

  // OPTIMIZATION: Memoize derived data
  const years = useMemo(() => yearsData?.years || [], [yearsData]);
  
  // OPTIMIZATION: Update stats when data changes
  useEffect(() => {
    if (yearsData?.stats) {
      setStats(yearsData.stats);
    }
  }, [yearsData]);

  // OPTIMIZATION: Fetch invite code separately (only when needed)
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
    if (!user?.has_partner) {
      fetchInviteCode();
    }
    // Set initial loading false after data loads
    if (!isLoading) {
      setInitialLoading(false);
    }
  }, [fetchInviteCode, user, isLoading]);

  // OPTIMIZATION: Memoized handlers
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
    // Prefetch the year data for faster navigation next time
    prefetch(`/years/${yearId}/`);
  }, [navigate]);

  // OPTIMIZATION: Memoize stats cards
  const statsCardsData = useMemo(() => [
    { icon: <Calendar className="w-6 h-6" />, label: "Days Together", value: stats.days_together, color: "from-love-red to-romantic-red" },
    { icon: <BookOpen className="w-6 h-6" />, label: "Years of Love", value: stats.total_years, color: "from-romantic-red to-deep-pink" },
    { icon: <ImageIcon className="w-6 h-6" />, label: "Precious Memories", value: stats.total_memories, color: "from-cherry-blossom to-love-red" },
    { icon: <Heart className="w-6 h-6" />, label: "Favorite Moments", value: stats.favorite_memories, color: "from-love-red to-cherry-blossom" },
  ], [stats]);

  const showEmptyState = !isLoading && years.length === 0;
  const showYearsGrid = !isLoading && years.length > 0;
  const isDarkMode = theme === 'dark';

  // Show loading only on initial load
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
      `}} />

      <RomanticBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 py-4 sm:py-6">
        {/* Welcome Header */}
        <div className="mb-8 sm:mb-12 relative">
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
        <div className="mb-8 sm:mb-12">
          <TimeCounter anniversaryDate={user?.anniversary_date || '2024-01-01'} />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          {statsCardsData.map((card, index) => (
            <StatsCard key={index} {...card} />
          ))}
        </div>

        {/* Envelope */}
        <div className="mb-12 sm:mb-16">
          <Envelope />
        </div>

        {/* Years Grid */}
        <div>
          <h2 className={`text-3xl sm:text-4xl font-serif text-center mb-6 sm:mb-8 tracking-wide ${isDarkMode ? 'text-rose-100' : 'text-rose-950'}`}>
            <span className="text-gradient-soft">Our Journey Through The Years</span>
            <div className="h-px bg-linear-to-r from-transparent via-rose-300 to-transparent mx-auto mt-3 sm:mt-4 w-25" />
          </h2>

          {isLoading ? (
            <LoadingSkeleton />
          ) : showYearsGrid && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {years.map((year: Year) => (
                  <YearCard 
                    key={year.id} 
                    year={year} 
                    onClick={() => handleYearClick(year.id)} 
                  />
                ))}
              </div>

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
                    Begin a New Chapter
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
                Start Your Love Story
              </h3>
              <p className={`mb-6 sm:mb-8 font-serif italic text-sm sm:text-base ${isDarkMode ? 'text-rose-300/70' : 'text-rose-700/60'}`}>
                Create your first year to begin capturing beautiful memories together
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
                <span className="relative z-10 flex items-center gap-2 font-serif uppercase tracking-widest text-xs sm:text-2.75">
                  Pen the First Page <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-rose-300" />
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
              
              <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-2.5 font-bold uppercase tracking-wider transition-all duration-200 ${
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