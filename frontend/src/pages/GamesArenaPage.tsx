import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import GamesArena from '../components/GamesArena';

const GamesArenaPage: React.FC = () => {
  const { theme } = useTheme();

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

      {/* Main content - adjusted for sidebar */}
      <div className="relative z-10 px-4 sm:px-6 py-6 pb-24 transition-all duration-300">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className={`text-3xl sm:text-4xl md:text-5xl font-serif italic font-bold ${isDarkMode ? 'text-rose-100' : 'text-rose-950'}`}>
                <span className="text-gradient-soft">Games Arena</span>
              </h1>
              <p className={`text-base sm:text-lg font-serif italic mt-2 ${isDarkMode ? 'text-rose-300/60' : 'text-rose-700/50'}`}>
                Fun games to play together and keep the spark alive! 💕
              </p>
            </div>
          </div>
          <div className={`mt-4 h-px w-full bg-gradient-to-r from-transparent via-rose-300/50 to-transparent`} />
        </motion.div>

        {/* Games Arena - Shows both games and scores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 sm:p-6 rounded-xl ${isDarkMode ? 'bg-stone-800/30 border border-stone-700' : 'bg-white/40 border border-rose-100'}`}
        >
          <GamesArena />
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 text-center pb-8"
        >
          <p className={`font-serif italic text-xs ${isDarkMode ? 'text-rose-300/40' : 'text-rose-700/40'}`}>
            "Play together, stay together" 💕
          </p>
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
        </motion.div>
      </div>
    </div>
  );
};

export default GamesArenaPage;