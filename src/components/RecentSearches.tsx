import React from 'react';
import { History, X, Trash2 } from 'lucide-react';

interface RecentSearchesProps {
  searches: string[];
  onSelect: (query: string) => void;
  onRemove: (query: string) => void;
  onClearAll: () => void;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelect,
  onRemove,
  onClearAll,
}) => {
  if (searches.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mb-6 px-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>جستجوهای اخیر شما:</span>
        </div>
        <button
          onClick={onClearAll}
          className="text-xs text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 flex items-center gap-1 transition-colors"
          title="پاک کردن تمام تاریخچه"
        >
          <Trash2 className="w-3 h-3" />
          <span>پاک‌سازی تاریخچه</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((item) => (
          <div
            key={item}
            className="inline-flex items-center gap-1.5 pl-1.5 pr-3 py-1 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs group"
          >
            <button
              onClick={() => onSelect(item)}
              className="hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors"
            >
              {item}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(item);
              }}
              className="p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              title="حذف"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
