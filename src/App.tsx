/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { RecentSearches } from './components/RecentSearches';
import { StoreStatusBanner } from './components/StoreStatusBanner';
import { CheapestHeroCard } from './components/CheapestHeroCard';
import { FilterBar } from './components/FilterBar';
import { ProductCard } from './components/ProductCard';
import { ProductTableRow } from './components/ProductTableRow';
import { BookmarksDrawer } from './components/BookmarksDrawer';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { LoginScreen } from './components/LoginScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { isUserAuthenticated, logoutUser } from './config/authConfig';
import { getApiUrl } from './config/api';
import {
  loadBookmarksFromStorage,
  saveBookmarksToStorage,
  clearBookmarksFromStorage,
} from './utils/bookmarksStorage';
import {
  ProductItem,
  BookmarkedItem,
  SearchResponse,
  StoreStatus,
  CurrencyMode,
  ViewMode,
  FilterState,
  StoreKey,
  SearchMode,
} from './types';
import { copyToClipboard, toPersianDigits } from './utils/formatters';
import {
  Cpu,
  Layers,
  SearchX,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Zap,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  PackageCheck,
  PackageX,
  Target,
} from 'lucide-react';

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

const POPULAR_FALLBACK = [
  { name: 'ماژول بلوتوث M18', query: 'ماژول بلوتوث M18' },
  { name: 'ESP32', query: 'ESP32' },
  { name: 'سنسور دما DHT22', query: 'سنسور DHT22' },
  { name: 'آردوینو Uno', query: 'Arduino Uno' },
  { name: 'ماژول رله ۵ ولت', query: 'ماژول رله 5 ولت' },
  { name: 'ماژول شارژر TP4056', query: 'ماژول TP4056' },
  { name: 'نمایشگر OLED I2C', query: 'نمایشگر OLED' },
  { name: 'درایور موتور L298N', query: 'درایور L298N' },
  { name: 'سنسور التراسونیک SR04', query: 'سنسور SR04' },
  { name: 'ماژول بلوتوث HC-05', query: 'ماژول HC-05' },
];

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isUserAuthenticated());
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Theme & Settings
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [currencyMode, setCurrencyMode] = useState<CurrencyMode>(() => {
    return (localStorage.getItem('currency_mode') as CurrencyMode) || 'toman';
  });
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('view_mode') as ViewMode) || 'grid';
  });

  // Search & Mode State
  const [searchMode, setSearchMode] = useState<SearchMode>(() => {
    const p = new URLSearchParams(window.location.search);
    return (p.get('mode') as SearchMode) || 'exact';
  });

  const [query, setQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductItem[]>([]);
  const [storesStatus, setStoresStatus] = useState<StoreStatus[]>([]);
  const [cheapestItem, setCheapestItem] = useState<ProductItem | null>(null);
  const [averagePrice, setAveragePrice] = useState(0);
  const [highestPrice, setHighestPrice] = useState(0);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);

  // Popular Queries
  const [popularQueries, setPopularQueries] = useState(POPULAR_FALLBACK);

  // Recent Searches History
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('recent_searches');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Bookmarks with Quantity (Permanently loaded from localStorage)
  const [bookmarks, setBookmarks] = useState<BookmarkedItem[]>(() => loadBookmarksFromStorage());
  const [isBookmarksOpen, setIsBookmarksOpen] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    stores: ALL_STORE_KEYS,
    inStockOnly: false,
    minPrice: 0,
    maxPrice: Infinity,
    sortBy: 'price_asc',
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Update theme class on HTML element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Persist currency & view mode
  useEffect(() => {
    localStorage.setItem('currency_mode', currencyMode);
  }, [currencyMode]);

  useEffect(() => {
    localStorage.setItem('view_mode', viewMode);
  }, [viewMode]);

  // Persist recent searches
  useEffect(() => {
    localStorage.setItem('recent_searches', JSON.stringify(recentSearches));
  }, [recentSearches]);

  // Persist bookmarks with backup
  useEffect(() => {
    saveBookmarksToStorage(bookmarks);
  }, [bookmarks]);

  // Sync bookmarks across browser tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'bookmarked_modules') {
        setBookmarks(loadBookmarksFromStorage());
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Load popular modules on mount and handle URL query param
  useEffect(() => {
    fetch(getApiUrl('/api/popular'))
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setPopularQueries(data);
        }
      })
      .catch(() => {
        // Fallback already set
      });

    // Check query param
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const mode = (params.get('mode') as SearchMode) || 'exact';
    setSearchMode(mode);

    if (q) {
      setQuery(q);
      executeSearch(q, mode);
    }
  }, []);

  // Main search function with SearchMode & 503 Auto-Retry
  const executeSearch = async (searchTerm: string, modeToUse?: SearchMode) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const currentMode = modeToUse || searchMode;
    setIsLoading(true);
    setSearchError(null);
    setRetryStatus(null);
    setActiveSearch(trimmed);
    setSearchMode(currentMode);

    // Update URL query param cleanly without reload
    const url = new URL(window.location.href);
    url.searchParams.set('q', trimmed);
    url.searchParams.set('mode', currentMode);
    window.history.replaceState({}, '', url.toString());

    // Update recent searches
    setRecentSearches((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      return [trimmed, ...filtered].slice(0, 10);
    });

    const MAX_RETRIES = 2;
    let attempt = 0;
    let succeeded = false;

    try {
      while (attempt <= MAX_RETRIES && !succeeded) {
        if (attempt > 0) {
          setRetryStatus(`سرور موقتاً شلوغ است (کد ۵۰۳). در حال تلاش مجدد خودکار (تلاش ${attempt} از ۲)...`);
          // Wait 2500ms before retrying
          await new Promise((resolve) => setTimeout(resolve, 2500));
        }

        try {
          // Client-side timeout of at least 60 seconds (65s)
          const controller = new AbortController();
          const timeoutTimer = setTimeout(() => controller.abort(), 65000);

          const res = await fetch(
            getApiUrl(`/api/search?q=${encodeURIComponent(trimmed)}&mode=${currentMode}`),
            { signal: controller.signal }
          );
          clearTimeout(timeoutTimer);

          if (res.status === 503) {
            if (attempt < MAX_RETRIES) {
              attempt++;
              continue;
            } else {
              let errorMsg = 'سرور موقتاً با ترافیک بالا مواجه شد (کد ۵۰۳). لطفاً چند لحظه بعد مجدداً دکمه تلاش را بزنید.';
              try {
                const errJson = await res.json();
                if (errJson?.error) {
                  errorMsg = `${errJson.error} (کد ۵۰۳)`;
                }
              } catch {
                // Ignore parse errors
              }
              throw new Error(errorMsg);
            }
          }

          if (!res.ok) {
            let errorMsg = `خطای سرور (${res.status})`;
            try {
              const errJson = await res.json();
              if (errJson?.error) errorMsg = errJson.error;
            } catch {
              // Ignore parse errors
            }
            throw new Error(errorMsg);
          }

          const data: SearchResponse = await res.json();
          setSearchResults(data.results || []);
          setStoresStatus(data.stores || []);
          setCheapestItem(data.cheapestItem || null);
          setAveragePrice(data.averagePriceToman || 0);
          setHighestPrice(data.highestPriceToman || 0);

          // Reset store filters to all stores
          setFilters((prev) => ({
            ...prev,
            stores: ALL_STORE_KEYS,
          }));

          succeeded = true;
          break;
        } catch (innerErr: any) {
          if (innerErr?.name === 'AbortError') {
            throw new Error('زمان پاسخ‌دهی به پایان رسید (بیش از ۶۰ ثانیه). لطفاً مجدداً جستجو کنید.');
          }

          if (attempt < MAX_RETRIES && (innerErr?.message?.includes('۵۰۳') || innerErr?.name === 'TypeError')) {
            attempt++;
            continue;
          }

          throw innerErr;
        }
      }
    } catch (err: any) {
      console.error('Search failure:', err);
      setSearchError(
        err?.message || 'متأسفانه خطایی در استعلام لحظه‌ای از فروشگاه‌ها رخ داد (۵۰۳). لطفاً پس از چند ثانیه مجدداً امتحان کنید.'
      );
    } finally {
      setIsLoading(false);
      setRetryStatus(null);
    }
  };

  const handleToggleBookmark = (item: ProductItem) => {
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === item.id);
      let next: BookmarkedItem[];
      if (exists) {
        showToast('کالا از نشان‌شده‌ها حذف شد');
        next = prev.filter((b) => b.id !== item.id);
      } else {
        showToast('کالا با موفقیت به لیست نشان‌شده‌ها و پیش‌فاکتور افزوده شد');
        next = [...prev, { ...item, quantity: 1 }];
      }
      saveBookmarksToStorage(next);
      return next;
    });
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    setBookmarks((prev) => {
      const next = prev.map((item) => (item.id === id ? { ...item, quantity } : item));
      saveBookmarksToStorage(next);
      return next;
    });
  };

  const handleCopyLink = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      showToast('لینک مستقیم کالا با موفقیت کپی شد');
    }
  };

  const handleCopyTitle = async (title: string) => {
    const success = await copyToClipboard(title);
    if (success) {
      showToast('نام کالا در کلیپ‌بورد کپی شد');
    }
  };

  const handleRemoveRecent = (term: string) => {
    setRecentSearches((prev) => prev.filter((s) => s !== term));
  };

  const handleClearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem('recent_searches');
    showToast('تاریخچه جستجو پاک شد');
  };

  const handleResetSearch = () => {
    setQuery('');
    setActiveSearch('');
    setSearchResults([]);
    setStoresStatus([]);
    setCheapestItem(null);
    setSearchError(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    url.searchParams.delete('mode');
    window.history.replaceState({}, '', url.toString());
  };

  // Filtered & Sorted items
  const filteredItems = useMemo(() => {
    let items = [...searchResults];

    // Filter by selected stores
    items = items.filter((item) => filters.stores.includes(item.storeKey));

    // Filter in-stock only
    if (filters.inStockOnly) {
      items = items.filter((item) => item.inStock);
    }

    // Sort items: In-stock items strictly higher than out-of-stock items
    if (filters.sortBy === 'price_asc') {
      items.sort((a, b) => {
        if (a.inStock && !b.inStock) return -1;
        if (!a.inStock && b.inStock) return 1;
        return a.priceToman - b.priceToman;
      });
    } else if (filters.sortBy === 'price_desc') {
      items.sort((a, b) => {
        if (a.inStock && !b.inStock) return -1;
        if (!a.inStock && b.inStock) return 1;
        return b.priceToman - a.priceToman;
      });
    } else if (filters.sortBy === 'relevance') {
      items.sort((a, b) => {
        if (a.inStock && !b.inStock) return -1;
        if (!a.inStock && b.inStock) return 1;
        return (b.score || 0) - (a.score || 0);
      });
    }

    return items;
  }, [searchResults, filters]);

  // Split in-stock vs out-of-stock for clear visual presentation
  const inStockItems = useMemo(() => {
    return filteredItems.filter((i) => i.inStock);
  }, [filteredItems]);

  const outOfStockItems = useMemo(() => {
    return filteredItems.filter((i) => !i.inStock);
  }, [filteredItems]);

  const totalInStockOriginal = useMemo(() => {
    return searchResults.filter((i) => i.inStock).length;
  }, [searchResults]);

  const totalOutOfStockOriginal = useMemo(() => {
    return searchResults.filter((i) => !i.inStock).length;
  }, [searchResults]);

  const bookmarkedIds = useMemo(() => {
    return new Set(bookmarks.map((b) => b.id));
  }, [bookmarks]);

  // Gate check: If user is not authenticated, display login screen
  if (!isAuthenticated) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <LoginScreen
          onLoginSuccess={() => {
            setIsAuthenticated(true);
            showToast('با موفقیت وارد سامانه شدید');
          }}
          darkMode={darkMode}
        />
        {toastMessage && (
          <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
        )}
      </div>
    );
  }

  const handleLogout = () => {
    logoutUser();
    setIsAuthenticated(false);
    showToast('با موفقیت از سامانه خارج شدید');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        onSuccess={(msg) => showToast(msg)}
      />

      {/* Bookmarks Drawer */}
      <BookmarksDrawer
        isOpen={isBookmarksOpen}
        onClose={() => setIsBookmarksOpen(false)}
        bookmarks={bookmarks}
        currencyMode={currencyMode}
        onRemoveBookmark={(id) => {
          setBookmarks((prev) => {
            const next = prev.filter((b) => b.id !== id);
            saveBookmarksToStorage(next);
            return next;
          });
          showToast('کالا از نشان‌شده‌ها حذف شد');
        }}
        onUpdateQuantity={handleUpdateQuantity}
        onClearAllBookmarks={() => {
          setBookmarks([]);
          clearBookmarksFromStorage();
          showToast('لیست نشان‌شده‌ها به طور کامل پاک شد');
        }}
      />

      {/* Header */}
      <Header
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        currencyMode={currencyMode}
        onToggleCurrency={() =>
          setCurrencyMode((prev) => (prev === 'toman' ? 'rial' : 'toman'))
        }
        bookmarksCount={bookmarks.length}
        onOpenBookmarks={() => setIsBookmarksOpen(true)}
        onResetSearch={handleResetSearch}
        onLogout={handleLogout}
        onOpenPasswordSettings={() => setIsChangePasswordOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Search Hero Area with Exact & Broad Mode Tabs */}
        <SearchBar
          query={query}
          onChangeQuery={setQuery}
          onSearch={(q, m) => executeSearch(q || query, m || searchMode)}
          isLoading={isLoading}
          popularQueries={popularQueries}
          searchMode={searchMode}
          onChangeSearchMode={(m) => {
            setSearchMode(m);
            if (activeSearch) {
              executeSearch(activeSearch, m);
            }
          }}
        />

        {/* Recent Searches */}
        {!activeSearch && recentSearches.length > 0 && (
          <RecentSearches
            searches={recentSearches}
            onSelect={(s) => {
              setQuery(s);
              executeSearch(s, searchMode);
            }}
            onRemove={handleRemoveRecent}
            onClearAll={handleClearAllRecent}
          />
        )}

        {/* Store Status Banner */}
        {storesStatus.length > 0 && (
          <StoreStatusBanner
            stores={storesStatus}
            onRetry={() => executeSearch(activeSearch, searchMode)}
            isSearching={isLoading}
          />
        )}

        {/* Loading State Animation */}
        {isLoading && (
          <div className="max-w-7xl mx-auto px-4 py-16 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg mb-4">
              <RefreshCw className="w-8 h-8 text-cyan-600 dark:text-cyan-400 animate-spin" />
            </div>

            {retryStatus ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700 mb-4 animate-pulse">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>{retryStatus}</span>
              </div>
            ) : (
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                در حال استعلام همزمان از ۱۰ فروشگاه قطعات الکترونیک...
              </h3>
            )}

            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              حالت جستجو: {searchMode === 'exact' ? '«جستجوی دقیق مدل»' : '«جستجوی کلی کالا»'} • استعلام زنده از ECA، روبوایکیو، دانشجو کیت، کافه ربات، ایران میکرو، جوان الکترونیک، مکاترونیک، جم ترونیک، ربوچیپ و آفتاب رایانه
            </p>
          </div>
        )}

        {/* Error State */}
        {searchError && !isLoading && (
          <div className="max-w-2xl mx-auto px-4 py-10">
            <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-base font-bold text-rose-800 dark:text-rose-300">
                خطا در برقراری ارتباط با سرور
              </h3>
              <p className="text-xs sm:text-sm text-rose-600 dark:text-rose-400">
                {searchError}
              </p>
              <button
                onClick={() => executeSearch(activeSearch, searchMode)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تلاش مجدد</span>
              </button>
            </div>
          </div>
        )}

        {/* Empty State: No results found */}
        {!isLoading && !searchError && activeSearch && searchResults.length === 0 && (
          <div className="max-w-xl mx-auto px-4 py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              کالایی با عبارت «{activeSearch}» {searchMode === 'exact' ? 'در حالت جستجوی دقیق' : ''} یافت نشد!
            </h3>
            
            {searchMode === 'exact' ? (
              <div className="space-y-4 mb-6">
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md mx-auto">
                  در حالت <b>جستجوی دقیق</b>، فقط عناوینی که دقیقاً کد یا مدل نوشته شده را دارند بررسی می‌شوند. می‌توانید با زدن دکمه زیر به <b>جستجوی کلی</b> تغییر حالت دهید تا تمام ماژول‌های مشابه و مرتبط نیز نمایش داده شوند.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchMode('broad');
                    executeSearch(activeSearch, 'broad');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-600/20 transition-all"
                >
                  <Layers className="w-4 h-4" />
                  <span>تغییر به «جستجوی کلی» برای دیدن همه موارد مرتبط</span>
                </button>
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                پیشنهاد می‌کنیم نام ماژول را ساده‌تر یا به انگلیسی جستجو فرمایید (مثلاً: ESP32، رله، DHT22، آردوینو، LM2596 و ...).
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center gap-2">
              {popularQueries.slice(0, 4).map((p) => (
                <button
                  key={p.query}
                  onClick={() => {
                    setQuery(p.query);
                    executeSearch(p.query, searchMode);
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 transition-colors"
                >
                  جستجوی «{p.name}»
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Found State */}
        {!isLoading && searchResults.length > 0 && (
          <>
            {/* Spotlight Hero Card for the Cheapest Item */}
            {cheapestItem && (
              <CheapestHeroCard
                item={cheapestItem}
                averagePrice={averagePrice}
                highestPrice={highestPrice}
                currencyMode={currencyMode}
                isBookmarked={bookmarkedIds.has(cheapestItem.id)}
                onToggleBookmark={handleToggleBookmark}
                onCopyLink={handleCopyLink}
                onCopyTitle={handleCopyTitle}
              />
            )}

            {/* Filter and Sorting Toolbar */}
            <FilterBar
              filters={filters}
              onChangeFilters={setFilters}
              availableStores={storesStatus}
              totalFiltered={filteredItems.length}
              totalOriginal={searchResults.length}
              inStockCount={totalInStockOriginal}
              outOfStockCount={totalOutOfStockOriginal}
              viewMode={viewMode}
              onChangeViewMode={setViewMode}
            />

            {/* Product Items Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 space-y-10">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    هیچ کالایی با فیلترهای انتخابی مطابقت ندارد.
                  </p>
                  <button
                    onClick={() =>
                      setFilters({
                        stores: ALL_STORE_KEYS,
                        inStockOnly: false,
                        minPrice: 0,
                        maxPrice: Infinity,
                        sortBy: 'price_asc',
                      })
                    }
                    className="text-xs text-cyan-600 hover:underline"
                  >
                    بازنشانی فیلترها
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <>
                  {/* In-Stock Section */}
                  {inStockItems.length > 0 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70 dark:border-emerald-900/60">
                        <div className="flex items-center gap-2.5">
                          <PackageCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                            کالاهای موجود و آماده ارسال
                          </h3>
                          <span className="px-3 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
                            {toPersianDigits(inStockItems.length)} کالا
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
                          مرتب‌شده بر اساس کمترین قیمت
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {inStockItems.map((item) => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            currencyMode={currencyMode}
                            isBookmarked={bookmarkedIds.has(item.id)}
                            onToggleBookmark={handleToggleBookmark}
                            onCopyLink={handleCopyLink}
                            onCopyTitle={handleCopyTitle}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Out of Stock Section (Shown only if inStockOnly is false and out-of-stock items exist) */}
                  {!filters.inStockOnly && outOfStockItems.length > 0 && (
                    <div className="space-y-4 pt-6 border-t-2 border-dashed border-slate-200/80 dark:border-slate-800 animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3.5 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40">
                        <div className="flex items-center gap-2">
                          <PackageX className="w-5 h-5 text-rose-500" />
                          <h3 className="text-xs sm:text-sm font-bold text-rose-900 dark:text-rose-200">
                            کالاهای ناموجود در انبار ({toPersianDigits(outOfStockItems.length)} مورد)
                          </h3>
                        </div>
                        <p className="text-xs text-rose-700 dark:text-rose-400">
                          این اقلام در حال حاضر ناموجودند، اما قیمت‌های آن‌ها جهت برآورد هزینه و مقایسه نمایش داده شده است.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                        {outOfStockItems.map((item) => (
                          <ProductCard
                            key={item.id}
                            item={item}
                            currencyMode={currencyMode}
                            isBookmarked={bookmarkedIds.has(item.id)}
                            onToggleBookmark={handleToggleBookmark}
                            onCopyLink={handleCopyLink}
                            onCopyTitle={handleCopyTitle}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Table View */
                <div className="overflow-x-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <th className="py-3 px-3 w-16 text-center">تصویر</th>
                        <th className="py-3 px-4">عنوان قطعه</th>
                        <th className="py-3 px-3">فروشگاه</th>
                        <th className="py-3 px-3 text-center">وضعیت موجودی</th>
                        <th className="py-3 px-4 text-left">قیمت</th>
                        <th className="py-3 px-3 text-left">عملیات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* In-Stock rows first */}
                      {inStockItems.map((item) => (
                        <ProductTableRow
                          key={item.id}
                          item={item}
                          currencyMode={currencyMode}
                          isBookmarked={bookmarkedIds.has(item.id)}
                          onToggleBookmark={handleToggleBookmark}
                          onCopyLink={handleCopyLink}
                          onCopyTitle={handleCopyTitle}
                        />
                      ))}

                      {/* Divider in table if both exist */}
                      {!filters.inStockOnly && outOfStockItems.length > 0 && inStockItems.length > 0 && (
                        <tr className="bg-rose-50/40 dark:bg-rose-950/20 border-y border-rose-200 dark:border-rose-900/50">
                          <td colSpan={6} className="py-2.5 px-4 text-xs font-bold text-rose-800 dark:text-rose-300">
                            کالاهای ناموجود در انبار ({toPersianDigits(outOfStockItems.length)} مورد در پایین جدول)
                          </td>
                        </tr>
                      )}

                      {/* Out-of-Stock rows */}
                      {!filters.inStockOnly &&
                        outOfStockItems.map((item) => (
                          <ProductTableRow
                            key={item.id}
                            item={item}
                            currencyMode={currencyMode}
                            isBookmarked={bookmarkedIds.has(item.id)}
                            onToggleBookmark={handleToggleBookmark}
                            onCopyLink={handleCopyLink}
                            onCopyTitle={handleCopyTitle}
                          />
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* Initial Empty State (When no search has been executed yet) */}
        {!activeSearch && !isLoading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-16 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Feature 1 */}
              <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-cyan-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 to-sky-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-cyan-600/20 group-hover:scale-105 transition-transform">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2.5">
                  جستجوی هوشمند و دوگانه
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  امکان تفکیک بین دو حالت «جستجوی دقیق مدل» برای انطباق ۱۰۰٪ با پارت نامبر قطعه (مثل M18) و «جستجوی کلی کالا» جهت بررسی تمام ماژول‌های مشابه و مرتبط.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                  <PackageCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2.5">
                  پیش‌فاکتور رسمی تک‌صفحه‌ای A4
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  افزودن قطعات به سبد نشان‌شده‌ها، تعیین تعداد دقیق هر قطعه، پیش‌نمایش برگه رسمی و چاپ فوری فایل PDF استاندارد یک صفحه‌ای با فونت یکپارچه برنامه.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-7 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-blue-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col items-start group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center mb-5 shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2.5">
                  پایش زنده ۱۰ مرجع تخصصی
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  استعلام همزمان قیمت و موجودی انبار از فروشگاه‌های ECA، روبوایکیو، دانشجو کیت، کافه ربات، ایران میکرو، جوان الکترونیک، مکاترونیک، جم ترونیک، ربوچیپ و آفتاب رایانه.
                </p>
              </div>

            </div>

            {/* Quick guide banner */}
            <div className="mt-8 p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5 border border-slate-700/60">
              <div className="space-y-1.5 text-center sm:text-right">
                <h4 className="text-base sm:text-lg font-black tracking-tight">
                  آماده پیدا کردن کمترین قیمت ماژول‌ها هستید؟
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 font-medium">
                  کافیست در کادر جستجوی بالا، نام مدل یا ماژول مورد نظر خود مانند «ماژول بلوتوث M18» یا «ESP32» را وارد کنید.
                </p>
              </div>
              <button
                onClick={() => {
                  setQuery('ماژول بلوتوث M18');
                  executeSearch('ماژول بلوتوث M18', 'exact');
                }}
                className="btn-tactile shrink-0 px-6 py-3 rounded-xl bg-gradient-to-l from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25 cursor-pointer"
              >
                جستجوی نمونه «M18»
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
