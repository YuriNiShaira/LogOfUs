import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import type { BucketListItem, BucketListFormData } from './bucketlistTypes';
import { categories } from './bucketlistConstants';

export interface CompleteModalProps {
  theme: string | null;
  selectedItem: BucketListItem | null;
  completionNotes: string;
  setCompletionNotes: (value: string) => void;
  onClose: () => void;
  onConfirm: (payload: { id: number; completed_by: string; notes: string }) => void;
}

export interface AddEditModalProps {
  theme: string | null;
  isOpen: boolean;
  onClose: () => void;
  editingItem: BucketListItem | null;
  formData: BucketListFormData;
  setFormData: React.Dispatch<React.SetStateAction<BucketListFormData>>;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const WashiTape = ({ rotate = '-rotate-2', isDark = false, className = '' }) => (
  <div className={`absolute -top-3 w-20 h-6 backdrop-blur-md shadow-sm z-20 ${rotate} ${className} ${
    isDark ? 'bg-rose-900/40 border border-black/10' : 'bg-rose-200/50 border border-black/5'
  }`} 
    style={{ clipPath: 'polygon(3% 0%, 97% 2%, 100% 100%, 0% 96%)', borderRadius: '2px 8px 3px 6px' }} 
  />
);

export const CompleteModal: React.FC<CompleteModalProps> = ({
  theme,
  selectedItem,
  completionNotes,
  setCompletionNotes,
  onClose,
  onConfirm,
}) => {
  const isDark = theme === 'dark';
  const [selectedOption, setSelectedOption] = React.useState<string>('me');

  React.useEffect(() => {
    if (selectedItem?.completed_by) {
      setSelectedOption(selectedItem.completed_by);
    } else {
      setSelectedOption('me');
    }
  }, [selectedItem]);

  if (!selectedItem) return null;

  const isBothCompleted = selectedItem.completed_by === 'both';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, y: 10, rotate: 1 }}
          animate={{ scale: 1, y: 0, rotate: 0 }}
          exit={{ scale: 0.95, y: 10, rotate: -1 }}
          className={`relative w-full max-w-md p-10 rounded-sm shadow-2xl border ${
            isDark ? 'bg-[#2a0815] border-rose-900/60' : 'bg-[#FFFAF0] border-rose-200/80'
          }`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
        >
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-overlay rounded-sm" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

          <WashiTape rotate="rotate-2" isDark={isDark} className="left-1/2 -translate-x-1/2" />
          
          <div className="text-center mb-8 relative z-10">
            <div className="text-4xl mb-4 drop-shadow-sm">🎯</div>
            <h3 className={`font-serif text-3xl mb-2 tracking-wide ${isDark ? 'text-rose-100' : 'text-rose-950'}`}>
              {selectedItem.completed_by ? 'Update Completion' : 'Dream Achieved'}
            </h3>
            <p className={`font-handwriting text-2xl ${isDark ? 'text-rose-300' : 'text-rose-700'}`}>
              "{selectedItem.title}"
            </p>
            {selectedItem.completed_by && (
              <p className={`text-xs font-serif italic mt-2 ${isDark ? 'text-rose-400/60' : 'text-rose-500/60'}`}>
                Currently: {selectedItem.completed_by === 'me' ? 'You' : selectedItem.completed_by === 'shaira' ? 'Partner' : 'Both'}
              </p>
            )}
          </div>

          <div className="space-y-8 relative z-10">
            <div>
              <label className={`block text-2.5 font-serif uppercase tracking-[0.2em] font-bold mb-3 text-center ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>
                Who completed this?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'me', label: 'Me', color: 'blue' },
                  { value: 'shaira', label: 'Partner', color: 'purple' },
                  { value: 'both', label: 'Both', color: 'emerald' },
                ].map((option) => {
                  const isActive = selectedOption === option.value;
                  const isDisabled = option.value === 'both' && isBothCompleted;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedOption(option.value)}
                      disabled={isDisabled}
                      className={`py-2 text-xs font-serif uppercase tracking-widest border rounded-full transition-all ${
                        isActive
                          ? isDark 
                            ? `bg-${option.color}-900/50 text-${option.color}-300 border-${option.color}-700`
                            : `bg-${option.color}-100 text-${option.color}-700 border-${option.color}-300`
                          : isDark 
                            ? 'border-rose-900/60 text-rose-300 hover:border-rose-600 hover:bg-[#4c0519]/40'
                            : 'border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50'
                      } ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {option.label}
                      {isActive && (
                        <span className="ml-1">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
              {selectedItem.completed_by && selectedItem.completed_by !== 'both' && (
                <p className={`text-center text-xs font-serif italic mt-3 ${isDark ? 'text-rose-400/50' : 'text-rose-500/50'}`}>
                  {selectedItem.completed_by === 'me' 
                    ? 'Your partner can still mark it as completed too!' 
                    : 'You can still mark it as completed too!'}
                </p>
              )}
            </div>

            <div>
              <label className={`block text-2.5 font-serif uppercase tracking-[0.2em] font-bold mb-1 ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>
                Journal Entry
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                rows={3}
                className={`w-full bg-transparent border-b border-dashed outline-none font-handwriting text-2xl resize-none transition-colors ${
                  isDark 
                    ? 'border-rose-900 text-rose-200 focus:border-rose-500 placeholder-rose-900/50' 
                    : 'border-rose-300 text-rose-900 focus:border-rose-400 placeholder-rose-300'
                }`}
                placeholder="How was the experience?..."
              />
            </div>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onConfirm({ 
                    id: selectedItem.id, 
                    completed_by: selectedOption, 
                    notes: completionNotes 
                  });
                }}
                className={`w-full py-3 rounded-full font-serif font-bold transition-all ${
                  isDark
                    ? 'bg-rose-800 hover:bg-rose-700 text-rose-50 shadow-md'
                    : 'bg-rose-800 hover:bg-rose-700 text-rose-50 shadow-md'
                }`}
              >
                {selectedItem.completed_by ? 'Update Completion' : 'Mark as Completed'}
              </button>
              <button onClick={onClose} className={`w-full font-serif italic text-sm transition-colors ${
                isDark ? 'text-rose-500/60 hover:text-rose-400' : 'text-rose-400 hover:text-rose-600'
              }`}>
                Cancel
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const AddEditBucketListModal: React.FC<AddEditModalProps> = ({
  theme,
  isOpen,
  onClose,
  editingItem,
  formData,
  setFormData,
  onSubmit,
}) => {
  const isDark = theme === 'dark';
  
  // Check if target_date is set
  const hasTargetDate = !!formData.target_date;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, rotate: -1, y: 10 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            exit={{ scale: 0.95, rotate: 1, y: 10 }}
            className={`relative w-full max-w-lg p-8 sm:p-12 rounded-sm shadow-2xl border ${
              isDark ? 'bg-[#2a0815] border-rose-900/60' : 'bg-[#FFFAF0] border-rose-200/80'
            }`}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply dark:mix-blend-overlay rounded-sm" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            <WashiTape rotate="-rotate-2" isDark={isDark} className="left-1/2 -translate-x-1/2" />
            
            <div className={`flex justify-between items-center mb-8 border-b pb-4 relative z-10 ${isDark ? 'border-rose-900/50' : 'border-rose-200/60'}`}>
              <h2 className={`font-serif italic text-3xl sm:text-4xl ${isDark ? 'text-rose-100' : 'text-rose-950'}`}>
                {editingItem ? 'Edit Dream' : 'New Dream'}
              </h2>
              <button onClick={onClose} className={`transition-colors ${isDark ? 'text-rose-500 hover:text-rose-300' : 'text-rose-300 hover:text-rose-600'}`}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 relative z-10">
              {/* Title */}
              <div>
                <label className={`block text-2.25 font-serif uppercase tracking-[0.2em] font-bold mb-1 ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className={`w-full bg-transparent border-b border-dashed outline-none font-handwriting text-3xl focus:border-solid pb-1 transition-colors ${
                    isDark ? 'border-rose-900 text-rose-200 focus:border-rose-500 placeholder-rose-900/50' : 'border-rose-300 text-rose-900 focus:border-rose-400 placeholder-rose-200'
                  }`}
                  placeholder="e.g., See the Northern Lights"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-2.25 font-serif uppercase tracking-[0.2em] font-bold mb-1 ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className={`w-full bg-transparent border-b border-dashed outline-none font-serif italic text-lg focus:border-solid resize-none transition-colors ${
                    isDark ? 'border-rose-900 text-rose-200 focus:border-rose-500 placeholder-rose-900/50' : 'border-rose-300 text-rose-900 focus:border-rose-400 placeholder-rose-200'
                  }`}
                  placeholder="A few thoughts on this dream..."
                />
              </div>

              {/* Category + Priority */}
              <div className="grid grid-cols-2 gap-6 pt-2">
                <div>
                  <label className={`block text-2.25 font-serif uppercase tracking-[0.2em] font-bold mb-1 ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className={`w-full bg-transparent border-b border-dashed font-serif text-base outline-none focus:border-solid transition-colors py-1 ${
                      isDark ? 'border-rose-900 text-rose-200 focus:border-rose-500' : 'border-rose-300 text-rose-900 focus:border-rose-400'
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} className={isDark ? 'bg-[#2a0815] text-rose-200' : 'bg-[#FFFAF0] text-rose-900'}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Priority Selector */}
                <div>
                  <label className={`block text-2.25 font-serif uppercase tracking-[0.2em] font-bold mb-1 ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                    className={`w-full bg-transparent border-b border-dashed font-serif text-base outline-none focus:border-solid transition-colors py-1 ${
                      isDark ? 'border-rose-900 text-rose-200 focus:border-rose-500' : 'border-rose-300 text-rose-900 focus:border-rose-400'
                    }`}
                  >
                    <option value={1} className={isDark ? 'bg-[#2a0815]' : 'bg-[#FFFAF0]'}>Low</option>
                    <option value={2} className={isDark ? 'bg-[#2a0815]' : 'bg-[#FFFAF0]'}>Medium</option>
                    <option value={3} className={isDark ? 'bg-[#2a0815]' : 'bg-[#FFFAF0]'}>High</option>
                  </select>
                </div>
              </div>

              {/* Target Date with auto-status indicator */}
              <div className="pt-2">
                <label className={`block text-2.25 font-serif uppercase tracking-[0.2em] font-bold mb-1 ${isDark ? 'text-rose-400/80' : 'text-rose-500/80'}`}>Target Date</label>
                <input
                  type="date"
                  value={formData.target_date}
                  onChange={(e) => {
                    setFormData({ ...formData, target_date: e.target.value });
                  }}
                  className={`w-full bg-transparent border-b border-dashed font-serif text-base outline-none focus:border-solid transition-colors py-1 ${
                    isDark ? 'border-rose-900 text-rose-200 focus:border-rose-500' : 'border-rose-300 text-rose-900 focus:border-rose-400'
                  }`}
                  style={{ colorScheme: isDark ? 'dark' : 'light' }}
                />
                {/* Show status hint when date is set */}
                {hasTargetDate && (
                  <p className={`text-xs font-serif italic mt-2 flex items-center gap-1.5 ${
                    isDark ? 'text-emerald-400' : 'text-emerald-600'
                  }`}>
                    <span>📅</span>
                    This dream will be marked as "Planned"
                  </p>
                )}
                {!hasTargetDate && (
                  <p className={`text-xs font-serif italic mt-2 flex items-center gap-1.5 ${
                    isDark ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    <span>📌</span>
                    Add a target date to mark as "Planned"
                  </p>
                )}
              </div>

              {/* Submit */}
              <div className="pt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className={`w-full py-4 rounded-full font-serif uppercase tracking-widest text-2.75 font-bold transition-all border shadow-md ${
                    isDark
                      ? 'bg-rose-900 border-rose-800 text-rose-50 hover:bg-rose-800 shadow-[0_4px_15px_rgba(159,18,57,0.3)]'
                      : 'bg-rose-950 border-rose-950 text-rose-50 hover:bg-rose-900 shadow-[0_4px_15px_rgba(136,19,55,0.25)]'
                  }`}
                >
                  {editingItem ? 'Update Dream' : 'Commit to Diary'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};