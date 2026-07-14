import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, Edit, Trash2, Mail, Feather, Sparkles } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';

interface LoveLetter {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

const LoveLetterManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingLetter, setEditingLetter] = useState<LoveLetter | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isActive, setIsActive] = useState(true);

  const queryClient = useQueryClient();

  // Updated injected styles for the elegant stationery theme
  useEffect(() => {
    if (isOpen) {
      const styleId = 'force-light-inputs-style-love-letter';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          #love-letter-modal-root input[type="text"],
          #love-letter-modal-root textarea {
            color: #4c0519 !important; /* Rose 950 */
            color-scheme: light !important;
            -webkit-text-fill-color: #4c0519 !important;
            background-color: transparent !important; /* Prevents global dark mode from making inputs dark */
          }
          #love-letter-modal-root input[type="text"] {
            border-color: #fecdd3 !important; /* Rose 200 */
          }
          #love-letter-modal-root input[type="text"]:focus {
            border-color: #fb7185 !important; /* Rose 400 */
          }
          #love-letter-modal-root input::placeholder,
          #love-letter-modal-root textarea::placeholder {
            color: #fda4af !important; /* Rose 300 */
            -webkit-text-fill-color: #fda4af !important;
          }
        `;
        document.head.appendChild(style);
      }
      return () => {
        const style = document.getElementById(styleId);
        if (style) style.remove();
      };
    }
  }, [isOpen]);

  const { data: letters, refetch } = useQuery<LoveLetter[]>({
    queryKey: ['allLoveLetters'],
    queryFn: async () => {
      const response = await api.get('/love-letters/');
      return response.data;
    },
    enabled: isOpen,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<LoveLetter>) => {
      const response = await api.post('/love-letters/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveLetters'] });
      queryClient.invalidateQueries({ queryKey: ['allLoveLetters'] });
      toast.success('Love letter sealed and sent! 💕');
      resetForm();
      refetch();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<LoveLetter> }) => {
      const response = await api.put(`/love-letters/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveLetters'] });
      queryClient.invalidateQueries({ queryKey: ['allLoveLetters'] });
      toast.success('Love letter beautifully rewritten! ✍️');
      resetForm();
      refetch();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/love-letters/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loveLetters'] });
      queryClient.invalidateQueries({ queryKey: ['allLoveLetters'] });
      toast.success('Letter discarded in the fire 🔥');
      refetch();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = { title, content, is_active: isActive };
    
    if (editingLetter) {
      updateMutation.mutate({ id: editingLetter.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (letter: LoveLetter) => {
    setEditingLetter(letter);
    setTitle(letter.title);
    setContent(letter.content);
    setIsActive(letter.is_active);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Burn this letter forever? 🔥')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setEditingLetter(null);
    setTitle('');
    setContent('');
    setIsActive(true);
  };

  return (
    <>
      {/* Floating Action Button - Wax Seal Style */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-linear-to-br from-rose-600 to-rose-900 text-white p-4 rounded-full shadow-[0_4px_15px_rgba(159,18,57,0.4)] border-2 border-rose-400 hover:shadow-[0_6px_20px_rgba(159,18,57,0.6)] transition-all duration-300 flex items-center justify-center group"
        title="Open Love Letters"
      >
        <div className="absolute inset-1 rounded-full border border-rose-400/50"></div>
        <Feather className="w-6 h-6 transform -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
      </motion.button>

      {/* Manager Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              id="love-letter-modal-root"
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
              /* Added force-light-theme to protect against global dark mode */
              className="relative bg-[#FFFAF0] rounded-sm w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,0,0,0.3)] border-8 border-white ring-1 ring-rose-900/10 force-light-theme"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Subtle paper texture overlay */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

              <div className="px-6 py-10 sm:px-12 sm:py-12 relative z-10">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-10 border-b border-rose-200/60 pb-6 text-center relative">
                  <div className="w-full">
                    <h2 className="text-4xl font-serif text-rose-950 flex items-center justify-center gap-3 tracking-wide">
                      <Sparkles className="w-5 h-5 text-rose-300" />
                      Letters of My Heart
                      <Sparkles className="w-5 h-5 text-rose-300" />
                    </h2>
                    <p className="text-rose-700/60 font-serif text-sm mt-3 italic tracking-wider uppercase">Penned with eternal devotion</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute right-0 top-0 p-2 text-rose-300 hover:text-rose-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Create/Edit Form - Styled like a premium sheet of paper */}
                <form onSubmit={handleSubmit} className="mb-14 relative">
                  <div className="bg-white p-8 sm:p-10 shadow-[0_4px_20px_rgba(225,29,72,0.05)] border border-rose-50">
                    
                    <div className="flex items-center gap-2 mb-6 text-rose-400 font-serif italic text-lg">
                      {editingLetter ? <Feather className="w-5 h-5" /> : <Feather className="w-5 h-5" />}
                      <h3>{editingLetter ? 'Revising our memory...' : 'Drafting a new letter...'}</h3>
                    </div>
                    
                    <div className="space-y-6">
                      <input
                        type="text"
                        placeholder="My Dearest..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full bg-transparent text-3xl font-serif text-rose-950 border-b border-rose-200 focus:border-rose-400 focus:outline-none py-3 placeholder:text-rose-200 transition-colors"
                        required
                        maxLength={200}
                      />
                      
                      <textarea
                        placeholder="Write what your heart feels..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={6}
                        className="w-full bg-transparent focus:outline-none resize-none font-serif text-rose-900/80 text-lg leading-relaxed py-4 placeholder:text-rose-200 placeholder:italic"
                        required
                      />
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-rose-50">
                        {/* Wax Seal Toggle Style */}
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <div className="relative flex items-center justify-center">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={(e) => setIsActive(e.target.checked)}
                              className="peer appearance-none w-8 h-8 rounded-full border-2 border-rose-200 checked:bg-rose-700 checked:border-rose-700 transition-all cursor-pointer shadow-sm"
                            />
                            {/* Inner wax seal details */}
                            <Heart className="w-4 h-4 text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 fill-white transition-opacity" />
                          </div>
                          <span className="text-sm font-serif italic text-rose-600 group-hover:text-rose-800 transition-colors">
                            {isActive ? 'Sealed for the envelope' : 'Leave unsealed'}
                          </span>
                        </label>
                        
                        <div className="flex gap-4">
                          {editingLetter && (
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              type="button"
                              onClick={resetForm}
                              className="px-6 py-2.5 rounded-full text-rose-400 font-serif hover:bg-rose-50 transition-colors border border-transparent"
                            >
                              Discard Draft
                            </motion.button>
                          )}
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={createMutation.isPending || updateMutation.isPending}
                            className="px-8 py-2.5 bg-rose-900 text-rose-50 rounded-full font-serif tracking-widest uppercase text-sm shadow-[0_4px_10px_rgba(136,19,55,0.2)] hover:bg-rose-800 hover:shadow-[0_6px_15px_rgba(136,19,55,0.3)] transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <Mail className="w-4 h-4" />
                            {editingLetter ? 'Reseal Letter' : 'Seal & Send'}
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Letters Archive */}
                <div>
                  <h3 className="font-serif text-2xl text-rose-900/80 italic mb-8 flex items-center gap-4 before:content-[''] before:flex-1 before:h-px before:bg-rose-200/60 after:content-[''] after:flex-1 after:h-px after:bg-rose-200/60">
                    Archive of Affection
                  </h3>
                  
                  {letters?.length === 0 ? (
                    <div className="text-center py-16">
                      <Feather className="w-10 h-10 mx-auto mb-4 text-rose-200 stroke-[1.5]" />
                      <p className="font-serif text-rose-400/80 italic text-lg">Your mahogany desk is empty. Pick up your pen.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                      {letters?.map((letter, index) => (
                        <motion.div
                          key={letter.id}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          /* Envelope styling */
                          className="group relative bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 border-x border-b border-rose-100 rounded-b-md"
                        >
                          {/* Envelope Flap Illusion */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-rose-200 via-rose-300 to-rose-200"></div>
                          
                          {/* Wax Seal Indicator */}
                          {letter.is_active && (
                            <div className="absolute -top-3 -right-3 w-8 h-8 bg-rose-700 rounded-full flex items-center justify-center shadow-md border border-rose-800" title="Sealed and active">
                              <Heart className="w-3.5 h-3.5 text-white fill-white" />
                            </div>
                          )}

                          <div className="flex flex-col h-full">
                            <div className="mb-4">
                              <h4 className="font-serif text-xl text-rose-950 mb-2 truncate pr-6">{letter.title}</h4>
                              <p className="text-sm text-rose-800/70 font-serif italic line-clamp-3 leading-relaxed">
                                "{letter.content}"
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-rose-50 mt-auto">
                              <span className="text-xs font-serif uppercase tracking-wider text-rose-400">
                                {new Date(letter.created_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                              
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <button
                                  onClick={() => handleEdit(letter)}
                                  className="p-2 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-full transition-colors"
                                  title="Unseal and edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(letter.id)}
                                  className="p-2 text-rose-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
                                  title="Burn letter"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LoveLetterManager;