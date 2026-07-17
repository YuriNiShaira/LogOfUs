import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X, Stamp, Camera } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import toast from 'react-hot-toast';
import UploadPhotoModal from "./UploadPhotoModal";

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

// Photo frame component with hover effect and upload buttons
const ModernFrame: React.FC<{
  imageUrl?: string | null;
  hoverImageUrl?: string | null;
  name: string;
  side: 'left' | 'right';
  isDark: boolean;
  onUpload: () => void;
  onUploadHover: () => void;
  isUploading?: boolean;
  isUploadingHover?: boolean;
  isPartner2?: boolean;
}> = ({ 
  imageUrl, 
  hoverImageUrl, 
  name, 
  side, 
  isDark, 
  onUpload, 
  onUploadHover,
  isUploading,
  isUploadingHover,
  isPartner2 = false
}) => {
  const [hoverImageError, setHoverImageError] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const primaryImage = imageUrl || null;
  const hoverImage = (hoverImageUrl && !hoverImageError) ? hoverImageUrl : null;

  const tilt = side === 'left' ? '-2deg' : '2deg';
  const hasHoverImage = !!hoverImageUrl && hoverImageUrl.trim() !== '' && hoverImageUrl !== primaryImage;
  const showHoverImage = isHovering && hasHoverImage;

  const accentHoverClass = isPartner2 
    ? 'hover:from-blue-50/90 hover:via-white/90 hover:to-blue-50/90' 
    : 'hover:from-rose-50/90 hover:via-white/90 hover:to-rose-50/90';
  const accentRingClass = isPartner2 
    ? 'focus:ring-blue-400/50' 
    : 'focus:ring-rose-400/50';
  const accentBorderClass = isPartner2 
    ? 'border-blue-200 hover:border-blue-400' 
    : 'border-rose-200 hover:border-rose-400';
  const accentTextClass = isPartner2 
    ? 'text-blue-400 hover:text-blue-600' 
    : 'text-rose-400 hover:text-rose-600';
  const accentPulseClass = isPartner2 
    ? 'bg-blue-400/20' 
    : 'bg-rose-400/20';

  return (
    <motion.div 
      className="flex flex-col items-center gap-3 sm:gap-4 select-none"
      style={{ rotate: tilt }}
      whileHover={{ scale: 1.03, rotate: '0deg', y: -4, zIndex: 30 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Outer black frame */}
      <div 
        className={`
          relative p-1.5 sm:p-2 rounded-sm shadow-md transition-all duration-500
          w-32 h-44 xs:w-36 xs:h-48 sm:w-44 sm:h-60 md:w-52 md:h-72
          bg-[#111111] border border-black
          ${isHovering && !primaryImage ? 'shadow-xl' : 'shadow-md'}
          ${isHovering && primaryImage ? 'shadow-2xl' : ''}
        `}
      >
        {/* Inner white matting */}
        <div className="w-full h-full p-2 sm:p-3 bg-[#fdfdfd]">
          {/* Photo container with inset shadow */}
          <div className="relative w-full h-full overflow-hidden shadow-[inset_0_2px_6px_rgba(0,0,0,0.15)]">
            
            {/* Main photo */}
            {primaryImage && (
              <img 
                src={primaryImage}
                alt={name}
                className={`
                  w-full h-full object-cover transition-all duration-700 ease-out
                  ${showHoverImage ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}
                `}
                onError={() => {}}
              />
            )}

            {/* Hover photo overlay */}
            {hasHoverImage && primaryImage && (
              <img 
                src={hoverImage || ''}
                alt={`${name} hover`}
                className={`
                  absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out
                  ${showHoverImage ? 'opacity-100 scale-105' : 'opacity-0 scale-100'}
                `}
                onError={() => {
                  console.warn('Hover image failed:', hoverImage);
                  setHoverImageError(true);
                }}
              />
            )}

            {/* Glass-like sheen on hover */}
            {hasHoverImage && primaryImage && (
              <div 
                className={`
                  absolute inset-0 bg-linear-to-tr from-transparent via-white/10 to-transparent 
                  transition-opacity duration-700 pointer-events-none
                  ${showHoverImage ? 'opacity-100' : 'opacity-0'}
                `}
              />
            )}

            {/* Empty state - upload button */}
            {!primaryImage && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpload();
                }}
                className={`absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10 
                           bg-linear-to-b from-gray-50/90 via-white/80 to-gray-100/90 backdrop-blur-sm
                           ${accentHoverClass} transition-all duration-500
                           cursor-pointer group focus:outline-none ${accentRingClass}`}
                aria-label="Upload main photo"
              >
                <div className="relative mb-3">
                  <motion.div 
                    className={`absolute inset-0 rounded-full ${accentPulseClass}`}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div 
                    className={`absolute inset-0 rounded-full ${isPartner2 ? 'bg-blue-300/30' : 'bg-rose-300/30'}`}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  />
                  <div className={`relative h-14 w-14 rounded-full bg-white shadow-lg flex items-center justify-center border-2 ${accentBorderClass} group-hover:border-${isPartner2 ? 'blue' : 'rose'}-400 transition-colors duration-300`}>
                    <Camera className={`h-6 w-6 ${accentTextClass} group-hover:scale-110 transition-all duration-300`} strokeWidth={1.5} />
                  </div>
                </div>
                
                <motion.div 
                  className="mb-3 opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" className={`text-gray-400 group-hover:${isPartner2 ? 'text-blue-400' : 'text-rose-400'} transition-colors`}>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 4-7 8-7s8 3 8 7" />
                  </svg>
                </motion.div>

                <div className="text-center px-2">
                  <p className={`text-xs font-serif ${isPartner2 ? 'text-blue-600/70 group-hover:text-blue-700' : 'text-rose-600/70 group-hover:text-rose-700'} transition-colors font-medium tracking-wide`}>
                    Add your photo
                  </p>
                  <p className="text-[9px] text-gray-400/60 group-hover:text-gray-500 mt-1 italic tracking-wide">
                    Click to upload
                  </p>
                </div>

                {/* Decorative sparkles */}
                <div className="absolute top-2 left-2">
                  <motion.div
                    animate={{ opacity: [0.3, 0.6, 0.3], rotate: [0, 180, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className={`h-2.5 w-2.5 ${isPartner2 ? 'text-blue-300/50' : 'text-rose-300/50'}`} />
                  </motion.div>
                </div>
                <div className="absolute bottom-2 right-2">
                  <motion.div
                    animate={{ opacity: [0.6, 0.3, 0.6], rotate: [360, 180, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear", delay: 2 }}
                  >
                    <Sparkles className="h-2.5 w-2.5 text-amber-300/50" />
                  </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-gray-100/40 to-transparent pointer-events-none" />
              </button>
            )}

            {/* Tiny indicator for photos with hover effect */}
            {primaryImage && hasHoverImage && (
              <div className="absolute top-1 right-1 z-20 pointer-events-none">
                <div className="bg-black/40 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                  <span className="text-[6px] text-white/60 font-serif tracking-wider">✦</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Name label and action buttons */}
      <div className="flex flex-col items-center gap-2 w-full max-w-35">
        <span className={`
          letter-title text-base sm:text-lg tracking-widest block truncate text-center
          ${isDark ? 'text-stone-400' : 'text-stone-700'}
        `}>
          {name}
        </span>
        
        <div className="flex items-center gap-2">
          {/* Main photo upload button */}
          <button
            onClick={(e) => { e.stopPropagation(); onUpload(); }}
            disabled={isUploading}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-serif transition-all
              ${primaryImage 
                ? isDark 
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800' 
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                : isPartner2 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm'
              }
            `}
            title="Upload main photo"
          >
            <Camera className="w-3 h-3" />
            {isUploading ? '...' : primaryImage ? 'Change' : 'Add Photo'}
          </button>
          
          {/* Hover photo upload button */}
          <button
            onClick={(e) => { e.stopPropagation(); onUploadHover(); }}
            disabled={isUploadingHover || !primaryImage}
            className={`
              flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-serif transition-all
              ${!primaryImage 
                ? 'opacity-40 cursor-not-allowed text-stone-400'
                : hasHoverImage
                  ? isDark 
                    ? isPartner2 ? 'text-blue-400 hover:text-blue-300 hover:bg-stone-800' : 'text-amber-400 hover:text-amber-300 hover:bg-stone-800'
                    : isPartner2 ? 'text-blue-600 hover:text-blue-800 hover:bg-stone-100' : 'text-amber-600 hover:text-amber-800 hover:bg-stone-100'
                  : isDark 
                    ? 'text-stone-500 hover:text-stone-300 hover:bg-stone-800' 
                    : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
              }
            `}
            title={!primaryImage ? "Upload main photo first" : "Upload hover photo"}
          >
            <Sparkles className="w-3 h-3" />
            {isUploadingHover ? '...' : hasHoverImage ? 'Hover ✓' : 'Hover'}
          </button>
        </div>
        
        {/* Status message */}
        <span className="text-[8px] text-rose-400/40 font-serif tracking-wider text-center">
          {!primaryImage 
            ? '✨ add your photo to begin' 
            : hasHoverImage 
              ? '✦ hover to reveal' 
              : 'add a hover photo'}
        </span>
      </div>
    </motion.div>
  );
};

// Main envelope component with letter display
const Envelope: React.FC = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Upload modal controls
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'main' | 'hover'>('main');
  const [uploadTarget, setUploadTarget] = useState<'partner1' | 'partner2'>('partner1');
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingHover, setIsUploadingHover] = useState(false);
  
  const timeoutsRef = useRef<number[]>([]);

  // Fetch love letters from API
  const { data: loveLetters, isLoading, isError } = useQuery<LoveLetter[]>({
    queryKey: ["loveLetters"],
    queryFn: async () => {
      const response = await api.get("/love-letters/active/");
      return response.data;
    },
  });

  // Fetch current user's profile
  const { data: userProfile, refetch: refetchUserProfile } = useQuery<UserProfile>({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const response = await api.get("/auth/profile/");
      return response.data;
    },
    enabled: !!user,
  });

  // Fetch partner's profile
  const { data: partnerProfile, refetch: refetchPartnerProfile } = useQuery<UserProfile>({
    queryKey: ["partnerProfile"],
    queryFn: async () => {
      try {
        const response = await api.get("/auth/partner-profile/");
        return response.data;
      } catch (error: any) {
        if (error.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!user,
  });

  // Fetch couple information
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
  const currentUserId = user?.id;
  
  // ✅ FIX: More reliable isPartner1 detection
  const isPartner1 = useMemo(() => {
    if (!coupleInfo || !userProfile) {
      return true;
    }
    
    // If there's only 1 member, current user is partner 1
    if (coupleInfo.member_count === 1) {
      return true;
    }
    
    return coupleInfo.partner1_name === userProfile.display_name;
  }, [coupleInfo, userProfile]);
  
  const myName = userProfile?.display_name || user?.display_name || "You";
  const partnerName = coupleInfo?.partner_name || coupleInfo?.partner2_name || "Partner";
  
  const myPhoto = userProfile?.profile_picture || null;
  const myHoverPhoto = userProfile?.hover_profile_picture || null;
  
  const partnerPhoto = partnerProfile?.profile_picture || null;
  const partnerHoverPhoto = partnerProfile?.hover_profile_picture || null;

  // ✅ FIX: Open upload modal with specific target and type
  const openUploadModal = (type: 'main' | 'hover', target: 'partner1' | 'partner2') => {
    console.log('📤 Opening upload modal for:', target, 'type:', type);
    setUploadType(type);
    setUploadTarget(target);
    setUploadModalOpen(true);
  };

  // ✅ UPDATED: Handle photo upload with target as form data
  const handleUpload = async (file: File) => {
    const isMain = uploadType === 'main';
    const target = uploadTarget;
    
    console.log('📤 Uploading for target:', target);
    console.log('📤 Upload type:', isMain ? 'main' : 'hover');
    
    if (isMain) setIsUploading(true);
    else setIsUploadingHover(true);

    try {
      const formData = new FormData();
      const fieldName = isMain ? 'profile_picture' : 'hover_profile_picture';
      formData.append(fieldName, file);
      
      if (currentUserId) {
        formData.append('user_id', String(currentUserId));
      }
      // ✅ Add target to form data - this tells the backend who to update
      formData.append('target', target === 'partner2' ? 'partner' : 'self');

      // ✅ Use the regular endpoint with target parameter
      let endpoint = isMain 
        ? '/auth/upload-profile-picture/' 
        : '/auth/upload-hover-profile-picture/';

      console.log('📡 Uploading to:', endpoint);
      console.log('📎 Target:', target);
      console.log('👤 Current user ID:', currentUserId);

      const response = await api.patch(endpoint, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ Upload success:', response.data);

      // ✅ Refetch the correct profile based on target
      if (target === 'partner2') {
        console.log('🔄 Refetching partner profile...');
        await refetchPartnerProfile();
        queryClient.invalidateQueries({ queryKey: ['partnerProfile'] });
      } else {
        console.log('🔄 Refetching user profile...');
        await refetchUserProfile();
        queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      }
      
      // ✅ Also invalidate couple info to update partner status
      queryClient.invalidateQueries({ queryKey: ['coupleInfo'] });
      
      toast.success(isMain ? 'Photo updated! 📸' : 'Hover photo updated! ✨');
      setUploadModalOpen(false);
    } catch (error: any) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error response:', error.response?.data);
      
      let errorMessage = 'Failed to upload';
      if (error.code === 'ERR_NETWORK') {
        errorMessage = 'Network error - please check your connection';
      } else if (error.response?.status === 413) {
        errorMessage = 'File too large - please choose a smaller image';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.error || 'Invalid file format';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      
      toast.error(errorMessage);
    } finally {
      if (isMain) setIsUploading(false);
      else setIsUploadingHover(false);
    }
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => clearTimeouts();
  }, []);

  const clearTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  // Handle envelope click - triggers the whole animation sequence
  const handleEnvelopeClick = () => {
    if (!currentLetter || isAnimating) return;

    clearTimeouts();
    setIsAnimating(true);
    setIsEnvelopeOpen(true);

    // Show magic particles
    const t1 = window.setTimeout(() => {
      setShowMagic(true);
      setShowLetterPreview(true);
    }, 350);

    // Open the full letter modal
    const t2 = window.setTimeout(() => {
      setShowLetterPreview(false);
      setShowModal(true);
    }, 1300);

    // Reset everything
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
    clearTimeouts();
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

      <UploadPhotoModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleUpload}
      />

      <div className="flex flex-col items-center justify-center py-12 select-none overflow-hidden">
        
        {/* Desktop layout with photos on both sides of envelope */}
        <div className="hidden md:flex items-center justify-center gap-12 lg:gap-20 w-full max-w-5xl px-6">
          {/* LEFT FRAME - Partner 1 */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, type: "spring" }}>
            <ModernFrame 
              imageUrl={isPartner1 ? myPhoto : partnerPhoto} 
              hoverImageUrl={isPartner1 ? myHoverPhoto : partnerHoverPhoto}
              name={isPartner1 ? myName : partnerName} 
              side="left" 
              isDark={isDark} 
              onUpload={() => openUploadModal('main', 'partner1')}
              onUploadHover={() => openUploadModal('hover', 'partner1')}
              isUploading={isUploading}
              isUploadingHover={isUploadingHover}
              isPartner2={false}
            />
          </motion.div>

          {/* Envelope button */}
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
              {/* Glow effect */}
              <motion.div
                animate={isEnvelopeOpen ? { opacity: 1, scale: 1.1 } : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }}
                transition={isEnvelopeOpen ? { duration: 0.4 } : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ willChange: "transform, opacity" }}
                className={`absolute inset-0 rounded-4xl blur-2xl transition-colors duration-500 ${isDark ? "bg-purple-500/20" : "bg-pink-400/20"}`}
              />

              {/* Floating hearts animation */}
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

              {/* Envelope body with gradient */}
              <div className="absolute inset-0 z-10 rounded-[30px] bg-linear-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.18)]" />
              <div className="absolute inset-0.5 z-12 rounded-[28px] bg-linear-to-b from-white/20 to-transparent" />

              {/* Letter preview that pops up */}
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

              {/* Bottom flap of envelope */}
              <div className="absolute bottom-0 left-0 z-30 h-35.5 w-full rounded-b-[30px] bg-linear-to-br from-rose-100 via-pink-100 to-pink-200" />
              <div className="absolute bottom-0 left-0 z-32 h-35.5 w-1/2" style={{ clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)", background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))", borderBottomLeftRadius: "30px" }} />
              <div className="absolute bottom-0 right-0 z-32 h-35.5 w-1/2" style={{ clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)", background: "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.08))", borderBottomRightRadius: "30px" }} />

              {/* Top flap that folds open */}
              <motion.div
                initial={false}
                animate={isEnvelopeOpen ? { rotateX: -180, y: -1, zIndex: 15 } : { rotateX: 0, y: 0, zIndex: 35 }}
                transition={{ type: "spring", stiffness: 85, damping: 15, zIndex: { delay: isEnvelopeOpen ? 0.15 : 0 } }}
                className="absolute left-0 top-0 h-30.5 w-full origin-top" 
                style={{ perspective: 1000, willChange: "transform" }}
              >
                <div className="absolute inset-0 shadow-md" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #be185d 100%)", borderTopLeftRadius: "30px", borderTopRightRadius: "30px" }} />
              </motion.div>

              {/* Envelope content overlay */}
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

          {/* RIGHT FRAME - Partner 2 */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, type: "spring", delay: 0.1 }}>
            <ModernFrame 
              imageUrl={isPartner1 ? partnerPhoto : myPhoto} 
              hoverImageUrl={isPartner1 ? partnerHoverPhoto : myHoverPhoto}
              name={isPartner1 ? partnerName : myName} 
              side="right" 
              isDark={isDark} 
              onUpload={() => openUploadModal('main', 'partner2')}
              onUploadHover={() => openUploadModal('hover', 'partner2')}
              isUploading={isUploading}
              isUploadingHover={isUploadingHover}
              isPartner2={true}
            />
          </motion.div>
        </div>

        {/* Mobile layout - photos stacked on top */}
        <div className="md:hidden flex flex-col items-center gap-10 w-full px-4">
          <div className="flex items-center justify-center gap-6 sm:gap-10 w-full pt-4">
            <ModernFrame 
              imageUrl={isPartner1 ? myPhoto : partnerPhoto} 
              hoverImageUrl={isPartner1 ? myHoverPhoto : partnerHoverPhoto}
              name={isPartner1 ? myName : partnerName} 
              side="left" 
              isDark={isDark} 
              onUpload={() => openUploadModal('main', 'partner1')}
              onUploadHover={() => openUploadModal('hover', 'partner1')}
              isUploading={isUploading}
              isUploadingHover={isUploadingHover}
              isPartner2={false}
            />
            <ModernFrame 
              imageUrl={isPartner1 ? partnerPhoto : myPhoto} 
              hoverImageUrl={isPartner1 ? partnerHoverPhoto : myHoverPhoto}
              name={isPartner1 ? partnerName : myName} 
              side="right" 
              isDark={isDark} 
              onUpload={() => openUploadModal('main', 'partner2')}
              onUploadHover={() => openUploadModal('hover', 'partner2')}
              isUploading={isUploading}
              isUploadingHover={isUploadingHover}
              isPartner2={true}
            />
          </div>

          {/* Mobile envelope - smaller version */}
          <motion.button
            type="button" onClick={handleEnvelopeClick} disabled={!currentLetter || isAnimating}
            whileHover={!isAnimating ? { scale: 1.03 } : {}} whileTap={!isAnimating ? { scale: 0.96 } : {}}
            className="relative h-52 w-72 cursor-pointer border-0 bg-transparent p-0 outline-none focus:ring-2 focus:ring-pink-400/40 rounded-4xl shrink-0 z-10 mt-2"
          >
            <motion.div animate={isEnvelopeOpen ? { y: 10, scale: 0.95 } : { y: [0, -3, 0], scale: 1, rotate: 0 }} transition={isEnvelopeOpen ? { type: "spring", stiffness: 100, damping: 15 } : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }} className="relative h-full w-full">
              
              <div className="absolute inset-0 z-10 rounded-[30px] bg-linear-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.18)]" />
              <div className="absolute inset-0.5 z-12 rounded-[28px] bg-linear-to-b from-white/20 to-transparent" />
              
              {/* Mobile letter preview */}
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

              {/* Mobile bottom flap */}
              <div className="absolute bottom-0 left-0 z-30 h-30 w-full rounded-b-[30px] bg-linear-to-br from-rose-100 via-pink-100 to-pink-200" />
              <div className="absolute bottom-0 left-0 z-32 h-30 w-1/2" style={{ clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)", background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))", borderBottomLeftRadius: "30px" }} />
              <div className="absolute bottom-0 right-0 z-32 h-30 w-1/2" style={{ clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)", background: "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.08))", borderBottomRightRadius: "30px" }} />

              {/* Mobile top flap */}
              <motion.div initial={false} animate={isEnvelopeOpen ? { rotateX: -180, y: -1, zIndex: 15 } : { rotateX: 0, y: 0, zIndex: 35 }} transition={{ type: "spring", stiffness: 85, damping: 15 }} className="absolute left-0 top-0 h-26 w-full origin-top" style={{ perspective: 1000 }}>
                <div className="absolute inset-0 shadow-md" style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #be185d 100%)", borderTopLeftRadius: "30px", borderTopRightRadius: "30px" }} />
              </motion.div>

              {/* Mobile content overlay */}
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

      {/* Full-screen letter modal */}
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

                {/* Wax seal decoration */}
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

            {/* Close button */}
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