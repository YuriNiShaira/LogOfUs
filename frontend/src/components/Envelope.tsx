import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X, Stamp, Camera } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import toast from 'react-hot-toast';

interface LoveLetter {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

interface UserProfile {
  id: number;
  display_name: string;
  profile_picture?: string | null;
  hover_profile_picture?: string | null;
}

interface CoupleInfo {
  partner_name: string;
  partner1_name?: string | null;
  partner2_name?: string | null;
  member_count: number;
}

const floatingHearts = [
  { id: 1, left: "18%", delay: 0 },
  { id: 2, left: "32%", delay: 0.1 },
  { id: 3, left: "50%", delay: 0.2 },
  { id: 4, left: "68%", delay: 0.15 },
  { id: 5, left: "82%", delay: 0.05 },
];

// MODERN FRAME with Mobile Support (Tap to Toggle, Long Press to Upload)
const ModernFrame: React.FC<{
  imageUrl?: string | null;
  hoverImageUrl?: string | null;
  name: string;
  side: 'left' | 'right';
  isDark: boolean;
  onUpload?: (side: 'left' | 'right') => void;
  onUploadHover?: (side: 'left' | 'right') => void;
  isUploading?: boolean;
  isUploadingHover?: boolean;
}> = ({ 
  imageUrl, 
  hoverImageUrl, 
  name, 
  side, 
  isDark, 
  onUpload, 
  onUploadHover,
  isUploading,
  isUploadingHover 
}) => {
  const [imageError, setImageError] = useState(false);
  const [hoverImageError, setHoverImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isToggled, setIsToggled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const longPressTimer = useRef<number | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const primaryImage = imageUrl || null;
  const hoverImage = (hoverImageUrl && !hoverImageError) ? hoverImageUrl : primaryImage;

  const getFallbackImage = (letter: string, isHover: boolean = false) => {
    const bgColor = isHover ? '#e8e0d8' : '#f0f0f0';
    const textColor = isHover ? '#777' : '#999';
    return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="${bgColor}"/%3E%3Ctext x="200" y="200" text-anchor="middle" dy=".3em" fill="${textColor}" font-family="serif" font-size="${isHover ? '40' : '60'}"%3E${isHover ? '✦' : encodeURIComponent(letter.toUpperCase())}%3C/text%3E%3C/svg%3E`;
  };

  const tilt = side === 'left' ? '-2deg' : '2deg';

  const handleTap = () => {
    if (isMobile) {
      if (hoverImageUrl && !isUploading && !isUploadingHover) {
        setIsToggled(!isToggled);
        if (navigator.vibrate) navigator.vibrate(10);
      }
    } else {
      onUpload?.(side);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onUploadHover && !isUploading && !isUploadingHover) {
      onUploadHover(side);
    }
  };

  const handleTouchStart = () => {
    if (isMobile && onUploadHover && !isUploading && !isUploadingHover) {
      longPressTimer.current = window.setTimeout(() => {
        if (onUploadHover) {
          onUploadHover(side);
          if (navigator.vibrate) navigator.vibrate(50);
          toast.success('Upload hover photo');
        }
        longPressTimer.current = null;
      }, 800);
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const showHoverImage = isMobile ? isToggled : isHovering;

  useEffect(() => {
    setIsToggled(false);
  }, [imageUrl, hoverImageUrl]);

  return (
    <motion.div 
      className="flex flex-col items-center gap-3 sm:gap-4 cursor-pointer select-none group"
      style={{ rotate: tilt }}
      whileHover={{ scale: 1.03, rotate: '0deg', y: -4, zIndex: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={handleTap}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      title={isMobile ? "Tap to switch photo | Long press for hover photo" : "Left-click: Change main photo | Right-click: Change hover photo"}
    >
      {/* Outer Frame (Black) */}
      <div 
        className={`
          relative p-1.5 sm:p-2 rounded-sm shadow-md group-hover:shadow-2xl transition-all duration-500
          w-32 h-44 xs:w-36 xs:h-48 sm:w-44 sm:h-60 md:w-52 md:h-72
          bg-[#111111] border border-black
        `}
      >
        {/* Inner Matting (White) */}
        <div className="w-full h-full p-2 sm:p-3 bg-[#fdfdfd]">
          {/* Edge-to-Edge Photo Container */}
          <div className="relative w-full h-full overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]">
            
            {/* Primary Image - visible by default */}
            <img 
              src={primaryImage || getFallbackImage(name.charAt(0), false)}
              alt={name}
              className={`
                w-full h-full object-cover transition-all duration-700 ease-out pointer-events-none
                ${showHoverImage ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
              `}
              onError={() => setImageError(true)}
            />

            {/* Hover/Toggle Image - fades in on hover or tap */}
            <img 
              src={hoverImage || getFallbackImage(name.charAt(0), true)}
              alt={`${name} hover`}
              className={`
                absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out pointer-events-none
                ${showHoverImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}
              `}
              onError={() => setHoverImageError(true)}
            />

            {/* Glass/Sheen overlay on hover/toggle */}
            <div 
              className={`
                absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent 
                transition-opacity duration-700 pointer-events-none
                ${showHoverImage ? 'opacity-100' : 'opacity-0'}
              `}
            />

            {/* Upload Overlay */}
            <AnimatePresence>
              {((isHovering && !isMobile) || !imageUrl || imageError) && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/30 backdrop-blur-[1px] flex flex-col items-center justify-center z-10 transition-opacity duration-300"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : isUploadingHover ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span className="text-[8px] text-white/60 font-serif">Hover photo...</span>
                    </div>
                  ) : (
                    <>
                      <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-white/90 mb-1.5 drop-shadow-md" strokeWidth={1.5} />
                      <span className="text-[10px] sm:text-xs text-white/90 font-serif tracking-widest uppercase">
                        {imageUrl ? 'Change' : 'Add Photo'}
                      </span>
                      {onUploadHover && imageUrl && (
                        <span className="text-[8px] text-white/60 font-serif mt-1">
                          {isMobile ? 'Long press for hover' : 'Right-click for hover'}
                        </span>
                      )}
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile toggle indicator */}
            {isMobile && hoverImageUrl && (
              <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20">
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
                  <span className="text-[6px] text-white/60 font-serif tracking-wider">
                    {isToggled ? '✦ hover' : 'tap'}
                  </span>
                </div>
              </div>
            )}

            {/* Hover indicator badge (desktop) */}
            {!isMobile && hoverImageUrl && (
              <div className="absolute top-1 right-1 z-20">
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                  <span className="text-[6px] text-white/60 font-serif tracking-wider">✦</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name below */}
      <div className="px-2 flex flex-col items-center">
        <span className={`
          letter-title text-base sm:text-lg tracking-widest block truncate max-w-35 text-center
          ${isDark ? 'text-stone-400' : 'text-stone-700'}
        `}>
          {name}
        </span>
        {hoverImageUrl && (
          <span className="text-[8px] text-rose-400/50 font-serif tracking-wider mt-0.5">
            {isMobile ? 'tap to toggle' : 'hover photo'}
          </span>
        )}
      </div>
    </motion.div>
  );
};

const Envelope: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const [uploadingSide, setUploadingSide] = useState<'left' | 'right' | null>(null);
  const [uploadingHoverSide, setUploadingHoverSide] = useState<'left' | 'right' | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverFileInputRef = useRef<HTMLInputElement>(null);
  
  const timeoutsRef = useRef<number[]>([]);

  const { data: loveLetters, isLoading, isError } = useQuery<LoveLetter[]>({
    queryKey: ["loveLetters"],
    queryFn: async () => {
      const response = await api.get("/love-letters/active/");
      return response.data;
    },
  });

  const { data: userProfile, refetch: refetchUserProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/auth/profile/");
      return response.data;
    },
    enabled: !!user,
  });

  const { data: coupleInfo } = useQuery<CoupleInfo>({
    queryKey: ["coupleInfo"],
    queryFn: async () => {
      const response = await api.get("/auth/couple-info/");
      return response.data;
    },
    enabled: !!user,
  });

  const currentLetter = useMemo(() => {
    if (!loveLetters || loveLetters.length === 0) return null;
    return loveLetters[0];
  }, [loveLetters]);

  const isDark = theme === 'dark';
  const myName = userProfile?.display_name || user?.display_name || "You";
  const partnerName = coupleInfo?.partner_name || coupleInfo?.partner1_name || "Partner";
  
  const myPhoto = userProfile?.profile_picture || null;
  const myHoverPhoto = userProfile?.hover_profile_picture || myPhoto;
  
  const partnerPhoto = null;
  const partnerHoverPhoto = null;

  const handlePhotoUpload = (side: 'left' | 'right') => {
    setUploadingSide(side);
    fileInputRef.current?.click();
  };

  const handleHoverPhotoUpload = (side: 'left' | 'right') => {
    setUploadingHoverSide(side);
    hoverFileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingSide) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      setUploadingSide(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      setUploadingSide(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('profile_picture', file);

      await api.patch('/auth/upload-profile-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadingSide === 'left') {
        await refetchUserProfile();
        toast.success('Main photo updated!');
      } else {
        toast.success('Photo uploaded!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload');
    } finally {
      setUploadingSide(null);
      e.target.value = '';
    }
  };

  const handleHoverFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadingHoverSide) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file for hover effect');
      setUploadingHoverSide(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      setUploadingHoverSide(null);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('hover_profile_picture', file);

      await api.patch('/auth/upload-hover-profile-picture/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (uploadingHoverSide === 'left') {
        await refetchUserProfile();
        toast.success('Hover photo updated!');
      } else {
        toast.success('Hover photo uploaded!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to upload hover photo');
    } finally {
      setUploadingHoverSide(null);
      e.target.value = '';
    }
  };

  useEffect(() => {
    return () => classNameTimeoutsClean();
  }, []);

  const classNameTimeoutsClean = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const handleEnvelopeClick = () => {
    if (!currentLetter || isAnimating) return;

    classNameTimeoutsClean();
    setIsAnimating(true);
    setIsEnvelopeOpen(true);

    const t1 = window.setTimeout(() => {
      setShowMagic(true);
      setShowLetterPreview(true);
    }, 350);

    const t2 = window.setTimeout(() => {
      setShowLetterPreview(false);
      setShowModal(true);
    }, 1300);

    const t3 = window.setTimeout(() => {
      setShowMagic(false);
      setIsEnvelopeOpen(false);
      setIsAnimating(false);
    }, 1700);

    timeoutsRef.current = [t1, t2, t3];
  };

  const handleClose = () => {
    setShowModal(false);
    setIsEnvelopeOpen(false);
    setShowLetterPreview(false);
    setShowMagic(false);
    setIsAnimating(false);
    classNameTimeoutsClean();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400&family=Dancing+Script:wght@500;700&display=swap');

        .paper-bg {
          background-color: #fcf6ef;
          background-image: 
            radial-gradient(circle at center, transparent 0%, rgba(139, 117, 91, 0.08) 100%),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 117, 91, 0.03) 2px,
              rgba(139, 117, 91, 0.03) 4px
            );
          position: relative;
          transform: translateZ(0); 
          will-change: transform;
        }

        .paper-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' seed='1'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        .letter-font { font-family: 'Crimson Text', serif; font-weight: 400; letter-spacing: 0.4px; }
        .letter-title { font-family: 'Cormorant Garamond', serif; font-weight: 700; letter-spacing: 1.5px; }
        .signature-font { font-family: 'Dancing Script', cursive; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 117, 91, 0.25); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 117, 91, 0.4); }

        .paper-edge {
          box-shadow: 
            inset 0 0 40px rgba(139, 117, 91, 0.06),
            0 10px 25px -5px rgba(0, 0, 0, 0.1),
            0 8px 10px -6px rgba(0, 0, 0, 0.05);
        }

        .gold-border {
          position: absolute;
          inset: 12px;
          border: 1px solid rgba(212, 175, 55, 0.3);
          pointer-events: none;
        }
        
        .gold-border::after, .gold-border::before {
          content: '';
          position: absolute;
          width: 8px;
          height: 8px;
          border: 1px solid rgba(212, 175, 55, 0.6);
        }
        .gold-border::before { top: -4px; left: -4px; border-right: none; border-bottom: none; }
        .gold-border::after { bottom: -4px; right: -4px; border-left: none; border-top: none; }

        .wax-seal {
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.2), 
                      0 4px 8px rgba(159, 18, 57, 0.4),
                      0 0 0 1px rgba(255,255,255,0.1);
        }
      `}</style>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <input
        ref={hoverFileInputRef}
        type="file"
        accept="image/*"
        onChange={handleHoverFileSelect}
        className="hidden"
      />

      <div className="flex flex-col items-center justify-center py-12 select-none overflow-hidden">
        
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-center gap-12 lg:gap-20 w-full max-w-5xl px-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, type: "spring" }}>
            <ModernFrame 
              imageUrl={myPhoto} 
              hoverImageUrl={myHoverPhoto}
              name={myName} 
              side="left" 
              isDark={isDark} 
              onUpload={handlePhotoUpload}
              onUploadHover={handleHoverPhotoUpload}
              isUploading={uploadingSide === 'left'}
              isUploadingHover={uploadingHoverSide === 'left'}
            />
          </motion.div>

          <motion.button
            type="button"
            onClick={handleEnvelopeClick}
            disabled={!currentLetter || isAnimating}
            whileHover={!isAnimating ? { scale: 1.05, y: -8 } : {}}
            whileTap={!isAnimating ? { scale: 0.96 } : {}}
            className="relative h-60 w-87.5 cursor-pointer border-0 bg-transparent p-0 outline-none focus:ring-2 focus:ring-pink-400/40 rounded-4xl shrink-0 z-10"
            style={{ willChange: "transform" }}
          >
            <motion.div
              animate={isEnvelopeOpen ? { y: 15, scale: 0.95 } : { y: [0, -5, 0], scale: 1, rotate: 0 }}
              transition={isEnvelopeOpen ? { type: "spring", stiffness: 100, damping: 15 } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="relative h-full w-full"
              style={{ willChange: "transform" }}
            >
              <motion.div
                animate={isEnvelopeOpen ? { opacity: 1, scale: 1.1 } : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }}
                transition={isEnvelopeOpen ? { duration: 0.4 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: "transform, opacity" }}
                className={`absolute inset-0 rounded-4xl blur-2xl transition-colors duration-500 ${isDark ? "bg-purple-500/20" : "bg-pink-400/20"}`}
              />

              <AnimatePresence>
                {showMagic && (
                  <>
                    {floatingHearts.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 0, scale: 0 }} animate={{ opacity: [0, 1, 0], y: -150, scale: [0.5, 1.2, 0.8] }} exit={{ opacity: 0 }} transition={{ duration: 1.2, delay: item.delay, ease: "easeOut" }} className="absolute top-15 z-50" style={{ left: item.left, willChange: "transform, opacity" }}>
                        <Heart className="h-4 w-4 fill-current text-red-400 drop-shadow-sm" />
                      </motion.div>
                    ))}
                    <motion.div initial={{ opacity: 0, scale: 0.6, rotate: -15, y: 0 }} animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [-15, 10, 25], y: -90 }} exit={{ opacity: 0 }} transition={{ duration: 1, delay: 0.1, ease: "easeOut" }} className="absolute left-[25%] top-16.25 z-50">
                      <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-md" />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.6, rotate: 15, y: 0 }} animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [15, -10, -25], y: -100 }} exit={{ opacity: 0 }} transition={{ duration: 1, delay: 0.2, ease: "easeOut" }} className="absolute right-[25%] top-15 z-50">
                      <Sparkles className="h-4 w-4 text-red-300 drop-shadow-md" />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <div className="absolute inset-0 z-10 rounded-[30px] bg-linear-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.18)]" />
              <div className="absolute inset-0.5 z-12 rounded-[28px] bg-linear-to-b from-white/20 to-transparent" />

              <AnimatePresence>
                {showLetterPreview && currentLetter && (
                  <motion.div
                    initial={{ y: 20, scale: 0.85, opacity: 0 }}
                    animate={{ y: -125, scale: 1, opacity: 1, rotate: [-1, 1.5, 0.5] }}
                    exit={{ opacity: 0, scale: 0.95, y: -135 }}
                    transition={{ y: { type: "spring", stiffness: 50, damping: 14 }, opacity: { duration: 0.2 }, rotate: { duration: 0.7, ease: "easeOut" } }}
                    className="absolute left-[6%] top-10 z-20 w-[88%]"
                    style={{ willChange: "transform, opacity" }}
                  >
                    <div className="paper-bg paper-edge rounded-t-lg rounded-b-xl overflow-hidden shadow-xl border border-amber-900/10 h-64 relative">
                      <div className="gold-border" style={{ bottom: 'auto', height: '100%' }} />
                      <div className="p-6 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                          <div className="h-8 w-8 rounded bg-red-900/5 flex items-center justify-center border border-red-900/10 rotate-[-5deg]">
                            <Stamp className="h-4 w-4 text-red-800/60" />
                          </div>
                          <p className="signature-font text-red-800/80 text-xl transform -rotate-2">For you</p>
                        </div>
                        <h3 className="letter-title text-xl text-center text-amber-950 mb-3 border-b border-amber-900/10 pb-2">
                          {currentLetter.title}
                        </h3>
                        <div className="space-y-2 mt-4">
                          <div className="h-2 w-full bg-amber-900/10 rounded-full" />
                          <div className="h-2 w-5/6 bg-amber-900/10 rounded-full mx-auto" />
                          <div className="h-2 w-4/6 bg-amber-900/10 rounded-full mx-auto" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 z-30 h-35.5 w-full rounded-b-[30px] bg-linear-to-br from-rose-100 via-pink-100 to-pink-200" />
              <div className="absolute bottom-0 left-0 z-32 h-35.5 w-1/2" style={{ clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)", background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))", borderBottomLeftRadius: "30px" }} />
              <div className="absolute bottom-0 right-0 z-32 h-35.5 w-1/2" style={{ clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)", background: "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.08))", borderBottomRightRadius: "30px" }} />

              <motion.div
                initial={false}
                animate={isEnvelopeOpen ? { rotateX: -180, y: -1, zIndex: 15 } : { rotateX: 0, y: 0, zIndex: 35 }}
                transition={{ type: "spring", stiffness: 85, damping: 15, zIndex: { delay: isEnvelopeOpen ? 0.15 : 0 } }}
                className="absolute left-0 top-0 h-30.5 w-full origin-top" 
                style={{ perspective: 1000, willChange: "transform" }}
              >
                <div className="absolute inset-0 shadow-md" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #be185d 100%)", borderTopLeftRadius: "30px", borderTopRightRadius: "30px" }} />
              </motion.div>

              <motion.div animate={isEnvelopeOpen ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }} transition={{ duration: 0.2 }} className="absolute inset-0 z-40 flex items-center justify-center" style={{ willChange: "opacity, transform" }}>
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <motion.div animate={!isEnvelopeOpen ? { scale: [1, 1.06, 1] } : { scale: 1 }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }} className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg shadow-pink-300/50 wax-seal">
                    <Heart className="h-7 w-7 fill-current text-red-500" />
                  </motion.div>
                  <div>
                    <p className="text-lg font-bold tracking-wide text-rose-950 letter-title">
                      {isLoading ? "Unlocking..." : isError ? "Failed to load" : currentLetter ? "Open my letter" : "No entries yet"}
                    </p>
                    <p className="mt-1 text-xs font-medium text-rose-900/60 letter-font">
                      {currentLetter ? "Tap to reveal" : "Create your first letter"}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </motion.button>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, type: "spring", delay: 0.1 }}>
            <ModernFrame 
              imageUrl={partnerPhoto} 
              hoverImageUrl={partnerHoverPhoto}
              name={partnerName} 
              side="right" 
              isDark={isDark} 
              onUpload={handlePhotoUpload}
              onUploadHover={handleHoverPhotoUpload}
              isUploading={uploadingSide === 'right'}
              isUploadingHover={uploadingHoverSide === 'right'}
            />
          </motion.div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex flex-col items-center gap-10 w-full px-4">
          <div className="flex items-center justify-center gap-6 sm:gap-10 w-full pt-4">
            <ModernFrame 
              imageUrl={myPhoto} 
              hoverImageUrl={myHoverPhoto}
              name={myName} 
              side="left" 
              isDark={isDark} 
              onUpload={handlePhotoUpload}
              onUploadHover={handleHoverPhotoUpload}
              isUploading={uploadingSide === 'left'}
              isUploadingHover={uploadingHoverSide === 'left'}
            />
            <ModernFrame 
              imageUrl={partnerPhoto} 
              hoverImageUrl={partnerHoverPhoto}
              name={partnerName} 
              side="right" 
              isDark={isDark} 
              onUpload={handlePhotoUpload}
              onUploadHover={handleHoverPhotoUpload}
              isUploading={uploadingSide === 'right'}
              isUploadingHover={uploadingHoverSide === 'right'}
            />
          </div>

          <motion.button
            type="button" onClick={handleEnvelopeClick} disabled={!currentLetter || isAnimating}
            whileHover={!isAnimating ? { scale: 1.03 } : {}} whileTap={!isAnimating ? { scale: 0.96 } : {}}
            className="relative h-52 w-72 cursor-pointer border-0 bg-transparent p-0 outline-none focus:ring-2 focus:ring-pink-400/40 rounded-4xl shrink-0 z-10 mt-2"
          >
             <motion.div animate={isEnvelopeOpen ? { y: 10, scale: 0.95 } : { y: [0, -3, 0], scale: 1, rotate: 0 }} transition={isEnvelopeOpen ? { type: "spring", stiffness: 100, damping: 15 } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="relative h-full w-full">
              
              <div className="absolute inset-0 z-10 rounded-[30px] bg-linear-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.18)]" />
              <div className="absolute inset-0.5 z-12 rounded-[28px] bg-linear-to-b from-white/20 to-transparent" />
              
              <AnimatePresence>
                {showLetterPreview && currentLetter && (
                  <motion.div initial={{ y: 20, scale: 0.85, opacity: 0 }} animate={{ y: -100, scale: 1, opacity: 1, rotate: [-1, 1.5, 0.5] }} exit={{ opacity: 0, scale: 0.95, y: -110 }} transition={{ y: { type: "spring", stiffness: 50, damping: 14 } }} className="absolute left-[6%] top-8 z-20 w-[88%]">
                    <div className="paper-bg paper-edge rounded-t-lg rounded-b-xl overflow-hidden shadow-xl border border-amber-900/10 h-52 relative">
                      <div className="gold-border" style={{ bottom: 'auto', height: '100%' }} />
                      <div className="p-5 relative z-10">
                         <h3 className="letter-title text-lg text-center text-amber-950 mb-2 border-b border-amber-900/10 pb-2 truncate">{currentLetter.title}</h3>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="absolute bottom-0 left-0 z-30 h-30 w-full rounded-b-[30px] bg-linear-to-br from-rose-100 via-pink-100 to-pink-200" />
              <div className="absolute bottom-0 left-0 z-32 h-30 w-1/2" style={{ clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)", background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))", borderBottomLeftRadius: "30px" }} />
              <div className="absolute bottom-0 right-0 z-32 h-30 w-1/2" style={{ clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)", background: "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.08))", borderBottomRightRadius: "30px" }} />

              <motion.div initial={false} animate={isEnvelopeOpen ? { rotateX: -180, y: -1, zIndex: 15 } : { rotateX: 0, y: 0, zIndex: 35 }} transition={{ type: "spring", stiffness: 85, damping: 15 }} className="absolute left-0 top-0 h-26 w-full origin-top" style={{ perspective: 1000 }}>
                <div className="absolute inset-0 shadow-md" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #be185d 100%)", borderTopLeftRadius: "30px", borderTopRightRadius: "30px" }} />
              </motion.div>

              <motion.div animate={isEnvelopeOpen ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }} className="absolute inset-0 z-40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 px-4 text-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 shadow-lg wax-seal">
                    <Heart className="h-5 w-5 fill-current text-red-500" />
                  </div>
                  <p className="text-sm font-bold tracking-wide text-rose-950 letter-title">
                    {isLoading ? "Unlocking..." : isError ? "Failed to load" : currentLetter ? "Open" : "No entries"}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </motion.button>
        </div>
      </div>

      {/* Full Modal Letter */}
      <AnimatePresence>
        {showModal && currentLetter && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-100 flex items-center justify-center bg-rose-950/30 p-4 sm:p-6"
            onClick={handleClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 22, stiffness: 150, delay: 0.1 }}
              className="w-full max-w-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="paper-bg paper-edge rounded-sm shadow-2xl overflow-hidden relative">
                <div className="gold-border" />

                <div className="absolute top-6 right-6 z-20 md:top-8 md:right-8">
                  <motion.div initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", delay: 0.4, damping: 12 }} className="h-12 w-12 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg wax-seal border border-red-900/50">
                    <Heart className="h-5 w-5 fill-red-300/80 text-red-200" />
                  </motion.div>
                </div>

                <div className="p-8 md:p-12 min-h-62.5 flex flex-col relative z-10 max-h-[85vh]">
                  <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }} className="letter-title text-2xl md:text-3xl text-amber-950 text-center mb-4 tracking-wide">
                    {currentLetter.title}
                  </motion.h1>

                  <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-px bg-amber-900/20" />
                      <Sparkles className="w-4 h-4 text-amber-600/40" />
                      <div className="w-12 h-px bg-amber-900/20" />
                    </div>
                  </div>

                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex-1 max-h-[45vh] overflow-y-auto custom-scrollbar pr-3">
                    <p className="letter-font text-base md:text-lg leading-loose text-amber-950/85 whitespace-pre-wrap text-justify">
                      {currentLetter.content}
                    </p>
                  </motion.div>

                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }} className="mt-6 pt-4 text-right pr-2 border-t border-amber-900/10 shrink-0">
                    <p className="letter-font text-sm text-amber-900/60 mb-1 mr-6">Yours truly,</p>
                    <p className="signature-font text-[#9f1239] transform -rotate-3 text-2xl">With endless love</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ delay: 0.5 }} onClick={handleClose} className="absolute top-4 right-4 md:top-8 md:right-8 z-101 rounded-full p-2.5 bg-white/60 backdrop-blur-sm hover:bg-white/90 text-rose-950 transition-all shadow-md cursor-pointer">
              <X className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Envelope;