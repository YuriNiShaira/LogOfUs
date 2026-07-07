// src/pages/WatchlistPlaylistPage.tsx

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Music,
  Film,
  Tv,
  Heart,
  X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import PlaylistSection from '../components/PlaylistSection';
import toast from 'react-hot-toast';

interface AnimeRating {
  id: number;
  title: string;
  media_type: 'anime' | 'movie' | 'show';
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
  watched_date: string;
  created_at: string;
}

type TabType = 'watchlist' | 'playlist';

// Floating Hearts Component
const FloatingHearts: React.FC = () => (
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
);

const WatchlistPlaylistPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');

  // ✅ Fix: Ensure we always get an array
  const { data: animeRatings, isLoading: animeLoading } = useQuery<AnimeRating[]>({
    queryKey: ['anime-ratings'],
    queryFn: async () => {
      const response = await api.get('/anime-ratings/');
      // ✅ Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with results property (paginated response)
        if (Array.isArray(response.data.results)) {
          return response.data.results;
        }
        // If it's a single object, wrap it in an array
        if (response.data.id) {
          return [response.data];
        }
      }
      // Fallback to empty array
      return [];
    },
  });

  // ✅ Ensure animeRatings is always an array for rendering
  const ratings = Array.isArray(animeRatings) ? animeRatings : [];

  // Delete anime mutation
  const deleteAnimeMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/anime-ratings/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anime-ratings'] });
      toast.success('Removed from watchlist');
    },
    onError: () => {
      toast.error('Failed to remove');
    },
  });

  const isDarkMode = theme === 'dark';

  const getMediaIcon = (type: string) => {
    switch (type) {
      case 'anime':
        return <Tv className="w-4 h-4" />;
      case 'movie':
        return <Film className="w-4 h-4" />;
      case 'show':
        return <Tv className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };

  const getMediaTypeLabel = (type: string) => {
    switch (type) {
      case 'anime':
        return 'Anime';
      case 'movie':
        return 'Movie';
      case 'show':
        return 'TV Show';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      <RomanticBackground />
      <Navbar />

      <div className="max-w-6xl mx-auto relative z-10 px-4 sm:px-6 py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold ${isDarkMode ? 'text-rose-100' : 'text-rose-950'}`}>
                <span className="text-gradient-soft">Watchlist & Playlist</span>
              </h1>
              <p className={`text-base sm:text-lg font-serif italic mt-2 ${isDarkMode ? 'text-rose-300/60' : 'text-rose-700/50'}`}>
                All the shows you love and songs that remind you of each other
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/dashboard')}
                className={`px-4 py-2 rounded-lg border font-serif text-sm transition-all ${
                  isDarkMode
                    ? 'border-rose-800/50 text-rose-300 hover:bg-rose-900/30'
                    : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                }`}
              >
                Back to Home
              </button>
            </div>
          </div>
          <div className={`mt-4 h-px w-full bg-gradient-to-r from-transparent via-rose-300/50 to-transparent`} />
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`flex gap-2 p-1 rounded-xl ${isDarkMode ? 'bg-stone-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-stone-700' : 'border-rose-100'}`}>
            {[
              { id: 'watchlist', label: 'Watchlist', icon: Star, color: 'from-purple-500 to-pink-500' },
              { id: 'playlist', label: 'Playlist', icon: Music, color: 'from-green-500 to-emerald-500' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-serif ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                      : isDarkMode
                        ? 'text-stone-400 hover:text-stone-200'
                        : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'watchlist' && (
            <motion.div
              key="watchlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-stone-800/50 border border-stone-700' : 'bg-white/60 border border-rose-100'}`}>
                  <p className="text-2xl font-serif font-bold text-rose-500">{ratings.length}</p>
                  <p className={`text-sm font-serif italic ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>Total Items</p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-stone-800/50 border border-stone-700' : 'bg-white/60 border border-rose-100'}`}>
                  <p className="text-2xl font-serif font-bold text-rose-500">
                    {ratings.filter(a => a.watched_together).length}
                  </p>
                  <p className={`text-sm font-serif italic ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>Watched Together 💕</p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-stone-800/50 border border-stone-700' : 'bg-white/60 border border-rose-100'}`}>
                  <p className="text-2xl font-serif font-bold text-rose-500">
                    {ratings.reduce((sum, a) => sum + (a.combined_overall || 0), 0)}
                  </p>
                  <p className={`text-sm font-serif italic ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>Total Stars</p>
                </div>
                <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-stone-800/50 border border-stone-700' : 'bg-white/60 border border-rose-100'}`}>
                  <p className="text-2xl font-serif font-bold text-rose-500">
                    {ratings.filter(a => (a.combined_overall || 0) >= 4).length}
                  </p>
                  <p className={`text-sm font-serif italic ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>Top Rated ⭐</p>
                </div>
              </div>

              {/* Watchlist Grid */}
              {animeLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : ratings.length === 0 ? (
                <div className={`text-center py-16 border-2 border-dashed rounded-xl ${isDarkMode ? 'border-stone-700' : 'border-rose-200'}`}>
                  <Star className="w-12 h-12 mx-auto mb-4 text-rose-300/50" />
                  <p className={`font-serif italic ${isDarkMode ? 'text-stone-400' : 'text-rose-400/70'}`}>
                    No watchlist items yet. Start adding your favorite shows! 🎬
                  </p>
                  <button
                    onClick={() => navigate('/year/1')}
                    className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg font-serif text-sm hover:bg-rose-600 transition-colors"
                  >
                    Add from Year Page
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ratings.map((anime) => (
                    <motion.div
                      key={anime.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ y: -4 }}
                      className={`p-6 rounded-xl border ${isDarkMode ? 'bg-stone-800/40 border-stone-700' : 'bg-white/60 border-rose-100'} shadow-sm hover:shadow-md transition-all relative group`}
                    >
                      {/* Delete button */}
                      <button
                        onClick={() => deleteAnimeMutation.mutate(anime.id)}
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-rose-400 hover:text-rose-600"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className={`p-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-pink-500/20`}>
                            {getMediaIcon(anime.media_type)}
                          </span>
                          <div>
                            <h4 className="font-serif font-bold text-gray-800 dark:text-stone-200">
                              {anime.title}
                            </h4>
                            <span className="text-xs text-gray-500 dark:text-stone-400">
                              {getMediaTypeLabel(anime.media_type)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {anime.genre && (
                        <p className={`text-sm font-serif italic ${isDarkMode ? 'text-stone-400' : 'text-gray-500'} mb-2`}>
                          {anime.genre}
                        </p>
                      )}

                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                          <span className="font-serif font-bold">{anime.combined_overall || 0}</span>
                        </div>
                        {anime.watched_together && (
                          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full">
                            <Heart className="w-3 h-3 fill-current" />
                            Together
                          </span>
                        )}
                      </div>

                      {anime.my_favorite_character && (
                        <p className={`text-xs font-serif italic mt-2 ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                          ❤️ {anime.my_favorite_character}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'playlist' && (
            <motion.div
              key="playlist"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlaylistSection />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center pb-8"
        >
          <p className={`font-serif italic text-xs ${isDarkMode ? 'text-rose-300/40' : 'text-rose-700/40'}`}>
            "Music and stories that bring us closer" 💕
          </p>
          <FloatingHearts />
        </motion.div>
      </div>
    </div>
  );
};

export default WatchlistPlaylistPage;