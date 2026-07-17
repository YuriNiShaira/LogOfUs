import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Image as ImageIcon, BookOpen } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CreateYearModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper: Torn Washi Tape
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-rose-100/50' }) => (
  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20`} 
       style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 96%)' }} 
  />
);

const CreateYearModal: React.FC<CreateYearModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [yearNumber, setYearNumber] = useState<number>(1);
  const [description, setDescription] = useState('');
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const queryClient = useQueryClient();

  // THE NUCLEAR OPTION: Inject styles directly into the document head
  useEffect(() => {
    if (isOpen) {
      const styleId = 'force-light-inputs-style-create-year';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          #create-year-modal-root input,
          #create-year-modal-root textarea,
          #create-year-modal-root select {
            background: transparent !important;
            background-color: transparent !important;
            color: #1f2937 !important;
            color-scheme: light !important;
            -webkit-text-fill-color: #1f2937 !important;
          }
          #create-year-modal-root input[type="number"] {
            color: #f43f5e !important; /* text-rose-500 */
            -webkit-text-fill-color: #f43f5e !important;
          }
          #create-year-modal-root input::placeholder,
          #create-year-modal-root textarea::placeholder {
            color: #9ca3af !important;
            -webkit-text-fill-color: #9ca3af !important;
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

  const getDateRange = (num: number) => {
    if (!user?.anniversary_date) return null;
    const anniversary = new Date(user.anniversary_date);

    if (num === 0) {
      // Prequel: any date before the anniversary
      const end = new Date(anniversary);
      end.setDate(end.getDate() - 1);
      return { start: null, end };
    }

    const start = new Date(anniversary);
    start.setFullYear(start.getFullYear() + (num - 1));
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return { start, end };
  };

  const dateRange = getDateRange(yearNumber);

  const createYearMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/years/', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Chapter added to your journal! 📖');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.year_number?.[0] || 'Failed to start chapter.';
      toast.error(msg);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (yearNumber < 0) {
      toast.error('Year number cannot be negative');
      return;
    }
    const formData = new FormData();
    formData.append('year_number', yearNumber.toString());
    formData.append('description', description);
    if (coverImage) {
      formData.append('cover_image', coverImage);
    }
    if (user?.id) {
      formData.append('user_id', user.id.toString());
    }
    createYearMutation.mutate(formData);
  };

  const resetForm = () => {
    setYearNumber(1);
    setDescription('');
    setCoverImage(null);
    setPreview('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            id="create-year-modal-root"
            initial={{ scale: 0.95, y: 20, rotate: 1 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.95, y: 20, rotate: -1 }}
            className="relative w-full max-w-lg bg-[#faf8f5] shadow-2xl rounded-sm border border-gray-200 my-auto z-[100000] max-h-[90vh] overflow-y-auto custom-scrollbar"
            style={{
              backgroundImage: 'radial-gradient(rgba(156, 163, 175, 0.3) 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <WashiTape rotate="rotate-2" />

            <div className="p-8 sm:p-10">
              {/* Header */}
              <div className="flex justify-between items-start mb-8 border-b-2 border-gray-300 pb-4 bg-[#faf8f5] inline-flex w-full">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center bg-white">
                    <BookOpen className="w-5 h-5 text-gray-600" />
                  </div>
                  <h2 className="text-4xl font-serif text-gray-800">
                    New Chapter
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-rose-500 transition-colors p-2"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Year Number Area */}
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-sm border border-gray-200 shadow-sm relative transform -rotate-1">
                  <div className="flex items-end gap-4 mb-2">
                    <label className="text-2.5 font-bold uppercase tracking-widest text-gray-500 pb-1">
                      Year No.
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={yearNumber}
                      onChange={(e) => setYearNumber(parseInt(e.target.value) || 0)}
                      className="w-24 bg-transparent! border-b-2 border-dashed border-gray-400 outline-none font-serif text-4xl !text-rose-500 text-center pb-1 focus:border-rose-500 transition-colors"
                      required
                    />
                  </div>
                  <p className="font-handwriting text-xl text-gray-500">
                    (Use 0 for the Prequel timeline)
                  </p>

                  {/* Date Range Marginalia */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {dateRange && yearNumber === 0 && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 shrink-0 mt-1" />
                        <span className="font-handwriting text-2xl leading-tight">
                          The Prequel: everything before our anniversary on{' '}
                          <span className="text-rose-500">
                            {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>.
                        </span>
                      </div>
                    )}
                    {dateRange && yearNumber >= 1 && dateRange.start && (
                      <div className="flex items-start gap-2 text-gray-600">
                        <Calendar className="w-4 h-4 shrink-0 mt-1" />
                        <span className="font-handwriting text-2xl leading-tight">
                          This chapter timeline spans from{' '}
                          <span className="text-rose-500">
                            {dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {' '}to{' '}
                          <span className="text-rose-500">
                            {dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Chapter Title / Description */}
                <div className="relative">
                  <label className="bg-[#faf8f5] inline-block pr-2 text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-[-10px] relative z-10">
                    Chapter Title / Focus
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-transparent! resize-none outline-none font-handwriting text-3xl text-gray-800! leading-[40px] mt-[-10px]"
                    placeholder={yearNumber === 0 ? "e.g., How We Met, The Chase..." : "Give this year a name..."}
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 39px, rgba(156, 163, 175, 0.3) 39px, rgba(156, 163, 175, 0.3) 40px)',
                      backgroundAttachment: 'local'
                    }}
                  />
                </div>

                {/* Cover Image Upload - Polaroid Style */}
                <div>
                  <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Cover Photo
                  </label>
                  <div className="bg-white p-3 pb-10 shadow-[0_4px_15px_rgba(0,0,0,0.1)] transform rotate-1 relative group w-full aspect-[4/3]">
                    
                    {/* Small piece of tape for the photo */}
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-10 h-4 bg-yellow-200/60 shadow-sm transform -rotate-3 z-10" />
                    
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="cover-image"
                    />
                    
                    <label htmlFor="cover-image" className="cursor-pointer block w-full h-full">
                      {preview ? (
                        <div className="relative w-full h-full bg-gray-100 overflow-hidden border border-gray-200">
                          <img src={preview} alt="Preview" className="w-full h-full object-cover filter contrast-[1.05] sepia-[.1]" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="font-handwriting text-2xl text-white">Change Photo</p>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                          <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="font-handwriting text-2xl text-gray-500">Paste cover photo here...</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-300">
                  <button
                    type="button"
                    onClick={onClose}
                    className="font-handwriting text-2xl text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    Nevermind
                  </button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={createYearMutation.isPending}
                    className="px-8 py-3 bg-rose-500 text-white rounded-sm font-handwriting text-3xl shadow-md hover:bg-rose-600 transition-colors disabled:opacity-50 transform -rotate-2"
                  >
                    {createYearMutation.isPending ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : yearNumber === 0 ? (
                      'Start Prequel'
                    ) : (
                      'Start Chapter'
                    )}
                  </motion.button>
                </div>

              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateYearModal;