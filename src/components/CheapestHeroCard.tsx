import React from 'react';
import { ExternalLink, Copy, Check, Bookmark, Sparkles, TrendingDown, Store } from 'lucide-react';
import { ProductItem, CurrencyMode } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';

interface CheapestHeroCardProps {
  item: ProductItem;
  averagePrice: number;
  highestPrice: number;
  currencyMode: CurrencyMode;
  isBookmarked: boolean;
  onToggleBookmark: (item: ProductItem) => void;
  onCopyLink: (url: string) => void;
  onCopyTitle: (title: string) => void;
}

export const CheapestHeroCard: React.FC<CheapestHeroCardProps> = ({
  item,
  averagePrice,
  currencyMode,
  isBookmarked,
  onToggleBookmark,
  onCopyLink,
  onCopyTitle,
}) => {
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copiedTitle, setCopiedTitle] = React.useState(false);

  const priceObj = formatPrice(item.priceToman, currencyMode);
  
  // Calculate savings percentage compared to average
  const savingsPct = averagePrice > item.priceToman
    ? Math.round(((averagePrice - item.priceToman) / averagePrice) * 100)
    : 0;

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
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 animate-fade-in">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-transparent dark:from-emerald-950/30 dark:via-cyan-950/20 border-2 border-emerald-500/35 dark:border-emerald-500/30 p-6 sm:p-8 shadow-xl shadow-emerald-500/5 backdrop-blur-md">
        
        {/* Glow Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold bg-emerald-600 text-white shadow-md shadow-emerald-600/30">
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>کمترین قیمت ثبت شده در بازار</span>
          </div>

          {savingsPct > 0 && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>{toPersianDigits(savingsPct)}٪ اقتصادی‌تر از میانگین قیمت سایر فروشگاه‌ها</span>
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Thumbnail Image */}
          <div className="md:col-span-3 flex justify-center">
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-2xl bg-white dark:bg-slate-900 p-3 border border-slate-200/80 dark:border-slate-800 shadow-md flex items-center justify-center overflow-hidden group">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80';
                }}
              />
              <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-xs">
                ارزان‌ترین
              </span>
            </div>
          </div>

          {/* Details & Specs */}
          <div className="md:col-span-6 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${item.storeBadgeColor}`}>
                <Store className="w-3.5 h-3.5" />
                <span>{item.storeName}</span>
              </span>

              {item.inStock ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>موجود در انبار (آماده ارسال فوری)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  <span>ناموجود در انبار</span>
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-snug">
              {item.title}
            </h2>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              این کالا با کمترین قیمت ممکن در میان ۱۰ مرجع تخصصی شناسایی گردیده است. قیمت و موجودی مستقیماً از وب‌سایت فروشگاه طرف استعلام تأیید شده‌اند.
            </p>
          </div>

          {/* Pricing & CTA Column */}
          <div className="md:col-span-3 flex flex-col items-stretch md:items-end justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="text-right md:text-left w-full">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 block mb-0.5">
                کمترین قیمت:
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                  {priceObj.amount}
                </span>
                <span className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                  {priceObj.unit}
                </span>
              </div>
            </div>

            {/* Primary Buy Button */}
            <a
              href={item.productUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tactile w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <span>خرید در {item.storeName}</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Quick Actions (Copy Link, Copy Name, Bookmark) */}
            <div className="flex items-center justify-between w-full gap-2 pt-2 border-t border-slate-200/70 dark:border-slate-800">
              <button
                onClick={handleCopyLink}
                className="btn-tactile flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="کپی لینک محصول"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedLink ? 'کپی شد' : 'کپی لینک'}</span>
              </button>

              <button
                onClick={handleCopyTitle}
                className="btn-tactile flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="کپی نام قطعه"
              >
                {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                <span>{copiedTitle ? 'کپی شد' : 'کپی نام'}</span>
              </button>

              <button
                onClick={() => onToggleBookmark(item)}
                className={`btn-tactile p-2 rounded-lg text-xs transition-colors cursor-pointer ${
                  isBookmarked
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300'
                    : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                title={isBookmarked ? 'حذف از نشان‌شده‌ها' : 'نشان کردن کالا'}
              >
                <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
