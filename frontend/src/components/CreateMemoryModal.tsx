import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Heart, Upload, Quote, Save } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface CreateMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearId: number;
}

interface YearData {
  id: number;
  year_number: number;
  description?: string;
}

const memoryTypes = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'date', label: 'Date' },
  { value: 'travel', label: 'Travel' },
  { value: 'everyday', label: 'Everyday Magic' },
  { value: 'special', label: 'Special Moment' },
  { value: 'sad', label: 'Sad Moment' },
];

// Helper: Torn tape
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-rose-100/50' }) => (
  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20`} 
       style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 96%)' }} 
  />
);

const CreateMemoryModal: React.FC<CreateMemoryModalProps> = ({ isOpen, onClose, yearId }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [memoryType, setMemoryType] = useState('special');
  const [isFavorite, setIsFavorite] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');

  const queryClient = useQueryClient();

  // THE NUCLEAR OPTION: Inject styles directly into the document head
  useEffect(() => {
    if (isOpen) {
      const styleId = 'force-light-inputs-style-create';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          #create-memory-modal-root input,
          #create-memory-modal-root textarea,
          #create-memory-modal-root select {
            background: transparent !important;
            background-color: transparent !important;
            color: #1f2937 !important;
            color-scheme: light !important;
            -webkit-text-fill-color: #1f2937 !important;
          }
          #create-memory-modal-root input::placeholder,
          #create-memory-modal-root textarea::placeholder {
            color: #9ca3af !important;
            -webkit-text-fill-color: #9ca3af !important;
          }
          #create-memory-modal-root select option {
            background-color: #ffffff !important;
            color: #1f2937 !important;
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

  const { data: yearData } = useQuery<YearData>({
    queryKey: ['year', yearId],
    queryFn: async () => {
      const response = await api.get(`/years/${yearId}/`);
      return response.data;
    },
    enabled: !!yearId && isOpen,
  });

  const getDateRange = (): { start: Date; end: Date } | null => {
    if (!user?.anniversary_date || !yearData?.year_number) return null;
    const anniversary = new Date(user.anniversary_date);
    const yearNumber = yearData.year_number;
    const start = new Date(anniversary);
    start.setFullYear(start.getFullYear() + (yearNumber - 1));
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    return { start, end };
  };

  const dateRange = getDateRange();
  const selectedDate = date ? new Date(date) : null;
  const isDateOutOfRange = dateRange && selectedDate && (selectedDate < dateRange.start || selectedDate > dateRange.end);

  const createMemoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.post('/memories/', formData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['year', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Memory pasted into journal! 💕');
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.date?.[0] || 'Failed to save memory. Please try again.';
      toast.error(errorMessage);
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setPreview('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !date || !description) {
      toast.error('Please fill in the required fields 💝');
      return;
    }

    const formData = new FormData();
    formData.append('year', yearId.toString());
    formData.append('title', title);
    formData.append('date', date);
    formData.append('description', description);
    formData.append('location', location);
    formData.append('favorite_quote', favoriteQuote);
    formData.append('memory_type', memoryType);
    formData.append('is_favorite', isFavorite.toString());
    if (image) {
      formData.append('image', image);
    }
    if (user?.id) {
      formData.append('user_id', user.id.toString());
    }

    createMemoryMutation.mutate(formData);
  };

  const resetForm = () => {
    setTitle('');
    setDate('');
    setDescription('');
    setLocation('');
    setFavoriteQuote('');
    setMemoryType('special');
    setIsFavorite(false);
    setImage(null);
    setPreview('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            id="create-memory-modal-root"
            initial={{ scale: 0.95, y: 20, rotate: 1 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.95, y: 20, rotate: -1 }}
            className="relative w-full max-w-3xl bg-[#faf8f5] shadow-2xl overflow-hidden rounded-sm border border-gray-200 my-auto z-10 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <WashiTape rotate="rotate-2" />

            {/* Header */}
            <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-gray-300 shrink-0">
              <h2 className="text-3xl font-serif text-gray-800">
                Log New Memory
              </h2>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-rose-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Area with Bullet Journal Dot Pattern */}
            <div 
              className="flex-1 overflow-y-auto p-8 custom-scrollbar"
              style={{
                backgroundImage: 'radial-gradient(rgba(156, 163, 175, 0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              <form id="create-memory-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Core Details (Title, Date, Type) */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white/60 backdrop-blur-sm p-6 rounded-sm border border-gray-200 shadow-sm">
                  
                  <div className="md:col-span-12">
                    <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-1">
                      Memory Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full bg-transparent! border-b-2 border-dashed border-gray-300 outline-none font-handwriting text-3xl text-gray-800! focus:border-rose-400 transition-colors pb-1"
                      placeholder="What happened?"
                      required
                    />
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-1">
                      Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="w-full bg-transparent! border-b-2 border-dashed border-gray-300 outline-none font-handwriting text-2xl text-gray-800! focus:border-rose-400 transition-colors pl-6 pb-1 cursor-pointer"
                        required
                      />
                    </div>
                    {/* Hand-written marginalia warning for dates out of range */}
                    {isDateOutOfRange && dateRange && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-sm transform rotate-1"
                      >
                        <p className="font-handwriting text-xl text-yellow-700 leading-tight">
                          Wait, this is outside Chapter {yearData?.year_number}! It should be between{' '}
                          <span className="font-bold">{dateRange.start.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                          {' '}and{' '}
                          <span className="font-bold">{dateRange.end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-1">
                      Category
                    </label>
                    <select
                      value={memoryType}
                      onChange={(e) => setMemoryType(e.target.value)}
                      className="w-full bg-transparent! border-b-2 border-dashed border-gray-300 outline-none font-handwriting text-2xl text-gray-800! focus:border-rose-400 transition-colors pb-1 cursor-pointer appearance-none"
                    >
                      {memoryTypes.map((type) => (
                        <option key={type.value} value={type.value} className="font-sans text-base">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Two Column Layout for Desktop */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Image & Location */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Polaroid Image Upload */}
                    <div>
                      <div className="text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Photo Memory
                      </div>
                      <div className="bg-white p-2 pb-8 shadow-md transform rotate-1 relative group w-full max-w-62.5 mx-auto sm:mx-0">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-100/80 shadow-sm transform -rotate-3 z-10" />
                        
                        {preview ? (
                          <div className="relative aspect-square w-full bg-gray-100 overflow-hidden border border-gray-200">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover filter contrast-[1.05] sepia-[.1]" />
                            <button
                              type="button"
                              onClick={handleRemoveImage}
                              className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="cursor-pointer aspect-square w-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                            <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="font-handwriting text-xl text-gray-500">Paste photo here...</p>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-1">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-0 top-1/2 transform -translate-y-1/2 text-rose-400 w-5 h-5" />
                        <input
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-transparent! border-b-2 border-dashed border-gray-300 outline-none font-handwriting text-2xl text-gray-800! focus:border-rose-400 transition-colors pl-7 pb-1"
                          placeholder="Where did this happen?"
                        />
                      </div>
                    </div>

                    {/* Favorite Stamp */}
                    <div className="pt-2">
                      <label className="flex items-center gap-3 cursor-pointer w-max group">
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          isFavorite 
                            ? 'border-rose-500 bg-rose-50' 
                            : 'border-gray-400 bg-transparent group-hover:border-rose-300'
                        }`}>
                          <Heart className={`w-4 h-4 ${isFavorite ? 'text-rose-500 fill-current' : 'text-gray-400'}`} />
                        </div>
                        <input type="checkbox" checked={isFavorite} onChange={(e) => setIsFavorite(e.target.checked)} className="hidden" />
                        <span className="font-handwriting text-2xl text-gray-700 select-none">
                          Mark as favorite
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Story & Quote */}
                  <div className="lg:col-span-7 space-y-6">
                    
                    {/* Story */}
                    <div className="bg-white/60 backdrop-blur-sm p-6 rounded-sm border border-gray-200 shadow-sm h-full flex flex-col">
                      <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-4">
                        The Story *
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={7}
                        className="w-full flex-1 bg-transparent! resize-none outline-none font-handwriting text-2xl text-gray-800! leading-8"
                        style={{
                          backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(156, 163, 175, 0.2) 31px, rgba(156, 163, 175, 0.2) 32px)',
                          backgroundAttachment: 'local',
                          lineHeight: '32px'
                        }}
                        placeholder="Start writing..."
                        required
                      />
                    </div>

                    {/* Quote */}
                    <div className="bg-blue-50/80 p-4 border border-blue-200 transform -rotate-1">
                      <label className="flex items-center gap-2 text-2.5 font-bold uppercase tracking-widest text-blue-700 mb-2">
                        <Quote className="w-3 h-3" /> Memorable Quote
                      </label>
                      <textarea
                        value={favoriteQuote}
                        onChange={(e) => setFavoriteQuote(e.target.value)}
                        rows={2}
                        className="w-full bg-transparent! resize-none outline-none font-handwriting text-2xl text-gray-800! text-center"
                        placeholder="Something special that was said..."
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-4 bg-gray-100 border-t border-gray-300 flex flex-wrap items-center justify-end gap-4 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="font-handwriting text-2xl text-gray-500 hover:text-gray-800 transition-colors"
              >
                Nevermind
              </button>
              
              <button
                type="submit"
                form="create-memory-form"
                disabled={createMemoryMutation.isPending}
                className="px-6 py-2 bg-rose-500 text-white rounded-sm font-handwriting text-2xl shadow-sm hover:bg-rose-600 transition-colors flex items-center gap-2 disabled:opacity-50 transform rotate-1"
              >
                {createMemoryMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" /> Tape to Diary
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateMemoryModal;