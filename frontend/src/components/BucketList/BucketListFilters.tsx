import React from 'react';
import { categories } from './bucketlistConstants';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

interface BucketListFiltersProps {
  theme: string | null;
  selectedCategory: string;
  selectedStatus: string;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

const BucketListFilters: React.FC<BucketListFiltersProps> = ({
  theme,
  selectedCategory,
  selectedStatus,
  onCategoryChange,
  onStatusChange,
}) => {
  const isDark = theme === 'dark';

  const selectBg = isDark ? 'bg-[#1a050f]/60 hover:bg-[#2a0815]/80' : 'bg-[#FFFAF0]/80 hover:bg-white';
  const borderColor = isDark ? 'border-rose-900/50' : 'border-rose-200/80';
  const textColor = isDark ? 'text-rose-200' : 'text-rose-800';
  const iconColor = isDark ? 'text-rose-400' : 'text-rose-400';
  const focusRing = isDark ? 'focus:ring-rose-800' : 'focus:ring-rose-200';
  const optionBg = isDark ? 'bg-[#1a050f]' : 'bg-[#FFFAF0]';

  return (
    <div className="flex flex-wrap items-center gap-3 mb-8">
      <div className={`flex items-center gap-2 mr-2 ${isDark ? 'text-rose-400' : 'text-rose-500'}`}>
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span className="text-2.5 uppercase font-serif tracking-[0.3em] font-semibold">
          Filter Entries
        </span>
      </div>

      <div className="relative inline-block group">
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className={`appearance-none cursor-pointer pl-5 pr-10 py-2 rounded-full text-xs font-serif uppercase tracking-widest shadow-sm transition-all outline-none border backdrop-blur-sm focus:ring-2 ${selectBg} ${borderColor} ${textColor} ${focusRing}`}
        >
          <option value="all" className={`${optionBg} ${textColor}`}>
            All Categories
          </option>
          {categories.map((cat) => (
            <option 
              key={cat.value} 
              value={cat.value} 
              className={`${optionBg} ${textColor}`}
            >
              {cat.label}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-transform group-hover:translate-y-[-30%] ${iconColor}`} />
      </div>

      <div className="relative inline-block group">
        <select
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
          className={`appearance-none cursor-pointer pl-5 pr-10 py-2 rounded-full text-xs font-serif uppercase tracking-widest shadow-sm transition-all outline-none border backdrop-blur-sm focus:ring-2 ${selectBg} ${borderColor} ${textColor} ${focusRing}`}
        >
          <option value="all" className={`${optionBg} ${textColor}`}>
            All Statuses
          </option>
          <option value="pending" className={`${optionBg} ${textColor}`}>
            Not Yet
          </option>
          <option value="planned" className={`${optionBg} ${textColor}`}>
            Planned
          </option>
          <option value="completed" className={`${optionBg} ${textColor}`}>
            Completed
          </option>
        </select>
        <ChevronDown className={`absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none transition-transform group-hover:translate-y-[-30%] ${iconColor}`} />
      </div>
    </div>
  );
};

export default BucketListFilters;