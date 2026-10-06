import React, { useRef, useEffect } from 'react';
import { Search, Loader2, X, Target, Layers, ArrowLeft } from 'lucide-react';
import { SearchMode } from '../types';

interface SearchBarProps {
  query: string;
  onChangeQuery: (q: string) => void;
  onSearch: (q?: string, mode?: SearchMode) => void;
  isLoading: boolean;
  popularQueries: { name: string; query: string }[];
  searchMode: SearchMode;
  onChangeSearchMode: (mode: SearchMode) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  query,
  onChangeQuery,
  onSearch,
  isLoading,
  popularQueries,
  searchMode,
  onChangeSearchMode,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading && query.trim()) {
      onSearch(query.trim(), searchMode);
    }
  };

  const handleChipClick = (chipQuery: string) => {
    if (isLoading) return;
    onChangeQuery(chipQuery);
    onSearch(chipQuery, searchMode);
  };

  const handleClear = () => {
    if (isLoading) return;
    onChangeQuery('');
    inputRef.current?.focus();
  };

  const handleTabChange = (mode: SearchMode) => {
    if (isLoading) return;
    onChangeSearchMode(mode);
    if (query.trim()) {
      onSearch(query.trim(), mode);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center pt-8 sm:pt-12 pb-6 px-4">
      
      {/* Editorial Kicker */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-cyan-50/80 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border border-cyan-200/80 dark:border-cyan-800/80 mb-4 shadow-2xs">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
        <span>موتور مقایسه زنده قیمت در ۱۰ مرجع تخصصی قطعات الکترونیک</span>
      </div>

      {/* Main Headline */}
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-tight mb-4">
        کشف <span className="bg-gradient-to-l from-cyan-600 via-sky-600 to-blue-600 dark:from-cyan-400 dark:via-sky-400 dark:to-blue-400 bg-clip-text text-transparent">ارزان‌ترین قیمت</span> قطعات
      </h1>
      
      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-7 font-medium leading-relaxed">
        استعلام بلادرنگ موجودی و کمترین قیمت ماژول‌ها، سنسورها و بردهای الکترونیکی میان فروشگاه‌های معتبر ایرانی با امکان صدور پیش‌فاکتور رسمی A4
      </p>

      {/* Segmented Search Mode Switcher */}
      <div className="max-w-xl mx-auto mb-4">
        <div className="grid grid-cols-2 p-1.5 bg-slate-200/70 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-300/70 dark:border-slate-700/80 shadow-inner">
          
          {/* Tab 1: Exact Search */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleTabChange('exact')}
            className={`btn-tactile flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              searchMode === 'exact'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Target className="w-4 h-4 shrink-0" />
            <span>جستجوی دقیق مدل</span>
            <span className="hidden sm:inline text-[11px] font-normal opacity-70">(مانند M18)</span>
          </button>

          {/* Tab 2: Broad Search */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleTabChange('broad')}
            className={`btn-tactile flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              searchMode === 'broad'
                ? 'bg-white dark:bg-slate-900 text-cyan-600 dark:text-cyan-400 shadow-md shadow-slate-200/50 dark:shadow-none'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4 shrink-0" />
            <span>جستجوی کلی کالا</span>
            <span className="hidden sm:inline text-[11px] font-normal opacity-70">(تمام ماژول‌ها)</span>
          </button>

        </div>
      </div>

      {/* Main Search Input Box */}
      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-5">
        <div className="relative flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-lg shadow-slate-200/40 dark:shadow-slate-950/60 focus-within:shadow-xl focus-within:border-cyan-500 focus-within:ring-4 focus-within:ring-cyan-500/15 transition-all p-2">
          
          {/* Prefix Search Icon */}
          <div className="pr-3 pl-2 text-slate-400 dark:text-slate-500 shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-cyan-600 dark:text-cyan-400 animate-spin" />
            ) : searchMode === 'exact' ? (
              <Target className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            ) : (
              <Search className="w-5 h-5 text-slate-400" />
            )}
          </div>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            disabled={isLoading}
            value={query}
            onChange={(e) => onChangeQuery(e.target.value)}
            placeholder={
              searchMode === 'exact'
                ? 'نام دقیق مدل را بنویسید (مثلاً ماژول بلوتوث M18، ESP32، DHT22)...'
                : 'نام کلی کالا را بنویسید (مثلاً ماژول بلوتوث، آردوینو، سنسور دما)...'
            }
            className="w-full py-2.5 sm:py-3 px-1 text-sm sm:text-base font-medium text-slate-900 dark:text-white placeholder-slate-400/90 dark:placeholder-slate-500 bg-transparent border-0 focus:outline-none focus:ring-0 disabled:opacity-60"
          />

          {/* Clear Button */}
          {query && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors shrink-0 ml-1 cursor-pointer"
              title="پاک کردن"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="btn-tactile shrink-0 flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-cyan-600/25 transition-all cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">در حال استعلام...</span>
              </>
            ) : (
              <>
                <span>استعلام قیمت</span>
                <ArrowLeft className="w-4 h-4 hidden sm:inline" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* Popular Suggestions Row */}
      {popularQueries.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-600 dark:text-slate-300 ml-1 text-[11px]">
            پیشنهادهای پرتکرار:
          </span>
          {popularQueries.slice(0, 6).map((item) => (
            <button
              key={item.name}
              type="button"
              disabled={isLoading}
              onClick={() => handleChipClick(item.query)}
              className="btn-tactile px-2.5 py-1 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-cyan-50 dark:hover:bg-cyan-950/60 hover:text-cyan-700 dark:hover:text-cyan-300 border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer text-[11px] font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {item.name}
            </button>
          ))}
        </div>
      )}

    </div>
  );
};
