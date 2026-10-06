import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeIranMicro(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://iran-micro.com/index.php?route=product/search&search=${encodeURIComponent(query)}&sort=p.price&order=ASC`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Iran-Micro returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];

  $('.product-thumb').each((i, el) => {
    try {
      const $el = $(el);
      const titleLink = $el.find('.caption h4 a').first();
      let title = titleLink.text().trim();
      let productUrl = titleLink.attr('href') || $el.find('a').first().attr('href') || '';

      const imgEl = $el.find('.image img, img').first();
      if (!title) {
        title = imgEl.attr('alt') || '';
      }
      title = title.replace(/\s+/g, ' ').trim();

      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://iran-micro.com/${imageUrl.replace(/^\//, '')}`;
      }

      if (productUrl.startsWith('/')) {
        productUrl = `https://iran-micro.com${productUrl}`;
      }

      const rawPrice = $el.find('.price').first().text().trim();
      const priceRial = cleanPrice(rawPrice);

      if (!title || priceRial <= 0) return;

      const priceToman = Math.round(priceRial / 10);
      const cardText = $el.text();
      const inStock = !cardText.includes('ناموجود') && !cardText.includes('عدم موجودی');

      const id = `iranmicro-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'ایران میکرو',
        storeKey: 'iranmicro',
        storeUrl: 'https://iran-micro.com',
        storeBadgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-900',
        productUrl,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
        inStock,
      });
    } catch {
      // Continue
    }
  });

  return items;
}
