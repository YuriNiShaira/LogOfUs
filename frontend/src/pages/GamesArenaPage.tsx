import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  Trophy,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import RomanticBackground from '../components/RomanticBackground';
import Navbar from '../components/Navbar';
import GamesArena from '../components/GamesArena';

interface GameScore {
  id: number;
  game_name: string;
  my_score: number;
  shaira_score: number;
  game_history: any[];
  updated_at: string;
}

interface LeaderboardData {
  my_total: number;
  shaira_total: number;
  leader: 'me' | 'shaira' | 'tie';
  games: GameScore[];
}

type GameTab = 'memory-match' | 'quiz' | 'scores';

const GamesArenaPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [activeGame, setActiveGame] = useState<GameTab>('memory-match');

  // Fetch game scores
  const { data: leaderboard, isLoading: scoresLoading } = useQuery<LeaderboardData>({
    queryKey: ['game-leaderboard'],
    queryFn: async () => {
      const response = await api.get('/game-scores/leaderboard/');
      return response.data;
    },
  });

  const isDarkMode = theme === 'dark';

  const gameTabs = [
    { id: 'memory-match' as GameTab, label: 'Memory Match', icon: Heart },
    { id: 'scores' as GameTab, label: 'Scores', icon: Trophy },
  ];

  const getWinnerEmoji = () => {
    if (!leaderboard) return '🤝';
    if (leaderboard.leader === 'me') return '👑';
    if (leaderboard.leader === 'shaira') return '👑';
    return '🤝';
  };

  const getWinnerName = () => {
    if (!leaderboard) return 'Tie';
    if (leaderboard.leader === 'me') return user?.display_name || 'You';
    if (leaderboard.leader === 'shaira') return 'Partner';
    return 'Tie';
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
                <span className="text-gradient-soft">Games Arena</span>
              </h1>
              <p className={`text-base sm:text-lg font-serif italic mt-2 ${isDarkMode ? 'text-rose-300/60' : 'text-rose-700/50'}`}>
                Fun games to play together and keep the spark alive!
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className={`px-4 py-2 rounded-lg border font-serif text-sm transition-all ${
                isDarkMode
                  ? 'border-rose-800/50 text-rose-300 hover:bg-rose-900/30'
                  : 'border-rose-200 text-rose-600 hover:bg-rose-50'
              }`}
            >
              Back to Love
            </button>
          </div>
          <div className={`mt-4 h-px w-full bg-gradient-to-r from-transparent via-rose-300/50 to-transparent`} />
        </motion.div>

        {/* Game Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className={`flex gap-2 p-1 rounded-xl ${isDarkMode ? 'bg-stone-800/50' : 'bg-white/50'} backdrop-blur-sm border ${isDarkMode ? 'border-stone-700' : 'border-rose-100'}`}>
            {gameTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeGame === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveGame(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all font-serif ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
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
          {activeGame === 'memory-match' && (
            <motion.div
              key="memory-match"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`p-6 rounded-xl ${isDarkMode ? 'bg-stone-800/30 border border-stone-700' : 'bg-white/40 border border-rose-100'}`}
            >
              <GamesArena />
            </motion.div>
          )}

          {activeGame === 'scores' && (
            <motion.div
              key="scores"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Overall Leaderboard */}
              <div className={`p-6 rounded-xl ${isDarkMode ? 'bg-stone-800/30 border border-stone-700' : 'bg-white/40 border border-rose-100'}`}>
                <h3 className={`text-2xl font-serif mb-4 ${isDarkMode ? 'text-rose-200' : 'text-rose-800'}`}>
                  <Trophy className="inline w-6 h-6 mr-2 text-amber-500" />
                  Overall Leaderboard
                </h3>

                {scoresLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : leaderboard ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-around py-4 bg-gradient-to-r from-rose-100/50 to-pink-100/50 dark:from-rose-900/20 dark:to-pink-900/20 rounded-xl">
                      <div className="text-center">
                        <p className={`text-sm font-serif ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                          {user?.display_name || 'You'}
                        </p>
                        <p className="text-3xl font-bold text-rose-500">{leaderboard.my_total}</p>
                      </div>
                      <div className="text-center">
                        <div className="text-4xl">{getWinnerEmoji()}</div>
                        <p className={`text-sm font-serif ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                          {getWinnerName()} wins!
                        </p>
                      </div>
                      <div className="text-center">
                        <p className={`text-sm font-serif ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                          Partner
                        </p>
                        <p className="text-3xl font-bold text-pink-500">{leaderboard.shaira_total}</p>
                      </div>
                    </div>

                    {/* Individual Game Scores */}
                    <div className="space-y-3 mt-6">
                      <h4 className={`font-serif text-lg ${isDarkMode ? 'text-stone-300' : 'text-gray-700'}`}>
                        Game Breakdown
                      </h4>
                      {leaderboard.games.map((game) => (
                        <div key={game.game_name} className={`p-4 rounded-lg ${isDarkMode ? 'bg-stone-800/50' : 'bg-white/60'} border ${isDarkMode ? 'border-stone-700' : 'border-rose-100'}`}>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className={`font-serif font-bold ${isDarkMode ? 'text-stone-200' : 'text-gray-800'}`}>
                                {game.game_name}
                              </p>
                              <p className={`text-xs font-serif ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                                Last played: {new Date(game.updated_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`font-serif ${isDarkMode ? 'text-stone-300' : 'text-gray-700'}`}>
                                You: <span className="font-bold text-rose-500">{game.my_score}</span>
                              </span>
                              <span className={`font-serif ${isDarkMode ? 'text-stone-300' : 'text-gray-700'}`}>
                                Partner: <span className="font-bold text-pink-500">{game.shaira_score}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className={`font-serif italic ${isDarkMode ? 'text-stone-400' : 'text-gray-500'}`}>
                    No scores yet. Start playing!
                  </p>
                )}
              </div>
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