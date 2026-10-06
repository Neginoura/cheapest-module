import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Bookmark, Sparkles, Store, XCircle } from 'lucide-react';
import { ProductItem, CurrencyMode } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductCardProps {
  item: ProductItem;
  currencyMode: CurrencyMode;
  isBookmarked: boolean;
  onToggleBookmark: (item: ProductItem) => void;
  onCopyLink: (url: string) => void;
  onCopyTitle: (title: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  item,
  currencyMode,
  isBookmarked,
  onToggleBookmark,
  onCopyLink,
  onCopyTitle,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);

  const priceObj = formatPrice(item.priceToman, currencyMode);

  const handleCopyLink = () => {
    onCopyLink(item.productUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyTitle = () => {
    onCopyTitle(item.title);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl transition-all duration-200 overflow-hidden ${
        item.isCheapest && item.inStock
          ? 'border-2 border-emerald-500 bg-white dark:bg-slate-900 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
          : item.inStock
          ? 'border border-slate-200/90 dark:border-slate-800/90 hover:border-cyan-500/40 dark:hover:border-cyan-500/30 bg-white dark:bg-slate-900 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-950/70'
          : 'border border-dashed border-rose-200 dark:border-rose-900/50 bg-slate-50/60 dark:bg-slate-900/40 opacity-75 hover:opacity-100'
      }`}
    >
      {/* Cheapest Badge Banner */}
      {item.isCheapest && item.inStock && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-extrabold py-1 px-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>کمترین قیمت موجود در بازار</span>
          </div>
          <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full">پیشنهاد برتر</span>
        </div>
      )}

      {/* Out of Stock Notice Banner */}
      {!item.inStock && (
        <div className="bg-rose-500/10 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] font-bold py-1 px-3.5 flex items-center justify-between border-b border-rose-200/60 dark:border-rose-900/60">
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-rose-500" />
            <span>اتمام موجودی در این فروشگاه</span>
          </div>
          <span className="text-[10px] bg-rose-200/60 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 px-1.5 py-0.2 rounded font-medium">
            ناموجود
          </span>
        </div>
      )}

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Top Header: Store & Stock Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${item.storeBadgeColor}`}>
            <Store className="w-3 h-3" />
            <span>{item.storeName}</span>
          </span>

          <div className="flex items-center gap-1.5">
            {item.inStock ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>موجود</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-800 px-2.5 py-0.5 rounded-full shadow-2xs">
                <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                <span>ناموجود</span>
              </span>
            )}

            {/* Bookmark button */}
            <button
              onClick={() => onToggleBookmark(item)}
              className={`btn-tactile p-1.5 rounded-xl transition-colors cursor-pointer ${
                isBookmarked
                  ? 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/70 dark:text-cyan-300 shadow-2xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن کالا و افزودن به پیش‌فاکتور'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Thumbnail Showcase */}
        <div className="relative w-full h-40 mb-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-800/80">
          <img
            src={item.imageUrl}
            alt={item.title}
            className={`max-h-full max-w-full object-contain transition-transform duration-300 ${
              item.inStock ? 'group-hover:scale-105' : 'grayscale-30 opacity-75'
            }`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80';
            }}
          />

          {!item.inStock && (
            <div className="absolute inset-0 bg-slate-900/15 dark:bg-slate-950/40 flex items-center justify-center backdrop-blur-[0.5px]">
              <span className="px-3 py-1 rounded-lg text-xs font-black bg-rose-600 text-white shadow-md">
                عدم موجودی
              </span>
            </div>
          )}
        </div>

        {/* Product Title */}
        <h3
          className={`text-sm font-bold line-clamp-2 mb-2.5 leading-relaxed h-11 ${
            item.inStock
              ? 'text-slate-900 dark:text-white'
              : 'text-slate-600 dark:text-slate-300'
          }`}
          title={item.title}
        >
          {item.title}
        </h3>

        {/* Price Section */}
        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {item.inStock ? 'قیمت نهایی:' : 'آخرین قیمت:'}
          </span>
          <div className="flex items-baseline gap-1.5">
            <span
              className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                item.isCheapest && item.inStock
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : item.inStock
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {priceObj.amount}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {priceObj.unit}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Quick Action Buttons */}
      <div className="px-4 pb-4 pt-1 bg-slate-50/70 dark:bg-slate-900/70 flex items-center gap-1.5 border-t border-slate-100 dark:border-slate-800/60">
        {/* Direct Link to Store */}
        <a
          href={item.productUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`btn-tactile flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
            item.inStock
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-cyan-600 dark:hover:bg-cyan-400 hover:text-white dark:hover:text-slate-900'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
          }`}
        >
          <span>{item.inStock ? `خرید در ${item.storeName}` : `مشاهده در ${item.storeName}`}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Copy Link */}
        <button
          onClick={handleCopyLink}
          className="btn-tactile p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="کپی کردن لینک مستقیم به کالا"
        >
          {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
        </button>

        {/* Copy Title */}
        <button
          onClick={handleCopyTitle}
          className="btn-tactile p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          title="کپی نام کالا"
        >
          {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <span className="text-[11px] font-black">Fa</span>}
        </button>
      </div>
    </div>
  );
};
