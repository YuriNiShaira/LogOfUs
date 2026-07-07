import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Heart, RotateCcw, User, Timer, Sparkles, Camera, ArrowLeft,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import DeleteConfirmModal from './DeleteConfirmModal';
import { useTheme } from '../contexts/ThemeContext';

interface Memory {
  id: number;
  title: string;
  image: string;
  year: number;
}

interface Card {
  id: number;
  memoryId: number;
  image: string;
  title: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface GameScore {
  id: number;
  game_name: string;
  my_score: number;
  shaira_score: number;
}

interface MemoryMatchGameProps {
  // ✅ Make year optional for global play
  yearId?: number;
  onBack?: () => void;
  currentScore?: GameScore;
  onWin: (winner: string) => void;
  onReset: () => void;
}

const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  yearId,
  onBack,
  currentScore,
  onWin,
  onReset,
}) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const displayName = user?.display_name || 'You';
  const partnerName = user?.partner_name || 'Partner';

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndexes, setFlippedIndexes] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [currentPlayer, setCurrentPlayer] = useState<'me' | 'shaira'>('me');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [myPairs, setMyPairs] = useState<number>(0);
  const [shairaPairs, setShairaPairs] = useState<number>(0);
  const [timer, setTimer] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameWinner, setGameWinner] = useState<string | null>(null);
  const [showResetModal, setShowResetModal] = useState(false);

  // ✅ Fetch memories (optionally by year, or all if no year)
  const { data: memories, isLoading } = useQuery<Memory[]>({
    queryKey: ['memoriesWithImages', yearId || 'all'],
    queryFn: async () => {
      const url = yearId ? `/memories/?year=${yearId}` : '/memories/';
      const response = await api.get(url);
      const allMemories = Array.isArray(response.data) ? response.data : response.data.results || [];
      return allMemories.filter((m: Memory) => m.image);
    },
  });

  const completeGame = (finalMyPairs: number, finalShairaPairs: number) => {
    setIsTimerRunning(false);
    setGameCompleted(true);

    let winner: string;
    if (finalMyPairs > finalShairaPairs) {
      winner = 'me';
      setGameWinner(displayName);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      toast.success(`You win! 🎉`, { icon: '🏆' });
    } else if (finalShairaPairs > finalMyPairs) {
      winner = 'shaira';
      setGameWinner(partnerName);
      toast.success(`${partnerName} wins! 💕`, { icon: '👑' });
    } else {
      winner = 'tie';
      setGameWinner('tie');
      toast("It's a tie! 🤝");
    }

    if (winner !== 'tie') onWin(winner);
  };

  const initializeGame = () => {
    if (!memories || memories.length < 2) return;
    const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    const shuffled = [...memories].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, pairCount);
    const gameCards: Card[] = [];

    selected.forEach((memory, index) => {
      gameCards.push({ 
        id: index * 2 + 1, 
        memoryId: memory.id, 
        image: memory.image, 
        title: memory.title, 
        isFlipped: false, 
        isMatched: false 
      });
      gameCards.push({ 
        id: index * 2 + 2, 
        memoryId: memory.id, 
        image: memory.image, 
        title: memory.title, 
        isFlipped: false, 
        isMatched: false 
      });
    });

    setCards([...gameCards].sort(() => Math.random() - 0.5));
    setFlippedIndexes([]);
    setMatchedPairs(0);
    setMyPairs(0);
    setShairaPairs(0);
    setCurrentPlayer('me');
    setGameStarted(true);
    setGameCompleted(false);
    setGameWinner(null);
    setTimer(0);
    setIsTimerRunning(true);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isTimerRunning && !gameCompleted) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => { if (interval) clearInterval(interval); };
  }, [isTimerRunning, gameCompleted]);

  useEffect(() => {
    if (flippedIndexes.length !== 2) return;
    const [firstIndex, secondIndex] = flippedIndexes;
    const firstCard = cards[firstIndex];
    const secondCard = cards[secondIndex];
    if (!firstCard || !secondCard) return;

    let timeout: ReturnType<typeof setTimeout>;

    if (firstCard.memoryId === secondCard.memoryId) {
      timeout = setTimeout(() => {
        const updatedCards = [...cards];
        updatedCards[firstIndex] = { ...updatedCards[firstIndex], isMatched: true };
        updatedCards[secondIndex] = { ...updatedCards[secondIndex], isMatched: true };

        const newMatchedPairs = matchedPairs + 1;
        const newMyPairs = currentPlayer === 'me' ? myPairs + 1 : myPairs;
        const newShairaPairs = currentPlayer === 'shaira' ? shairaPairs + 1 : shairaPairs;
        const totalPairs = updatedCards.length / 2;

        setCards(updatedCards);
        setMatchedPairs(newMatchedPairs);
        setMyPairs(newMyPairs);
        setShairaPairs(newShairaPairs);
        setFlippedIndexes([]);

        if (newMatchedPairs === totalPairs) completeGame(newMyPairs, newShairaPairs);
      }, 500);
    } else {
      timeout = setTimeout(() => {
        const updatedCards = [...cards];
        updatedCards[firstIndex] = { ...updatedCards[firstIndex], isFlipped: false };
        updatedCards[secondIndex] = { ...updatedCards[secondIndex], isFlipped: false };
        setCards(updatedCards);
        setFlippedIndexes([]);
        setCurrentPlayer((prev) => (prev === 'me' ? 'shaira' : 'me'));
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [flippedIndexes]);

  const handleCardClick = (index: number) => {
    if (!gameStarted || gameCompleted) return;
    if (flippedIndexes.length === 2) return;
    if (!cards[index]) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;
    if (flippedIndexes.includes(index)) return;

    const updatedCards = [...cards];
    updatedCards[index] = { ...updatedCards[index], isFlipped: true };
    setCards(updatedCards);
    setFlippedIndexes((prev) => [...prev, index]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResetScore = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    onReset();
    setShowResetModal(false);
  };

  const getGridCols = () => {
    return 'grid-cols-4';
  };

  const isDark = theme === 'dark';
  const textMain = isDark ? 'text-rose-50' : 'text-rose-950';
  const textSub = isDark ? 'text-rose-300' : 'text-rose-800';

  if (isLoading) {
    return (
      <div className="w-full relative z-10 p-6 sm:p-12">
        <div className="text-center py-12">
          <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 ${isDark ? 'border-rose-400' : 'border-rose-600'}`} />
          <p className={`font-serif italic text-lg ${textSub}`}>Dusting off the photo album...</p>
        </div>
      </div>
    );
  }

  const memoriesWithImages = memories?.filter((m) => m.image) || [];
  const hasEnoughMemories = memoriesWithImages.length >= 2;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.98 }}
      className="relative z-10 w-full"
    >
      {/* Score Header - Ledger Style */}
      <div className="flex items-center justify-between mb-12 flex-wrap gap-6">
        {onBack && (
          <button 
            onClick={onBack} 
            className={`flex items-center gap-2 text-2.5 font-serif uppercase tracking-widest transition-colors ${textSub} hover:${textMain}`}
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Menu
          </button>
        )}
        
        <div className={`flex items-center gap-8 px-8 py-3 rounded-sm border ${isDark ? 'bg-[#1a050f]/60 border-rose-900/50' : 'bg-white/60 border-rose-200/60'}`}>
          <div className="text-center">
            <p className={`text-2.25 uppercase font-serif tracking-widest ${textSub} mb-1`}>{displayName}</p>
            <p className={`text-3xl font-handwriting ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{currentScore?.my_score || 0}</p>
          </div>
          
          <button 
            onClick={handleResetScore} 
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

      {/* Game Title & Status */}
      <div className="text-center mb-10">
        <h3 className={`text-4xl font-serif tracking-wide ${textMain} mb-4`}>Memory Match</h3>
        
        <div className="h-8">
          {gameStarted && !gameCompleted && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-6 flex-wrap">
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border transform -rotate-1 ${isDark ? 'bg-[#2a0815]/80 border-rose-900/60 text-amber-200/90' : 'bg-[#FFFAF0]/80 border-rose-200 text-amber-700'}`}>
                <Timer className="w-4 h-4" />
                <span className="font-serif italic tracking-wide">{formatTime(timer)}</span>
              </div>
              <div className={`flex items-center gap-2 px-4 py-1.5 rounded-sm border transform rotate-1 shadow-sm ${
                currentPlayer === 'me' 
                  ? (isDark ? 'bg-[#1a050f]/80 border-rose-900/60 text-rose-300' : 'bg-white border-rose-200 text-rose-700') 
                  : (isDark ? 'bg-[#4c0519]/40 border-rose-800 text-rose-200' : 'bg-rose-50 border-rose-300 text-rose-800')
              }`}>
                <User className="w-3.5 h-3.5" />
                <span className="font-serif italic tracking-wide">
                  {currentPlayer === 'me' ? displayName : partnerName}'s Turn
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Not enough photos State */}
      {!hasEnoughMemories ? (
        <div className={`text-center py-16 px-4 border-2 border-dashed rounded-sm max-w-lg mx-auto ${isDark ? 'border-rose-900/50 bg-[#1a050f]/40' : 'border-rose-200 bg-rose-50/40'}`}>
          <Camera className={`w-10 h-10 mx-auto mb-4 ${isDark ? 'text-rose-800/80' : 'text-rose-300'}`} />
          <h4 className={`text-2xl font-serif mb-2 ${textMain}`}>Not enough photos!</h4>
          <p className={`font-serif italic mb-6 ${textSub}`}>You need at least 2 photo memories to play.</p>
          <div className="flex justify-center">
            <div className={`px-4 py-1 rounded-full border text-2.5 font-serif uppercase tracking-widest ${isDark ? 'bg-black/20 border-rose-900 text-rose-400' : 'bg-white border-rose-100 text-rose-500'}`}>
              Current photos: {memoriesWithImages.length}
            </div>
          </div>
        </div>
      ) : !gameStarted ? (
        
        /* Start Screen */
        <div className="text-center py-8 max-w-lg mx-auto">
          <Sparkles className={`w-8 h-8 mx-auto mb-6 ${isDark ? 'text-rose-400' : 'text-rose-300'}`} />
          <h4 className={`text-3xl font-serif mb-10 ${textMain}`}>Ready to test your memory?</h4>
          
          <div className="flex gap-4 justify-center mb-12 flex-wrap">
            {(['easy', 'medium', 'hard'] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-6 py-2.5 rounded-full font-serif uppercase tracking-widest text-2.75 transition-all border ${
                  difficulty === d 
                    ? (isDark ? 'bg-[#4c0519]/60 border-rose-800 text-rose-200 transform scale-105' : 'bg-rose-50 border-rose-300 text-rose-800 transform scale-105') 
                    : (isDark ? 'bg-transparent border-rose-900/50 text-rose-400/60 hover:text-rose-300 hover:border-rose-700' : 'bg-transparent border-rose-200 text-rose-600/70 hover:text-rose-800 hover:border-rose-300')
                }`}>
                {d} <span className="opacity-60 lowercase italic ml-1">({d === 'easy' ? '4' : d === 'medium' ? '6' : '8'} pairs)</span>
              </button>
            ))}
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.02 }} 
            whileTap={{ scale: 0.98 }} 
            onClick={initializeGame} 
            className={`px-10 py-3.5 rounded-full font-serif uppercase tracking-widest text-xs transition-all shadow-md ${
              isDark
                ? 'bg-rose-900 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
                : 'bg-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_4px_15px_rgba(136,19,55,0.25)]'
            }`}
          >
            Scatter the photos
          </motion.button>
        </div>
      ) : gameCompleted ? (
        
        /* Game Over */
        <div className="text-center py-10">
          <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring" }} className="text-6xl mb-6">
            {gameWinner === displayName ? '🏆' : gameWinner === partnerName ? '👑' : '🤝'}
          </motion.div>
          <h4 className={`text-4xl font-serif mb-8 ${textMain}`}>
            {gameWinner === 'tie' ? "It's a Tie!" : `${gameWinner} Claims Victory!`}
          </h4>
          
          <div className={`flex justify-center gap-12 mb-8 border px-8 py-5 rounded-sm max-w-sm mx-auto shadow-inner ${isDark ? 'bg-[#1a050f]/60 border-rose-900/50' : 'bg-white/60 border-rose-200/60'}`}>
            <div>
              <p className={`text-2.5 font-serif uppercase tracking-widest mb-1 ${textSub}`}>{displayName}</p>
              <p className={`text-4xl font-handwriting ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>{myPairs}</p>
            </div>
            <div className={`w-px ${isDark ? 'bg-rose-900/50' : 'bg-rose-200'}`}></div>
            <div>
              <p className={`text-2.5 font-serif uppercase tracking-widest mb-1 ${textSub}`}>{partnerName}</p>
              <p className={`text-4xl font-handwriting ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>{shairaPairs}</p>
            </div>
          </div>
          
          <p className={`font-serif italic mb-10 ${textSub}`}>Completed in {formatTime(timer)}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={initializeGame} 
              className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-serif uppercase tracking-widest text-2.75 transition-all border ${
                isDark
                  ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_5px_15px_rgba(0,0,0,0.3)]'
                  : 'bg-rose-950 border-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_5px_15px_rgba(136,19,55,0.25)]'
              }`}>
              Play Again
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setGameStarted(false)} 
              className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-serif uppercase tracking-widest text-2.75 transition-all border ${
                isDark
                  ? 'bg-transparent border-rose-800/50 text-rose-300 hover:bg-rose-900/40 hover:border-rose-700'
                  : 'bg-transparent border-rose-200 text-rose-800 hover:bg-white hover:border-rose-300 hover:shadow-sm'
              }`}>
              Settings
            </motion.button>
          </div>
        </div>
      ) : (
        
        /* Game Board */
        <>
          <div className="flex justify-center gap-6 sm:gap-12 mb-8 relative z-10">
            <div className={`text-center border px-5 py-2 rounded-sm transform -rotate-2 shadow-sm ${
              isDark ? 'bg-[#1a050f]/60 border-rose-900/50' : 'bg-white border-rose-200/80'
            }`}>
              <p className={`text-2.25 font-serif uppercase tracking-widest mb-1 ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>{displayName} ❤️</p>
              <p className={`text-3xl font-handwriting ${isDark ? 'text-rose-200' : 'text-rose-800'}`}>{myPairs}</p>
            </div>
            <div className={`text-center border px-5 py-2 rounded-sm transform rotate-2 shadow-sm ${
              isDark ? 'bg-[#4c0519]/40 border-rose-800/60' : 'bg-rose-50 border-rose-300/80'
            }`}>
              <p className={`text-2.25 font-serif uppercase tracking-widest mb-1 ${isDark ? 'text-rose-400' : 'text-rose-700'}`}>{partnerName} ⭐</p>
              <p className={`text-3xl font-handwriting ${isDark ? 'text-rose-300' : 'text-rose-600'}`}>{shairaPairs}</p>
            </div>
          </div>

          <div 
            className={`p-6 md:p-10 rounded-sm border shadow-inner mb-10 ${
              isDark ? 'bg-[#110307]/50 border-rose-900/30' : 'bg-[#FFFAF0] border-rose-200/50'
            }`}
            style={{
              backgroundImage: isDark ? 'radial-gradient(rgba(225,29,72,0.3) 1px, transparent 1px)' : 'radial-gradient(rgba(225,29,72,0.15) 1px, transparent 1px)',
              backgroundSize: '24px 24px'
            }}
          >
            <div className={`grid ${getGridCols()} gap-4 sm:gap-6 max-w-3xl mx-auto`}>
              {cards.map((card, index) => (
                <motion.button key={card.id}
                  whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05, rotate: (index % 2 === 0 ? 3 : -3) } : {}}
                  whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
                  onClick={() => handleCardClick(index)}
                  className={`aspect-square transition-all duration-300 ${
                    card.isMatched ? 'opacity-30 grayscale cursor-default scale-95' : 'cursor-pointer hover:drop-shadow-md'
                  }`}
                  disabled={card.isFlipped || card.isMatched || flippedIndexes.length === 2}
                >
                  <AnimatePresence mode="wait">
                    {card.isFlipped || card.isMatched ? (
                      <motion.div key="front" initial={{ rotateY: 90 }} animate={{ rotateY: 0 }} exit={{ rotateY: 90 }} transition={{ duration: 0.2 }}
                        className={`w-full h-full p-2 sm:p-3 pb-6 sm:pb-8 rounded-sm shadow-sm border flex flex-col ${
                          isDark ? 'bg-[#FFFAF0] border-rose-200' : 'bg-white border-rose-100'
                        }`}>
                        <div className="flex-1 overflow-hidden bg-rose-950">
                          <img src={card.image} alt={card.title} className="w-full h-full object-cover filter contrast-110 sepia-[.15]" />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div key="back" initial={{ rotateY: -90 }} animate={{ rotateY: 0 }} exit={{ rotateY: -90 }} transition={{ duration: 0.2 }}
                        className={`w-full h-full border rounded-sm flex items-center justify-center shadow-sm relative overflow-hidden ${
                          isDark ? 'bg-[#2a0815] border-rose-900/60' : 'bg-rose-50 border-rose-200'
                        }`}>
                        
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border ${
                          isDark ? 'bg-rose-900 border-rose-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),_0_2px_5px_rgba(0,0,0,0.5)]' : 'bg-rose-700 border-rose-800 shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),_0_2px_5px_rgba(225,29,72,0.3)]'
                        }`}>
                          <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white/80 opacity-90" />
                        </div>
                        
                        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '8px 8px', backgroundPosition: '0 0, 4px 4px' }} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-center">
            <motion.button 
              whileHover={{ scale: 1.02 }} 
              whileTap={{ scale: 0.98 }}
              onClick={() => { if (window.confirm('Pack up the cards and quit?')) { setGameStarted(false); setIsTimerRunning(false); } }}
              className={`font-serif italic text-sm transition-colors border-b border-transparent ${
                isDark ? 'text-rose-400/70 hover:text-rose-300 hover:border-rose-400' : 'text-rose-600/70 hover:text-rose-800 hover:border-rose-400'
              }`}
            >
              Quit Game
            </motion.button>
          </div>
        </>
      )}

      <DeleteConfirmModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        onConfirm={confirmReset}
        title="Burn the Ledger?"
        message="This will wipe the Memory Match slate clean and reset the score to 0-0. Are you sure you want to erase this history?"
        loading={false}
      />
    </motion.div>
  );
};

export default MemoryMatchGame;