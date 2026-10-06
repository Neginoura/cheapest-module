import React, { useMemo, useState } from 'react';
import {
  X,
  Trash2,
  Bookmark,
  ShoppingBag,
  Store,
  FileText,
  Plus,
  Minus,
  Eye,
} from 'lucide-react';
import { BookmarkedItem, CurrencyMode, StoreKey } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import { InvoiceModal } from './InvoiceModal';

interface BookmarksDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: BookmarkedItem[];
  currencyMode: CurrencyMode;
  onRemoveBookmark: (id: string) => void;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onClearAllBookmarks: () => void;
}

export const BookmarksDrawer: React.FC<BookmarksDrawerProps> = ({
  isOpen,
  onClose,
  bookmarks,
  currencyMode,
  onRemoveBookmark,
  onUpdateQuantity,
  onClearAllBookmarks,
}) => {
  const [activeInvoiceStore, setActiveInvoiceStore] = useState<{
    storeName?: string;
    items: BookmarkedItem[];
    title: string;
  } | null>(null);

  // Group bookmarks by store
  const groupedByStore = useMemo(() => {
    const map = new Map<
      string,
      {
        storeName: string;
        storeKey: StoreKey;
        storeBadgeColor: string;
        items: BookmarkedItem[];
      }
    >();

    bookmarks.forEach((item) => {
      const key = item.storeKey || item.storeName;
      if (!map.has(key)) {
        map.set(key, {
          storeName: item.storeName,
          storeKey: item.storeKey,
          storeBadgeColor: item.storeBadgeColor,
          items: [],
        });
      }
      map.get(key)!.items.push(item);
    });

    return Array.from(map.values());
  }, [bookmarks]);

  // Overall totals across all stores
  const grandTotalToman = useMemo(() => {
    return bookmarks.reduce(
      (sum, item) => sum + item.priceToman * (item.quantity || 1),
      0
    );
  }, [bookmarks]);

  const totalPieces = useMemo(() => {
    return bookmarks.reduce((sum, item) => sum + (item.quantity || 1), 0);
  }, [bookmarks]);

  const formattedGrandTotal = formatPrice(grandTotalToman, currencyMode);

  if (!isOpen) return null;

  // Open Preview Modal for a specific store
  const handleOpenStoreInvoice = (storeName: string, storeItems: BookmarkedItem[]) => {
    setActiveInvoiceStore({
      storeName,
      items: storeItems,
      title: `پیش‌فاکتور خرید از ${storeName}`,
    });
  };

  // Open Preview Modal for all stores combined
  const handleOpenAllStoresInvoice = () => {
    setActiveInvoiceStore({
      storeName: undefined,
      items: bookmarks,
      title: 'پیش‌فاکتور جامع تأمین قطعات (تمام فروشگاه‌ها)',
    });
  };

  return (
    <>
      {/* Invoice Preview Modal */}
      {activeInvoiceStore && (
        <InvoiceModal
          isOpen={true}
          onClose={() => setActiveInvoiceStore(null)}
          title={activeInvoiceStore.title}
          items={activeInvoiceStore.items}
          currencyMode={currencyMode}
          storeName={activeInvoiceStore.storeName}
        />
      )}

      <div className="fixed inset-0 z-40 overflow-hidden animate-fade-in">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
          <div className="w-screen max-w-lg bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 shadow-2xl flex flex-col">
            
            {/* Drawer Top Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-100 dark:bg-cyan-950/80 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shadow-xs">
                  <Bookmark className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                    نشان‌شده‌ها و پیش‌فاکتورها
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    تفکیک شده در {toPersianDigits(groupedByStore.length)} فروشگاه (مجموع {toPersianDigits(bookmarks.length)} ردیف)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {bookmarks.length > 0 && (
                  <button
                    onClick={onClearAllBookmarks}
                    className="btn-tactile p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
                    title="پاک کردن تمام نشان‌شده‌ها"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="btn-tactile p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body: Grouped by store */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {bookmarks.length === 0 ? (
                <div className="text-center py-20 px-4">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4 text-slate-400">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
                    هنوز کالایی را نشان نکرده‌اید!
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                    روی علامت نشان (Bookmark) در کنار هر قطعه کلیک کنید تا به لیست پیش‌فاکتور تفکیک‌شده اضافه شود.
                  </p>
                </div>
              ) : (
                groupedByStore.map((group) => {
                  const storeTotalToman = group.items.reduce(
                    (s, it) => s + it.priceToman * (it.quantity || 1),
                    0
                  );
                  const storeFormatted = formatPrice(storeTotalToman, currencyMode);

                  return (
                    <div
                      key={group.storeKey || group.storeName}
                      className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-xs"
                    >
                      {/* Store Header Bar */}
                      <div className="p-3.5 sm:p-4 bg-slate-50/70 dark:bg-slate-800/60 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${group.storeBadgeColor}`}
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>{group.storeName}</span>
                          </span>
                          <span className="text-[11px] text-slate-500 font-bold">
                            ({toPersianDigits(group.items.length)} کالا)
                          </span>
                        </div>

                        {/* Open Preview Modal Button */}
                        <button
                          onClick={() => handleOpenStoreInvoice(group.storeName, group.items)}
                          className="btn-tactile inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-50 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 hover:bg-cyan-100 dark:hover:bg-cyan-900 transition-colors shadow-2xs cursor-pointer"
                          title={`مشاهده پیش‌نمایش و صدور پیش‌فاکتور ${group.storeName}`}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>پیش‌فاکتور {group.storeName}</span>
                        </button>
                      </div>

                      {/* Items from this store */}
                      <div className="p-3.5 divide-y divide-slate-100 dark:divide-slate-800/80 space-y-3">
                        {group.items.map((item) => {
                          const qty = item.quantity || 1;
                          const unitPrice = formatPrice(item.priceToman, currencyMode);
                          const linePrice = formatPrice(item.priceToman * qty, currencyMode);

                          return (
                            <div
                              key={item.id}
                              className="pt-3 first:pt-0 flex items-start gap-3"
                            >
                              {/* Thumbnail */}
                              <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0 flex items-center justify-center overflow-hidden">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="max-h-full max-w-full object-contain"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80';
                                  }}
                                />
                              </div>

                              {/* Title, Quantity & Prices */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-1 mb-1">
                                  <h4
                                    className="text-xs font-bold text-slate-900 dark:text-white line-clamp-2 leading-relaxed"
                                    title={item.title}
                                  >
                                    {item.title}
                                  </h4>
                                  <button
                                    onClick={() => onRemoveBookmark(item.id)}
                                    className="btn-tactile p-1 text-slate-400 hover:text-rose-500 shrink-0 cursor-pointer"
                                    title="حذف"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Stock status and unit price */}
                                <div className="flex items-center gap-2 text-[11px] mb-2 text-slate-500 dark:text-slate-400 font-medium">
                                  <span>واحد: {unitPrice.amount} {unitPrice.unit}</span>
                                  <span>•</span>
                                  {item.inStock ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                      موجود
                                    </span>
                                  ) : (
                                    <span className="text-rose-500 font-bold">ناموجود</span>
                                  )}
                                </div>

                                {/* Stepper & Subtotal */}
                                <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                  {/* Quantity Stepper */}
                                  <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 overflow-hidden shadow-2xs">
                                    <button
                                      onClick={() =>
                                        onUpdateQuantity(item.id, Math.max(1, qty - 1))
                                      }
                                      disabled={qty <= 1}
                                      className="btn-tactile p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 cursor-pointer"
                                      title="کاهش تعداد"
                                    >
                                      <Minus className="w-3 h-3" />
                                    </button>

                                    <span className="px-2.5 py-0.5 text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
                                      {toPersianDigits(qty)}
                                    </span>

                                    <button
                                      onClick={() => onUpdateQuantity(item.id, qty + 1)}
                                      className="btn-tactile p-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                                      title="افزایش تعداد"
                                    >
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>

                                  {/* Line Total */}
                                  <div className="text-left font-mono">
                                    <span className="text-xs font-black text-slate-900 dark:text-white">
                                      {linePrice.amount}
                                    </span>{' '}
                                    <span className="text-[10px] font-bold text-slate-500">
                                      {linePrice.unit}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Store Subtotal Footer */}
                      <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-bold">جمع این فروشگاه:</span>
                        <div className="font-black text-slate-900 dark:text-white font-mono">
                          {storeFormatted.amount}{' '}
                          <span className="text-[10px] font-bold text-slate-400">
                            {storeFormatted.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Overall Summary & Open All Stores Preview */}
            {bookmarks.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      جمع کل تمام فروشگاه‌ها:
                    </span>
                    <div className="text-[11px] font-medium text-slate-400">
                      {toPersianDigits(bookmarks.length)} ردیف ({toPersianDigits(totalPieces)} قطعه)
                    </div>
                  </div>
                  <div className="flex items-baseline gap-1 font-mono">
                    <span className="text-2xl font-black text-cyan-600 dark:text-cyan-400 tracking-tight">
                      {formattedGrandTotal.amount}
                    </span>
                    <span className="text-xs font-bold text-slate-500">
                      {formattedGrandTotal.unit}
                    </span>
                  </div>
                </div>

                {/* Primary Global Action Button */}
                <button
                  onClick={handleOpenAllStoresInvoice}
                  className="btn-tactile w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-l from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-cyan-600/25 transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>مشاهده و صدور پیش‌فاکتور رسمی جامع</span>
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};
