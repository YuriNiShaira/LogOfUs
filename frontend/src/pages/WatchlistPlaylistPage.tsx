import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Star,
  Music,
  Heart,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import PlaylistSection from '../components/PlaylistSection';
import AnimeRatingSection from '../components/AnimeRatingSection';

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
  const [activeTab, setActiveTab] = useState<TabType>('watchlist');

  const isDarkMode = theme === 'dark';

  return (
    <div className="min-h-screen relative overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;600;700&family=Playfair+Display:ital,wght@0,400;0,600;1,400&display=swap');
        .font-handwriting { font-family: 'Caveat', cursive; }
        .font-serif { font-family: 'Playfair Display', serif; }
      `}} />

      <RomanticBackground />
      <Navbar />

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 py-6 pb-24">
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
            >
              <AnimeRatingSection 
                isGlobal={true}
              />
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