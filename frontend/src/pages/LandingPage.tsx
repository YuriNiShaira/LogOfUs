import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, ArrowRight, PenLine, BookOpen, Camera, 
  MapPin, Star, Music, MessageCircle, ChevronRight,
  Lock, EyeOff, HeartHandshake, ChevronDown, Sparkles,
  AlertTriangle
} from 'lucide-react';
import RomanticBackground from '../components/RomanticBackground';
import InstallPWA from '../components/InstallPWA';

// Helper: Torn Washi Tape
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-yellow-100/70', className = '' }) => (
  <div className={`absolute -top-4 w-28 h-8 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-20 ${className}`} 
       style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 100%, 0% 96%)' }} 
  />
);

const HEARTS_CONFIG = [
  { id: 1, x: '10%', delay: 0, size: 24, rotate: 10 },
  { id: 2, x: '30%', delay: 2, size: 18, rotate: -15 },
  { id: 3, x: '60%', delay: 5, size: 28, rotate: 5 },
  { id: 4, x: '85%', delay: 1, size: 20, rotate: -20 },
  { id: 5, x: '45%', delay: 7, size: 16, rotate: 25 },
];

const FloatingPaperHeart = ({ delay = 0, x = '50%', size = 24, rotate = 0 }) => (
  <motion.div
    initial={{ y: '110vh', opacity: 0, rotate: rotate }}
    animate={{ y: '-10vh', opacity: [0, 0.6, 0], rotate: rotate + (Math.random() * 40 - 20) }}
    transition={{ duration: 15, repeat: Infinity, delay, ease: 'linear' }}
    className="absolute text-rose-300/40 pointer-events-none drop-shadow-sm"
    style={{ left: x }}
  >
    <Heart fill="currentColor" size={size} />
  </motion.div>
);

const Polaroid = ({ image, caption, rotation = -2, tapeColor, tapeRotate, className = '' }: any) => (
  <motion.div
    className={`relative bg-white p-3 pb-10 shadow-[0_10px_20px_rgba(0,0,0,0.08)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] border border-gray-100 rounded-sm cursor-pointer ${className}`}
    initial={{ rotate: rotation }}
    whileHover={{ scale: 1.05, rotate: rotation > 0 ? rotation - 2 : rotation + 2, zIndex: 40 }}
  >
    <WashiTape color={tapeColor} rotate={tapeRotate} className="left-1/2 -translate-x-1/2" />
    <div className="overflow-hidden bg-gray-100 border border-gray-200 aspect-[4/5] w-full">
      <img src={image} alt={caption} className="w-full h-full object-cover filter contrast-[1.05] sepia-[.1]" />
    </div>
    <div className="absolute bottom-3 left-0 w-full text-center px-4">
      <p className="font-handwriting text-2xl text-gray-700 opacity-90 truncate">{caption}</p>
    </div>
  </motion.div>
);

// Styled specifically for the sticky note aesthetic
const features = [
  { icon: Camera, title: 'Capture Memories', description: 'Document every special moment with photos, dates, and heartfelt stories.', noteColor: 'bg-[#fef3c7]', pinColor: 'bg-rose-400', rotation: '-rotate-2' },
  { icon: MapPin, title: 'Plan Adventures', description: 'Create a shared bucket list of dreams and places to explore together.', noteColor: 'bg-[#e0f2fe]', pinColor: 'bg-blue-400', rotation: 'rotate-2' },
  { icon: Star, title: 'Rate & Review', description: 'Keep track of movies, shows, and anime you watch as a couple.', noteColor: 'bg-[#fce7f3]', pinColor: 'bg-purple-400', rotation: '-rotate-1' },
  { icon: Music, title: 'Share Music', description: 'Recommend songs that remind you of each other and your story.', noteColor: 'bg-[#dcfce7]', pinColor: 'bg-emerald-400', rotation: 'rotate-3' },
  { icon: BookOpen, title: 'Your Story', description: 'Build a beautiful timeline of your relationship year by year.', noteColor: 'bg-[#ffedd5]', pinColor: 'bg-amber-400', rotation: '-rotate-3' },
  { icon: Heart, title: 'Stay Connected', description: 'One diary, two authors. Write your story together in real time.', noteColor: 'bg-[#f3e8ff]', pinColor: 'bg-indigo-400', rotation: 'rotate-1' },
];

