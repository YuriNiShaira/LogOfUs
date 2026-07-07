import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  title?: string;
  description?: string;
  buttonText?: string;
  accept?: string;
  maxSize?: number; // in MB
}

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  title = 'Upload Photo',
  description = 'Choose a photo to upload',
  buttonText = 'Upload',
  accept = 'image/*',
  maxSize = 5,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Image must be less than ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a photo first');
      return;
    }

    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      setSelectedFile(null);
      setPreview(null);
      onClose();
    } catch (error) {
      // Error is handled in the parent component
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-stone-700">
              <div>
                <h3 className="text-xl font-serif text-gray-800 dark:text-stone-200">
                  {title}
                </h3>
                <p className="text-sm font-serif italic text-gray-500 dark:text-stone-400">
                  {description}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500 dark:text-stone-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Preview Area */}
              <div 
                className={`
                  relative w-full aspect-square rounded-lg overflow-hidden border-2 border-dashed
                  ${preview ? 'border-transparent' : 'border-gray-300 dark:border-stone-600'}
                  bg-gray-50 dark:bg-stone-800/50
                  flex items-center justify-center
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                {preview ? (
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-stone-500">
                    <ImageIcon className="w-12 h-12" />
                    <p className="text-sm font-serif italic">Tap to select a photo</p>
                    <p className="text-xs font-serif">or drag and drop</p>
                  </div>
                )}
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* File info */}
              {selectedFile && (
                <div className="flex items-center justify-between text-sm">
                  <span className="font-serif text-gray-600 dark:text-stone-300 truncate">
                    {selectedFile.name}
                  </span>
                  <span className="text-gray-400 dark:text-stone-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                  </span>
                </div>
              )}

              {/* Upload button */}
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading}
                className={`
                  w-full py-3 rounded-lg font-serif font-bold transition-all
                  flex items-center justify-center gap-2
                  ${selectedFile && !isUploading
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg'
                    : 'bg-gray-200 dark:bg-stone-700 text-gray-400 dark:text-stone-500 cursor-not-allowed'
                  }
                `}
              >
                {isUploading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {buttonText}
                  </>
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-stone-800/50 border-t border-gray-200 dark:border-stone-700">
              <p className="text-xs font-serif text-gray-400 dark:text-stone-500 text-center">
                Supported formats: JPG, PNG, WEBP • Max size: {maxSize}MB
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadPhotoModal;