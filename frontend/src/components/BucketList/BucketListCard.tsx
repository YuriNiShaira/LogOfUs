import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, CheckCircle, User, Calendar, Flag } from 'lucide-react';
import type { BucketListItem } from './bucketlistTypes';

interface BucketListCardProps {
  item: BucketListItem;
  index: number;
  theme: string;
  onEdit: (item: BucketListItem) => void;
  onDelete: (item: BucketListItem) => void;
  onComplete: (item: BucketListItem) => void;
  currentUser: string;
}

const BucketListCard: React.FC<BucketListCardProps> = ({
  item,
  index,
  theme,
  onEdit,
  onDelete,
  onComplete,
  currentUser,
}) => {
  const isDark = theme === 'dark';
  const [isHovering, setIsHovering] = useState(false);

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 3: return isDark ? 'text-red-400 border-red-400' : 'text-red-600 border-red-600';
      case 2: return isDark ? 'text-amber-400 border-amber-400' : 'text-amber-600 border-amber-600';
      default: return isDark ? 'text-blue-400 border-blue-400' : 'text-blue-600 border-blue-600';
    }
  };

  const isCompleted = item.status === 'completed';
  
  const hasCompleted = isCompleted && (
    (currentUser === 'me' && (item.completed_by === 'me' || item.completed_by === 'both')) ||
    (currentUser === 'shaira' && (item.completed_by === 'shaira' || item.completed_by === 'both'))
  );
  
  const partnerCompleted = isCompleted && (
    (currentUser === 'me' && (item.completed_by === 'shaira' || item.completed_by === 'both')) ||
    (currentUser === 'shaira' && (item.completed_by === 'me' || item.completed_by === 'both'))
  );

  let displayLabel = item.status_display || 'Pending';
  
  if (isCompleted) {
    if (hasCompleted && partnerCompleted) {
      displayLabel = 'Both Completed';
    } else if (hasCompleted) {
      displayLabel = 'You Completed';
    } else if (partnerCompleted) {
      displayLabel = 'Partner Completed';
    }
  }

  // Helper to check if a specific user completed the item
  const isCompletedBy = (user: string) => {
    return item.completed_by === user || item.completed_by === 'both';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className={`relative p-6 rounded-xl border transition-all duration-300 ${
        isDark 
          ? 'bg-[#2a0815] border-rose-900/50 hover:border-rose-700' 
          : 'bg-white border-rose-100 hover:border-rose-300 shadow-sm hover:shadow-md'
      }`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-serif uppercase tracking-wider px-3 py-1 rounded-full border ${
            isCompleted
              ? hasCompleted && partnerCompleted
                ? isDark ? 'bg-emerald-900/40 text-emerald-300 border-emerald-700' : 'bg-emerald-100 text-emerald-700 border-emerald-300'
                : hasCompleted
                  ? isDark ? 'bg-blue-900/40 text-blue-300 border-blue-700' : 'bg-blue-100 text-blue-700 border-blue-300'
                  : partnerCompleted
                    ? isDark ? 'bg-purple-900/40 text-purple-300 border-purple-700' : 'bg-purple-100 text-purple-700 border-purple-300'
                    : isDark ? 'bg-amber-900/40 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-700 border-amber-300'
              : isDark ? 'bg-amber-900/40 text-amber-300 border-amber-700' : 'bg-amber-100 text-amber-700 border-amber-300'
          }`}>
            {displayLabel}
          </span>
          
          {isCompleted && (
            <div className="flex items-center gap-1 text-xs">
              {isCompletedBy('me') && (
                <span className={`flex items-center gap-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                  <User className="w-3 h-3" /> You
                </span>
              )}
              {isCompletedBy('me') && isCompletedBy('shaira') && (
                <span className={isDark ? 'text-stone-500' : 'text-stone-400'}>+</span>
              )}
              {isCompletedBy('shaira') && (
                <span className={`flex items-center gap-0.5 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                  <User className="w-3 h-3" /> Partner
                </span>
              )}
            </div>
          )}
        </div>

        <div className={`flex items-center gap-1 px-2 py-0.5 rounded border ${getPriorityColor(item.priority)}`}>
          <Flag className="w-3 h-3" />
          <span className="text-xs font-serif">{item.priority}</span>
        </div>
      </div>

      <h3 className={`text-xl font-serif font-bold mb-2 ${isDark ? 'text-rose-100' : 'text-gray-800'}`}>
        {item.title}
        {isCompleted && hasCompleted && (
          <CheckCircle className="inline ml-2 w-4 h-4 text-emerald-500" />
        )}
      </h3>

      {item.description && (
        <p className={`text-sm font-serif italic mb-3 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>
          {item.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs">
        <span className={`font-serif ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>
          {item.category_display || item.category}
        </span>
        {item.target_date && (
          <span className={`flex items-center gap-1 ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>
            <Calendar className="w-3 h-3" />
            {new Date(item.target_date).toLocaleDateString()}
          </span>
        )}
        <span className={`font-serif ${isDark ? 'text-stone-500' : 'text-gray-500'}`}>
          Added by: {item.added_by_display || item.added_by}
        </span>
      </div>

      <div className={`absolute top-4 right-4 flex gap-1 transition-opacity duration-300 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
        {!isCompleted && (
          <button
            onClick={() => onComplete(item)}
            className={`p-1.5 rounded transition-colors ${
              isDark ? 'hover:bg-emerald-900/30 text-emerald-400' : 'hover:bg-emerald-50 text-emerald-500'
            }`}
            title="Mark as Completed"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
        )}
        {(!hasCompleted || !isCompleted) && (
          <button
            onClick={() => onEdit(item)}
            className={`p-1.5 rounded transition-colors ${
              isDark ? 'hover:bg-blue-900/30 text-blue-400' : 'hover:bg-blue-50 text-blue-500'
            }`}
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(item)}
          className={`p-1.5 rounded transition-colors ${
            isDark ? 'hover:bg-red-900/30 text-red-400' : 'hover:bg-red-50 text-red-500'
          }`}
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {isCompleted && (
        <div className={`mt-3 pt-3 border-t ${isDark ? 'border-stone-700' : 'border-stone-200'}`}>
          <div className="flex items-center gap-4 text-xs">
            {isCompletedBy('me') && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                <CheckCircle className="w-3 h-3" /> You completed this
              </span>
            )}
            {isCompletedBy('shaira') && (
              <span className={`flex items-center gap-1 ${isDark ? 'text-purple-400' : 'text-purple-600'}`}>
                <CheckCircle className="w-3 h-3" /> Partner completed this
              </span>
            )}
            {item.completed_at && (
              <span className={isDark ? 'text-stone-500' : 'text-gray-500'}>
                {new Date(item.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
          {item.completion_notes && (
            <p className={`mt-1 text-xs font-serif italic ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
              "{item.completion_notes}"
            </p>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BucketListCard;