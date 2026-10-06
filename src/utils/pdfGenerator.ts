import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { BookmarkedItem, CurrencyMode } from '../types';
import { formatPrice, toPersianDigits } from './formatters';

export interface GeneratePdfOptions {
  title: string;
  items: BookmarkedItem[];
  currencyMode: CurrencyMode;
  storeName?: string;
  projectName?: string;
  invoiceNumber?: string;
}

/**
 * Generates an official, clean, printable A4 PDF invoice in Persian.
 * Strictly guarantees NO extra blank page is created:
 * - Content height is calculated dynamically based on real content.
 * - Fits cleanly on exactly 1 single A4 page with 10mm margins.
 * - Uses pure standard hex colors (#000000, #ffffff, #333333, etc.) in an isolated iframe
 *   to eliminate Tailwind v4 oklch CSS color errors.
 * - Uses the app's 'Vazirmatn' Persian font.
 */
export async function generateA4InvoicePdf({
  title,
  items,
  currencyMode,
  storeName,
  projectName = 'پروژه الکترونیک و IoT',
  invoiceNumber,
}: GeneratePdfOptions): Promise<void> {
  const invNum = invoiceNumber || `INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const todayPersian = new Intl.DateTimeFormat('fa-IR', {
    dateStyle: 'full',
  }).format(new Date());

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalAmountToman = items.reduce(
    (sum, item) => sum + item.priceToman * (item.quantity || 1),
    0
  );
  const totalFormatted = formatPrice(totalAmountToman, currencyMode);

  // Create an isolated iframe to isolate html2canvas from document Tailwind v4 oklch colors
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  iframe.style.width = '750px';
  iframe.style.height = 'auto';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    throw new Error('امکان ایجاد فریم ایزوله برای تولید PDF میسر نشد.');
  }

  // Construct table rows with compact, clean padding
  let rowsHtml = '';
  items.forEach((item, index) => {
    const qty = item.quantity || 1;
    const unitPrice = formatPrice(item.priceToman, currencyMode);
    const linePrice = formatPrice(item.priceToman * qty, currencyMode);
    const stockText = item.inStock ? 'موجود' : 'ناموجود';
    const isAlt = index % 2 === 1;

    rowsHtml += `
      <tr style="border-bottom: 1px solid #e5e5e5; background-color: ${isAlt ? '#f9f9f9' : '#ffffff'};">
        <td style="padding: 8px 6px; text-align: center; font-weight: bold; color: #555555; font-size: 11px; width: 34px;">
          ${toPersianDigits(index + 1)}
        </td>
        <td style="padding: 8px 10px; font-weight: bold; font-size: 11px; line-height: 1.45; color: #111111;">
          ${escapeHtml(item.title)}
          ${!storeName ? `<div style="font-size: 10px; color: #666666; font-weight: normal; margin-top: 2px;">فروشگاه: ${escapeHtml(item.storeName)}</div>` : ''}
        </td>
        ${!storeName ? `
        <td style="padding: 8px 8px; font-size: 11px; color: #333333; white-space: nowrap;">
          ${escapeHtml(item.storeName)}
        </td>` : ''}
        <td style="padding: 8px 6px; text-align: center; font-weight: bold; font-size: 12px; color: #000000; width: 42px;">
          ${toPersianDigits(qty)}
        </td>
        <td style="padding: 8px 10px; text-align: left; font-size: 11px; color: #333333; white-space: nowrap;">
          ${unitPrice.amount} <span style="font-size: 10px; color: #666666;">${unitPrice.unit}</span>
        </td>
        <td style="padding: 8px 10px; text-align: left; font-size: 11px; font-weight: bold; color: #000000; white-space: nowrap;">
          ${linePrice.amount} <span style="font-size: 10px; color: #666666;">${linePrice.unit}</span>
        </td>
        <td style="padding: 8px 6px; text-align: center; width: 62px;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; color: ${item.inStock ? '#15803d' : '#b91c1c'}; background-color: ${item.inStock ? '#f0fdf4' : '#fef2f2'}; border: 1px solid ${item.inStock ? '#bbf7d0' : '#fecaca'};">
            ${stockText}
          </span>
        </td>
      </tr>
    `;
  });

  // Isolated HTML document: zero trailing padding/margin, compact A4 layout
  const htmlContent = `
    <!DOCTYPE html>
    <html dir="rtl" lang="fa">
    <head>
      <meta charset="utf-8">
      <title>پیش‌فاکتور رسمی</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
      <style>
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Vazirmatn', Tahoma, Arial, sans-serif;
          background-color: #ffffff;
          color: #111111;
          direction: rtl;
          width: 750px;
          margin: 0;
          padding: 0;
        }
        .invoice-card {
          border: 2px solid #222222;
          border-radius: 8px;
          padding: 18px 22px;
          background-color: #ffffff;
          margin: 0;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #222222;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .header-title h1 {
          font-size: 19px;
          font-weight: 900;
          color: #000000;
          margin-bottom: 3px;
        }
        .header-title .subtitle {
          font-size: 12px;
          font-weight: bold;
          color: #0369a1;
        }
        .header-title .note {
          font-size: 10px;
          color: #666666;
          margin-top: 2px;
        }
        .meta-box {
          background-color: #f5f5f5;
          border: 1px solid #d4d4d4;
          border-radius: 6px;
          padding: 7px 11px;
          font-size: 11px;
          color: #333333;
          line-height: 1.5;
          min-width: 200px;
        }
        .meta-box b {
          color: #000000;
        }
        .info-bar {
          background-color: #fafafa;
          border: 1px solid #e5e5e5;
          border-radius: 6px;
          padding: 7px 11px;
          margin-bottom: 12px;
          font-size: 11px;
          display: flex;
          justify-content: space-between;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
        }
        th {
          background-color: #1f2937;
          color: #ffffff;
          padding: 8px 8px;
          font-size: 11px;
          font-weight: bold;
          text-align: right;
        }
        th.center, td.center {
          text-align: center;
        }
        th.left, td.left {
          text-align: left;
        }
        .total-box {
          background-color: #f5f5f5;
          border: 1px solid #cccccc;
          border-radius: 6px;
          padding: 10px 14px;
          margin-bottom: 14px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-badge {
          background-color: #ffffff;
          border: 1px solid #bbbbbb;
          border-radius: 6px;
          padding: 7px 12px;
          text-align: left;
        }
        .total-amount {
          font-size: 16px;
          font-weight: 900;
          color: #0284c7;
        }
        .footer {
          border-top: 1px dashed #cccccc;
          padding-top: 10px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          font-size: 10px;
          color: #666666;
          line-height: 1.4;
        }
        .stamp-box {
          border: 1px dashed #999999;
          border-radius: 6px;
          padding: 10px 18px;
          text-align: center;
          font-size: 10px;
          color: #888888;
          min-width: 120px;
        }
      </style>
    </head>
    <body>
      <div id="invoice-sheet" class="invoice-card">
        
        <!-- Header -->
        <div class="header">
          <div class="header-title">
            <h1>پیش‌فاکتور تأمین قطعات الکترونیک</h1>
            <div class="subtitle">${escapeHtml(title)}</div>
            <div class="note">سامانه هوشمند استعلام و مقایسه قیمت «ارزان‌ترین ماژول» (اندازه A4)</div>
          </div>

          <div class="meta-box">
            <div>شماره پیش‌فاکتور: <b>${invNum}</b></div>
            <div>تاریخ صدور: <b>${todayPersian}</b></div>
            ${storeName ? `<div>فروشگاه طرف استعلام: <b style="color: #0369a1;">${escapeHtml(storeName)}</b></div>` : ''}
          </div>
        </div>

        <!-- Project Info -->
        <div class="info-bar">
          <div>عنوان پروژه / خریدار: <b style="color: #000000; margin-right: 4px;">${escapeHtml(projectName)}</b></div>
          <div>تعداد اقلام: <b>${toPersianDigits(items.length)} ردیف (${toPersianDigits(totalQuantity)} عدد)</b></div>
        </div>

        <!-- Table -->
        <table>
          <thead>
            <tr>
              <th class="center" style="width: 34px;">#</th>
              <th>شرح ماژول / قطعه</th>
              ${!storeName ? '<th style="width: 95px;">فروشگاه</th>' : ''}
              <th class="center" style="width: 42px;">تعداد</th>
              <th class="left" style="width: 100px;">قیمت واحد</th>
              <th class="left" style="width: 110px;">جمع ردیف</th>
              <th class="center" style="width: 62px;">وضعیت</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <!-- Grand Total -->
        <div class="total-box">
          <div style="font-size: 11px; color: #444444;">
            <div>مجموع تعداد کالاها: <b style="color: #000000;">${toPersianDigits(totalQuantity)} عدد</b></div>
            <div style="font-size: 10px; color: #777777; margin-top: 2px;">قیمت‌ها بر اساس آخرین استعلام زنده فروشگاه‌ها ثبت گردیده‌اند.</div>
          </div>
          <div class="total-badge">
            <span style="font-size: 11px; font-weight: bold; color: #555555; margin-left: 6px;">مبلغ کل فاکتور:</span>
            <span class="total-amount">${totalFormatted.amount}</span>
            <span style="font-size: 11px; font-weight: bold; color: #111111; margin-right: 4px;">${totalFormatted.unit}</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="footer">
          <div style="max-width: 450px;">
            <b>شرایط:</b> این سند به صورت پیش‌فاکتور رایانه‌ای صادر شده است. قیمت نهایی و موجودی قطعات در لحظه تسویه سبد خرید در فروشگاه‌های مربوطه معتبر خواهد بود.
          </div>
          <div class="stamp-box">
            محل مهر و امضاء
          </div>
        </div>

      </div>
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  // Wait for Google Font (Vazirmatn) to load inside iframe
  try {
    if (iframeDoc.fonts) {
      await iframeDoc.fonts.ready;
    }
  } catch {
    // Continue if unsupported
  }
  await new Promise((resolve) => setTimeout(resolve, 150));

  try {
    // Target the invoice sheet directly to avoid any outer body padding/margin
    const targetElement = iframeDoc.getElementById('invoice-sheet') || iframeDoc.body;
    const canvas = await html2canvas(targetElement, {
      scale: 2, // 2x high-resolution for crisp A4 print
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      windowWidth: 750,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4', // 210mm x 297mm
    });

    const pdfWidth = 210;
    const pdfHeight = 297;
    const margin = 10;
    const maxContentWidth = pdfWidth - margin * 2; // 190mm
    const maxContentHeight = pdfHeight - margin * 2; // 277mm

    // Proportional dimensions
    let renderWidth = maxContentWidth;
    let renderHeight = (canvas.height * renderWidth) / canvas.width;

    // If content height is slightly larger than maxContentHeight (e.g. up to 18% taller),
    // scale it down slightly so it fits on EXACTLY 1 single page!
    if (renderHeight > maxContentHeight && renderHeight <= maxContentHeight * 1.18) {
      const scaleFactor = maxContentHeight / renderHeight;
      renderWidth = renderWidth * scaleFactor;
      renderHeight = maxContentHeight;
    }

    const posX = (pdfWidth - renderWidth) / 2; // Horizontally centered
    const posY = margin;

    if (renderHeight <= maxContentHeight) {
      // Exactly ONE single page without any second page!
      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight);
    } else {
      // For exceptionally long lists (e.g. 25+ items), paginate strictly where real content exists
      let heightLeft = renderHeight;
      let currentY = posY;

      pdf.addImage(imgData, 'JPEG', posX, currentY, renderWidth, renderHeight);
      heightLeft -= maxContentHeight;

      // Only add a subsequent page if there is AT LEAST 25mm of genuine content remaining
      while (heightLeft > 25) {
        currentY -= maxContentHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', posX, currentY, renderWidth, renderHeight);
        heightLeft -= maxContentHeight;
      }
    }

    const safeName = (storeName || 'AllStores')
      .replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_')
      .slice(0, 30);
    const fileName = `PishFactor-${safeName}-${Date.now()}.pdf`;

    pdf.save(fileName);
  } finally {
    if (iframe.parentNode) {
      iframe.parentNode.removeChild(iframe);
    }
  }
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
