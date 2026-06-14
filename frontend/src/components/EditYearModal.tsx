import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Sparkles, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import DeleteConfirmModal from './DeleteConfirmModal';

interface EditYearModalProps {
  isOpen: boolean;
  onClose: () => void;
  yearId: number;
  yearNumber: number;
  currentDescription: string;
  currentCoverImage: string | null;
  onDeleteYear?: () => void;
}

const WashiTape = ({ rotate = '-rotate-2' }) => (
  <div 
    className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-red-100/50 backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20`} 
    style={{ clipPath: 'polygon(2% 0%, 98% 2%, 100% 100%, 0% 96%)' }} 
  />
);

const EditYearModal: React.FC<EditYearModalProps> = ({
  isOpen,
  onClose,
  yearId,
  yearNumber,
  currentDescription,
  currentCoverImage,
  onDeleteYear,
}) => {
  const [description, setDescription] = useState(currentDescription);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentCoverImage);
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Inject styles directly into the head to enforce light mode rules for inputs in dark mode
  useEffect(() => {
    if (isOpen) {
      const styleId = 'force-light-year-inputs-style';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          #edit-year-modal-root input,
          #edit-year-modal-root textarea {
            background: transparent !important;
            background-color: transparent !important;
            color: #1f2937 !important;
            color-scheme: light !important;
            -webkit-text-fill-color: #1f2937 !important;
          }
          #edit-year-modal-root input::placeholder,
          #edit-year-modal-root textarea::placeholder {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setCoverImage(null);
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      if (description !== currentDescription) {
        formData.append('description', description);
      }
      if (coverImage) {
        formData.append('cover_image', coverImage);
      } else if (previewUrl === null && currentCoverImage) {
        formData.append('cover_image', '');
      }

      await api.patch(`/years/${yearId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      queryClient.invalidateQueries({ queryKey: ['year', yearId] });
      queryClient.invalidateQueries({ queryKey: ['years'] });
      
      toast.success('Chapter updated successfully! ✨');
      onClose();
    } catch (error: any) {
      console.error('Error updating year:', error);
      toast.error(error.response?.data?.error || 'Failed to update chapter');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (onDeleteYear) {
      await onDeleteYear();
      setShowDeleteModal(false);
      onClose();
    }
  };

  const yearLabel = yearNumber === 0 ? 'Prequel' : `Volume ${yearNumber}`;
  const isPrequel = yearNumber === 0;

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
            id="edit-year-modal-root" // Anchor target for light-mode fallback style enforcement
            initial={{ scale: 0.95, y: 20, rotate: -1 }}
            animate={{ scale: 1, y: 0, rotate: 0 }}
            exit={{ scale: 0.95, y: 20, rotate: 1 }}
            className="relative w-full max-w-2xl bg-[#faf8f5] shadow-2xl overflow-hidden rounded-sm border border-gray-200 my-auto z-10 flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <WashiTape rotate="rotate-1" />

            {/* Header */}
            <div className="flex justify-between items-center px-8 pt-8 pb-4 border-b border-gray-300 shrink-0">
              <div>
                <h2 className="text-3xl font-serif text-gray-800">
                  Edit {yearLabel}
                </h2>
                <p className="text-gray-500 font-handwriting text-xl mt-1">
                  {isPrequel ? "Before the story began..." : `Chapter ${yearNumber} of your journey`}
                </p>
              </div>
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
              <form id="edit-year-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* Cover Image Section - Polaroid Style */}
                <div>
                  <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-2">
                    Chapter Cover
                  </label>
                  <div className="bg-white p-3 pb-6 shadow-md transform -rotate-1 relative group w-full max-w-md mx-auto sm:mx-0">
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-4 bg-yellow-100/80 shadow-sm transform rotate-3 z-10" />
                    
                    {previewUrl ? (
                      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden border border-gray-200">
                        <img 
                          src={previewUrl} 
                          alt="Chapter cover" 
                          className="w-full h-full object-cover filter contrast-[1.05] sepia-[.1]" 
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer aspect-[4/3] w-full border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors">
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                          className="hidden" 
                        />
                        <Upload className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="font-handwriting text-xl text-gray-500 text-center px-4">
                          Click to add cover image
                        </p>
                        <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                      </label>
                    )}
                    
                    {coverImage && (
                      <p className="text-xs text-green-600 mt-2 text-center">✓ New image ready</p>
                    )}
                  </div>
                </div>

                {/* Chapter Title / Theme - Vintage Journal Style */}
                <div className="bg-white/60 backdrop-blur-sm p-6 rounded-sm border border-gray-200 shadow-sm">
                  <label className="block text-2.5 font-bold uppercase tracking-widest text-gray-500 mb-4">
                    Year Title / Chapter Theme
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full resize-none outline-none font-handwriting text-2xl text-gray-800! leading-8 bg-transparent!"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, rgba(156, 163, 175, 0.2) 31px, rgba(156, 163, 175, 0.2) 32px)',
                      backgroundAttachment: 'local',
                      lineHeight: '32px'
                    }}
                    placeholder={`What defines ${isPrequel ? 'the time before' : `year ${yearNumber}`} of your love story?`}
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2 text-right font-mono">
                    {description.length}/500 characters
                  </p>
                </div>
              </form>
            </div>

            {/* Footer Actions */}
            <div className="px-8 py-4 bg-gray-100 border-t border-gray-300 flex flex-wrap items-center justify-between gap-4 shrink-0">
              
              {onDeleteYear && (
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="font-handwriting text-2xl text-red-500 hover:text-red-700 transition-colors flex items-center gap-2 border-b border-transparent hover:border-red-300"
                >
                  <Trash2 className="w-5 h-5" /> Remove Chapter
                </button>
              )}

              <div className="flex gap-4 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="font-handwriting text-2xl text-gray-500 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
                
                <button
                  type="submit"
                  form="edit-year-form"
                  disabled={loading}
                  className="px-6 py-2 bg-rose-500 text-white rounded-sm font-handwriting text-2xl shadow-sm hover:bg-rose-600 transition-colors flex items-center gap-2 disabled:opacity-50 transform -rotate-1"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Delete Confirmation Modal */}
          {onDeleteYear && (
            <DeleteConfirmModal
              isOpen={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDelete}
              title="Remove this chapter?"
              message={`Are you sure you want to delete ${yearLabel}? This will remove all memories in this chapter and cannot be undone.`}
              itemName={yearLabel}
              loading={loading}
            />
          )}
        </div>
      )}
    </AnimatePresence>
  );
};

export default EditYearModal;