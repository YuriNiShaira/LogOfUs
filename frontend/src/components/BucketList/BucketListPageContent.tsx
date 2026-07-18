import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Clock,
  Calendar,
  Trophy,
  Sparkles
} from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import { useTheme } from '../../contexts/ThemeContext';

import DeleteConfirmModal from '../DeleteConfirmModal';
import { BucketListCard, BucketListFilters, BucketListStats, CompleteModal, AddEditBucketListModal } from './index';
import type { BucketListItem, BucketListStats as BucketListStatsType, BucketListFormData } from './bucketlistTypes';

interface BucketListPageContentProps {
  currentUser: string;
}

const BucketListPageContent: React.FC<BucketListPageContentProps> = ({ currentUser }) => {
  const { theme } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BucketListItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedItem, setSelectedItem] = useState<BucketListItem | null>(null);
  const [completionNotes, setCompletionNotes] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

  const [formData, setFormData] = useState<BucketListFormData>({
    title: '',
    description: '',
    category: 'travel',
    priority: 2,
    target_date: '',
  });

  const queryClient = useQueryClient();
  const isDark = theme === 'dark';

  // Fetch bucket list items
  const { data: items, isLoading } = useQuery<BucketListItem[]>({
    queryKey: ['bucketlist'],
    queryFn: async () => {
      const response = await api.get('/bucketlist/');
      return Array.isArray(response.data) ? response.data : response.data.results || [];
    },
  });

  // Fetch stats
  const { data: stats } = useQuery<BucketListStatsType>({
    queryKey: ['bucketlistStats'],
    queryFn: async () => {
      const response = await api.get('/bucketlist/stats/');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.post('/bucketlist/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });
      toast.success('Added to bucket list!');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Create bucket list error:', error);
      toast.error(error?.response?.data?.target_date?.[0] || 'Failed to add dream.');
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.put(`/bucketlist/${id}/`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });
      toast.success('Item updated!');
      setIsModalOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      console.error('Update bucket list error:', error);
      toast.error(error?.response?.data?.target_date?.[0] || 'Failed to update dream.');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/bucketlist/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });
      toast.success('Item removed');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.error || 'Failed to delete dream.');
    },
  });

  // Complete mutation
  const completeMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await api.post(`/bucketlist/${id}/complete/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['bucketlist'] });
      queryClient.invalidateQueries({ queryKey: ['bucketlistStats'] });

      confetti({
        particleCount: 200,
        spread: 100,
        origin: { y: 0.6 },
      });

      toast.success(data.message);
      setSelectedItem(null);
      setCompletionNotes('');
    },
  });

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: '',
      description: '',
      category: 'travel',
      priority: 2,
      target_date: '',
    });
  };

  const buildPayload = () => {
    const payload: Record<string, any> = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      priority: formData.priority,
    };

    if (formData.target_date.trim()) {
      payload.target_date = formData.target_date;
    }

    return payload;
  };

  const handleEdit = (item: BucketListItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      target_date: item.target_date || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteClick = (item: BucketListItem) => {
    setDeleteTarget({ id: item.id, name: item.title });
  };

  const handleComplete = (item: BucketListItem) => {
    setSelectedItem(item);
    setCompletionNotes('');
  };

  // Filter items based on category and status
  const filteredItems = items?.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    return true;
  });


  const pendingItems = filteredItems?.filter((i) => {
    // If status is not completed, show it
    if (i.status !== 'completed') return true;
    
    // If status is completed, only show if current user hasn't completed it
    if (currentUser === 'me') {
      return i.completed_by !== 'me' && i.completed_by !== 'both';
    } else {
      return i.completed_by !== 'shaira' && i.completed_by !== 'both';
    }
  }) || [];


  const plannedItems = filteredItems?.filter((i) => {
    return i.status === 'planned';
  }) || [];


  const completedItems = filteredItems?.filter((i) => {
    if (i.status !== 'completed') return false;
    
    // Only show in Achieved if current user has completed it
    if (currentUser === 'me') {
      return i.completed_by === 'me' || i.completed_by === 'both';
    } else {
      return i.completed_by === 'shaira' || i.completed_by === 'both';
    }
  }) || [];

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className={`text-4xl font-serif font-bold mb-2 ${isDark ? 'text-rose-100' : 'text-rose-950'}`}>
            Our Bucket List
          </h2>
          <p className={`font-serif italic ${isDark ? 'text-rose-300/70' : 'text-rose-700/60'}`}>
            Dreams we'll achieve together. One by one.
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          className={`px-6 py-2.5 rounded-full font-serif uppercase tracking-widest text-xs font-bold transition-all ${
            isDark
              ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
              : 'bg-rose-950 border-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_4px_15px_rgba(136,19,55,0.25)]'
          }`}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Pen a Dream
          </span>
        </button>
      </div>

      {/* Stats */}
      {stats && <BucketListStats stats={stats} theme={theme} />}

      {/* Filters */}
      <BucketListFilters
        theme={theme}
        selectedCategory={selectedCategory}
        selectedStatus={selectedStatus}
        onCategoryChange={setSelectedCategory}
        onStatusChange={setSelectedStatus}
      />

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className={`rounded-sm p-6 animate-pulse border ${isDark ? 'bg-[#2a0815] border-rose-900/50' : 'bg-[#FFFAF0] border-rose-100'}`}>
              <div className={`h-24 rounded-sm ${isDark ? 'bg-rose-900/30' : 'bg-rose-200/30'}`}></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 mt-8">
          
          {/* Column 1: Not Yet */}
          <div>
            <h3 className={`text-xs font-serif uppercase tracking-[0.2em] font-semibold mb-6 pb-4 border-b flex items-center gap-3 ${
              isDark ? 'text-rose-200 border-rose-900/50' : 'text-rose-800 border-rose-200/80'
            }`}>
              <Clock className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
              Not Yet
              <span className={`text-2.5 ml-auto ${isDark ? 'text-rose-400/70' : 'text-rose-400'}`}>
                ({pendingItems.length})
              </span>
            </h3>
            <div className="space-y-5">
              {pendingItems.map((item, index) => (
                <BucketListCard
                  key={item.id}
                  item={item}
                  index={index}
                  theme={theme}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onComplete={handleComplete}
                  currentUser={currentUser}
                />
              ))}
              {pendingItems.length === 0 && (
                <p className={`text-center py-10 font-serif italic text-sm ${isDark ? 'text-rose-400/50' : 'text-rose-400'}`}>
                  No pending dreams
                </p>
              )}
            </div>
          </div>

          {/* Column 2: Planned */}
          <div>
            <h3 className={`text-xs font-serif uppercase tracking-[0.2em] font-semibold mb-6 pb-4 border-b flex items-center gap-3 ${
              isDark ? 'text-rose-200 border-rose-900/50' : 'text-rose-800 border-rose-200/80'
            }`}>
              <Calendar className={`w-4 h-4 ${isDark ? 'text-rose-400' : 'text-rose-500'}`} />
              Planned
              <span className={`text-2.5 ml-auto ${isDark ? 'text-rose-400/70' : 'text-rose-400'}`}>
                ({plannedItems.length})
              </span>
            </h3>
            <div className="space-y-5">
              {plannedItems.map((item, index) => (
                <BucketListCard
                  key={item.id}
                  item={item}
                  index={index}
                  theme={theme}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onComplete={handleComplete}
                  currentUser={currentUser}
                />
              ))}
              {plannedItems.length === 0 && (
                <p className={`text-center py-10 font-serif italic text-sm ${isDark ? 'text-rose-400/50' : 'text-rose-400'}`}>
                  No planned dreams
                </p>
              )}
            </div>
          </div>

          {/* Column 3: Achieved */}
          <div>
            <h3 className={`text-xs font-serif uppercase tracking-[0.2em] font-semibold mb-6 pb-4 border-b flex items-center gap-3 ${
              isDark ? 'text-rose-200 border-rose-900/50' : 'text-rose-800 border-rose-200/80'
            }`}>
              <Trophy className={`w-4 h-4 ${isDark ? 'text-amber-500/80' : 'text-amber-500'}`} />
              Achieved
              <span className={`text-2.5 ml-auto ${isDark ? 'text-rose-400/70' : 'text-rose-400'}`}>
                ({completedItems.length})
              </span>
            </h3>
            <div className="space-y-5">
              {completedItems.map((item, index) => (
                <BucketListCard
                  key={item.id}
                  item={item}
                  index={index}
                  theme={theme}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  onComplete={handleComplete}
                  currentUser={currentUser}
                />
              ))}
              {completedItems.length === 0 && (
                <p className={`text-center py-10 font-serif italic text-sm ${isDark ? 'text-rose-400/50' : 'text-rose-400'}`}>
                  No completed dreams yet
                </p>
              )}
            </div>
          </div>

        </div>
      )}

      <CompleteModal
        theme={theme}
        selectedItem={selectedItem}
        completionNotes={completionNotes}
        setCompletionNotes={setCompletionNotes}
        onClose={() => setSelectedItem(null)}
        onConfirm={({ id, completed_by, notes }) => completeMutation.mutate({ id, data: { completed_by, notes } })}
      />

      <AddEditBucketListModal
        theme={theme}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingItem={editingItem}
        formData={formData}
        setFormData={setFormData}
        onSubmit={(e) => {
          e.preventDefault();
          const payload = buildPayload();
          if (editingItem) {
            updateMutation.mutate({ id: editingItem.id, data: payload });
          } else {
            createMutation.mutate(payload);
          }
        }}
      />

      <DeleteConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        title="Burn this Page?"
        itemName={deleteTarget?.name}
        message="This action cannot be undone. This dream will be permanently erased from your journal."
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default BucketListPageContent;