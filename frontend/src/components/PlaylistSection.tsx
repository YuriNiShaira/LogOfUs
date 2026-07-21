import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Music, Plus, Edit, Trash2, X, CheckCircle,
  Star, Play, Disc, Loader2
} from 'lucide-react';
import { api } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

interface SongRecommendation {
  id: number;
  title: string;
  artist: string;
  creator_display: string;
  youtube_link: string;
  spotify_link: string;
  is_listened: boolean;
  listened_date: string | null;
  rating: number;
  mood: string;
  mood_display: string;
  created_at: string;
  year: number | null;
}

interface PlaylistStats {
  total_songs: number;
  listened_count: number;
  my_recommendations: number;
  shaira_recommendations: number;
  average_rating: number;
}

interface PlaylistSectionProps {
  yearId?: number;
  yearNumber?: number;
}

const MOOD_CHOICES = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'sad', label: 'Sad' },
  { value: 'chill', label: 'Chill' },
  { value: 'other', label: 'Other' },
];

// Naka-fix sa puti/off-white ang tape para malinis
const WashiTape = ({ rotate = '-rotate-2' }) => (
  <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 bg-white/90 backdrop-blur-md shadow-sm border border-black/10 ${rotate} z-10`} />
);

// Vibrant card colors based on mood
const getMoodColors = (mood: string, isDark: boolean) => {
  switch (mood) {
    case 'romantic':
      return isDark ? 'bg-rose-900/40 border-rose-700' : 'bg-rose-100 border-rose-300';
    case 'sad':
      return isDark ? 'bg-blue-900/40 border-blue-700' : 'bg-blue-100 border-blue-300';
    case 'chill':
      return isDark ? 'bg-emerald-900/40 border-emerald-700' : 'bg-emerald-100 border-emerald-300';
    default: // 'other'
      return isDark ? 'bg-amber-900/40 border-amber-700' : 'bg-amber-100 border-amber-300';
  }
};

const PlaylistSection: React.FC<PlaylistSectionProps> = ({ yearId, yearNumber }) => {
  const { theme } = useTheme();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSong, setEditingSong] = useState<SongRecommendation | null>(null);
  const [filterListened, setFilterListened] = useState<'all' | 'listened' | 'unlistened'>('all');
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    youtube_link: '',
    spotify_link: '',
    is_listened: false,
    rating: 0,
    mood: 'other',
  });

  const queryClient = useQueryClient();
  const isDark = theme === 'dark';

  // Query for songs
  const { data: songs, isLoading: isLoadingSongs } = useQuery<SongRecommendation[]>({
    queryKey: ['songRecommendations', yearId || 'all', filterListened],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (yearId) params.append('year', String(yearId));
        if (filterListened !== 'all') params.append('is_listened', String(filterListened === 'listened'));
        
        const url = `/song-recommendations/${params.toString() ? '?' + params.toString() : ''}`;
        const response = await api.get(url);
        const data = response.data;
        return Array.isArray(data) ? data : data.results || [];
      } catch (error: any) {
        console.error('Error fetching songs:', error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  // Query for stats
  const { data: stats } = useQuery<PlaylistStats>({
    queryKey: ['playlistStats', yearId || 'all'],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        if (yearId) params.append('year_id', String(yearId));
        const url = `/song-recommendations/stats/${params.toString() ? '?' + params.toString() : ''}`;
        const response = await api.get(url);
        return {
          total_songs: response.data.total_songs || 0,
          listened_count: response.data.listened_count || 0,
          my_recommendations: response.data.my_recommendations || 0,
          shaira_recommendations: response.data.shaira_recommendations || 0,
          average_rating: response.data.average_rating || 0,
        };
      } catch (error: any) {
        return { total_songs: 0, listened_count: 0, my_recommendations: 0, shaira_recommendations: 0, average_rating: 0 };
      }
    },
    retry: 1,
    staleTime: 30000,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const payload: any = { ...data, is_listened: false };
      if (yearId) payload.year = yearId;
      const response = await api.post('/song-recommendations/', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations'] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats'] });
      toast.success('Song added to our mixtape 🎵');
      closeModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to add song.'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const payload: any = { ...data };
      if (yearId) payload.year = yearId;
      payload.rating = (data.rating >= 1 && data.rating <= 5) ? data.rating : null;
      const response = await api.put(`/song-recommendations/${id}/`, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations'] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats'] });
      toast.success('Song updated ✨');
      closeModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Failed to update song.'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await api.delete(`/song-recommendations/${id}/`); },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations'] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats'] });
      toast.success('Song removed');
    },
  });

  const toggleListenedMutation = useMutation({
    mutationFn: async ({ id, is_listened }: { id: number; is_listened: boolean }) => {
      const response = await api.patch(`/song-recommendations/${id}/`, { 
        is_listened,
        listened_date: is_listened ? new Date().toISOString().split('T')[0] : null
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['songRecommendations'] });
      queryClient.invalidateQueries({ queryKey: ['playlistStats'] });
      toast.success(variables.is_listened ? 'Marked as listened 🎧' : 'Marked as unlistened');
    },
  });

  const handleEdit = (song: SongRecommendation) => {
    setEditingSong(song);
    setFormData({
      title: song.title, artist: song.artist,
      youtube_link: song.youtube_link || '', spotify_link: song.spotify_link || '',
      is_listened: song.is_listened, rating: song.rating || 0, mood: song.mood || 'other',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSong(null);
    setFormData({ title: '', artist: '', youtube_link: '', spotify_link: '', is_listened: false, rating: 0, mood: 'other' });
  };

  const songList = Array.isArray(songs) ? songs : [];

  return (
    <div className={`space-y-10 max-w-6xl mx-auto p-4 sm:p-8 rounded-3xl min-h-screen transition-colors duration-300 ${
      isDark ? 'bg-slate-900/40 text-slate-100' : 'bg-amber-50/40 text-gray-800'
    }`}>
      
      {/* HEADER */}
      <header className={`flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-dashed pb-6 ${
        isDark ? 'border-slate-700' : 'border-gray-300'
      }`}>
        <div>
          <h2 className="text-4xl font-serif tracking-tight font-bold">
            Our Mixtape {yearNumber ? `Vol. ${yearNumber}` : ''}
          </h2>
          <p className={`mt-1 font-medium text-lg ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            The songs that scored our favorite moments
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className={`px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all font-semibold flex items-center gap-2 ${
            isDark ? 'bg-pink-600 text-white hover:bg-pink-500' : 'bg-pink-500 text-white hover:bg-pink-600'
          }`}
        >
          <Plus className="w-5 h-5" /> Add a Song
        </motion.button>
      </header>

      {/* STATS */}
      {stats && (
        <div className="flex flex-wrap gap-4">
          {[
            { label: 'Total Tracks', value: stats.total_songs || 0, bg: isDark ? 'bg-slate-800' : 'bg-white' },
            { label: 'Listened To', value: stats.listened_count || 0, bg: isDark ? 'bg-slate-800' : 'bg-white' },
          ].map((stat, i) => (
            <motion.div 
              key={i} whileHover={{ y: -5 }}
              className={`relative ${stat.bg} p-6 rounded-2xl shadow-sm border flex-1 min-w-[140px] text-center ${
                isDark ? 'border-slate-700' : 'border-gray-100'
              }`}
            >
              <p className="text-4xl font-handwriting mb-1">{stat.value}</p>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-gray-400'}`}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      {/* FILTERS */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
        <span className="font-handwriting text-2xl opacity-80">Filter:</span>
        <div className={`flex p-1 rounded-xl gap-1 ${isDark ? 'bg-slate-800' : 'bg-white/60'} border ${isDark ? 'border-slate-700' : 'border-gray-200'}`}>
          {[
            { id: 'all', label: 'All Tracks' },
            { id: 'listened', label: 'Heard It' },
            { id: 'unlistened', label: 'New to Me' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterListened(tab.id as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterListened === tab.id 
                  ? (isDark ? 'bg-slate-600 text-white shadow' : 'bg-white shadow text-gray-800')
                  : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-gray-500 hover:text-gray-800')
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* LOADING & EMPTY STATES */}
      {isLoadingSongs ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className={`w-10 h-10 animate-spin ${isDark ? 'text-pink-500' : 'text-pink-400'}`} />
        </div>
      ) : songList.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center space-y-4 opacity-60">
          <Disc className="w-16 h-16 mb-2" />
          <h4 className="text-3xl font-handwriting">The mixtape is empty</h4>
          <p className="font-medium text-lg">Add a song that reminds you of us.</p>
        </motion.div>
      ) : (
        /* TRACK LIST */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {songList.map((song, idx) => {
              const cardClass = getMoodColors(song.mood, isDark);

              return (
                <motion.div
                  key={song.id} layout
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
                  className={`group relative p-6 pt-8 rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col ${
                    cardClass
                  } ${song.is_listened ? 'opacity-70 grayscale-[30%]' : ''}`}
                >
                  {/* Lahat Tape na lang, pero alternating ang rotation */}
                  <WashiTape rotate={idx % 2 === 0 ? 'rotate-2' : '-rotate-3'} />
                  
                  {/* ACTION BUTTONS */}
                  <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                    <button onClick={() => handleEdit(song)} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-slate-700/80 hover:bg-blue-900/80 text-blue-400' : 'bg-white/80 hover:bg-blue-50 text-blue-600'}`}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(song.id)} className={`p-2 rounded-full transition-colors ${isDark ? 'bg-slate-700/80 hover:bg-red-900/80 text-red-400' : 'bg-white/80 hover:bg-red-50 text-red-600'}`}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1 mb-4">
                    <h3 className={`font-handwriting text-3xl leading-tight line-clamp-2 ${song.is_listened ? 'line-through decoration-gray-400/50' : ''}`}>
                      {song.title}
                    </h3>
                    <p className={`font-handwriting text-2xl mt-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                      by {song.artist}
                    </p>
                  </div>

                  <div className="flex flex-col gap-4 mt-auto">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        Added by <span className={isDark ? 'text-pink-400' : 'text-pink-600'}>{song.creator_display || 'Unknown'}</span>
                      </span>
                      {song.mood && (
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                          isDark ? 'bg-black/20 text-slate-200' : 'bg-white/60 text-gray-700'
                        }`}>
                          {song.mood_display || song.mood}
                        </span>
                      )}
                    </div>

                    <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-slate-700/50' : 'border-gray-400/30'}`}>
                      <button
                        onClick={() => toggleListenedMutation.mutate({ id: song.id, is_listened: !song.is_listened })}
                        className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                          song.is_listened 
                            ? (isDark ? 'text-emerald-400' : 'text-emerald-700') 
                            : (isDark ? 'text-slate-300 hover:text-white' : 'text-gray-600 hover:text-gray-900')
                        }`}
                      >
                        {song.is_listened ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-dashed border-current opacity-50" />}
                        {song.is_listened ? 'Listened' : 'Mark Listened'}
                      </button>

                      <div className="flex gap-3">
                        {song.youtube_link && (
                          <a href={song.youtube_link} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#FF0000]" title="YouTube">
                            <Play className="w-5 h-5 fill-current" />
                          </a>
                        )}
                        {song.spotify_link && (
                          <a href={song.spotify_link} target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform text-[#1DB954]" title="Spotify">
                            <Music className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {song.rating > 0 && (
                      <div className="flex gap-1 justify-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < song.rating ? 'text-amber-400 fill-current' : (isDark ? 'text-slate-700' : 'text-gray-300')}`} />
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }} 
              animate={{ scale: 1, y: 0, opacity: 1 }} 
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className={`relative w-full max-w-lg shadow-2xl overflow-hidden rounded-2xl ${
                isDark ? 'bg-slate-900 text-slate-100 border border-slate-700' : 'bg-white text-gray-800'
              }`}
            >
              <div className={`absolute top-0 bottom-0 left-8 w-[2px] ${isDark ? 'bg-slate-700' : 'bg-red-200/60'}`} />

              <div className="px-12 py-8 relative">
                <button onClick={closeModal} className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${isDark ? 'hover:bg-slate-800' : 'hover:bg-gray-100'}`}>
                  <X className="w-5 h-5" />
                </button>
                
                <h2 className="text-4xl font-handwriting mb-6">
                  {editingSong ? 'Rewrite Track' : 'New Song'}
                </h2>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  editingSong ? updateMutation.mutate({ id: editingSong.id, data: formData }) : createMutation.mutate(formData);
                }} className="space-y-5">
                  
                  <div className="space-y-4">
                    <input type="text" required placeholder="Song Title..." value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full bg-transparent border-b-2 font-handwriting text-3xl py-2 outline-none transition-colors ${
                        isDark ? 'border-slate-700 focus:border-pink-500 placeholder:text-slate-600' : 'border-gray-200 focus:border-pink-400 placeholder:text-gray-400'
                      }`} />
                    
                    <input type="text" required placeholder="Artist..." value={formData.artist} onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                      className={`w-full bg-transparent border-b-2 font-handwriting text-3xl py-2 outline-none transition-colors ${
                        isDark ? 'border-slate-700 focus:border-pink-500 placeholder:text-slate-600' : 'border-gray-200 focus:border-pink-400 placeholder:text-gray-400'
                      }`} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Vibe / Mood</label>
                      <select value={formData.mood} onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                        className={`w-full p-2.5 rounded-lg border outline-none cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'}`}>
                        {MOOD_CHOICES.map((mood) => (
                          <option key={mood.value} value={mood.value}>{mood.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className={`text-xs font-bold uppercase tracking-wider block ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Media Links (Optional)</label>
                    <div className="relative">
                      <Play className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                      <input type="url" placeholder="YouTube URL" value={formData.youtube_link} onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-colors ${
                          isDark ? 'bg-slate-800 border-slate-700 focus:border-red-500/50' : 'bg-gray-50 border-gray-200 focus:border-red-400/50'
                        }`} />
                    </div>
                    <div className="relative">
                      <Music className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-gray-400'}`} />
                      <input type="url" placeholder="Spotify URL" value={formData.spotify_link} onChange={(e) => setFormData({ ...formData, spotify_link: e.target.value })}
                        className={`w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-colors ${
                          isDark ? 'bg-slate-800 border-slate-700 focus:border-emerald-500/50' : 'bg-gray-50 border-gray-200 focus:border-emerald-400/50'
                        }`} />
                    </div>
                  </div>

                  {editingSong && (
                    <div className={`p-4 rounded-xl border ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-amber-50/50 border-amber-200/50'}`}>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                          formData.is_listened ? 'bg-emerald-500 border-emerald-500' : (isDark ? 'border-slate-600' : 'border-gray-300')
                        }`}>
                          {formData.is_listened && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" checked={formData.is_listened} onChange={(e) => setFormData({ ...formData, is_listened: e.target.checked })} />
                        <span className="font-handwriting text-2xl mt-1">We've listened to this</span>
                      </label>
                      
                      {formData.is_listened && (
                        <div className="flex items-center gap-4 pt-4 mt-2 border-t border-dashed border-gray-300/50">
                          <span className="text-sm font-semibold">Rating:</span>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map((r) => (
                              <button key={r} type="button" onClick={() => setFormData({ ...formData, rating: r })}>
                                <Star className={`w-7 h-7 transition-colors ${
                                  formData.rating >= r ? 'text-amber-400 fill-current' : (isDark ? 'text-slate-700 hover:text-slate-600' : 'text-gray-200 hover:text-gray-300')
                                }`} />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className={`w-full mt-4 text-white font-bold py-3 rounded-xl shadow-md transition-colors ${
                      isDark ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-500 hover:bg-pink-600'
                    }`}>
                    {editingSong ? 'Save Changes' : 'Add to Mixtape'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaylistSection;