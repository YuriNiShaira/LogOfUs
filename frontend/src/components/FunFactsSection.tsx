import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, MapPin, Heart, Edit, Save,
  Camera, Utensils, Tv,
} from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface FunFacts {
  id: number;
  favorite_food: string;
  favorite_anime: string;
  song_of_the_year: string;
  best_moment: string;
  inside_jokes: string;
  places_visited: string;
  favorite_movie: string;
  favorite_activity: string;
  memorable_quote: string;
  highlights: string;
  year: number;
}

interface FunFactsSectionProps {
  yearId: number;
  yearNumber: number;
}

// Helper component for the "tape" effect on sticky notes
const WashiTape = ({ rotate = '-rotate-2' }) => (
  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-6 bg-white/40 backdrop-blur-md shadow-sm border border-white/20 ${rotate} z-10`} />
);

const FunFactsSection: React.FC<FunFactsSectionProps> = ({ yearId, yearNumber }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<FunFacts>>({});

  const queryClient = useQueryClient();

  const { data: funFacts, isLoading } = useQuery<FunFacts>({
    queryKey: ['funFacts', yearId],
    queryFn: async () => {
      const response = await api.get(`/fun-facts/by_year/?year_id=${yearId}`);
      return response.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<FunFacts>) => {
      if (funFacts?.id) {
        const response = await api.put(`/fun-facts/${funFacts.id}/`, data);
        return response.data;
      } else {
        const response = await api.post('/fun-facts/', { ...data, year: yearId });
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['funFacts', yearId] });
      toast.success('Diary page updated! 🎉');
      setIsEditing(false);
    },
    onError: () => {
      toast.error('Failed to save. Please try again.');
    },
  });

  const handleEditClick = () => {
    setFormData(funFacts || {});
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({});
    setIsEditing(false);
  };

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const isDirty = useMemo(() => {
    if (!funFacts && Object.keys(formData).length > 0) return true;
    return JSON.stringify({ ...funFacts, ...formData }) !== JSON.stringify(funFacts);
  }, [formData, funFacts]);

  // Updated with paper colors and slight rotations for that messy corkboard look
  const factCards = [
    { icon: Utensils, label: 'Fun Fact #1', key: 'favorite_food' as keyof FunFacts, bg: 'bg-yellow-100', rotate: '-rotate-2', placeholder: 'Share some fun facts' },
    { icon: Tv, label: 'Fun Fact #2', key: 'favorite_anime' as keyof FunFacts, bg: 'bg-pink-100', rotate: 'rotate-1', placeholder: 'Share some fun facts.' },
    { icon: Music, label: 'Fun Fact #3', key: 'song_of_the_year' as keyof FunFacts, bg: 'bg-blue-100', rotate: '-rotate-1', placeholder: 'Share some fun facts' },
    { icon: Camera, label: 'Fun Fact #4', key: 'favorite_movie' as keyof FunFacts, bg: 'bg-green-100', rotate: 'rotate-2', placeholder: 'Share some fun facts' },
    { icon: Heart, label: 'Fun Fact #5', key: 'favorite_activity' as keyof FunFacts, bg: 'bg-purple-100', rotate: '-rotate-3', placeholder: 'Share some fun facts' },
    { icon: MapPin, label: 'Fun Fact #6', key: 'places_visited' as keyof FunFacts, bg: 'bg-orange-100', rotate: 'rotate-1', placeholder: 'Share some fun facts' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400" />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto p-4 sm:p-8 bg-amber-50/30 rounded-3xl min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b-2 border-dashed border-gray-300 pb-6">
        <div>
          <h2 className="text-4xl font-serif text-gray-800 tracking-tight">
            Chapter {yearNumber} ✨
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            Flipping through our favorite memories...
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.button
              key="edit-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleEditClick}
              className="bg-white border-2 border-gray-200 text-gray-700 px-6 py-2 rounded-lg shadow-sm hover:shadow-md transition-all font-medium flex items-center gap-2"
            >
              <Edit className="w-4 h-4" /> Pick up pen
            </motion.button>
          ) : (
            <motion.div key="action-btns" className="flex gap-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <button onClick={handleCancel} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saveMutation.isPending || !isDirty}
                className="bg-pink-400 hover:bg-pink-500 text-white px-6 py-2 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 transition-all font-medium flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Page'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky Notes Grid (Larger sizes & 3-column layout) */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8 pt-4">
        {factCards.map((card, idx) => {
          const Icon = card.icon;
          const value = formData[card.key] as string || '';
          const displayValue = funFacts?.[card.key] as string || '';

          return (
            <motion.div
              key={card.key}
              initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: card.rotate }}
              transition={{ delay: idx * 0.1, type: "spring" }}
              whileHover={{ scale: 1.02, rotate: 0, zIndex: 20 }}
              className={`relative ${card.bg} w-full sm:w-[calc(50%-1.5rem)] lg:w-[calc(33.333%-2rem)] max-w-85 p-6 rounded-bl-xl shadow-[4px_4px_15px_rgba(0,0,0,0.05)] aspect-square flex flex-col`}
            >
              <WashiTape rotate={idx % 2 === 0 ? 'rotate-2' : '-rotate-3'} />
              
              <div className="flex items-center gap-2 mb-4 mt-2 text-gray-700/70 border-b border-gray-700/10 pb-2">
                <Icon className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider">{card.label}</span>
              </div>
              
              <div className="flex-1 flex items-center justify-center text-center w-full overflow-hidden px-2">
                {isEditing ? (
                  <textarea
                    value={value}
                    onChange={(e) => setFormData(prev => ({ ...prev, [card.key]: e.target.value }))}
                    placeholder={card.placeholder}
                    className="w-full h-full bg-transparent resize-none outline-none text-center text-2xl font-handwriting text-gray-800 placeholder:text-gray-400"
                  />
                ) : (
                  <p className="text-2xl font-handwriting text-gray-800 leading-snug wrap-break-words break-all w-full line-clamp-5">
                    {displayValue || <span className="text-gray-400/60">Empty...</span>}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default FunFactsSection;