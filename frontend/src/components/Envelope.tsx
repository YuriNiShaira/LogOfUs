import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Sparkles, X, Stamp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { useTheme } from "../contexts/ThemeContext";

interface LoveLetter {
  id: number;
  title: string;
  content: string;
  created_at: string;
  is_active: boolean;
}

const floatingHearts = [
  { id: 1, left: "18%", delay: 0 },
  { id: 2, left: "32%", delay: 0.1 },
  { id: 3, left: "50%", delay: 0.2 },
  { id: 4, left: "68%", delay: 0.15 },
  { id: 5, left: "82%", delay: 0.05 },
];

const Envelope: React.FC = () => {
  const { theme } = useTheme();
  const [isEnvelopeOpen, setIsEnvelopeOpen] = useState(false);
  const [showLetterPreview, setShowLetterPreview] = useState(false);
  const [showMagic, setShowMagic] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const timeoutsRef = useRef<number[]>([]);

  const { data: loveLetters, isLoading, isError } = useQuery<LoveLetter[]>({
    queryKey: ["loveLetters"],
    queryFn: async () => {
      const response = await api.get("/love-letters/active/");
      return response.data;
    },
  });

  const currentLetter = useMemo(() => {
    if (!loveLetters || loveLetters.length === 0) return null;
    return loveLetters[0];
  }, [loveLetters]);

  useEffect(() => {
    return () => {
      classNameTimeoutsClean();
    };
  }, []);

  const classNameTimeoutsClean = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
  };

  const handleEnvelopeClick = () => {
    if (!currentLetter || isAnimating) return;

    classNameTimeoutsClean();
    setIsAnimating(true);
    
    // Step 1: Flap opens
    setIsEnvelopeOpen(true);

    // Step 2: Letter slides out & magic sparkles appear
    const t1 = window.setTimeout(() => {
      setShowMagic(true);
      setShowLetterPreview(true);
    }, 350);

    // Step 3: Preview fades out as full Modal scales in
    const t2 = window.setTimeout(() => {
      setShowLetterPreview(false);
      setShowModal(true);
    }, 1300);

    // Step 4: Cleanup hidden states
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

        .letter-font {
          font-family: 'Crimson Text', serif;
          font-weight: 400;
          letter-spacing: 0.4px;
        }

        .letter-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 700;
          letter-spacing: 1.5px;
        }

        .signature-font {
          font-family: 'Dancing Script', cursive;
          font-size: 1.8rem;
          color: #9f1239; /* Deep rose */
        }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 117, 91, 0.25);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 117, 91, 0.4);
        }

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

      <div className="flex flex-col items-center justify-center py-12 select-none">
        <motion.button
          type="button"
          onClick={handleEnvelopeClick}
          disabled={!currentLetter || isAnimating}
          whileHover={!isAnimating ? { scale: 1.05, y: -8 } : {}}
          whileTap={!isAnimating ? { scale: 0.96 } : {}}
          className="relative h-60 w-87.5 cursor-pointer border-0 bg-transparent p-0 outline-none focus:ring-2 focus:ring-pink-400/40 rounded-4xl"
          style={{ willChange: "transform" }}
        >
          <motion.div
            animate={
              isEnvelopeOpen
                ? { y: 15, scale: 0.95 }
                : { y: [0, -5, 0], scale: 1, rotate: 0 }
            }
            transition={
              isEnvelopeOpen
                ? { type: "spring", stiffness: 100, damping: 15 }
                : { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
            }
            className="relative h-full w-full"
            style={{ willChange: "transform" }}
          >
            {/* Background glow */}
            <motion.div
              animate={
                isEnvelopeOpen
                  ? { opacity: 1, scale: 1.1 }
                  : { opacity: [0.4, 0.7, 0.4], scale: [1, 1.03, 1] }
              }
              transition={
                isEnvelopeOpen
                  ? { duration: 0.4 }
                  : { duration: 2.8, repeat: Infinity, ease: "easeInOut" }
              }
              style={{ willChange: "transform, opacity" }}
              className={`absolute inset-0 rounded-4xl blur-2xl transition-colors duration-500 ${
                theme === "dark" ? "bg-purple-500/20" : "bg-pink-400/20"
              }`}
            />

            {/* Floating particles */}
            <AnimatePresence>
              {showMagic && (
                <>
                  {floatingHearts.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 0, scale: 0 }}
                      animate={{ opacity: [0, 1, 0], y: -150, scale: [0.5, 1.2, 0.8] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1.2, delay: item.delay, ease: "easeOut" }}
                      className="absolute top-15 z-50"
                      style={{ left: item.left, willChange: "transform, opacity" }}
                    >
                      <Heart className="h-4 w-4 fill-current text-red-400 drop-shadow-sm" />
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: -15, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [-15, 10, 25], y: -90 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                    className="absolute left-[25%] top-16.25 z-50"
                  >
                    <Sparkles className="h-5 w-5 text-amber-300 drop-shadow-md" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.6, rotate: 15, y: 0 }}
                    animate={{ opacity: [0, 1, 0], scale: [0.6, 1.2, 0.8], rotate: [15, -10, -25], y: -100 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="absolute right-[25%] top-15 z-50"
                  >
                    <Sparkles className="h-4 w-4 text-red-300 drop-shadow-md" />
                  </motion.div>
                </>
              )}
            </AnimatePresence>

            {/* Z-Index 10: Envelope back */}
            <div className="absolute inset-0 z-10 rounded-[30px] bg-linear-to-br from-rose-300 via-pink-300 to-fuchsia-400 shadow-[0_28px_70px_rgba(236,72,153,0.18)]" />
            <div className="absolute inset-0.5 z-12 rounded-[28px] bg-linear-to-b from-white/20 to-transparent" />

            {/* Z-Index 20: Letter preview sliding out perfectly between back and front pocket */}
            <AnimatePresence>
              {showLetterPreview && currentLetter && (
                <motion.div
                  initial={{ y: 20, scale: 0.85, opacity: 0 }}
                  animate={{ 
                    y: -125, 
                    scale: 1, 
                    opacity: 1,
                    rotate: [-1, 1.5, 0.5]
                  }}
                  exit={{ opacity: 0, scale: 0.95, y: -135 }}
                  transition={{ 
                    y: { type: "spring", stiffness: 50, damping: 14 },
                    opacity: { duration: 0.2 },
                    rotate: { duration: 0.7, ease: "easeOut" }
                  }}
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

            {/* Z-Index 30: Front pocket */}
            <div className="absolute bottom-0 left-0 z-30 h-35.5 w-full rounded-b-[30px] bg-linear-to-br from-rose-100 via-pink-100 to-pink-200" />

            {/* Fold highlights for pocket */}
            <div
              className="absolute bottom-0 left-0 z-32 h-35.5 w-1/2"
              style={{
                clipPath: "polygon(0 0, 100% 50%, 100% 100%, 0 100%)",
                background: "linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.1))",
                borderBottomLeftRadius: "30px",
              }}
            />
            <div
              className="absolute bottom-0 right-0 z-32 h-35.5 w-1/2"
              style={{
                clipPath: "polygon(0 50%, 100% 0, 100% 100%, 0 100%)",
                background: "linear-gradient(225deg, rgba(255,255,255,0.4), rgba(255,255,255,0.08))",
                borderBottomRightRadius: "30px",
              }}
            />

            {/* Top flap */}
            <motion.div
              initial={false}
              animate={isEnvelopeOpen ? { rotateX: -180, y: -1, zIndex: 15 } : { rotateX: 0, y: 0, zIndex: 35 }}
              transition={{ 
                type: "spring",
                stiffness: 85,
                damping: 15,
                zIndex: { delay: isEnvelopeOpen ? 0.15 : 0 } 
              }}
              className="absolute left-0 top-0 h-30.5 w-full origin-top" 
              style={{ perspective: 1000, willChange: "transform" }}
            >
              <div
                className="absolute inset-0 shadow-md"
                style={{
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                  background: "linear-gradient(135deg, #fb7185 0%, #ec4899 50%, #be185d 100%)",
                  borderTopLeftRadius: "30px",
                  borderTopRightRadius: "30px",
                }}
              />
            </motion.div>

            {/* Z-Index 40: Front message */}
            <motion.div
              animate={isEnvelopeOpen ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-40 flex items-center justify-center"
              style={{ willChange: "opacity, transform" }}
            >
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <motion.div
                  animate={!isEnvelopeOpen ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-white/95 shadow-lg shadow-pink-300/50 wax-seal"
                >
                  <Heart className="h-7 w-7 fill-current text-red-500" />
                </motion.div>

                <div>
                  <p className="text-lg font-bold tracking-wide text-rose-950 letter-title">
                    {isLoading ? "Unlocking..." : isError ? "Failed to load" : currentLetter ? "Open my letter 💌" : "No entries yet"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-rose-900/60 letter-font">
                    {currentLetter ? "Tap to reveal" : "Create your first letter ✨"}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </motion.button>
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
                {/* Vintage gold border inside the paper */}
                <div className="gold-border" />

                {/* Wax seal on the actual letter */}
                <div className="absolute top-6 right-6 z-20 md:top-8 md:right-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -40 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", delay: 0.4, damping: 12 }}
                    className="h-12 w-12 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg wax-seal border border-red-900/50"
                  >
                    <Heart className="h-5 w-5 fill-red-300/80 text-red-200" />
                  </motion.div>
                </div>

                {/* Content Container - Adjusted heights here to be dynamic instead of fixed length */}
                <div className="p-8 md:p-12 min-h-[250px] flex flex-col relative z-10 max-h-[85vh]">
                  {/* Elegant Title */}
                  <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="letter-title text-2xl md:text-3xl text-amber-950 text-center mb-4 tracking-wide"
                  >
                    {currentLetter.title}
                  </motion.h1>

                  {/* Decorative Divider */}
                  <div className="flex justify-center mb-6">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-px bg-amber-900/20" />
                      <Sparkles className="w-4 h-4 text-amber-600/40" />
                      <div className="w-12 h-px bg-amber-900/20" />
                    </div>
                  </div>

                  {/* Body Text - Now properly scrolls only when needed and doesn't stretch too much */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.8 }}
                    className="flex-1 max-h-[45vh] overflow-y-auto custom-scrollbar pr-3"
                  >
                    <p className="letter-font text-base md:text-lg leading-[2] text-amber-950/85 whitespace-pre-wrap text-justify">
                      {currentLetter.content}
                    </p>
                  </motion.div>

                  {/* Hand-written Signature */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="mt-6 pt-4 text-right pr-2 border-t border-amber-900/10 shrink-0"
                  >
                    <p className="letter-font text-sm text-amber-900/60 mb-1 mr-6">Yours truly,</p>
                    <p className="signature-font transform -rotate-3 text-2xl">With endless love ♡</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.5 }}
              onClick={handleClose}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-101 rounded-full p-2.5 bg-white/60 backdrop-blur-sm hover:bg-white/90 text-rose-950 transition-all shadow-md cursor-pointer"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Envelope;