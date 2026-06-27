import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Heart, Quote, Trash2, Save, Image as ImageIcon } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import DeleteConfirmModal from './DeleteConfirmModal';
import type { Memory } from './year-detail';

interface EditMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  memory: Memory | null;
  yearId: number;
}

const memoryTypes = [
  { value: 'milestone', label: 'Milestone' },
  { value: 'date', label: 'Date' },
  { value: 'travel', label: 'Travel' },
  { value: 'everyday', label: 'Everyday Magic' },
  { value: 'special', label: 'Special Moment' },
  { value: 'sad', label: 'Sad Moment' },
];

const WashiTape = ({ rotate = '-rotate-2' }) => (
  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-red-100/50 backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20`} 
       style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 96%)' }} 
  />
);

const EditMemoryModal: React.FC<EditMemoryModalProps> = ({ isOpen, onClose, memory, yearId }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [favoriteQuote, setFavoriteQuote] = useState('');
  const [memoryType, setMemoryType] = useState('special');
  const [isFavorite, setIsFavorite] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [shouldDeleteImage, setShouldDeleteImage] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const queryClient = useQueryClient();

  // THE NUCLEAR OPTION: Inject styles directly into the document head to guarantee they win
  useEffect(() => {
    if (isOpen) {
      const styleId = 'force-light-inputs-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          #edit-memory-modal-root input,
          #edit-memory-modal-root textarea,
          #edit-memory-modal-root select {
            background: transparent !important;
            background-color: transparent !important;
            color: #1f2937 !important;
            color-scheme: light !important;
            -webkit-text-fill-color: #1f2937 !important;
          }
          #edit-memory-modal-root input::placeholder,
          #edit-memory-modal-root textarea::placeholder {
            color: #9ca3af !important;
            -webkit-text-fill-color: #9ca3af !important;
          }
          #edit-memory-modal-root select option {
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

  useEffect(() => {
    if (memory) {
      setTitle(memory.title);
      setDate(memory.date);
      setDescription(memory.description);
      setLocation(memory.location || '');
      setFavoriteQuote(memory.favorite_quote || '');
      setMemoryType(memory.memory_type);
      setIsFavorite(memory.is_favorite);
      setPreview(memory.image || '');
      setShouldDeleteImage(false);
      setImage(null);
    }
  }, [memory]);

  const updateMemoryMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await api.put(`/memories/${memory?.id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['year', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['years'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Journal entry updated! ✍️');
      onClose();
    },
    onError: () => {
      toast.error('Failed to update memory. Please try again.');
    },
  });

  const deleteMemoryMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/memories/${memory?.id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['year', yearId.toString()] });
      queryClient.invalidateQueries({ queryKey: ['years'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      toast.success('Memory torn out. 💔');
      setShowDeleteModal(false);
      onClose();
    },
    onError: () => {
      toast.error('Failed to delete memory.');
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setShouldDeleteImage(false);
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
    setShouldDeleteImage(true);
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
    formData.append('location', location || '');
    formData.append('favorite_quote', favoriteQuote || '');
    formData.append('memory_type', memoryType);
    formData.append('is_favorite', isFavorite ? 'true' : 'false');
    
    // ✅ FIX: Handle image deletion properly
    if (shouldDeleteImage) {
      // Send a special flag to delete the image
      formData.append('delete_image', 'true');
    } else if (image) {
      formData.append('image', image);
    }
    // If neither, keep existing image

    updateMemoryMutation.mutate(formData);
  };

  return (
    <AnimatePresence>
      {isOpen && memory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            id="edit-memory-modal-root"
            initial={{ scale: 0.95, y: 20, rotate: -1 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.95, y: 20, rotate: 1 }}
            className="relative w-full max-w-3xl bg-[#faf8f5] shadow-2xl overflow-hidden rounded-sm border border-gray-200 my-auto z-10 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <WashiTape rotate="rotate-1" />

            {/* Header */}
            <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-gray-300 shrink-0">
              <h2 className="text-3xl font-serif text-gray-800">
                Rewrite Memory
              </h2>
              <button onClick={onClose} className="p-2 text-gray-500 hover:text-rose-500 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Scrollable Form Area */}
            <div 
              className="flex-1 overflow-y-auto p-8 custom-scrollbar"
              style={{
                backgroundImage: 'radial-gradient(rgba(156, 163, 175, 0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px'
              }}
            >
              <form id="edit-memory-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Core Details */}
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
                        className="w-full bg-transparent! border-b-2 border-dashed border-gray-300 outline-none font-handwriting text-2xl text-gray-800! focus:border-rose-400 transition-colors pl-6 pb-1 cursor-pointer"
                        required
                      />
                    </div>
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

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: Image & Location */}
                  <div className="lg:col-span-5 space-y-6">
                    <div>
                      <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-2">
                        Photo Memory
                      </label>
                      <div className="bg-white p-2 pb-8 shadow-md transform -rotate-1 relative group w-full max-w-62.5 mx-auto sm:mx-0">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-100/80 shadow-sm transform rotate-3 z-10" />
                        
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
                            <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="font-handwriting text-xl text-gray-500">Paste photo here...</p>
                          </label>
                        )}
                        
                        {/* ✅ Show delete image indicator */}
                        {shouldDeleteImage && (
                          <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-sm z-20">
                            <span className="text-white font-handwriting text-xl bg-red-500/80 px-4 py-2 rounded-full">
                              ✕ Image will be removed
                            </span>
                          </div>
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
                          Mark as Favorite
                        </span>
                      </label>
                    </div>
                  </div>

                  {/* Right Column: Story & Quote */}
                  <div className="lg:col-span-7 space-y-6">
                    
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
                    <div className="bg-amber-50/80 p-4 border border-amber-200 transform rotate-1">
                      <label className="flex items-center gap-2 text-2.5 font-bold uppercase tracking-widest text-amber-700 mb-2">
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
            <div className="px-8 py-4 bg-gray-100 border-t border-gray-300 flex flex-wrap items-center justify-between gap-4 shrink-0">
              
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteMemoryMutation.isPending}
                className="font-handwriting text-2xl text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 border-b border-transparent hover:border-red-300 disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" /> Tear out page
              </button>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-handwriting text-2xl text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Nevermind
                </button>
                
                <button
                  type="submit"
                  form="edit-memory-form"
                  disabled={updateMemoryMutation.isPending}
                  className="px-6 py-2 bg-rose-500 text-white rounded-sm font-handwriting text-2xl shadow-sm hover:bg-rose-600 transition-colors flex items-center gap-2 disabled:opacity-50 transform -rotate-1"
                >
                  {updateMemoryMutation.isPending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" /> Tape to Diary
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onConfirm={() => deleteMemoryMutation.mutate()}
            title="Tear out this page?"
            message="Are you sure you want to discard this memory? It will be gone forever."
            itemName={memory.title}
            loading={deleteMemoryMutation.isPending}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditMemoryModal;