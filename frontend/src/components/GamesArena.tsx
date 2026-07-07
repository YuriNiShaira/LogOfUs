import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RotateCcw,
  Crown,
  Grid3x3,
  Image as ImageIcon,
  ArrowLeft,
  Trophy,
  Gamepad2,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import MemoryMatchGame from './MemoryMatchGame';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useNavigate } from 'react-router-dom';

interface GameScore {
  id: number;
  game_name: string;
  my_score: number;
  shaira_score: number;
  year: number;
}

interface LeaderboardData {
  my_total: number;
  shaira_total: number;
  leader: string;
  games: GameScore[];
}

interface GamesArenaProps {
  // ✅ Make year optional for global play
  yearId?: number;
  yearNumber?: number;
}

type GameType = 'tictactoe' | 'memorymatch' | 'menu';

const GamesArena: React.FC<GamesArenaProps> = ({ yearId, yearNumber }) => {
  const [activeGame, setActiveGame] = useState<GameType>('menu');
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { theme } = useTheme();

  const displayName = user?.display_name || 'You';
  const partnerName = user?.partner_name || 'Partner';

  // ✅ Fetch leaderboard (with or without year)
  const { data: leaderboard } = useQuery<LeaderboardData>({
    queryKey: ['leaderboard', yearId || 'all'],
    queryFn: async () => {
      const url = yearId ? `/game-scores/leaderboard/?year_id=${yearId}` : '/game-scores/leaderboard/';
      const response = await api.get(url);
      return response.data;
    },
  });

  const recordWinMutation = useMutation({
    mutationFn: async ({ gameName, winner }: { gameName: string; winner: string }) => {
      const response = await api.post('/game-scores/record_win/', {
        year_id: yearId || 0,
        game_name: gameName,
        winner,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', yearId || 'all'] });

      if (variables.winner === 'me') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success(`${displayName} won! 🎉`, { icon: '🏆' });
      } else {
        toast.success(`${partnerName} won! 💕`, { icon: '👑' });
      }
    },
  });

  const resetGameMutation = useMutation({
    mutationFn: async (gameName: string) => {
      const existingScore = leaderboard?.games?.find((g) => g.game_name === gameName);
      if (existingScore) {
        const response = await api.put(`/game-scores/${existingScore.id}/`, {
          year: yearId || 0,
          game_name: gameName,
          my_score: 0,
          shaira_score: 0,
        });
        return response.data;
      } else {
        const response = await api.post('/game-scores/', {
          year: yearId || 0,
          game_name: gameName,
          my_score: 0,
          shaira_score: 0,
        });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard', yearId || 'all'] });
      toast.success('Scoreboard erased! 🔄');
      setResetTarget(null);
    },
  });

  const handleResetScore = (gameName: string) => {
    setResetTarget(gameName);
  };

  const games = [
    {
      id: 'tictactoe' as GameType,
      name: 'Tic Tac Toe',
      icon: Grid3x3,
      description: "The classic game of X's and O's... 💕",
    },
    {
      id: 'memorymatch' as GameType,
      name: 'Memory Match',
      icon: ImageIcon,
      description: 'Test your memory using your favorite moments together! 📸',
    },
  ];

  const isDark = theme === 'dark';
  const bgMain = isDark ? 'bg-[#2a0815]' : 'bg-[#FFFAF0]';
  const textMain = isDark ? 'text-rose-50' : 'text-rose-950';
  const textSub = isDark ? 'text-rose-300' : 'text-rose-800';
  const cardBg = isDark ? 'bg-[#4c0519]/40 border-rose-900/50' : 'bg-white border-rose-100';

  // ✅ If no yearId, show a back button to dashboard
  const handleBack = () => {
    if (yearId) {
      // If in year page context, go back to menu
      setActiveGame('menu');
    } else {
      // If in global games page, go to dashboard
      navigate('/dashboard');
    }
  };

  return (
    <div className={`space-y-8 max-w-5xl mx-auto p-6 sm:p-10 ${bgMain} rounded-sm min-h-screen transition-colors duration-300 shadow-[0_10px_40px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.4)] border border-rose-900/5 relative overflow-hidden`}>
      
      {/* Premium Paper Grain overlay */}
      <style>{`
        .paper-grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E");
        }
      `}</style>
      <div className="absolute inset-0 opacity-[0.03] paper-grain pointer-events-none mix-blend-multiply dark:mix-blend-overlay"></div>

      {/* Header & Overall Scoreboard */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-10 border-b border-rose-200/50 dark:border-rose-900/50">
        <div className="flex items-start gap-4">
          <button
            onClick={handleBack}
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-rose-900/50' : 'hover:bg-rose-50'}`}
            title="Back"
          >
            <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
          </button>
          <div>
            <p className={`text-2.75 font-bold uppercase tracking-[0.2em] ${textSub} mb-2 flex items-center gap-2`}>
              <Gamepad2 className="w-4 h-4" /> Games Arena
            </p>
            <h2 className={`text-4xl sm:text-5xl font-serif tracking-wide ${textMain}`}>
              Play &amp; Wagers <span className="text-rose-400 font-light italic text-3xl ml-2">{yearNumber ? `Vol. ${yearNumber}` : '🎮'}</span>
            </h2>
          </div>
        </div>

        {/* Journal Ledger Scoreboard */}
        <div className={`flex items-center gap-8 px-10 py-5 rounded-sm shadow-sm border ${cardBg}`}>
          <div className="text-center relative">
            {leaderboard?.leader === 'me' && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-500" />}
            <p className={`text-2.5 font-serif uppercase tracking-widest ${textSub} mb-1`}>{displayName}</p>
            <p className={`text-4xl font-handwriting ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{leaderboard?.my_total || 0}</p>
          </div>
          
          <div className="flex flex-col items-center px-6 border-x border-dashed border-rose-200 dark:border-rose-900/50">
            <Trophy className={`w-5 h-5 mb-1 ${isDark ? 'text-rose-900' : 'text-rose-200'}`} />
            <span className={`text-2.75 font-serif italic uppercase tracking-wider ${textSub}`}>The Ledger</span>
          </div>
          
          <div className="text-center relative">
            {leaderboard?.leader === 'shaira' && <Crown className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 text-amber-500" />}
            <p className={`text-2.5 font-serif uppercase tracking-widest ${textSub} mb-1`}>{partnerName}</p>
            <p className={`text-4xl font-handwriting ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>{leaderboard?.shaira_total || 0}</p>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <AnimatePresence mode="wait">
        {activeGame === 'menu' ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 pt-6"
          >
            {games.map((game) => {
              const Icon = game.icon;
              const score = leaderboard?.games?.find((g) => g.game_name === game.id);
              
              return (
                <motion.div 
                  key={game.id} 
                  whileHover={{ scale: 1.02, y: -4 }} 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveGame(game.id)}
                  className={`p-8 sm:p-10 rounded-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] cursor-pointer transition-all border group relative overflow-hidden ${cardBg}`}
                >
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className={`p-4 rounded-full bg-transparent border-2 border-rose-200 dark:border-rose-900/60 transform group-hover:rotate-12 transition-transform duration-500`}>
                      <Icon className={`w-7 h-7 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} />
                    </div>
                    
                    {score && (
                      <div className={`px-5 py-3 rounded-sm text-right border ${isDark ? 'bg-[#2a0815] border-rose-900/50' : 'bg-[#FFFAF0] border-rose-100'}`}>
                        <p className={`text-2.25 uppercase font-serif tracking-widest ${textSub} mb-1`}>Score</p>
                        <p className="text-2xl font-handwriting flex items-center gap-2">
                          <span className={isDark ? 'text-rose-300' : 'text-rose-700'}>{score.my_score}</span>
                          <span className={`${textSub} text-sm`}>—</span>
                          <span className={isDark ? 'text-rose-400' : 'text-rose-600'}>{score.shaira_score}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`text-3xl font-serif mb-3 tracking-wide ${textMain}`}>{game.name}</h3>
                  <p className={`text-sm leading-relaxed mb-8 font-serif italic ${textSub}`}>{game.description}</p>
                  
                  <div className={`inline-flex items-center gap-3 text-2.75 font-serif uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                    Play Now <span className="text-lg leading-none transform group-hover:translate-x-2 transition-transform">→</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : activeGame === 'tictactoe' ? (
          <TicTacToeGame
            key="tictactoe"
            onBack={() => setActiveGame('menu')}
            onWin={(winner) => recordWinMutation.mutate({ gameName: 'tictactoe', winner })}
            currentScore={leaderboard?.games?.find((g) => g.game_name === 'tictactoe')}
            onReset={() => handleResetScore('tictactoe')}
            theme={theme}
            displayName={displayName}
            partnerName={partnerName}
          />
        ) : activeGame === 'memorymatch' ? (
          <motion.div key="memorymatch" className="relative z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <MemoryMatchGame
              yearId={yearId}
              onBack={() => setActiveGame('menu')}
              onWin={(winner) => recordWinMutation.mutate({ gameName: 'memorymatch', winner })}
              currentScore={leaderboard?.games?.find((g) => g.game_name === 'memorymatch')}
              onReset={() => handleResetScore('memorymatch')}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <DeleteConfirmModal
        isOpen={!!resetTarget}
        onClose={() => setResetTarget(null)}
        onConfirm={() => {
          if (resetTarget) resetGameMutation.mutate(resetTarget);
        }}
        title="Burn the Ledger?"
        message="This will wipe the slate clean and reset the score to 0-0. Are you sure you want to erase this history?"
        loading={resetGameMutation.isPending}
      />
    </div>
  );
};

// --- Tic Tac Toe Component ---
interface TicTacToeProps {
  onBack: () => void;
  onWin: (winner: string) => void;
  currentScore?: GameScore;
  onReset: () => void;
  theme: string;
  displayName: string;
  partnerName: string;
}

const TicTacToeGame: React.FC<TicTacToeProps> = ({ onBack, onWin, currentScore, onReset, theme, displayName, partnerName }) => {
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [winner, setWinner] = useState<string | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [hasRecordedWin, setHasRecordedWin] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        setWinningLine(lines[i]);
        return squares[a];
      }
    }
    return null;
  };

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? '❤️' : '⭐';
    setBoard(newBoard);
    
    const gameWinner = calculateWinner(newBoard);
    if (gameWinner && !hasRecordedWin) {
      setWinner(gameWinner);
      setHasRecordedWin(true);
      onWin(gameWinner === '❤️' ? 'me' : 'shaira');
    } else if (!newBoard.includes(null) && !gameWinner) {
      toast("It's a tie! 🤝");
    }
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setWinner(null);
    setWinningLine(null);
    setHasRecordedWin(false);
  };

  const isDark = theme === 'dark';
  const textMain = isDark ? 'text-rose-50' : 'text-rose-950';
  const textSub = isDark ? 'text-rose-300' : 'text-rose-800';

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      className="relative z-10 rounded-sm p-6 sm:p-12 w-full"
    >
      <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
        <button 
          onClick={onBack} 
          className={`flex items-center gap-2 text-2.5 font-serif uppercase tracking-widest transition-colors ${textSub} hover:${textMain}`}
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Menu
        </button>
        
        <div className={`flex items-center gap-8 px-8 py-3 rounded-sm border ${isDark ? 'bg-[#1a050f]/60 border-rose-900/50' : 'bg-white/60 border-rose-200/60'}`}>
          <div className="text-center">
            <p className={`text-2.25 uppercase font-serif tracking-widest ${textSub} mb-1`}>{displayName}</p>
            <p className={`text-3xl font-handwriting ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{currentScore?.my_score || 0}</p>
          </div>
          
          <button 
            onClick={() => setShowResetModal(true)} 
            className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-rose-900/50 text-rose-500' : 'hover:bg-rose-50 text-rose-300'}`} 
            title="Erase Ledger"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          
          <div className="text-center">
            <p className={`text-2.25 uppercase font-serif tracking-widest ${textSub} mb-1`}>{partnerName}</p>
            <p className={`text-3xl font-handwriting ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>{currentScore?.shaira_score || 0}</p>
          </div>
        </div>
      </div>

      <div className="text-center mb-12">
        <h3 className={`text-4xl font-serif tracking-wide ${textMain}`}>
          {winner
            ? `${winner === '❤️' ? displayName : partnerName} claims victory! 🎉`
            : `It's ${isXNext ? displayName : partnerName}'s turn ${isXNext ? '❤️' : '⭐'}`}
        </h3>
      </div>

      {/* Hand-drawn style Tic Tac Toe Board */}
      <div className="max-w-87.5 sm:max-w-100 mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-3">
          {board.map((cell, index) => {
            const borderBottom = index < 6 ? (isDark ? 'border-b border-rose-900/60' : 'border-b border-rose-200') : '';
            const borderRight = index % 3 !== 2 ? (isDark ? 'border-r border-rose-900/60' : 'border-r border-rose-200') : '';
            
            return (
              <motion.button 
                key={index}
                whileHover={!cell && !winner ? { scale: 1.05 } : {}}
                whileTap={!cell && !winner ? { scale: 0.95 } : {}}
                onClick={() => handleClick(index)}
                className={`w-full aspect-square text-5xl sm:text-6xl flex items-center justify-center transition-colors
                  ${borderBottom} ${borderRight}
                  ${winningLine?.includes(index) 
                    ? (isDark ? 'bg-rose-900/30' : 'bg-rose-50/80') 
                    : (isDark ? 'hover:bg-[#4c0519]/20' : 'hover:bg-rose-50/30')
                  } 
                  ${!cell && !winner ? 'cursor-pointer' : 'cursor-default'}
                `}
              >
                {cell && (
                  <motion.span 
                    initial={{ scale: 0, opacity: 0, rotate: -20 }} 
                    animate={{ scale: 1, opacity: 1, rotate: 0 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {cell}
                  </motion.span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="text-center mt-14">
        <motion.button 
          whileHover={{ scale: 1.02 }} 
          whileTap={{ scale: 0.98 }} 
          onClick={resetGame} 
          className={`px-8 py-3.5 rounded-full font-serif uppercase tracking-widest text-xs transition-all border ${
            isDark
              ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
              : 'bg-rose-900 border-rose-950 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(136,19,55,0.2)]'
          }`}
        >
          Draw a New Grid
        </motion.button>
      </div>

      <DeleteConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={() => { onReset(); setShowResetModal(false); }}
        title="Burn the Ledger?"
        message="This will wipe the Tic Tac Toe slate clean and reset the score to 0-0. Continue?"
      />
    </motion.div>
  );
};

export default GamesArena;