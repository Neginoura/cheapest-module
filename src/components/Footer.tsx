import React from 'react';
import { Cpu, ShieldCheck, Zap, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Slogan */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center text-white">
                <Cpu className="w-4 h-4" />
              </div>
              <span className="font-black text-lg text-slate-900 dark:text-white">
                ارزان‌ترین <span className="text-cyan-600 dark:text-cyan-400">ماژول</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              سامانه هوشمند و لحظه‌ای برای جستجو، پایش و مقایسه قیمت ماژول‌ها، سنسورها و قطعات الکترونیک در ۱۰ فروشگاه معتبر ایرانی. بدون واسطه، با لینک مستقیم و شفافیت کامل در استعلام قیمت‌ها و وضعیت موجودی کالاها.
            </p>
          </div>

          {/* Supported Stores */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              ۱۰ فروشگاه تخصصی تحت پوشش
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <a href="https://eshop.eca.ir" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>فروشگاه ECA</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://roboeq.ir" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>روبوایکیو (RoboEq)</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://daneshjookit.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>دانشجو کیت</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://thecaferobot.com/store/" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>کافه ربات</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://iran-micro.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>ایران میکرو</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://www.javanelec.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>جوان الکترونیک</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://mclc.ir" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>مکاترونیک (MCLC)</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://jamtronic.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>جم ترونیک</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://robochip.ir" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>ربوچیپ</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
              <a href="https://aftabrayaneh.com" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-600 dark:hover:text-cyan-400 flex items-center gap-1">
                <span>آفتاب رایانه</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Features Highlights */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              ویژگی‌های کلیدی
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>اولویت نمایش با کالاهای موجود در انبار</span>
              </li>
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                <span>برچسب برجسته قرمز برای اقلام ناموجود</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>پیش‌فاکتور BOM و محاسبه جمع کل</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright & disclaimer */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 dark:text-slate-500">
          <p>
            کلیه حقوق و علائم تجاری متعلق به فروشگاه‌های متبوع است. این سامانه جهت سهولت مقایسه برای مهندسان و سازندگان ایرانی توسعه داده شده است.
          </p>
          <div className="flex items-center gap-1">
            <span>طراحی شده با دقت و افتخار برای جامعه الکترونیک ایران</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
