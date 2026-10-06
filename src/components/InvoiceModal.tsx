import React, { useState } from 'react';
import {
  X,
  FileDown,
  Download,
  FileText,
  CheckCircle2,
  XCircle,
  Cpu,
  Loader2,
  Printer,
} from 'lucide-react';
import { BookmarkedItem, CurrencyMode } from '../types';
import { formatPrice, toPersianDigits } from '../utils/formatters';
import { generateA4InvoicePdf } from '../utils/pdfGenerator';

interface InvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: BookmarkedItem[];
  currencyMode: CurrencyMode;
  storeName?: string;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({
  isOpen,
  onClose,
  title,
  items,
  currencyMode,
  storeName,
}) => {
  const [projectName, setProjectName] = useState('پروژه الکترونیک و IoT');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  if (!isOpen) return null;

  const invoiceNumber = `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const todayPersian = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'full',
  }).format(new Date());

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalAmountToman = items.reduce(
    (sum, item) => sum + item.priceToman * (item.quantity || 1),
    0
  );
  const totalFormatted = formatPrice(totalAmountToman, currencyMode);

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      await generateA4InvoicePdf({
        title,
        items,
        currencyMode,
        storeName,
        projectName,
        invoiceNumber,
      });
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      // Fallback to window.print if needed
      try {
        window.print();
      } catch {
        // ignore
      }
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadTxt = () => {
    let content = `========================================================\n`;
    content += `         پیش‌فاکتور قطعات الکترونیک - ارزان‌ترین ماژول\n`;
    content += `========================================================\n`;
    content += `عنوان: ${title}\n`;
    content += `نام پروژه / خریدار: ${projectName}\n`;
    content += `شماره پیش‌فاکتور: ${invoiceNumber}\n`;
    content += `تاریخ صدور: ${todayPersian}\n`;
    if (storeName) {
      content += `فروشگاه تأمین‌کننده: ${storeName}\n`;
    }
    content += `--------------------------------------------------------\n`;
    content += `ردیف | شرح قطعه | فروشگاه | تعداد | قیمت واحد (${totalFormatted.unit}) | قیمت کل (${totalFormatted.unit}) | وضعیت\n`;
    content += `--------------------------------------------------------\n`;

    items.forEach((item, index) => {
      const q = item.quantity || 1;
      const unit = formatPrice(item.priceToman, currencyMode).amount;
      const total = formatPrice(item.priceToman * q, currencyMode).amount;
      const stock = item.inStock ? 'موجود' : 'ناموجود';
      content += `${index + 1} | ${item.title} | ${item.storeName} | ${q} | ${unit} | ${total} | ${stock}\n`;
      content += `   لینک: ${item.productUrl}\n`;
    });

    content += `--------------------------------------------------------\n`;
    content += `جمع کل تعداد اقلام: ${totalQuantity} عدد\n`;
    content += `جمع کل فاکتور: ${totalFormatted.amount} ${totalFormatted.unit}\n`;
    content += `========================================================\n`;
    content += `تولید شده توسط سامانه هوشمند «ارزان‌ترین ماژول»\n`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${storeName ? storeName.replace(/\s+/g, '_') : 'AllStores'}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadCsv = () => {
    let csv = '\uFEFF'; // UTF-8 BOM for Persian Excel support
    csv += 'ردیف,نام قطعه,فروشگاه,تعداد,قیمت واحد,قیمت کل,واحد پول,وضعیت موجودی,لینک خرید\n';

    items.forEach((item, index) => {
      const q = item.quantity || 1;
      const unitPrice = currencyMode === 'toman' ? item.priceToman : item.priceRial;
      const totalPrice = unitPrice * q;
      const cleanTitle = `"${item.title.replace(/"/g, '""')}"`;
      const stock = item.inStock ? 'موجود' : 'ناموجود';
      csv += `${index + 1},${cleanTitle},"${item.storeName}",${q},${unitPrice},${totalPrice},${totalFormatted.unit},${stock},"${item.productUrl}"\n`;
    });

    csv += `\n,,,جمع کل اقلام:,${totalQuantity},جمع کل فاکتور:,${currencyMode === 'toman' ? totalAmountToman : totalAmountToman * 10},${totalFormatted.unit},\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${storeName ? storeName.replace(/\s+/g, '_') : 'AllStores'}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        
        {/* Modal Top Bar (Hidden on print) */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50 print:hidden gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-600 text-white flex items-center justify-center shadow-md shadow-cyan-600/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {title}
              </h2>
              <p className="text-xs text-slate-500">
                پیش‌فاکتور رسمی قطعات در اندازه استاندارد A4
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Primary Action: Download A4 PDF */}
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="btn-tactile inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold bg-gradient-to-l from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-md shadow-cyan-600/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>در حال ساخت فایل PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>چاپ / دانلود PDF (اندازه A4)</span>
                </>
              )}
            </button>

            {/* Secondary: Excel */}
            <button
              onClick={handleDownloadCsv}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
              title="دریافت فایل اکسل (CSV)"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">اکسل (CSV)</span>
            </button>

            {/* Secondary: Text */}
            <button
              onClick={handleDownloadTxt}
              className="btn-tactile inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="دریافت فایل متنی"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">فایل متنی</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="btn-tactile p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-slate-800 dark:text-slate-100 print:overflow-visible print:p-4">
          
          {/* Official Invoice Header */}
          <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  پیش‌فاکتور تأمین قطعات الکترونیک
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  سامانه هوشمند استعلام و مقایسه قیمت «ارزان‌ترین ماژول» (سایز برگه: A4)
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
              <div>
                <span className="text-slate-500 ml-1">شماره پیش‌فاکتور:</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{invoiceNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 ml-1">تاریخ صدور:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{todayPersian}</span>
              </div>
              {storeName && (
                <div>
                  <span className="text-slate-500 ml-1">فروشگاه طرف استعلام:</span>
                  <span className="font-bold text-cyan-600 dark:text-cyan-400">{storeName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Project / Buyer Information */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300">عنوان پروژه یا سفارش‌دهنده:</span>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              placeholder="نام پروژه، آزمایشگاه یا سفارش‌دهنده را بنویسید..."
            />
          </div>

          {/* Invoice Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-right border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2.5 px-3 text-center w-12">#</th>
                  <th className="py-2.5 px-3">شرح قطعه یا ماژول</th>
                  {!storeName && <th className="py-2.5 px-3">فروشگاه</th>}
                  <th className="py-2.5 px-2 text-center w-16">تعداد</th>
                  <th className="py-2.5 px-3 text-left">قیمت واحد</th>
                  <th className="py-2.5 px-3 text-left">قیمت کل</th>
                  <th className="py-2.5 px-3 text-center w-20">وضعیت انبار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {items.map((item, index) => {
                  const qty = item.quantity || 1;
                  const itemUnitPrice = formatPrice(item.priceToman, currencyMode);
                  const itemTotalPrice = formatPrice(item.priceToman * qty, currencyMode);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-3 text-center font-bold text-slate-400">
                        {toPersianDigits(index + 1)}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white leading-relaxed">
                          {item.title}
                        </div>
                      </td>
                      {!storeName && (
                        <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {item.storeName}
                        </td>
                      )}
                      <td className="py-3 px-2 text-center font-bold text-slate-900 dark:text-white">
                        {toPersianDigits(qty)}
                      </td>
                      <td className="py-3 px-3 text-left font-mono whitespace-nowrap">
                        <span className="font-semibold">{itemUnitPrice.amount}</span>{' '}
                        <span className="text-[10px] text-slate-400">{itemUnitPrice.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-left font-mono whitespace-nowrap font-bold text-slate-900 dark:text-white">
                        <span>{itemTotalPrice.amount}</span>{' '}
                        <span className="text-[10px] text-slate-400">{itemTotalPrice.unit}</span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {item.inStock ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/80 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>موجود</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100 dark:bg-rose-950/80 dark:text-rose-300 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            <span>ناموجود</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Grand Totals Box */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div className="space-y-1 text-center sm:text-right">
              <span className="text-xs text-slate-500">مجموع اقلام درخواستی:</span>
              <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {toPersianDigits(items.length)} ردیف کالا (شامل {toPersianDigits(totalQuantity)} قطعه)
              </div>
            </div>

            <div className="flex items-baseline gap-2 bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              <span className="text-xs font-bold text-slate-500">جمع کل فاکتور:</span>
              <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 font-mono">
                {totalFormatted.amount}
              </span>
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                {totalFormatted.unit}
              </span>
            </div>
          </div>

          {/* Bottom Action inside modal */}
          <div className="pt-4 flex items-center justify-center print:hidden">
            <button
              onClick={handleGeneratePdf}
              disabled={isGeneratingPdf}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>در حال ساخت فایل PDF در اندازه A4...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-5 h-5" />
                  <span>چاپ / دانلود PDF (اندازه A4)</span>
                </>
              )}
            </button>
          </div>

          {/* Signatures & Notes */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-8 text-xs text-slate-500">
            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">ملاحظات و شرایط استعلام:</p>
              <p className="leading-relaxed text-[11px]">
                کلیه قیمت‌ها بر اساس آخرین استعلام زنده و مستقیم از وب‌سایت فروشگاه‌های مربوطه ثبت شده است. قیمت نهایی و موجودی در لحظه تسویه سبد خرید فروشگاه معتبر خواهد بود.
              </p>
            </div>
            <div className="text-center pt-8 border-t border-dashed border-slate-300 dark:border-slate-700">
              <span className="text-xs text-slate-400">محل امضاء و تأیید خریدار / تأمین‌کننده</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
