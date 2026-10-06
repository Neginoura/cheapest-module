import React from 'react';
import { Cpu, Moon, Sun, Bookmark, Coins, LogOut, KeyRound } from 'lucide-react';
import { CurrencyMode } from '../types';
import { toPersianDigits } from '../utils/formatters';
import { PwaInstallPrompt } from './PwaInstallPrompt';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  currencyMode: CurrencyMode;
  onToggleCurrency: () => void;
  bookmarksCount: number;
  onOpenBookmarks: () => void;
  onResetSearch: () => void;
  onLogout?: () => void;
  onOpenPasswordSettings?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  currencyMode,
  onToggleCurrency,
  bookmarksCount,
  onOpenBookmarks,
  onResetSearch,
  onLogout,
  onOpenPasswordSettings,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Editorial Title */}
        <button
          onClick={onResetSearch}
          className="flex items-center gap-3 text-right group focus:outline-none cursor-pointer btn-tactile"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 via-sky-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-600/20 group-hover:shadow-cyan-600/35 transition-all">
            <Cpu className="w-5 h-5 transition-transform group-hover:rotate-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-slate-900 dark:text-white">
                ارزان‌ترین <span className="text-cyan-600 dark:text-cyan-400">ماژول</span>
              </span>
              <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>استعلام همزمان ۱۰ فروشگاه</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
              سامانه هوشمند کشف کمترین قیمت و صدور پیش‌فاکتور رسمی
            </p>
          </div>
        </button>

        {/* Actions & Settings Bar */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* PWA Install Button (Displays when installable or iOS guide) */}
          <PwaInstallPrompt />

          {/* Currency Switcher */}
          <button
            onClick={onToggleCurrency}
            className="btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200/90 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition-colors cursor-pointer"
            title="تغییر واحد پول (تومان / ریال)"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline text-slate-500 dark:text-slate-400">واحد:</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">
              {currencyMode === 'toman' ? 'تومان' : 'ریال'}
            </span>
          </button>

          {/* Bookmarks Drawer Trigger */}
          <button
            onClick={onOpenBookmarks}
            className="btn-tactile relative flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:bg-slate-200/90 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition-colors cursor-pointer"
            title="لیست نشان‌شده‌ها و پیش‌فاکتور"
          >
            <Bookmark className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden md:inline">نشان‌شده‌ها</span>
            {bookmarksCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[11px] font-black bg-cyan-600 text-white rounded-full shadow-xs">
                {toPersianDigits(bookmarksCount)}
              </span>
            )}
          </button>

          {/* Dark Mode Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="btn-tactile p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:bg-slate-200/90 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition-colors cursor-pointer"
            title={darkMode ? 'تغییر به حالت روشن' : 'تغییر به حالت تاریک'}
            aria-label="تغییر تم"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Password Settings */}
          {onOpenPasswordSettings && (
            <button
              onClick={onOpenPasswordSettings}
              className="btn-tactile p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-200/90 dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-800 transition-colors cursor-pointer"
              title="تغییر رمز عبور ورود"
              aria-label="تغییر رمز عبور"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          )}

          {/* Logout Button */}
          {onLogout && (
            <button
              onClick={onLogout}
              className="btn-tactile flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50/90 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200/80 dark:border-rose-900/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors cursor-pointer"
              title="خروج از حساب کاربری و قفل سامانه"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