const steps = [
  { step: '1', title: 'Open the Cover', description: 'Create your shared diary and set your anniversary as page one.', icon: BookOpen },
  { step: '2', title: 'Share the Pen', description: 'Send a special invite code so your partner can co-author with you.', icon: PenLine },
  { step: '3', title: 'Fill the Pages', description: 'Pin your polaroids, jot down inside jokes, and build your story.', icon: Camera },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [subtitleIndex, setSubtitleIndex] = useState(0);
  const subtitles = [
    "Your love story, beautifully documented.",
    "A shared diary for the two of you.",
    "Every moment, preserved forever.",
    "Your relationship's home on the web.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [subtitles.length]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#faf8f5]">
      <RomanticBackground />

      {/* Paper Texture */}
      <div className="absolute inset-0 opacity-[0.4] pointer-events-none mix-blend-multiply" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)'/%3E%3C/svg%3E")`
      }} />

      {/* Floating Hearts */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {HEARTS_CONFIG.map((heart) => (
          <FloatingPaperHeart key={heart.id} x={heart.x} delay={heart.delay} size={heart.size} rotate={heart.rotate} />
        ))}
      </div>

      {/* ========== HERO SECTION ========== */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center py-20 px-4 sm:px-6">
        <div className="w-full max-w-7xl mx-auto flex-1 flex items-center">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center w-full">

            {/* Left Polaroids */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="hidden md:flex md:col-span-3 flex-col items-end gap-12 pt-10"
            >
              <Polaroid image="/dashboard.jpg" caption="Our timeline" rotation={-6} tapeColor="bg-rose-100/80" tapeRotate="-rotate-3" className="w-full max-w-60 -translate-x-4" />
              <Polaroid image="/dashboard2.jpg" caption="Bucket list" rotation={4} tapeColor="bg-blue-100/80" tapeRotate="rotate-2" className="w-full max-w-55 translate-x-4" />
            </motion.div>

            {/* Center Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="col-span-1 md:col-span-6 flex justify-center relative"
            >
              <div className="bg-[#fffaf6] p-10 sm:p-14 w-full max-w-xl mx-auto shadow-2xl border border-gray-200 relative transform rotate-1 transition-transform hover:rotate-0 duration-500">
                <WashiTape rotate="rotate-2" color="bg-red-100/60" className="left-1/2 -translate-x-1/2 -top-4 w-32" />
                <WashiTape rotate="-rotate-3" color="bg-amber-100/60" className="right-[-20px] top-10 w-20" />
                <WashiTape rotate="rotate-6" color="bg-blue-100/60" className="left-[-20px] bottom-20 w-16" />

                <div className="text-center relative z-10 flex flex-col items-center">
                  <motion.div animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }} transition={{ duration: 6, repeat: Infinity }} className="mb-6 relative">
                    <div className="absolute inset-0 bg-rose-200/30 rounded-full blur-2xl" />
                    <img src="/favicon.svg" alt="LogOfUs" className="w-20 h-20 md:w-24 md:h-24 mx-auto relative z-10" style={{ filter: 'drop-shadow(0 8px 20px rgba(244,114,182,0.4))' }} />
                  </motion.div>

                  <h1 className="text-6xl sm:text-7xl lg:text-8xl font-serif font-black tracking-tighter text-gray-900 mb-2 leading-none">LogOfUs</h1>
                  
                  {/* Typing Effect Subtitle */}
                  <div className="h-16 flex items-center justify-center mb-8">
                    <motion.p
                      key={subtitleIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="text-3xl sm:text-4xl font-handwriting text-rose-600 transform -rotate-2"
                    >
                      {subtitles[subtitleIndex]}
                    </motion.p>
                  </div>

                  <div className="flex items-center gap-4 w-full max-w-xs mx-auto mb-8 opacity-60">
                    <div className="h-px bg-gray-400 flex-1" />
                    <Heart className="w-3 h-3 text-gray-400 fill-current" />
                    <div className="h-px bg-gray-400 flex-1" />
                  </div>

                  <p className="text-gray-600 font-serif text-lg leading-relaxed mb-10 px-4">
                    A shared diary for couples. Capture your memories, plan adventures, rate movies, and build your story together—one chapter at a time.
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-10 md:hidden w-full px-2">
                    <Polaroid image="/dashboard.jpg" caption="Timeline" rotation={-4} />
                    <Polaroid image="/dashboard1.jpg" caption="Calendar" rotation={3} />
                  </div>

                  <div className="flex flex-col items-center gap-6 w-full">
                    <motion.button
                      whileHover={{ scale: 1.05, rotate: -1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/register')}
                      className="w-full sm:w-auto px-10 py-4 rounded-sm bg-rose-500 text-white font-handwriting text-3xl shadow-[0_4px_15px_rgba(225,29,72,0.3)] hover:bg-rose-600 transition-all flex items-center justify-center gap-3"
                    >
                      <PenLine className="w-5 h-5 mb-1" /> Start Writing
                    </motion.button>

                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-2">
                      <button onClick={() => navigate('/login')} className="font-handwriting text-2xl text-gray-600 hover:text-gray-900 border-b border-transparent hover:border-gray-400 transition-colors flex items-center gap-2">
                        Open your diary <ArrowRight className="w-4 h-4" />
                      </button>
                      <span className="hidden sm:block text-gray-300">•</span>
                      <button onClick={() => navigate('/join')} className="font-handwriting text-2xl text-rose-500 hover:text-rose-700 border-b border-transparent hover:border-rose-300 transition-colors">
                        Have an invite code?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Polaroids */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="hidden md:flex md:col-span-3 flex-col items-start gap-12 pt-10"
            >
              <Polaroid image="/dashboard1.jpg" caption="Shared calendar" rotation={5} tapeColor="bg-yellow-100/80" tapeRotate="rotate-3" className="w-full max-w-60 translate-x-2" />
              <Polaroid image="/dashboard3.jpg" caption="Watchlists" rotation={-5} tapeColor="bg-rose-100/80" tapeRotate="-rotate-4" className="w-full max-w-55 -translate-x-6" />
            </motion.div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 text-gray-400 flex flex-col items-center gap-2">
          <span className="font-handwriting text-xl">Discover</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </section>

      {/* ========== DIARY ONBOARDING (STEPS) ========== */}
      <section className="relative z-10 py-20 px-4 sm:px-6 bg-white/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Write Your First Chapter</h2>
            <p className="text-gray-500 font-serif text-lg">Every great love story starts with a blank page.</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15 }}
                  className="relative group mt-6"
                >
                  {/* Notebook Paper Card */}
                  <div 
                    className="pt-12 pb-10 px-8 bg-[#fffcf9] rounded-sm shadow-sm hover:shadow-md transition-all relative overflow-hidden border border-gray-100"
                    style={{ 
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #f0e6e0 32px)',
                      backgroundPositionY: '12px'
                    }}
                  >
                    {/* Red margin line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-rose-300/50" />
                    
                    {/* Content shifted past the margin */}
                    <div className="pl-4 text-center">
                      <div className="w-12 h-12 mx-auto mb-4 bg-transparent flex items-center justify-center transform -rotate-3">
                        <Icon className="w-8 h-8 text-gray-700 opacity-80" />
                      </div>
                      <h3 className="font-handwriting text-3xl text-gray-800 mb-2 transform -rotate-1">{step.title}</h3>
                      <p className="text-gray-600 font-serif text-sm leading-relaxed bg-white/60 inline-block px-2">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Handwritten Step Number */}
                  <div className="absolute -top-6 -left-2 font-handwriting text-5xl text-rose-400 opacity-60 transform -rotate-12 z-10">
                    #{step.step}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== HONEST TRUST BANNER ========== */}
      <section className="relative z-10 py-6 border-y border-gray-200 bg-[#fefdfb]/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row justify-center items-center gap-8 text-center sm:text-left">
          <div className="flex items-center gap-3 text-gray-600">
            <Lock className="w-5 h-5 text-rose-400" />
            <span className="font-serif">Just Between You Two</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="flex items-center gap-3 text-gray-600">
            <EyeOff className="w-5 h-5 text-blue-400" />
            <span className="font-serif">No Public Feeds or Followers</span>
          </div>
          <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-gray-300" />
          <div className="flex items-center gap-3 text-gray-600">
            <HeartHandshake className="w-5 h-5 text-amber-400" />
            <span className="font-serif">Made for Couples</span>
          </div>
        </div>
      </section>

      {/* ========== FEATURES SECTION (STICKY NOTES) ========== */}
      <section className="relative z-10 pt-24 pb-16 px-4 sm:px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="mb-16">
            <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4">Everything You Need</h2>
            <p className="text-gray-500 font-serif text-lg max-w-xl mx-auto">
              Replace scattered texts and forgotten notes. Build your legacy in one beautiful, shared space.
            </p>
          </motion.div>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-14 px-4"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className={`relative p-8 pt-10 shadow-[2px_6px_15px_rgba(0,0,0,0.08)] hover:shadow-[5px_12px_25px_rgba(0,0,0,0.12)] transition-all duration-300 text-center group ${feature.noteColor} transform ${feature.rotation} hover:rotate-0 hover:scale-105 z-10 hover:z-20`}
                  style={{ borderRadius: '2px 2px 20px 2px' }}
                >
                  {/* The Pushpin */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 z-20">
                    <div className={`w-5 h-5 rounded-full ${feature.pinColor} mx-auto shadow-[0_4px_6px_rgba(0,0,0,0.4)] border border-black/10 relative`}>
                      {/* Pin highlight for 3D effect */}
                      <div className="absolute top-1 left-1 w-1.5 h-1.5 bg-white/60 rounded-full" />
                    </div>
                  </div>

                  <div className="flex flex-col items-center">
                    <Icon className="w-8 h-8 mb-4 text-gray-700/70" />
                    <h3 className="font-handwriting text-3xl text-gray-800 mb-3">{feature.title}</h3>
                    <p className="text-gray-700/80 font-serif text-sm leading-relaxed">{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== OUR PROMISE SECTION ========== */}
      <section className="relative z-10 py-24 px-4 sm:px-6 border-t border-gray-200 bg-[#fffcf9]">
        <div className="max-w-4xl mx-auto relative">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white p-10 md:p-16 shadow-xl border border-gray-100 rounded-sm relative transform -rotate-1"
          >
            <WashiTape color="bg-rose-100/80" className="top-[-20px] left-1/2 -translate-x-1/2 w-40" rotate="rotate-1" />
            
            <div className="text-center space-y-6">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">Built for love, not for likes.</h2>
              
              <div className="space-y-4 font-serif text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                <p>
                  In a world of public feeds and fleeting stories, we wanted to create something different. A quiet corner of the internet just for the two of you.
                </p>
                <p>
                  LogOfUs is a blank canvas for your inside jokes, your messy polaroids, your grand adventures, and your quiet Sundays. No algorithms, no followers—just your memories, preserved forever.
                </p>
              </div>

              <div className="pt-8 flex flex-col items-center">
                <p className="font-handwriting text-3xl text-gray-800 mb-2">Yours truly,</p>
                <p className="font-serif font-bold text-rose-500">— LogOfUs</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="relative z-10 bg-[#f8f5f0] border-t border-gray-200 pt-20 pb-8 px-4 sm:px-6 overflow-hidden">
        {/* Decorative elements in footer */}
        <div className="absolute top-0 left-10 w-full h-1 bg-linear-to-r from-transparent via-rose-200 to-transparent opacity-50" />
        <WashiTape color="bg-rose-200/40" rotate="-rotate-2" className="top-[-10px] right-[10%] w-24" />
        <FloatingPaperHeart x="80%" size={16} delay={2} />

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
            
            {/* Brand & Story */}
            <div className="md:col-span-5 pr-0 md:pr-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center shadow-sm">
                  <img src="/favicon.svg" alt="LogOfUs" className="w-6 h-6" />
                </div>
                <span className="font-serif text-2xl font-black text-gray-900 tracking-tight">LogOfUs</span>
              </div>
              <p className="text-gray-500 font-serif leading-relaxed mb-6">
                A digital diary built for couples who want to remember the little things. Safe, private, and beautifully yours.
              </p>
              {/* Privacy note */}
              <p className="text-xs text-gray-400 font-serif italic mb-4">
                Please keep our community safe. Do not upload private or explicit photos.
              </p>
            </div>

            {/* Navigation */}
            <div className="md:col-span-3">
              <h4 className="font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-rose-400" /> Contents
              </h4>
              <ul className="space-y-4">
                <li><button onClick={() => navigate('/register')} className="font-serif text-gray-500 hover:text-rose-500 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> Create Diary</button></li>
                <li><button onClick={() => navigate('/login')} className="font-serif text-gray-500 hover:text-rose-500 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> Open Diary (Login)</button></li>
                <li><button onClick={() => navigate('/join')} className="font-serif text-gray-500 hover:text-rose-500 transition-colors flex items-center gap-2 group"><ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" /> Use Invite Code</button></li>
              </ul>
            </div>

            {/* Contact / Support */}
            <div className="md:col-span-4">
              <h4 className="font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400" /> Say Hello
              </h4>
              <p className="text-gray-500 font-serif text-sm mb-6">
                We're building this for couples like you. Got a feature request or found a bug? Let us know.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => navigate('/contact')}
                  className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-gray-700 font-serif rounded-sm shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  <PenLine className="w-4 h-4" /> Send us a note
                </button>
                <p className="text-gray-400 font-serif text-sm">
                  Or email: <a href="mailto:yurimauricio0404@gmail.com" className="text-rose-500 hover:underline">yurimauricio0404@gmail.com</a>
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8 flex flex-col items-center justify-center gap-3 text-center">
            <div className="flex items-center justify-center gap-2 font-handwriting text-2xl text-gray-400 italic mb-2">
              <span>Built with</span>
              <Heart className="w-5 h-5 text-rose-400 fill-current" />
              <span>for Shaira Danica.</span>
            </div>
            <p className="text-gray-400 font-serif text-sm">
              © {new Date().getFullYear()} LogOfUs. All rights reserved.
            </p>
            
            {/* ========== SUBTLE DEVELOPMENT NOTICE ========== */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-red-300 hover:text-amber-400 transition-colors duration-300">
              <AlertTriangle className="w-3 h-3" />
              <span className="font-serif">Currently in development — you may encounter bugs</span>
            </div>
          </div>
        </div>
      </footer>
      
      {/* PWA Smart Install Banner */}
      <InstallPWA />
    </div>
  );
};

export default LandingPage;