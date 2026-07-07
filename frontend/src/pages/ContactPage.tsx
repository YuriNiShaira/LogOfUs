import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Feather, Send, ArrowLeft, Heart, Sparkles, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import RomanticBackground from '../components/RomanticBackground';

const ContactPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.message.trim()) {
      toast.error('Please write a message');
      return;
    }
    if (!form.email.trim()) {
      toast.error('Please provide your Gmail so we can reply 💌');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/auth/contact/', form);
      toast.success(response.data.message || 'Message sent! 💕');
      setSent(true);
    } catch {
      toast.error('Failed to send. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <RomanticBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className={`relative z-10 w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.15)] ${
          theme === 'dark'
            ? 'bg-[#2a0815]/95 backdrop-blur-md border-[6px] border-[#4c0519] rounded-sm'
            : 'bg-[#FFFAF0]/95 backdrop-blur-md border-[6px] border-white rounded-sm ring-1 ring-rose-900/5'
        }`}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none rounded-sm" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

        <div className="p-6 sm:p-8 relative z-10">
          <button 
            onClick={() => navigate(-1)} 
            className={`inline-flex items-center text-sm font-serif italic tracking-wide transition-colors ${
              theme === 'dark' ? 'text-rose-400 hover:text-rose-300' : 'text-rose-400 hover:text-rose-600'
            } mb-6 group`}
          >
            <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform" /> Return
          </button>

          {sent ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-8"
            >
              <div className="flex justify-center mb-4">
                <div className={`h-16 w-16 rounded-full flex items-center justify-center shadow-lg border-2 ${
                  theme === 'dark' 
                    ? 'bg-linear-to-br from-rose-800 to-rose-950 border-rose-900' 
                    : 'bg-linear-to-br from-rose-600 to-rose-800 border-rose-700'
                }`}>
                  <Heart className="h-7 w-7 text-white fill-white/50" />
                </div>
              </div>
              <h2 className={`text-2xl font-serif mb-2 tracking-wide ${
                theme === 'dark' ? 'text-rose-100' : 'text-rose-950'
              }`}>
                Safely Delivered
              </h2>
              <p className={`mb-6 font-serif italic ${theme === 'dark' ? 'text-rose-300/80' : 'text-rose-700/70'}`}>
                We'll reply to your Gmail soon 💌
              </p>
              
              <div className="flex justify-center">
                <div className="w-16 h-px bg-linear-to-r from-transparent via-rose-300 to-transparent mb-6" />
              </div>

              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', message: '' }); }}
                className={`text-xs font-serif uppercase tracking-widest ${
                  theme === 'dark' ? 'text-rose-400 hover:text-rose-200' : 'text-rose-500 hover:text-rose-800'
                } transition-colors`}
              >
                Write Another Letter
              </button>
            </motion.div>
          ) : (
            <>
              <div className="text-center mb-6">
                <motion.div
                  animate={{ y: [-2, 2, -2] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Feather className={`w-6 h-6 mx-auto mb-3 ${
                    theme === 'dark' ? 'text-rose-400' : 'text-rose-300'
                  }`} />
                </motion.div>
                <h1 className={`text-2xl sm:text-3xl font-serif flex items-center justify-center gap-2 ${
                  theme === 'dark' ? 'text-rose-50' : 'text-rose-950'
                }`}>
                  <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-rose-500' : 'text-rose-300'}`} />
                  Get in Touch
                  <Sparkles className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-rose-500' : 'text-rose-300'}`} />
                </h1>
                <p className={`font-serif italic text-sm mt-1 ${theme === 'dark' ? 'text-rose-300/70' : 'text-rose-700/60'}`}>
                  Share your thoughts with us
                </p>
              </div>

              {/* Compact Note Banner */}
              <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 ${
                theme === 'dark'
                  ? 'bg-blue-950/30 border-blue-800/40'
                  : 'bg-blue-50/60 border-blue-200/60'
              }`}>
                <Mail className={`w-4 h-4 flex-shrink-0 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <p className={`font-serif text-xs ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  <span className="font-medium">Include your Gmail</span> — so we can reply personally 💌
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block font-serif italic text-sm mb-1 ml-1 ${
                      theme === 'dark' ? 'text-rose-300' : 'text-rose-800'
                    }`}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className={`w-full px-3 py-2 border-b-2 rounded-none focus:outline-none transition-all font-serif text-base bg-transparent ${
                        theme === 'dark'
                          ? 'border-rose-900/60 text-rose-100 placeholder-rose-900/80 focus:border-rose-500'
                          : 'border-rose-200 text-rose-950 placeholder-rose-200 focus:border-rose-400'
                      }`}
                      placeholder="Optional"
                    />
                  </div>

                  <div>
                    <label className={`block font-serif italic text-sm mb-1 ml-1 ${
                      theme === 'dark' ? 'text-rose-300' : 'text-rose-800'
                    }`}>
                      Gmail <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className={`w-full px-3 py-2 border-b-2 rounded-none focus:outline-none transition-all font-serif text-base bg-transparent ${
                        theme === 'dark'
                          ? 'border-rose-900/60 text-rose-100 placeholder-rose-900/80 focus:border-rose-500'
                          : 'border-rose-200 text-rose-950 placeholder-rose-200 focus:border-rose-400'
                      }`}
                      placeholder="your.email@gmail.com"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className={`block font-serif italic text-sm mb-1.5 ml-1 ${
                    theme === 'dark' ? 'text-rose-300' : 'text-rose-800'
                  }`}>
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    rows={3}
                    className={`w-full px-4 py-2.5 border rounded-sm focus:outline-none transition-all font-serif text-base resize-none shadow-inner ${
                      theme === 'dark'
                        ? 'bg-[#1a050f]/50 border-rose-900/50 text-rose-100 placeholder-rose-900/80 focus:border-rose-600'
                        : 'bg-white/60 border-rose-100 text-rose-950 placeholder-rose-200 focus:border-rose-300'
                    }`}
                    placeholder="What's on your mind?"
                    required
                  />
                </div>

                <div className="pt-1">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 rounded-full font-serif uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50 border ${
                      theme === 'dark'
                        ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
                        : 'bg-rose-900 border-rose-950 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(136,19,55,0.2)]'
                    }`}
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-rose-200 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Send Message
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-6 pt-4 border-t border-rose-200/40 dark:border-rose-900/50 text-center">
                <p className={`font-serif italic text-xs ${
                  theme === 'dark' ? 'text-rose-400/80' : 'text-rose-700/60'
                }`}>
                  Or email us directly at{' '}
                  <a href="mailto:yurimauricio0404@gmail.com" className={`not-italic font-medium ${
                    theme === 'dark' ? 'text-rose-300 hover:text-rose-100' : 'text-rose-800 hover:text-rose-600'
                  } transition-colors`}>
                    yurimauricio0404@gmail.com
                  </a>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ContactPage;