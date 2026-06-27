import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Sparkles, BookHeart, LockKeyhole, User, Key } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import RomanticBackground from '../components/RomanticBackground';

const FloatingHeart = ({ delay = 0, x = "50%" }) => (
  <motion.div
    initial={{ y: "110vh", opacity: 0, scale: 0 }}
    animate={{ 
      y: "-10vh", 
      opacity: [0, 0.4, 0],
      scale: [0.5, 1, 0.7],
      x: ["-20px", "20px", "-20px"] 
    }}
    transition={{ duration: 15, repeat: Infinity, delay, ease: "linear" }}
    className="absolute text-pink-300/40 pointer-events-none"
    style={{ left: x }}
  >
    <Heart fill="currentColor" size={24} />
  </motion.div>
);

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    if (!formData.username.trim() || !formData.password) {
      toast.error('Please fill in both fields');
      return;
    }
    
    setLoading(true);

    try {
      const response = await api.post('/auth/login/', {
        username: formData.username.trim(),
        password: formData.password
      });
      
      const { tokens, ...userData } = response.data;
      
      if (!tokens?.access || !tokens?.refresh) {
        throw new Error('Invalid response from server');
      }
      
      login(userData, tokens.access, tokens.refresh);
      toast.success(response.data.message || 'Welcome back!');
      setIsOpening(true);
      
      setTimeout(() => { 
        navigate('/dashboard');
      }, 1800);
      
    } catch (error: any) {
      setLoading(false);
      setIsOpening(false);
      
      let errorMessage = 'Invalid credentials. Try again';
      
      if (error.response?.data?.details?.non_field_errors) {
        errorMessage = error.response.data.details.non_field_errors[0];
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setFormData(prev => ({ ...prev, password: '' }));
      
      setTimeout(() => {
        const passwordInput = document.querySelector('input[name="password"]') as HTMLInputElement;
        if (passwordInput) {
          passwordInput.focus();
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden bg-[#fff0f5]">
      <RomanticBackground />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 sm:w-225 h-96 sm:h-225 bg-pink-100/60 rounded-full blur-[110px] pointer-events-none z-0" />

      <div className="fixed inset-0 z-0 overflow-hidden">
        <FloatingHeart x="10%" delay={0} />
        <FloatingHeart x="30%" delay={2} />
        <FloatingHeart x="60%" delay={5} />
        <FloatingHeart x="85%" delay={1} />
      </div>

      {/* --- THE BOOK CONTAINER --- */}
      <div className="relative z-10 perspective-[2000px]">
        {/* Adjusted Dimensions for Mobile View vs Desktop */}
        <div className="relative w-[300px] sm:w-[400px] h-[480px] sm:h-[612px] preserve-3d">
          
          {/* Rear paper stack */}
          <div className="absolute inset-0 bg-[#f9f9f9] rounded-r-[2.25rem] rounded-l-md shadow-xl translate-z-[-10px] border-r-4 sm:border-r-6 border-b-4 sm:border-b-6 border-gray-200/50 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-page-lines" />
          </div>

          {/* Inside pages */}
          <div className="absolute inset-0 bg-[#fffefc] rounded-r-[2.25rem] rounded-l-md border border-gray-100 flex flex-col items-center justify-center p-6 pl-10 sm:p-8 sm:pl-14 z-0 overflow-hidden shadow-inner">
            <div className="absolute right-4 top-3 bottom-3 w-4 border-r-2 border-gray-100/80" />
            <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-24 bg-linear-to-r from-pink-50 to-transparent pointer-events-none" />

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isOpening ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.9, duration: 0.5, type: "spring", stiffness: 100 }}
              className="text-center relative z-10"
            >
              <BookHeart className="w-12 h-12 sm:w-16 sm:h-16 text-pink-400 mx-auto mb-3 sm:mb-4 opacity-60" />
              <h2 className="text-xl sm:text-2xl font-serif text-gray-700 mb-2 tracking-wide">Chapter 1</h2>
              <p className="text-pink-600/90 text-sm sm:text-md font-light italic">Opening your memories...</p>
            </motion.div>
          </div>

          {/* Front cover */}
          <motion.div
            className="absolute inset-0 origin-left preserve-3d z-10 cursor-default rounded-r-[2.25rem] rounded-l-md"
            animate={{ rotateY: isOpening ? -165 : 0 }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Inside of cover */}
            <div className="absolute inset-0 bg-[#ffe4e6] rounded-l-[2.25rem] rounded-r-md backface-hidden [transform:rotateY(180deg)] border-l-4 sm:border-l-8 border-[#ec4899] shadow-inner" />

            {/* Outside of cover */}
            <div className="absolute inset-0 rounded-r-[2.25rem] rounded-l-md backface-hidden flex flex-col items-center p-4 sm:p-6 pl-6 sm:pl-10 overflow-hidden border-l-4 border-rose-950/40 bg-gradient-leather bg-[#831843] shadow-[10px_0_30px_rgba(0,0,0,0.4)]">
              
              <div className="absolute inset-3 sm:inset-4 rounded-r-[1.5rem] rounded-l-sm border-2 border-dashed border-rose-400/20 pointer-events-none" />
              <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-linear-to-r from-black/50 via-black/10 to-transparent pointer-events-none" />
              <div className="absolute left-6 sm:left-8 top-0 bottom-0 w-px bg-white/10" />

              {/* Cover Art */}
              <div className="mt-2 sm:mt-4 mb-2 sm:mb-3 flex flex-col items-center text-center relative z-20">
                <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-rose-200 fill-rose-200/20 mb-1 sm:mb-3 drop-shadow-md" />
                <h1 className="text-2xl sm:text-4xl font-serif text-gradient-gold font-bold tracking-wider">LogOfUs</h1>
                <div className="w-12 sm:w-16 h-px bg-rose-300/40 my-1 sm:my-1.5" />
                <p className="text-gradient-gold text-[9px] sm:text-xs italic tracking-widest uppercase opacity-90">Your Love Story Diary</p>
              </div>
              
              {/* Login Form */}
              <AnimatePresence mode="wait">
                {!isOpening && (
                  <motion.form 
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="w-full flex flex-col flex-1 mt-1 relative z-20"
                  >
                    {/* Top Group: Login Inputs & Main Button */}
                    <div className="space-y-2 sm:space-y-3">
                      {/* Username */}
                      <div className="space-y-1">
                        <label className="block text-[9px] sm:text-xs font-bold text-rose-100 uppercase tracking-widest ml-1">Username</label>
                        <div className="relative">
                          <User className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-rose-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full pl-9 sm:pl-11 pr-4 py-1.5 sm:py-2.5 bg-white/95 text-gray-800 border-none rounded-lg sm:rounded-xl focus:ring-4 focus:ring-rose-400/50 font-medium shadow-inner transition-all text-xs sm:text-sm"
                            placeholder="Username"
                            required
                            autoComplete="username"
                          />
                        </div>
                      </div>
                      
                      {/* Password */}
                      <div className="space-y-1">
                        <label className="block text-[9px] sm:text-xs font-bold text-rose-100 uppercase tracking-widest ml-1">Password</label>
                        <div className="relative">
                          <Key className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 text-rose-400 w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full pl-9 sm:pl-11 pr-4 py-1.5 sm:py-2.5 bg-white/95 text-gray-800 border-none rounded-lg sm:rounded-xl focus:ring-4 focus:ring-rose-400/50 font-medium shadow-inner transition-all text-xs sm:text-sm"
                            placeholder="••••••••"
                            required
                            autoComplete="current-password"
                          />
                        </div>
                      </div>
                      
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-linear-to-r from-rose-50 to-rose-100 text-rose-800 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 active:scale-95 mt-2 sm:mt-4 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-base"
                      >
                        {loading ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <><span>Unlock Our Pages</span><Sparkles size={14} className="sm:w-4 sm:h-4" /></>
                        )}
                      </button>
                    </div>

                    {/* Bottom Group: Action Buttons */}
                    <div className="mt-4 sm:mt-8 pb-1 sm:pb-4 space-y-1.5 sm:space-y-2.5">
                      <div className="flex items-center gap-3 mb-1.5 sm:mb-3">
                        <div className="flex-1 h-px bg-rose-300/20" />
                        <span className="text-[9px] sm:text-xs text-rose-200/60 uppercase tracking-widest font-semibold">Or</span>
                        <div className="flex-1 h-px bg-rose-300/20" />
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate('/register')}
                        className="w-full bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-50 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-[11px] sm:text-sm shadow-sm backdrop-blur-sm"
                      >
                        <Heart className="w-3 h-3 sm:w-4 sm:h-4 fill-current opacity-80" />
                        Create New Diary
                      </button>

                      <button
                        type="button"
                        onClick={() => navigate('/join')}
                        className="w-full bg-black/10 hover:bg-black/20 border border-rose-400/20 text-rose-200 py-1.5 sm:py-2.5 rounded-lg sm:rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-[11px] sm:text-sm shadow-sm"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Join Partner's Diary
                      </button>
                    </div>

                    <div className="mt-auto pt-2 pb-1 text-center">
                      <p className="text-rose-200/40 text-[9px] sm:text-[11px] italic font-serif px-2 tracking-wide">
                        "Every love story is beautiful, but ours is my favorite."
                      </p>
                    </div>

                  </motion.form>
                )}
              </AnimatePresence>

              {/* Clasp */}
              <div className="absolute top-[45%] -right-2 sm:-right-3 w-8 sm:w-10 h-16 sm:h-20 bg-linear-to-r from-rose-200 to-rose-300 rounded-lg border border-rose-400/50 shadow-md flex flex-col items-center justify-center pt-1.5 sm:pt-2">
                <div className="w-3 h-5 sm:w-4 sm:h-6 bg-black/80 rounded-full flex items-center justify-center shadow-inner">
                  <LockKeyhole size={8} className="text-rose-100/50 sm:w-2.5 sm:h-2.5" />
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .perspective-[2000px] { perspective: 2000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .translate-z-[-10px] { transform: translateZ(-10px); }
        
        .bg-page-lines {
          background-image: linear-gradient(#e5e7eb 1px, transparent 1px);
          background-size: 100% 3px;
        }

        .text-gradient-gold {
          background: linear-gradient(135deg, #e7c688 0%, #fdfdcb 50%, #b8935c 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .bg-gradient-leather {
          background-image: 
            radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.05), transparent 30%),
            linear-gradient(to bottom right, #a02052, #831843, #651034);
        }
      `}} />
    </div>
  );
};

export default LoginPage;