import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus, Camera, Coffee, Heart,
} from 'lucide-react';
import { api } from '../services/api';
import CreateMemoryModal from '../components/CreateMemoryModal';
import EditMemoryModal from '../components/EditMemoryModal';
import FunFactsSection from '../components/FunFactsSection';
import MemoryDetailModal from '../components/MemoryDetailModal';
import RomanticBackground from '../components/RomanticBackground';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import EditYearModal from '../components/EditYearModal';
import {
  TimelineSkeleton,
  EmptyMemories,
  ScatteredPolaroidCard,
  MasonryCard,
  TimelineMemory,
  YearHeader,
  YearStats,
  MemoriesControls,
} from '../components/year-detail';
import toast from 'react-hot-toast';

interface Year {
  id: number;
  year_number: number;  
  cover_image?: string;
  description?: string;
}

interface Memory {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string | null;
  memory_type: string;
  is_favorite: boolean;
  location: string;
  favorite_quote?: string;
  year_id: number;
  year: number;
}

type TabType = 'memories' | 'funfacts';
type SortOrder = 'newest' | 'oldest';
type LayoutStyle = 'scattered' | 'timeline' | 'masonry';

const YearDetailPage: React.FC = () => {
  const { yearId } = useParams();
  const navigate = useNavigate();
  const timelineRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<TabType>('memories');
  const [pendingMemoryId, setPendingMemoryId] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [layoutStyle, setLayoutStyle] = useState<LayoutStyle>('timeline');
  const [isCreateMemoryModalOpen, setIsCreateMemoryModalOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMemoryForView, setSelectedMemoryForView] = useState<Memory | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [showReturnToBook, setShowReturnToBook] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [showDeleteYearModal, setShowDeleteYearModal] = useState(false);
  const [isEditYearModalOpen, setIsEditYearModalOpen] = useState(false);

  const { data: year, isLoading: yearLoading } = useQuery<Year>({
    queryKey: ['year', yearId],
    queryFn: async () => {
      const response = await api.get(`/years/${yearId}/`);
      return response.data;
    },
    enabled: !!yearId,
  });

  const { data: memoriesData, isLoading: memoriesLoading } = useQuery<Memory[]>({
    queryKey: ['memories', yearId],
    queryFn: async () => {
      const response = await api.get(`/memories/?year=${yearId}`);
      const data = Array.isArray(response.data) ? response.data : response.data.results || [];
      return data.map((memory: any) => ({
        ...memory,
        year_id: memory.year_id || parseInt(yearId!),
        year: memory.year || year?.year_number || 0,
      }));
    },
    enabled: !!yearId && activeTab === 'memories',
  });

  const deleteMutation = useMutation({
    mutationFn: async (memoryId: number) => {
      await api.delete(`/memories/${memoryId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memories', yearId] });
      toast.success('Memory deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete memory');
    },
  });

  const deleteYearMutation = useMutation({
    mutationFn: async () => {
      await api.delete(`/years/${yearId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['years'] });
      toast.success('Year deleted successfully');
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete year');
    },
  });

  const handleEditYear = () => {
    queryClient.invalidateQueries({ queryKey: ['year', yearId] });
    queryClient.invalidateQueries({ queryKey: ['years'] });
  };

  const memories = useMemo(() => {
    const rawMemories = Array.isArray(memoriesData) ? memoriesData : [];
    return [...rawMemories].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });
  }, [memoriesData, sortOrder]);

  // Only keep Memories and Fun Facts tabs
  const tabs = [
    { id: 'memories' as TabType, label: 'Memories', icon: Camera, color: 'from-pink-500 to-rose-500' },
    { id: 'funfacts' as TabType, label: 'Fun Facts', icon: Coffee, color: 'from-orange-500 to-amber-500' },
  ];

  const stats = useMemo(() => {
    if (!memories.length) return null;
    const favoriteCount = memories.filter(m => m.is_favorite).length;
    const uniqueLocations = new Set(memories.filter(m => m.location).map(m => m.location)).size;
    const monthsWithMemories = new Set(memories.map(m => new Date(m.date).getMonth())).size;
    return { favoriteCount, uniqueLocations, totalMemories: memories.length, monthsWithMemories };
  }, [memories]);

  useEffect(() => {
    const state = location.state as { memoryId?: number } | null;
    const searchParams = new URLSearchParams(location.search);
    const queryMemoryId = searchParams.get('memoryId') ?? searchParams.get('memory');
    const memoryId = state?.memoryId ?? (queryMemoryId ? Number(queryMemoryId) : undefined);

    if (memoryId && pendingMemoryId === null) {
      setPendingMemoryId(memoryId);
      setShowReturnToBook(!!state?.memoryId);
      if (state?.memoryId) {
        try {
          navigate(location.pathname, { replace: true, state: {} });
        } catch (e) {
          // ignore navigation errors
        }
      }
    }
  }, [location.state, location.search, pendingMemoryId, navigate, location.pathname]);

  useEffect(() => {
    if (pendingMemoryId !== null && !isViewModalOpen && memories.length > 0) {
      const memory = memories.find((m) => m.id === pendingMemoryId);
      if (memory) {
        setSelectedMemoryForView(memory);
        setIsViewModalOpen(true);
        setPendingMemoryId(null);
        try {
          navigate(location.pathname, { replace: true, state: {} });
        } catch (e) {
          // ignore navigation errors
        }
      }
    }
  }, [pendingMemoryId, memories, isViewModalOpen, navigate, location.pathname]);

  const handleReturnToBook = () => {
    if (selectedMemoryForView) {
      navigate('/calendar', { 
        state: { 
          openBookModal: true, 
          bookDate: selectedMemoryForView.date 
        } 
      });
    } else {
      navigate('/calendar');
    }
  };

  if (yearLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <RomanticBackground />
        <div className="text-center relative z-10">
          <Heart className="w-12 h-12 text-rose-500 mx-auto animate-pulse" />
          <p className="text-gray-600 mt-4">Loading memories...</p>
        </div>
      </div>
    );
  }

  if (!year) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <RomanticBackground />
        <div className="text-center relative z-10">
          <Heart className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-gray-600 mt-4">Year not found</p>
          <button onClick={() => navigate('/dashboard')} className="mt-4 btn-soft">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 relative overflow-hidden">
      <RomanticBackground />
      
      <div className="max-w-7xl mx-auto relative z-10">
        <YearHeader
          year={year.year_number} 
          description={year.description}
          onDeleteYear={() => setShowDeleteYearModal(true)}
          onEditYear={() => setIsEditYearModalOpen(true)}
        />

        {stats && activeTab === 'memories' && memories.length > 0 && (
          <YearStats
            totalMemories={stats.totalMemories}
            favoriteCount={stats.favoriteCount}
            uniqueLocations={stats.uniqueLocations}
            monthsWithMemories={stats.monthsWithMemories}
          />
        )}

        {/* Tabs - Only Memories and Fun Facts */}
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex gap-2 p-2 bg-white/50 backdrop-blur-md rounded-2xl flex-wrap shadow-md border border-white/60">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-35 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all font-medium ${
                    isActive
                      ? `bg-linear-to-r ${tab.color} text-white shadow-lg`
                      : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {activeTab === 'memories' && (
            <motion.div key="memories" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {memoriesLoading ? (
                <TimelineSkeleton />
              ) : memories.length === 0 ? (
                <EmptyMemories onCreate={() => setIsCreateMemoryModalOpen(true)} />
              ) : (
                <>
                  <MemoriesControls
                    sortOrder={sortOrder}
                    onSortChange={setSortOrder}
                    layoutStyle={layoutStyle}
                    onLayoutChange={setLayoutStyle}
                  />

                  {layoutStyle === 'timeline' && (
                    <div ref={timelineRef} className="relative">
                      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12 pb-8 border-b border-pink-200">
                        <h2 className="text-2xl md:text-3xl font-serif text-gray-700 mb-3">Our Love Story Timeline</h2>
                        <p className="text-gray-500">A journey through {memories.length} beautiful moments</p>
                      </motion.div>
                      <div className="relative">
                        <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-linear-to-b from-pink-200 via-rose-300 to-pink-200 rounded-full hidden md:block" />
                        {memories.map((memory, index) => (
                          <TimelineMemory
                            key={memory.id}
                            memory={memory}
                            index={index}
                            isEven={index % 2 === 0}
                            onView={() => { setSelectedMemoryForView(memory); setShowReturnToBook(false); setIsViewModalOpen(true); }}
                            onEdit={() => { setSelectedMemory(memory); setIsEditModalOpen(true); }}
                            onDelete={() => setDeleteTarget({ id: memory.id, name: memory.title })}
                          />
                        ))}
                        <motion.div initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} className="flex justify-center mt-8">
                          <div className="relative">
                            <div className="w-16 h-16 rounded-full bg-linear-to-r from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
                              <Heart className="w-8 h-8 text-white fill-white" />
                            </div>
                            <div className="absolute inset-0 rounded-full bg-rose-400/30 animate-ping" />
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {layoutStyle === 'scattered' && (
                    <div className="relative min-h-150">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 gap-y-12">
                        {memories.map((memory, index) => (
                          <ScatteredPolaroidCard
                            key={memory.id} memory={memory} index={index}
                            onView={() => { setSelectedMemoryForView(memory); setShowReturnToBook(false); setIsViewModalOpen(true); }}
                            onEdit={() => { setSelectedMemory(memory); setIsEditModalOpen(true); }}
                            onDelete={() => setDeleteTarget({ id: memory.id, name: memory.title })}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {layoutStyle === 'masonry' && (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                      {memories.map((memory, index) => (
                        <MasonryCard
                          key={memory.id} memory={memory} index={index}
                          onView={() => { setSelectedMemoryForView(memory); setShowReturnToBook(false); setIsViewModalOpen(true); }}
                          onEdit={() => { setSelectedMemory(memory); setIsEditModalOpen(true); }}
                          onDelete={() => setDeleteTarget({ id: memory.id, name: memory.title })}
                        />
                      ))}
                    </div>
                  )}

                  <motion.button
                    whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCreateMemoryModalOpen(true)}
                    className="fixed bottom-8 right-8 z-30 bg-linear-to-r from-rose-500 to-pink-500 text-white p-4 rounded-full shadow-2xl transition-all"
                  >
                    <Plus className="w-6 h-6" />
                  </motion.button>
                </>
              )}
            </motion.div>
          )}

          {activeTab === 'funfacts' && (
            <motion.div key="funfacts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <FunFactsSection yearId={parseInt(yearId!)} yearNumber={year.year_number} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <CreateMemoryModal isOpen={isCreateMemoryModalOpen} onClose={() => setIsCreateMemoryModalOpen(false)} yearId={parseInt(yearId!)} />
      <EditMemoryModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedMemory(null); }} memory={selectedMemory} yearId={parseInt(yearId!)} />
      <MemoryDetailModal
        isOpen={isViewModalOpen}
        onClose={() => { setIsViewModalOpen(false); setSelectedMemoryForView(null); setShowReturnToBook(false); }}
        memory={selectedMemoryForView}
        onEdit={(memory) => { setIsViewModalOpen(false); setSelectedMemoryForView(null); setSelectedMemory(memory); setIsEditModalOpen(true); setShowReturnToBook(false); }}
        onReturnToBook={showReturnToBook ? handleReturnToBook : undefined}
      />
      
      <DeleteConfirmModal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { if (deleteTarget) { deleteMutation.mutate(deleteTarget.id); setDeleteTarget(null); } }} title="Delete Memory" itemName={deleteTarget?.name} message="This action cannot be undone. All data will be permanently removed." loading={deleteMutation.isPending} />
      <DeleteConfirmModal isOpen={showDeleteYearModal} onClose={() => setShowDeleteYearModal(false)} onConfirm={() => { deleteYearMutation.mutate(); setShowDeleteYearModal(false); }} title="Delete Year" itemName={year?.year_number?.toString()} message="This will permanently delete this year and ALL memories inside it. This cannot be undone!" loading={deleteYearMutation.isPending} />
      
      <EditYearModal
        isOpen={isEditYearModalOpen}
        onClose={() => {
          setIsEditYearModalOpen(false);
          handleEditYear();
        }}
        yearId={parseInt(yearId!)}
        yearNumber={year.year_number}
        currentDescription={year.description || ''}
        currentCoverImage={year.cover_image || null}
      />
    </div>
  );
};

export default YearDetailPage;