import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeCafeRobot(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://thecaferobot.com/store/catalogsearch/result/?q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`CafeRobot returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];

  $('.product-item').each((i, el) => {
    try {
      const $el = $(el);
      const titleLink = $el.find('.product-item-link').first();
      let title = titleLink.text().trim();
      let productUrl = titleLink.attr('href') || $el.find('a').first().attr('href') || '';

      const imgEl = $el.find('img').first();
      if (!title) {
        title = imgEl.attr('alt') || '';
      }
      title = title.replace(/\s+/g, ' ').trim();

      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://thecaferobot.com${imageUrl}`;
      }

      if (productUrl.startsWith('/')) {
        productUrl = `https://thecaferobot.com${productUrl}`;
      }

      const rawPrice = $el.find('.price').first().text().trim();
      const priceToman = cleanPrice(rawPrice);

      if (!title || priceToman <= 0) return;

      const priceRial = priceToman * 10;
      const cardText = $el.text();
      const inStock = !cardText.includes('ناموجود') && !cardText.includes('عدم موجودی') && $el.find('.unavailable').length === 0;

      const id = `caferobot-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'کافه ربات',
        storeKey: 'caferobot',
        storeUrl: 'https://thecaferobot.com/store/',
        storeBadgeColor: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900',
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
