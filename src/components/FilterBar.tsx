import React from 'react';
import { ArrowUpDown, LayoutGrid, ListFilter, SlidersHorizontal, X, CheckCircle2 } from 'lucide-react';
import { FilterState, SortOption, ViewMode, StoreStatus, StoreKey } from '../types';
import { toPersianDigits } from '../utils/formatters';

const ALL_STORE_KEYS: StoreKey[] = [
  'eca',
  'roboeq',
  'djk',
  'caferobot',
  'iranmicro',
  'javanelec',
  'mclc',
  'jamtronic',
  'robochip',
  'aftabrayaneh',
];

interface FilterBarProps {
  filters: FilterState;
  onChangeFilters: (filters: FilterState) => void;
  availableStores: StoreStatus[];
  totalFiltered: number;
  totalOriginal: number;
  inStockCount: number;
  outOfStockCount: number;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChangeFilters,
  availableStores,
  totalFiltered,
  totalOriginal,
  inStockCount,
  outOfStockCount,
  viewMode,
  onChangeViewMode,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleToggleStore = (key: StoreKey) => {
    let nextStores = [...filters.stores];
    if (nextStores.includes(key)) {
      if (nextStores.length > 1) {
        nextStores = nextStores.filter((k) => k !== key);
      }
    } else {
      nextStores.push(key);
    }
    onChangeFilters({ ...filters, stores: nextStores });
  };

  const handleToggleInStock = (onlyInStock: boolean) => {
    onChangeFilters({ ...filters, inStockOnly: onlyInStock });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChangeFilters({ ...filters, sortBy: e.target.value as SortOption });
  };

  const handleResetFilters = () => {
    onChangeFilters({
      stores: ALL_STORE_KEYS,
      inStockOnly: false,
      minPrice: 0,
      maxPrice: Infinity,
      sortBy: 'price_asc',
    });
  };

  const hasActiveFilters =
    filters.inStockOnly ||
    filters.stores.length < ALL_STORE_KEYS.length ||
    filters.sortBy !== 'price_asc';

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xs transition-colors">
        
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Segmented Stock Status Controls */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
            <button
              onClick={() => handleToggleInStock(false)}
              className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                !filters.inStockOnly
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>همه نتایج</span>
              <span className="text-[11px] font-mono opacity-70">
                ({toPersianDigits(totalOriginal)})
              </span>
            </button>

            <button
              onClick={() => handleToggleInStock(true)}
              className={`btn-tactile flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filters.inStockOnly
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>فقط موجودها</span>
              <span className="text-[11px] font-mono opacity-85">
                ({toPersianDigits(inStockCount)})
              </span>
            </button>
          </div>

          {/* Right Action Controls: Sort, View Switcher & Store Filter Trigger */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Sort Select */}
            <div className="relative inline-flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 absolute right-3 text-slate-400 pointer-events-none" />
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="appearance-none bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl pr-9 pl-3.5 py-2 border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer"
              >
                <option value="price_asc">مرتب‌سازی: موجودها در ابتدا، ارزان‌ترین به گران‌ترین</option>
                <option value="price_desc">مرتب‌سازی: گران‌ترین به ارزان‌ترین</option>
                <option value="relevance">مرتب‌سازی: بیشترین انطباق با عبارت جستجو</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="hidden sm:inline-flex items-center rounded-xl border border-slate-200/80 dark:border-slate-700/80 p-0.5 bg-slate-100/90 dark:bg-slate-800/90">
              <button
                onClick={() => onChangeViewMode('grid')}
                className={`btn-tactile p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="نمایش شبکه‌ای (کارت)"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => onChangeViewMode('table')}
                className={`btn-tactile p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
                title="نمایش جدولی و مقایسه‌ای"
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>

            {/* Expand / Filter button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                isExpanded || filters.stores.length < ALL_STORE_KEYS.length
                  ? 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800'
                  : 'bg-slate-100/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/80'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فیلتر ۱۰ فروشگاه</span>
            </button>
          </div>
        </div>

        {/* Collapsible Store Filters */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-200/80 dark:border-slate-800 animate-fade-in">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  انتخاب یا عدم نمایش فروشگاه‌ها:
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="btn-tactile flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>بازنشانی فیلترها</span>
                  </button>
                )}
              </div>

              {/* Store Filter Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {availableStores.map((store) => {
                  const isChecked = filters.stores.includes(store.key);
                  return (
                    <button
                      key={store.key}
                      onClick={() => handleToggleStore(store.key)}
                      className={`btn-tactile flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all text-right cursor-pointer ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-xs'
                          : 'bg-slate-50/70 dark:bg-slate-800/30 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div
                          className={`w-3.5 h-3.5 rounded flex items-center justify-center border text-[10px] shrink-0 font-bold ${
                            isChecked
                              ? 'bg-cyan-500 border-cyan-500 text-white'
                              : 'border-slate-400 text-transparent'
                          }`}
                        >
                          ✓
                        </div>
                        <span className="truncate">{store.name}</span>
                      </div>
                      <span className="text-[11px] font-mono opacity-80 shrink-0 mr-1">
                        ({toPersianDigits(store.itemCount)})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
