import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Edit, Trash2, X, Trophy, Settings, User, Heart, 
  ChevronDown, ChevronUp, Film, Check, Tv, Clapperboard, BookOpen, PenTool
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

// --- Types ---
interface AnimeCategory {
  id: number;
  name: string;
  order: number;
  year: number | null;
}

interface AnimeRating {
  id: number;
  title: string;
  media_type: string;
  my_ratings: Record<string, number>;
  shaira_ratings: Record<string, number>;
  my_overall: number;
  shaira_overall: number;
  combined_overall: number;
  genre: string;
  watched_together: boolean;
  my_favorite_character: string;
  shaira_favorite_character: string;
  favorite_moment: string;
  notes: string;
  year: number | null;
}

interface AnimeRatingSectionProps {
  yearId?: number | null;
  yearNumber?: number;
  isGlobal?: boolean;
}

const MEDIA_TYPES = [
  { value: 'all', label: 'All', icon: BookOpen },
  { value: 'anime', label: 'Anime', icon: Tv },
  { value: 'movie', label: 'Movie', icon: Clapperboard },
  { value: 'show', label: 'Show', icon: Film },
];

const RatingProgress = ({ label, myScore, partnerScore, theme }: { 
  label: string; 
  myScore: number; 
  partnerScore: number;
  theme: string;
}) => (
  <div className="space-y-1.5 w-full">
    <div className={`flex justify-between text-xs font-serif font-bold tracking-wide ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>
      <span>{label}</span>
    </div>
    <div className={`relative h-4 rounded-sm overflow-hidden flex ${theme === 'dark' ? 'bg-stone-800' : 'bg-stone-200'}`}>
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(myScore / 10) * 50}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute left-0 top-0 bottom-0 bg-rose-400/90 flex items-center justify-end pr-2 text-2.5 text-white font-bold"
        style={{ borderRadius: '2px 0 0 2px' }}
      >
        {myScore > 0 && myScore}
      </motion.div>
      <div className={`absolute left-1/2 top-0 bottom-0 w-px z-10 ${theme === 'dark' ? 'bg-stone-700' : 'bg-white'}`} />
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(partnerScore / 10) * 50}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        className="absolute right-0 top-0 bottom-0 bg-indigo-400/90 flex items-center justify-start pl-2 text-2.5 text-white font-bold"
        style={{ borderRadius: '0 2px 2px 0' }}
      >
        {partnerScore > 0 && partnerScore}
      </motion.div>
    </div>
  </div>
);

const getMediaTypeIcon = (type: string) => {
  switch (type) {
    case 'anime': return <Tv className="w-4 h-4 inline" />;
    case 'movie': return <Clapperboard className="w-4 h-4 inline" />;
    case 'show': return <Film className="w-4 h-4 inline" />;
    default: return null;
  }
};

const AnimeRatingSection: React.FC<AnimeRatingSectionProps> = ({ yearId, yearNumber, isGlobal = false }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const partnerName = user?.partner_name || 'Partner';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingAnime, setEditingAnime] = useState<AnimeRating | null>(null);
  const [expandedAnime, setExpandedAnime] = useState<number | null>(null);
  const [mediaTypeFilter, setMediaTypeFilter] = useState<string>('all');
  const [categoryName, setCategoryName] = useState('');
  
  const [formData, setFormData] = useState({
    title: '', media_type: 'anime', my_ratings: {} as Record<string, number>,
    shaira_ratings: {} as Record<string, number>, genre: '', watched_together: true,
    my_favorite_character: '', shaira_favorite_character: '', favorite_moment: '', notes: '',
  });

  const queryClient = useQueryClient();

  const mediaTypeParam = encodeURIComponent(mediaTypeFilter.trim());

  const getYearParam = () => {
    if (isGlobal) return 'all';
    if (yearId) return yearId;
    return 'all';
  };

  // Build URL for categories - handle global mode
  const getCategoriesUrl = () => {
    const yearParam = getYearParam();
    if (yearParam === 'all') {
      return `/anime-categories/?year=all`;
    }
    return mediaTypeFilter === 'all'
      ? `/anime-categories/?year=${yearParam}`
      : `/anime-categories/?year=${yearParam}&media_type=${mediaTypeParam}`;
  };

  // Build URL for anime ratings - handle global mode
  const getAnimeRatingsUrl = () => {
    const yearParam = getYearParam();
    if (yearParam === 'all') {
      return mediaTypeFilter === 'all' 
        ? '/anime-ratings/'
        : `/anime-ratings/?media_type=${mediaTypeParam}`;
    }
    return mediaTypeFilter === 'all' 
      ? `/anime-ratings/?year=${yearParam}`
      : `/anime-ratings/?year=${yearParam}&media_type=${mediaTypeParam}`;
  };

  const { data: categories } = useQuery<AnimeCategory[]>({
    queryKey: ['animeCategories', getYearParam(), mediaTypeFilter, isGlobal],
    queryFn: async () => {
      const url = getCategoriesUrl();
      const response = await api.get(url);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    enabled: true,
  });

  const { data: animeList, isLoading } = useQuery<AnimeRating[]>({
    queryKey: ['animeRatings', getYearParam(), mediaTypeFilter, isGlobal],
    queryFn: async () => {
      const url = getAnimeRatingsUrl();
      console.log('Fetching URL:', url);
      const response = await api.get(url);
      console.log('Response count:', Array.isArray(response.data) ? response.data.length : response.data.results?.length);
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
    staleTime: 0,
    enabled: true,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (name: string) => {
      const payload: any = { 
        name, 
        order: 0,
        media_type: mediaTypeFilter !== 'all' ? mediaTypeFilter : 'anime'
      };
      
      // ✅ For global mode, don't send year
      if (!isGlobal && yearId) {
        payload.year = yearId;
      }
      
      console.log('📤 Sending category payload:', payload);
      const response = await api.post('/anime-categories/', payload);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['animeCategories', getYearParam(), mediaTypeFilter, isGlobal] }); 
      toast.success('Category added!'); 
      setCategoryName(''); 
    },
    onError: (error: any) => {
      console.error('Category error:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to add category');
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/anime-categories/${id}/`); },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['animeCategories', getYearParam(), mediaTypeFilter, isGlobal] }); 
      toast.success('Category removed'); 
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = { ...data };
      // ✅ For global mode, don't send year
      if (!isGlobal && yearId) {
        payload.year = yearId;
      }
      const response = await api.post('/anime-ratings/', payload);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['animeRatings', getYearParam(), mediaTypeFilter, isGlobal] }); 
      toast.success('Added to journal!'); 
      setIsModalOpen(false); 
      resetForm(); 
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/anime-ratings/${id}/`, data);
      return response.data;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['animeRatings', getYearParam(), mediaTypeFilter, isGlobal] }); 
      toast.success('Updated beautifully!'); 
      setIsModalOpen(false); 
      resetForm(); 
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/anime-ratings/${id}/`); },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['animeRatings', getYearParam(), mediaTypeFilter, isGlobal] }); 
      toast.success('Page torn out'); 
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const myRatings: Record<string, number> = {};
    const shairaRatings: Record<string, number> = {};
    categories?.forEach(cat => {
      myRatings[cat.name] = formData.my_ratings[cat.name] || 0;
      shairaRatings[cat.name] = formData.shaira_ratings[cat.name] || 0;
    });
    const data = { ...formData, my_ratings: myRatings, shaira_ratings: shairaRatings };
    if (editingAnime) { updateMutation.mutate({ id: editingAnime.id, data }); } 
    else { createMutation.mutate(data); }
  };

  const handleEdit = (anime: AnimeRating) => {
    setEditingAnime(anime);
    setFormData({
      title: anime.title, media_type: anime.media_type || 'anime',
      my_ratings: anime.my_ratings || {}, shaira_ratings: anime.shaira_ratings || {},
      genre: anime.genre, watched_together: anime.watched_together,
      my_favorite_character: anime.my_favorite_character,
      shaira_favorite_character: anime.shaira_favorite_character,
      favorite_moment: anime.favorite_moment, notes: anime.notes,
    });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingAnime(null);
    setFormData({
      title: '', media_type: 'anime', my_ratings: {}, shaira_ratings: {},
      genre: '', watched_together: true, my_favorite_character: '',
      shaira_favorite_character: '', favorite_moment: '', notes: '',
    });
  };

  // Diary Theme-aware styles
  const textColor = theme === 'dark' ? 'text-[#e5e0d8]' : 'text-stone-800';
  const subTextColor = theme === 'dark' ? 'text-stone-400' : 'text-stone-500';
  
  const cardBg = theme === 'dark' 
    ? 'bg-[#2a2626] border-stone-700/60 shadow-[0_8px_30px_rgba(0,0,0,0.25)]' 
    : 'bg-[#fcfbf7] border-stone-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.06)]';
  
  const diaryInputStyle = `w-full bg-transparent border-0 border-b-2 border-dashed rounded-none px-2 py-2 focus:ring-0 transition-colors focus:outline-none ${
    theme === 'dark' 
      ? 'border-stone-600 focus:border-rose-400/80 text-stone-200 placeholder-stone-600' 
      : 'border-stone-300 focus:border-rose-400/80 text-stone-800 placeholder-stone-300'
  }`;

  const modalBg = theme === 'dark' ? 'bg-[#221f1f] border-stone-700' : 'bg-[#f9f8f4] border-stone-200';
  const headerBg = theme === 'dark' ? 'bg-[#242121] border-stone-700' : 'bg-[#f4f1ea] border-stone-200';

  const headerTitle = isGlobal ? 'Our Watchlist' : `Chapter ${yearNumber}`;
  const headerSubtitle = isGlobal 
    ? 'All our shared stories & memories...' 
    : `Our shared stories & memories... (${animeList?.length || 0} entries)`;

  return (
    <div className="space-y-8 pb-12 px-2 md:px-0 max-w-7xl mx-auto">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&display=swap');
        
        .font-handwriting {
          font-family: 'Caveat', cursive;
          font-size: 1.35rem;
          line-height: 1.4;
        }

        .text-gradient-gold {
          background: linear-gradient(135deg, #b8935c 0%, #e7c688 40%, #d8ad62 60%, #fdffb3 80%, #b8935c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .journal-lines {
          background-image: repeating-linear-gradient(transparent, transparent 31px, ${theme === 'dark' ? 'rgba(229, 225, 216, 0.05)' : 'rgba(0, 0, 0, 0.05)'} 31px, ${theme === 'dark' ? 'rgba(229, 225, 216, 0.05)' : 'rgba(0, 0, 0, 0.05)'} 32px);
          background-attachment: local;
        }
      `}} />

      {/* Header - Journal Cover Style */}
      <div className={`flex flex-col md:flex-row items-start md:items-end justify-between gap-6 p-6 md:p-8 rounded-xl shadow-sm border-b-4 ${headerBg}`}>
        <div>
          <h2 className={`text-4xl md:text-5xl font-serif font-bold italic ${textColor}`}>{headerTitle}</h2>
          <p className={`mt-2 font-serif text-lg ${subTextColor}`}>{headerSubtitle}</p>
        </div>
        <div className="flex flex-wrap w-full md:w-auto gap-3">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setIsCategoryModalOpen(true)}
            className={`flex-1 md:flex-none px-5 py-3 font-serif font-medium border transition-all flex items-center justify-center gap-2 rounded-lg shadow-sm ${
              theme === 'dark' ? 'bg-stone-800 text-stone-300 border-stone-600 hover:bg-stone-700' : 'bg-[#fffdfa] text-stone-600 border-stone-300 hover:text-rose-700 hover:bg-rose-50/50'
            }`}>
            <Settings className="w-4 h-4" /> Add Criteria
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex-1 md:flex-none px-6 py-3 bg-rose-700 hover:bg-rose-800 text-[#fdfbf7] font-serif font-semibold shadow-md hover:shadow-lg flex items-center justify-center gap-2 rounded-lg transition-all">
            <PenTool className="w-4 h-4" /> Write Entry
          </motion.button>
        </div>
      </div>

      {/* Media Type Filter - Bookmark Style */}
      <div className="flex gap-2 flex-nowrap overflow-x-auto pb-2 scrollbar-hide px-2">
        {MEDIA_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <motion.button key={type.value} whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }} onClick={() => setMediaTypeFilter(type.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-t-xl text-sm font-serif font-bold transition-all border-b-0 whitespace-nowrap ${
                mediaTypeFilter === type.value
                  ? `bg-rose-700 text-[#fdfbf7] shadow-[0_-4px_10px_rgba(0,0,0,0.1)] border-rose-800 border-x border-t z-10`
                  : theme === 'dark' 
                    ? 'bg-stone-800/80 text-stone-400 border border-stone-700 hover:bg-stone-700' 
                    : 'bg-[#f4f1ea] text-stone-500 border border-stone-300 hover:bg-[#e8e4db] hover:text-stone-700'
              }`}>
              <Icon className="w-4 h-4" /> {type.label}
            </motion.button>
          );
        })}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {isCategoryModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setIsCategoryModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, rotate: -2 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.95, rotate: 2 }}
              className={`rounded-lg p-8 max-w-md w-full shadow-2xl relative ${modalBg}`}
              onClick={(e) => e.stopPropagation()}>
              <div className="absolute top-0 right-0 w-8 h-8 bg-black/10 rounded-bl-3xl" />
              
              <div className="flex justify-between items-center mb-6 border-b border-dashed border-stone-400/50 pb-4">
                <h2 className={`text-2xl font-serif font-bold italic ${textColor}`}>Rating Criteria</h2>
                <button onClick={() => setIsCategoryModalOpen(false)} className={`p-2 rounded-full transition-colors ${theme === 'dark' ? 'hover:bg-stone-800 text-stone-400' : 'hover:bg-stone-200 text-stone-500'}`}><X className="w-5 h-5" /></button>
              </div>
              
              <div className="flex gap-4 mb-6">
                <input type="text" placeholder="e.g., Story, Animation..." value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
                  className={diaryInputStyle} />
                <button onClick={() => categoryName && createCategoryMutation.mutate(categoryName)} disabled={!categoryName}
                  className="px-5 py-2 bg-stone-800 text-stone-100 font-serif rounded shadow-sm hover:shadow-md hover:bg-stone-900 disabled:opacity-50 transition-all">Add</button>
              </div>
              
              <div className="space-y-3 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                {categories?.map((cat) => (
                  <div key={cat.id} className={`flex items-center justify-between p-3 rounded-md border border-dashed transition-colors ${theme === 'dark' ? 'bg-stone-800/40 border-stone-700 hover:border-stone-600' : 'bg-[#fffdfa] border-stone-300 hover:border-stone-400'}`}>
                    <span className={`font-serif text-lg ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>{cat.name}</span>
                    <button onClick={() => deleteCategoryMutation.mutate(cat.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50/10 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Grid - Polaroid / Journal Clippings */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`rounded-xl p-6 animate-pulse h-48 ${theme === 'dark' ? 'bg-stone-800/50' : 'bg-[#f4f1ea]'}`} />
          ))}
        </div>
      ) : animeList?.length === 0 ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
          className={`flex flex-col items-center justify-center py-24 px-4 text-center rounded-xl border-2 border-dashed ${theme === 'dark' ? 'border-stone-700 bg-stone-800/20' : 'border-stone-300 bg-stone-50/50'}`}>
          <BookOpen className={`w-16 h-16 mb-4 ${theme === 'dark' ? 'text-stone-600' : 'text-stone-300'}`} />
          <h3 className={`text-2xl font-serif italic mb-2 ${textColor}`}>The pages are empty...</h3>
          <p className={`${subTextColor} font-serif max-w-sm`}>Click the "Write Entry" button to start filling your journal.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-6 pb-12">
          <AnimatePresence>
            {animeList?.map((anime, index) => (
              <motion.div key={anime.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                className={`relative rounded-xl p-6 md:p-8 transition-all hover:-translate-y-1 ${cardBg} group`}>
                
                {/* Washi Tape detail */}
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 opacity-90 backdrop-blur-md z-10 shadow-[0_1px_3px_rgba(0,0,0,0.05)]
                  ${theme === 'dark' ? 'bg-stone-600/60' : 'bg-pink-200/80'} 
                  ${index % 2 === 0 ? '-rotate-2' : 'rotate-2'}`} 
                />

                {/* Action Buttons */}
                <div className="absolute top-6 right-6 flex flex-col gap-2 z-20">
                  <button onClick={() => setExpandedAnime(expandedAnime === anime.id ? null : anime.id)}
                    className={`w-9 h-9 rounded-full border border-dashed flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-rose-400/50 ${theme === 'dark' ? 'border-stone-600 text-stone-400 hover:text-rose-400 hover:border-rose-400 bg-stone-800/80' : 'border-stone-300 text-stone-400 hover:text-rose-500 hover:border-rose-300 bg-white'}`}>
                    {expandedAnime === anime.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  <button onClick={() => handleEdit(anime)} 
                    className={`w-9 h-9 rounded-full border border-dashed flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-400/50 opacity-0 group-hover:opacity-100 ${theme === 'dark' ? 'border-stone-600 text-stone-400 hover:text-blue-400 hover:border-blue-400 bg-stone-800/80' : 'border-stone-300 text-stone-400 hover:text-blue-500 hover:border-blue-300 bg-white'}`}>
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-col mb-5">
                  <div className="flex items-center gap-3 mb-4 pr-12 flex-wrap">
                    <span className={`${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`} title={`Format: ${anime.media_type}`}>
                      {getMediaTypeIcon(anime.media_type || 'anime')}
                    </span>
                    <h3 className={`text-3xl font-serif font-bold leading-none tracking-tight pt-1 ${textColor}`}>{anime.title}</h3>
                    {anime.genre && (
                      <span className={`text-xs px-2 py-0.5 mt-1 font-serif italic border border-dashed rounded-sm ${theme === 'dark' ? 'border-stone-600 text-stone-400 bg-stone-800/50' : 'border-stone-300 text-stone-500 bg-white/50'}`}>
                        {anime.genre}
                      </span>
                    )}
                    {anime.watched_together && (
                      <div className="mt-1" title="Watched together">
                        <Heart className="w-4 h-4 text-[#f96a7b] fill-[#f96a7b]" />
                      </div>
                    )}
                  </div>
                  
                  <div className={`self-start inline-flex items-center rounded-lg px-1 py-1 border border-dashed ${theme === 'dark' ? 'border-stone-600 bg-stone-800/40' : 'border-stone-300 bg-white/50'}`}>
                    <div className="flex items-center gap-1.5 px-3 py-1">
                      <User className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-rose-400' : 'text-[#f96a7b]'}`} />
                      <span className={`font-serif font-bold text-sm ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>{anime.my_overall}</span>
                    </div>
                    <div className={`w-px h-4 ${theme === 'dark' ? 'bg-stone-600' : 'bg-stone-200'}`} />
                    <div className="flex items-center gap-1.5 px-3 py-1">
                      <Trophy className="w-4 h-4 text-[#d8ad62]" />
                      <span className="font-serif font-bold text-gradient-gold text-sm">{anime.combined_overall}</span>
                    </div>
                    <div className={`w-px h-4 ${theme === 'dark' ? 'bg-stone-600' : 'bg-stone-200'}`} />
                    <div className="flex items-center gap-1.5 px-3 py-1">
                      <Heart className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-indigo-400' : 'text-blue-500'}`} />
                      <span className={`font-serif font-bold text-sm ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>{anime.shaira_overall}</span>
                    </div>
                  </div>
                </div>

                {/* Fav Characters Snippet */}
                {(anime.my_favorite_character || anime.shaira_favorite_character) && (
                  <div className="flex flex-col gap-3 mt-6">
                    {anime.my_favorite_character && (
                      <div className="flex items-baseline relative">
                        <span className={`font-serif italic text-sm w-12 shrink-0 ${theme === 'dark' ? 'text-rose-300/70' : 'text-[#d67b8a]/70'}`}>Me:</span>
                        <span className={`font-handwriting text-2xl px-2 relative z-10 translate-y-1 ${theme === 'dark' ? 'text-rose-200' : 'text-[#8b3d4b]'}`}>
                          {anime.my_favorite_character}
                        </span>
                        <div className={`absolute bottom-1 left-10 right-0 border-b border-dashed ${theme === 'dark' ? 'border-rose-900/50' : 'border-rose-200'}`} />
                      </div>
                    )}
                    {anime.shaira_favorite_character && (
                      <div className="flex items-baseline relative">
                        <span className={`font-serif italic text-sm w-12 shrink-0 ${theme === 'dark' ? 'text-indigo-300/70' : 'text-[#7b9bd6]/70'}`}>{partnerName}:</span>
                        <span className={`font-handwriting text-2xl px-2 relative z-10 translate-y-1 ${theme === 'dark' ? 'text-indigo-200' : 'text-[#3d5a8b]'}`}>
                          {anime.shaira_favorite_character}
                        </span>
                        <div className={`absolute bottom-1 left-10 right-0 border-b border-dashed ${theme === 'dark' ? 'border-indigo-900/50' : 'border-blue-200'}`} />
                      </div>
                    )}
                  </div>
                )}

                <AnimatePresence>
                  {expandedAnime === anime.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className={`pt-6 mt-6 border-t-2 border-dashed ${theme === 'dark' ? 'border-stone-700' : 'border-stone-200'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 mb-8 px-2">
                          {categories?.map((cat) => (
                            <RatingProgress key={cat.id} label={cat.name} myScore={anime.my_ratings?.[cat.name] || 0} partnerScore={anime.shaira_ratings?.[cat.name] || 0} theme={theme} />
                          ))}
                        </div>
                        
                        {(anime.favorite_moment || anime.notes) && (
                          <div className={`p-6 md:p-8 journal-lines shadow-inner rounded-md ${theme === 'dark' ? 'bg-[#332e2e]' : 'bg-[#fffdfa]'}`}>
                            {anime.favorite_moment && (
                              <div className="mb-6">
                                <p className={`text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-500' : 'text-stone-400'}`}>Favorite Moment:</p>
                                <p className={`font-handwriting text-2xl ${theme === 'dark' ? 'text-rose-200' : 'text-stone-800'}`}>"{anime.favorite_moment}"</p>
                              </div>
                            )}
                            {anime.notes && (
                              <div>
                                <p className={`text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-500' : 'text-stone-400'}`}>Journal Notes:</p>
                                <p className={`font-handwriting text-xl leading-relaxed ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>{anime.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-6">
                          <button onClick={() => deleteMutation.mutate(anime.id)} className={`text-xs font-serif italic hover:underline px-3 py-1 rounded-md transition-colors ${theme === 'dark' ? 'text-red-400 hover:bg-red-900/30' : 'text-red-500 hover:bg-red-50/50'}`}>
                            Tear out this page...
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Add/Edit Entry Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className={`relative max-w-5xl w-full shadow-2xl my-auto border-4 ${theme === 'dark' ? 'bg-[#262222] border-stone-800' : 'bg-[#faf7f0] border-[#e8e3d5]'}`}
              style={{ borderRadius: '4px 16px 16px 4px' }}
              onClick={(e) => e.stopPropagation()}>
              
              <div className={`absolute top-0 bottom-0 left-0 w-8 md:w-12 border-r-2 shadow-inner ${theme === 'dark' ? 'bg-linear-to-r from-[#111] to-[#1a1717] border-stone-800' : 'bg-linear-to-r from-[#d3cbb5] to-[#e5dfce] border-[#d3cbb5]'}`} />
              
              <div className="pl-14 md:pl-20 pr-6 md:pr-10 py-8 md:py-10">
                <div className="flex justify-between items-start mb-8 border-b-2 border-dashed border-stone-300/50 pb-6">
                  <div>
                    <h2 className={`text-3xl md:text-5xl font-serif font-bold italic ${theme === 'dark' ? 'text-[#e5e0d8]' : 'text-stone-800'}`}>
                      {editingAnime ? 'Rewrite Entry' : 'New Journal Entry'}
                    </h2>
                    <p className={`mt-2 font-serif text-lg ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>Let's log our thoughts...</p>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className={`p-3 rounded-full transition-colors border hover:shadow-md ${theme === 'dark' ? 'bg-stone-800 text-stone-400 hover:text-white border-stone-700 hover:bg-stone-700' : 'bg-white text-stone-400 hover:text-rose-600 border-stone-200 hover:bg-stone-50'}`}>
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-14">
                    
                    {/* Left Column - Details */}
                    <div className="lg:col-span-5 space-y-8">
                      <div className="space-y-6">
                        <div>
                          <label className={`block text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>Entry Type</label>
                          <select value={formData.media_type} onChange={(e) => setFormData({ ...formData, media_type: e.target.value })}
                            className={`${diaryInputStyle} font-serif text-lg pb-2 cursor-pointer`}>
                            <option value="anime">Anime</option>
                            <option value="movie">Movie</option>
                            <option value="show">TV Show</option>
                          </select>
                        </div>
                        <div>
                          <label className={`block text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>Title *</label>
                          <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className={`${diaryInputStyle} font-serif text-2xl italic pb-2`} placeholder="The story we watched..." required />
                        </div>
                        <div>
                          <label className={`block text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>Genre</label>
                          <input type="text" value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                            className={`${diaryInputStyle} font-handwriting text-2xl pb-2`} placeholder="Romance, Action..." />
                        </div>
                        
                        <label className={`inline-flex items-center gap-4 cursor-pointer mt-6 p-2 rounded-lg hover:bg-stone-500/5 transition-colors`}>
                          <div className={`w-6 h-6 border-2 flex items-center justify-center rounded ${formData.watched_together ? 'border-rose-500 bg-rose-500/10' : (theme === 'dark' ? 'border-stone-600' : 'border-stone-400')}`}>
                            {formData.watched_together && <Check className="w-4 h-4 text-rose-500" strokeWidth={4} />}
                          </div>
                          <input type="checkbox" className="hidden" checked={formData.watched_together} onChange={(e) => setFormData({ ...formData, watched_together: e.target.checked })} />
                          <span className={`font-serif italic text-xl ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>Watched Together 💕</span>
                        </label>
                      </div>

                      <div className={`pt-8 border-t border-dashed ${theme === 'dark' ? 'border-stone-700' : 'border-stone-300'}`}>
                        <div className="space-y-8">
                          <div>
                            <label className={`block text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-600'}`}>My Favorite Character</label>
                            <input type="text" value={formData.my_favorite_character} onChange={(e) => setFormData({ ...formData, my_favorite_character: e.target.value })}
                              className={`${diaryInputStyle} font-handwriting text-2xl text-rose-600 pb-2`} />
                          </div>
                          <div>
                            <label className={`block text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-600'}`}>{partnerName}'s Favorite Character</label>
                            <input type="text" value={formData.shaira_favorite_character} onChange={(e) => setFormData({ ...formData, shaira_favorite_character: e.target.value })}
                              className={`${diaryInputStyle} font-handwriting text-2xl text-indigo-600 pb-2`} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Column - Ratings & Notes */}
                    <div className="lg:col-span-7 flex flex-col gap-8 lg:border-l border-dashed border-stone-300/50 lg:pl-10">
                      <div>
                        <h3 className={`text-2xl font-serif font-bold italic mb-6 ${theme === 'dark' ? 'text-[#e5e0d8]' : 'text-stone-800'}`}>
                          Scoring Metrics
                        </h3>
                        {categories && categories.length > 0 ? (
                          <div className="space-y-8 max-h-87.5 overflow-y-auto pr-4 custom-scrollbar">
                            {categories.map((cat) => (
                              <div key={cat.id}>
                                <p className={`font-serif text-xl font-bold border-b border-stone-200/50 pb-2 mb-4 ${theme === 'dark' ? 'text-stone-300' : 'text-stone-700'}`}>{cat.name}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                                  <div>
                                    <p className={`text-xs font-serif font-bold uppercase mb-3 ${theme === 'dark' ? 'text-rose-400' : 'text-rose-500'}`}>Your Score</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {[1,2,3,4,5,6,7,8,9,10].map((rating) => (
                                        <button key={`my-${rating}`} type="button" onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, my_ratings: { ...prev.my_ratings, [cat.name]: rating } })); }}
                                          className={`w-8 h-8 rounded-md flex items-center justify-center font-serif text-sm transition-all border ${
                                            formData.my_ratings[cat.name] === rating ? 'bg-rose-600 text-white border-rose-700 shadow-inner scale-105' : 
                                            theme === 'dark' ? 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700 hover:border-stone-500' : 'bg-[#fffdfa] text-stone-500 border-stone-300 hover:bg-stone-100 hover:border-stone-400'
                                          }`}>{rating}</button>
                                      ))}
                                    </div>
                                  </div>
                                  <div>
                                    <p className={`text-xs font-serif font-bold uppercase mb-3 ${theme === 'dark' ? 'text-indigo-400' : 'text-indigo-500'}`}>{partnerName}'s Score</p>
                                    <div className="flex flex-wrap gap-1.5">
                                      {[1,2,3,4,5,6,7,8,9,10].map((rating) => (
                                        <button key={`partner-${rating}`} type="button" onClick={(e) => { e.preventDefault(); setFormData(prev => ({ ...prev, shaira_ratings: { ...prev.shaira_ratings, [cat.name]: rating } })); }}
                                          className={`w-8 h-8 rounded-md flex items-center justify-center font-serif text-sm transition-all border ${
                                            formData.shaira_ratings[cat.name] === rating ? 'bg-indigo-600 text-white border-indigo-700 shadow-inner scale-105' :
                                            theme === 'dark' ? 'bg-stone-800 text-stone-400 border-stone-700 hover:bg-stone-700 hover:border-stone-500' : 'bg-[#fffdfa] text-stone-500 border-stone-300 hover:bg-stone-100 hover:border-stone-400'
                                          }`}>{rating}</button>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className={`p-6 rounded-lg border-2 border-dashed ${theme === 'dark' ? 'border-stone-700 bg-stone-800/20' : 'border-stone-300 bg-stone-50'}`}>
                            <p className={`font-serif italic text-center ${theme === 'dark' ? 'text-stone-500' : 'text-stone-500'}`}>No metrics defined. Set up categories first.</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-8 pt-4">
                        <div>
                          <label className={`block text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>Favorite Moment</label>
                          <textarea value={formData.favorite_moment} onChange={(e) => setFormData({ ...formData, favorite_moment: e.target.value })} rows={2}
                            className={`w-full bg-transparent border-0 border-b-2 border-dashed rounded-none px-2 py-2 focus:ring-0 transition-colors focus:outline-none resize-none font-handwriting text-2xl leading-relaxed ${theme === 'dark' ? 'border-stone-600 focus:border-rose-400/80 text-stone-200' : 'border-stone-300 focus:border-rose-400/80 text-stone-800'}`} 
                            placeholder="That scene where..." />
                        </div>
                        <div>
                          <label className={`block text-xs font-serif font-bold uppercase tracking-wider mb-2 ${theme === 'dark' ? 'text-stone-400' : 'text-stone-500'}`}>Journal Notes</label>
                          <textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3}
                            className={`w-full bg-transparent border-0 border-b-2 border-dashed rounded-none px-2 py-2 focus:ring-0 transition-colors focus:outline-none resize-none font-handwriting text-2xl leading-relaxed ${theme === 'dark' ? 'border-stone-600 focus:border-rose-400/80 text-stone-200' : 'border-stone-300 focus:border-rose-400/80 text-stone-800'}`} 
                            placeholder="Tears shed, thoughts, feelings..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`mt-12 flex flex-col-reverse sm:flex-row justify-end gap-4 pt-8 border-t-2 border-dashed ${theme === 'dark' ? 'border-stone-700' : 'border-stone-300'}`}>
                    <button type="button" onClick={() => setIsModalOpen(false)}
                      className={`px-8 py-3.5 font-serif font-bold transition-colors rounded-lg w-full sm:w-auto text-center ${theme === 'dark' ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800' : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'}`}>
                      Cancel
                    </button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                      className="px-10 py-3.5 bg-rose-800 hover:bg-rose-900 text-[#fdfbf7] font-serif font-bold rounded-lg shadow-md flex items-center justify-center gap-3 w-full sm:w-auto transition-all">
                      {editingAnime ? <><Edit className="w-5 h-5"/> Update Diary</> : <><BookOpen className="w-5 h-5"/> Paste in Journal</>}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
};

export default AnimeRatingSection;