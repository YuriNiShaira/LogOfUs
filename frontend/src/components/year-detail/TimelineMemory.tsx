import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MapPin, Star, Calendar, Clock, Camera } from 'lucide-react';
import type { Memory } from './utils';
import { getMemoryTypeIcon, formatDate } from './utils';

interface TimelineMemoryProps {
  memory: Memory;
  index: number;
  isEven: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

// Helper for the scrapbook tape
const WashiTape = ({ rotate = '-rotate-2', color = 'bg-white/50' }) => (
  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 ${color} backdrop-blur-md shadow-sm border border-black/5 ${rotate} z-10`} />
);

const TimelineMemory: React.FC<TimelineMemoryProps> = ({
  memory,
  index,
  isEven,
  onView,
  onEdit,
  onDelete,
}) => {
  const memoryIcon = getMemoryTypeIcon(memory.memory_type);
  const formattedDate = formatDate(memory.date);
  const fullDate = new Date(memory.date);
  
  // Create a slightly randomized rotation for that messy scrapbook feel
  const paperRotation = isEven ? 'rotate-1' : '-rotate-1';
  const polaroidRotation = isEven ? '-rotate-2' : 'rotate-2';

  return (
    <motion.div
      initial={{ opacity: 0, x: isEven ? -20 : 20, y: 30 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", stiffness: 100 }}
      className="relative mb-24 group"
    >
      {/* Hand-drawn dashed timeline connection line */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-0 h-full border-l-2 border-dashed border-gray-300 -z-10 mt-10" />
      
      {/* Scrapbook pinned Date marker */}
      <motion.div 
        className="absolute left-1/2 transform -translate-x-1/2 -top-4 z-20"
        whileHover={{ scale: 1.1, rotate: 5 }}
      >
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-[#faf8f5] shadow-[0_2px_8px_rgba(0,0,0,0.1)] border-2 border-gray-200 flex items-center justify-center transform rotate-3">
            {/* The "Pin" */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-red-400 shadow-sm border border-red-500 z-30" />
            <Calendar className="w-5 h-5 text-gray-600 mt-1" />
          </div>
        </div>
      </motion.div>
      
      {/* Month indicator sticker */}
      <div className={`absolute ${isEven ? 'right-[54%]' : 'left-[54%]'} top-1 whitespace-nowrap z-20 force-light-theme`}>
        <div className="inline-block px-3 py-1 bg-yellow-100 shadow-sm border border-yellow-200 font-handwriting text-gray-700 text-xl transform -rotate-2">
          {fullDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>
      
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-10 items-center pt-16`}>
        {/* Content Side - Notebook Paper */}
        <div className={`${isEven ? 'md:order-1' : 'md:order-2'} pl-0 md:pl-0 z-10`}>
          <div className={`w-full max-w-lg ${isEven ? 'md:ml-auto md:pr-10' : 'md:mr-auto md:pl-10'}`}>
            
            {/* Added force-light-theme here */}
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className={`bg-[#faf8f5] p-6 sm:p-8 rounded-sm shadow-md border-l-4 border-red-300 relative transform ${paperRotation} force-light-theme`}
              style={{
                backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #e5e7eb 31px, #e5e7eb 32px)',
                backgroundAttachment: 'local'
              }}
            >
              <WashiTape rotate={isEven ? '-rotate-3' : 'rotate-2'} color="bg-blue-100/50" />

              {/* Memory Type Badge (Sticker) */}
              <div className="inline-flex items-center gap-2 px-2 py-1 bg-white border border-gray-200 shadow-sm rounded-sm mb-4 transform -rotate-1">
                <span className="text-lg">{memoryIcon}</span>
                <span className="text-sm font-handwriting text-gray-700 tracking-wide">
                  {memory.memory_type}
                </span>
              </div>
              
              {/* Title */}
              <h3 className="text-3xl md:text-4xl font-handwriting text-gray-800 mb-2 -mt-2 leading-8">
                {memory.title}
              </h3>
              
              {/* Meta Date & Favorite */}
              <div className="flex items-center gap-2 text-gray-600 font-handwriting text-xl mb-4 leading-8">
                <Clock className="w-4 h-4" />
                <span>{formattedDate}</span>
                {memory.is_favorite && (
                  <>
                    <span className="mx-1">•</span>
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-yellow-600">Favorite</span>
                  </>
                )}
              </div>
              
              {/* Location Stamp */}
              {memory.location && (
                <div className="flex items-center gap-2 mb-2 bg-red-50/50 w-max px-2 border border-red-100 border-dashed transform rotate-1">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-gray-700 font-handwriting text-xl">{memory.location}</span>
                </div>
              )}
              
              {/* Description */}
              <p className="text-gray-800 font-handwriting text-2xl leading-8 line-clamp-4 -mt-1">
                {memory.description}
              </p>
              
              {/* Quote Note */}
              {memory.favorite_quote && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 shadow-sm transform rotate-1">
                  <p className="text-gray-700 font-handwriting text-2xl text-center">
                    "{memory.favorite_quote}"
                  </p>
                </div>
              )}
              
              {/* Action Buttons - Label style */}
              <div className="flex flex-wrap gap-4 mt-6 pt-2">
                <button
                  onClick={onView}
                  className="font-handwriting text-2xl text-blue-600 hover:text-blue-800 border-b-2 border-blue-300 transition-colors"
                >
                  Read Full Story
                </button>
                <button
                  onClick={onEdit}
                  className="font-handwriting text-2xl text-gray-500 hover:text-gray-700 border-b-2 border-gray-300 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="font-handwriting text-2xl text-red-500 hover:text-red-700 border-b-2 border-red-300 transition-colors"
                >
                  Tear out
                </button>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Image Side - Polaroid */}
        <div className={`${isEven ? 'md:order-2' : 'md:order-1'} z-10`}>
          {/* Added force-light-theme here */}
          <motion.div
            whileHover={{ scale: 1.03, rotate: 0, zIndex: 30 }}
            className={`relative bg-white p-4 pb-16 shadow-[0_15px_35px_rgba(0,0,0,0.1)] border border-gray-100 max-w-sm mx-auto cursor-pointer transform ${polaroidRotation} transition-all duration-300 force-light-theme`}
            onClick={onView}
          >
            <WashiTape rotate={isEven ? 'rotate-2' : '-rotate-3'} color="bg-pink-100/70" />
            
            {memory.image ? (
              <div className="bg-gray-100 aspect-square overflow-hidden border border-gray-200">
                <img 
                  src={memory.image} 
                  alt={memory.title} 
                  className="w-full h-full object-cover filter contrast-[1.05] sepia-[.1]"
                />
              </div>
            ) : (
              <div className="bg-[#f0ece1] aspect-square flex flex-col items-center justify-center border border-dashed border-gray-300">
                <Heart className="w-12 h-12 text-gray-300 mb-2" />
                <p className="font-handwriting text-2xl text-gray-500">Waiting for a photo...</p>
                <div className="mt-4 p-2 rounded-full bg-white/50 border border-gray-200 shadow-sm">
                  <Camera className="w-5 h-5 text-gray-600" />
                </div>
              </div>
            )}
            
            {/* Polaroid caption area */}
            <div className="absolute bottom-4 left-0 w-full text-center px-4">
              <p className="font-handwriting text-3xl text-gray-800 truncate">
                {memory.title}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TimelineMemory;