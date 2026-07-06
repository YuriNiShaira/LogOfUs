import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, X, Upload, PawPrint, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import DeleteConfirmModal from '../DeleteConfirmModal';

interface PetPhoto {
  id: number;
  image: string;
  pet_name: string;
  caption: string;
  date_taken: string;
  year: number;
}

interface PetGallerySectionProps {
  yearId: number;
  yearNumber: number;
}

const PetGallerySection: React.FC<PetGallerySectionProps> = ({ yearId, yearNumber }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetPhoto | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [petToDelete, setPetToDelete] = useState<PetPhoto | null>(null);
  const [formData, setFormData] = useState({
    pet_name: '',
    caption: '',
    date_taken: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  const queryClient = useQueryClient();

  const { data: petPhotos, isLoading, isError } = useQuery<PetPhoto[]>({
    queryKey: ['pet-photos', yearId],
    queryFn: async () => {
      const response = await api.get(`/pet-photos/?year=${yearId}`);
      // ✅ Ensure we always return an array
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && typeof response.data === 'object') {
        // If the API returns an object with results property (like paginated response)
        if (Array.isArray(response.data.results)) {
          return response.data.results;
        }
        // If it's an object with other structure, try to convert or return empty array
        console.warn('Unexpected pet photos data structure:', response.data);
        return [];
      }
      return [];
    },
    enabled: !!yearId,
  });

  // ✅ Ensure petPhotos is always an array for rendering
  const photos = Array.isArray(petPhotos) ? petPhotos : [];

  const uploadMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await api.post('/pet-photos/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-photos', yearId] });
      toast.success('Pet photo added! 🐾');
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to add pet photo');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/pet-photos/${id}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-photos', yearId] });
      toast.success('Pet photo removed');
      setShowDeleteModal(false);
      setPetToDelete(null);
      setSelectedPet(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Failed to delete pet photo');
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile || !formData.pet_name) {
      toast.error('Please provide a photo and pet name');
      return;
    }

    const data = new FormData();
    data.append('year', yearId.toString());
    data.append('image', imageFile);
    data.append('pet_name', formData.pet_name);
    data.append('caption', formData.caption);
    data.append('date_taken', formData.date_taken || new Date().toISOString().split('T')[0]);

    uploadMutation.mutate(data);
  };

  const resetForm = () => {
    setFormData({ pet_name: '', caption: '', date_taken: '' });
    setImageFile(null);
    setPreview('');
    setIsUploading(false);
  };

  const handleDeleteClick = (pet: PetPhoto) => {
    setPetToDelete(pet);
    setShowDeleteModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-2 border-rose-300 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🐾</div>
        <p className="font-serif text-rose-400/70 italic">
          Failed to load pet photos. Please try again.
        </p>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ['pet-photos', yearId] })}
          className="mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg font-serif hover:bg-rose-600 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif text-rose-800 flex items-center gap-3">
            <PawPrint className="w-6 h-6 text-amber-500" />
            Pet Gallery
            <span className="text-sm font-serif italic text-rose-400 font-normal">
              {photos.length} memories
            </span>
          </h3>
          <p className="text-sm font-serif italic text-rose-400/70">
            {photos.length === 0 
              ? 'Share your fur baby moments this year! 💕'
              : 'Every paw print tells a story'
            }
          </p>
        </div>
        <button
          onClick={() => setIsUploading(!isUploading)}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-lg font-serif text-sm hover:bg-rose-600 transition-colors shadow-md"
        >
          {isUploading ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {isUploading ? 'Cancel' : 'Add Photo'}
        </button>
      </div>

      {/* Upload Form */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-rose-100 shadow-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-serif text-rose-700 mb-1">
                  Pet Name *
                </label>
                <input
                  type="text"
                  value={formData.pet_name}
                  onChange={(e) => setFormData({ ...formData, pet_name: e.target.value })}
                  className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 font-serif"
                  placeholder="Bella, Milo, etc."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-serif text-rose-700 mb-1">
                  Date Taken
                </label>
                <input
                  type="date"
                  value={formData.date_taken}
                  onChange={(e) => setFormData({ ...formData, date_taken: e.target.value })}
                  className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 font-serif"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-serif text-rose-700 mb-1">
                Caption
              </label>
              <input
                type="text"
                value={formData.caption}
                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                className="w-full px-4 py-2 border border-rose-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 font-serif"
                placeholder="What's your fur baby doing?"
              />
            </div>
            <div>
              <label className="block text-sm font-serif text-rose-700 mb-1">
                Photo *
              </label>
              <div className="flex items-center gap-4 flex-wrap">
                <label className="cursor-pointer px-4 py-2 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <span className="flex items-center gap-2 text-rose-700 font-serif">
                    <Upload className="w-4 h-4" />
                    Choose Photo
                  </span>
                </label>
                {preview && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-rose-200 shadow-sm">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setPreview(''); }}
                      className="absolute top-1 right-1 bg-red-500/80 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={uploadMutation.isPending}
              className="px-6 py-2 bg-rose-500 text-white rounded-lg font-serif hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {uploadMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <PawPrint className="w-4 h-4" />
                  Add to Gallery 🐾
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Pet Photos Grid - ✅ Use 'photos' instead of 'petPhotos' */}
      {photos.length === 0 && !isUploading ? (
        <div className="text-center py-16 border-2 border-dashed border-rose-200 rounded-xl">
          <div className="text-6xl mb-4">🐾</div>
          <p className="font-serif text-rose-400/70 italic">
            No pet photos yet. Share your fur baby moments!
          </p>
          <p className="text-sm font-serif text-rose-300/50 mt-2">
            Year {yearNumber} • Add your first pet memory
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {photos.map((photo) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              className="relative group cursor-pointer"
              onClick={() => setSelectedPet(photo)}
            >
              <div className="bg-white p-2 pb-6 shadow-md rotate-[-1deg] transition-all group-hover:rotate-0 group-hover:shadow-lg">
                <div className="relative">
                  <img
                    src={photo.image}
                    alt={photo.pet_name}
                    className="w-full aspect-square object-cover rounded-sm"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(photo);
                    }}
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-red-500/80 text-white p-1.5 rounded-full hover:bg-red-600 transition-all shadow-sm"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center w-full px-2">
                  <p className="font-handwriting text-sm text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full inline-block shadow-sm">
                    {photo.pet_name}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPet && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedPet(null)}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="relative max-w-lg w-full bg-[#fdfbf7] rounded-xl overflow-hidden shadow-2xl border border-rose-100"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedPet.image}
              alt={selectedPet.pet_name}
              className="w-full aspect-square object-cover"
            />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif text-rose-800 flex items-center gap-3">
                  <span>🐾</span> {selectedPet.pet_name}
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteClick(selectedPet)}
                    className="text-red-400 hover:text-red-600 transition-colors p-2 hover:bg-red-50 rounded-full"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedPet(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-50 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              {selectedPet.caption && (
                <p className="text-gray-600 font-serif italic mt-3 text-lg">
                  "{selectedPet.caption}"
                </p>
              )}
              {selectedPet.date_taken && (
                <p className="text-xs text-gray-400 font-serif mt-3">
                  📅 {new Date(selectedPet.date_taken).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setPetToDelete(null);
        }}
        onConfirm={() => {
          if (petToDelete) {
            deleteMutation.mutate(petToDelete.id);
          }
        }}
        title="Remove pet memory?"
        message="This pet photo will be permanently removed from your gallery."
        itemName={petToDelete?.pet_name}
        loading={deleteMutation.isPending}
      />
    </div>
  );
};

export default PetGallerySection;