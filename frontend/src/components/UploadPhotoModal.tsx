import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Power, Trash2, UploadCloud, Camera as CameraIcon, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  accept?: string;
  maxSize?: number; // in MB
}

const UploadPhotoModal: React.FC<UploadPhotoModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  accept = 'image/*',
  maxSize = 5,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lock background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const processFile = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Format not supported by camera.');
      return;
    }

    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Memory Card Full: File exceeds ${maxSize}MB`);
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await onUpload(selectedFile);
      handleClose();
    } catch {
      toast.error('Upload Failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreview(null);
    setIsDragging(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 flex items-center justify-center bg-black/80 p-4 select-none"
          style={{ 
            zIndex: 999999,
            position: 'fixed'
          }}
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.85, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative flex w-full max-w-4xl aspect-[16/10] sm:aspect-[16/9] max-h-[90vh] bg-[#2a2b2e] rounded-[32px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_1px_2px_rgba(255,255,255,0.2)] border border-[#1a1a1c]"
            style={{ zIndex: 1000000 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Viewfinder Bump (Top Center) */}
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-48 h-8 bg-[#2a2b2e] rounded-t-2xl shadow-[inset_0_2px_2px_rgba(255,255,255,0.15)] flex justify-center items-end pb-1 border-t border-l border-r border-[#444]">
              <div className="w-16 h-4 bg-[#111] rounded shadow-inner"></div>
            </div>

            {/* Strap loops */}
            <div className="absolute top-12 -left-3 w-4 h-8 bg-zinc-400 rounded-l-md border border-zinc-500 shadow-md"></div>
            <div className="absolute top-12 -right-3 w-4 h-8 bg-zinc-400 rounded-r-md border border-zinc-500 shadow-md"></div>

            {/* Left side: Screen area */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col min-h-0">
              {/* LCD Screen Bezel */}
              <div className="flex-1 bg-[#111] p-3 rounded-lg shadow-[0_2px_10px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] border border-[#222] flex flex-col min-h-0 relative">
                
                {/* Brand / Model text above screen */}
                <div className="text-center text-[#555] text-[10px] font-black uppercase tracking-widest mb-2 font-sans shrink-0">
                  LUMINA X-1
                </div>

                {/* Actual LCD Screen */}
                <div 
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => !preview && fileInputRef.current?.click()}
                  className={`
                    flex-1 bg-black rounded shadow-[inset_0_0_20px_rgba(0,0,0,1)] relative overflow-hidden flex items-center justify-center min-h-0
                    ${!preview ? 'cursor-pointer' : ''}
                    ${isDragging ? 'ring-2 ring-red-500' : ''}
                  `}
                >
                  {/* The Image */}
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Viewfinder" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-zinc-600 space-y-3">
                      <CameraIcon className="w-12 h-12 opacity-50" />
                      <p className="font-mono text-xs text-center uppercase tracking-wider">
                        Insert SD Card <br/> (Click or Drag Image)
                      </p>
                    </div>
                  )}

                  {/* UI Overlay on Screen */}
                  {preview && (
                    <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between font-mono text-[10px] text-white drop-shadow-md">
                      <div className="flex justify-between">
                        <span className="text-red-500 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          REC
                        </span>
                        <span>100%</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span>F1.8</span>
                          <span>1/1000</span>
                          <span>ISO 400</span>
                        </div>
                        <div className="text-right text-green-400">
                          RAW+JPEG <br/> [OK]
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Physical Grip & Buttons */}
            <div className="w-32 sm:w-48 bg-[#1f1f21] rounded-r-[32px] shadow-[inset_10px_0_20px_rgba(0,0,0,0.5)] border-l border-[#111] p-4 flex flex-col items-center justify-between relative overflow-hidden shrink-0">
              
              {/* Fake leather texture pattern overlay */}
              <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '4px 4px' }}></div>

              {/* Top: Power Button */}
              <div className="relative z-10 w-full flex justify-end">
                <button 
                  onClick={handleClose}
                  className="w-8 h-8 rounded-full bg-[#111] border border-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.1)] flex items-center justify-center text-red-500 hover:text-red-400 hover:bg-[#222] active:scale-95 transition-all"
                  title="Power Off (Close)"
                >
                  <Power className="w-4 h-4" />
                </button>
              </div>

              {/* Middle: D-Pad & Delete Button */}
              <div className="relative z-10 flex flex-col items-center gap-4 w-full">
                
                {/* Centered Delete Button */}
                <div className="flex justify-center w-full px-2">
                  <button 
                    onClick={() => {
                      if (preview && !isUploading) {
                        setPreview(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }
                    }}
                    className={`text-[9px] font-bold flex flex-col items-center
                      ${preview ? 'text-zinc-400 hover:text-red-400' : 'text-zinc-700 cursor-not-allowed'}
                    `}
                  >
                    <div className="w-6 h-6 rounded-full bg-[#222] shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex items-center justify-center mb-1">
                      <Trash2 className="w-3 h-3" />
                    </div>
                    DEL
                  </button>
                </div>

                {/* Circular D-Pad */}
                <div className="w-24 h-24 rounded-full bg-[#1a1a1c] shadow-[0_4px_10px_rgba(0,0,0,0.8),inset_0_2px_5px_rgba(255,255,255,0.05)] border border-[#111] relative flex items-center justify-center mt-2">
                  {/* Directional Arrows */}
                  <ChevronUp className="absolute top-1 w-4 h-4 text-zinc-600" />
                  <ChevronRight className="absolute right-1 w-4 h-4 text-zinc-600" />
                  <ChevronDown className="absolute bottom-1 w-4 h-4 text-zinc-600" />
                  <ChevronLeft className="absolute left-1 w-4 h-4 text-zinc-600" />
                  
                  {/* Center OK button */}
                  <div className="w-10 h-10 rounded-full bg-[#2a2a2d] border border-[#111] shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_2px_rgba(255,255,255,0.1)] flex items-center justify-center text-[10px] font-bold text-zinc-500">
                    OK
                  </div>
                </div>
              </div>

              {/* Bottom: Big Shutter/Upload Button */}
              <div className="relative z-10 w-full flex flex-col items-center gap-2">
                <button
                  onClick={preview ? handleUpload : () => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className={`
                    w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200
                    shadow-[0_5px_15px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.3)]
                    border-[3px] border-[#444]
                    ${preview 
                      ? 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 active:scale-95' 
                      : 'bg-gradient-to-b from-zinc-600 to-zinc-800 hover:from-zinc-500 hover:to-zinc-700 active:scale-95'}
                    ${isUploading ? 'opacity-70 cursor-wait' : ''}
                  `}
                >
                  {isUploading ? (
                    <Circle className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <UploadCloud className={`w-6 h-6 ${preview ? 'text-white' : 'text-zinc-400'}`} />
                  )}
                </button>
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider">
                  {preview ? 'UPLOAD' : 'SELECT'}
                </span>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={(e) => processFile(e.target.files?.[0])}
              className="hidden"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UploadPhotoModal;