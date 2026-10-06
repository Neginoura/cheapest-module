import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { StoreStatus } from '../types';
import { toPersianDigits } from '../utils/formatters';

interface StoreStatusBannerProps {
  stores: StoreStatus[];
  onRetry: () => void;
  isSearching: boolean;
}

export const StoreStatusBanner: React.FC<StoreStatusBannerProps> = ({
  stores,
  onRetry,
  isSearching,
}) => {
  if (!stores || stores.length === 0) return null;

  const errorStores = stores.filter(s => s.status === 'error' || s.status === 'timeout');
  const successStores = stores.filter(s => s.status === 'success' && s.itemCount > 0);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 animate-fade-in">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-800/90 rounded-2xl p-4 shadow-xs">
        
        {/* Banner Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              وضعیت استعلام لحظه‌ای در ۱۰ مرجع تخصصی:
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{toPersianDigits(successStores.length)} فروشگاه دارای نتیجه</span>
            </div>
          </div>

          {errorStores.length > 0 && (
            <button
              onClick={onRetry}
              disabled={isSearching}
              className="btn-tactile inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSearching ? 'animate-spin' : ''}`} />
              <span>استعلام مجدد فروشگاه‌های دارای وقفه</span>
            </button>
          )}
        </div>

        {/* 10 Stores Micro Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {stores.map((store) => {
            const isSuccess = store.status === 'success' && store.itemCount > 0;
            const isEmpty = store.status === 'empty' || (store.status === 'success' && store.itemCount === 0);

            return (
              <div
                key={store.key}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-colors ${
                  isSuccess
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/60 text-slate-900 dark:text-slate-100'
                    : isEmpty
                    ? 'bg-slate-50/70 dark:bg-slate-800/30 border-slate-200/70 dark:border-slate-800 text-slate-400 dark:text-slate-500'
                    : 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-800/50 text-amber-800 dark:text-amber-300'
                }`}
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  {isSuccess ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  ) : isEmpty ? (
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  )}
                  <span className="font-bold truncate text-[11px] sm:text-xs">{store.name}</span>
                </div>

                <div className="text-left shrink-0 mr-1.5 font-mono">
                  {isSuccess ? (
                    <span className="font-black text-emerald-700 dark:text-emerald-400 text-[11px]">
                      {toPersianDigits(store.itemCount)}
                    </span>
                  ) : isEmpty ? (
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans">۰ کالا</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400 text-[10px] font-sans" title={store.error || 'در دسترس نبود'}>
                      تایم‌اوت
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
