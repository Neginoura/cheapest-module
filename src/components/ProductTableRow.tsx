import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Bookmark, Sparkles, XCircle } from 'lucide-react';
import { ProductItem, CurrencyMode } from '../types';
import { formatPrice } from '../utils/formatters';

interface ProductTableRowProps {
  item: ProductItem;
  currencyMode: CurrencyMode;
  isBookmarked: boolean;
  onToggleBookmark: (item: ProductItem) => void;
  onCopyLink: (url: string) => void;
  onCopyTitle: (title: string) => void;
}

export const ProductTableRow: React.FC<ProductTableRowProps> = ({
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
    <tr
      className={`border-b border-slate-200/70 dark:border-slate-800/80 transition-colors ${
        item.isCheapest && item.inStock
          ? 'bg-emerald-50/40 dark:bg-emerald-950/20'
          : !item.inStock
          ? 'bg-slate-50/40 dark:bg-slate-900/30 opacity-70 hover:opacity-100'
          : 'hover:bg-slate-50/80 dark:hover:bg-slate-900/50'
      }`}
    >
      {/* Thumbnail */}
      <td className="py-3.5 px-3 w-16 text-center">
        <div className="relative w-12 h-12 rounded-xl bg-white dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
          <img
            src={item.imageUrl}
            alt={item.title}
            className={`max-h-full max-w-full object-contain ${!item.inStock ? 'grayscale-40' : ''}`}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80';
            }}
          />
        </div>
      </td>

      {/* Title & Badge */}
      <td className="py-3.5 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            {item.isCheapest && item.inStock && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-2xs">
                <Sparkles className="w-3 h-3 text-emerald-200" />
                <span>ارزان‌ترین</span>
              </span>
            )}
            <span
              className={`text-xs sm:text-sm font-bold leading-relaxed line-clamp-2 ${
                item.inStock ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              {item.title}
            </span>
          </div>
        </div>
      </td>

      {/* Store */}
      <td className="py-3.5 px-3 whitespace-nowrap">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${item.storeBadgeColor}`}>
          {item.storeName}
        </span>
      </td>

      {/* Stock Status */}
      <td className="py-3.5 px-3 whitespace-nowrap text-center">
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
      </td>

      {/* Price */}
      <td className="py-3.5 px-4 whitespace-nowrap text-left font-mono">
        <div className="flex items-baseline gap-1.5 justify-end">
          <span
            className={`text-base sm:text-lg font-black tracking-tight ${
              item.isCheapest && item.inStock
                ? 'text-emerald-600 dark:text-emerald-400'
                : item.inStock
                ? 'text-slate-900 dark:text-white'
                : 'text-slate-400 dark:text-slate-500 line-through'
            }`}
          >
            {priceObj.amount}
          </span>
          <span className="text-xs font-bold text-slate-500">{priceObj.unit}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3.5 px-3 whitespace-nowrap text-left">
        <div className="flex items-center gap-1.5 justify-end">
          <button
            onClick={handleCopyLink}
            className="btn-tactile p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="کپی لینک"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => onToggleBookmark(item)}
            className={`btn-tactile p-2 rounded-lg transition-colors cursor-pointer ${
              isBookmarked
                ? 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/80 dark:text-cyan-300'
                : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
          </button>

          <a
            href={item.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`btn-tactile inline-flex items-center gap-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              item.inStock
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-cyan-600 dark:hover:bg-cyan-400 hover:text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
            }`}
          >
            <span>خرید</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </td>
    </tr>
  );
};
