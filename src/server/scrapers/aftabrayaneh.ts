import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeAftabRayaneh(query: string, timeoutMs = 6000): Promise<ProductItem[]> {
  const url = `https://aftabrayaneh.com/?s=${encodeURIComponent(query)}&post_type=product`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`AftabRayaneh returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];
  const visitedUrls = new Set<string>();

  $('article, .product, .type-product').each((i, el) => {
    try {
      const $el = $(el);
      const titleLink = $el.find('.woocommerce-loop-product__title, .product-title a, h2 a, h3 a, a').first();
      let title = titleLink.text().trim();
      let productUrl = titleLink.attr('href') || $el.find('a').first().attr('href') || '';

      if (!productUrl || visitedUrls.has(productUrl)) return;
      visitedUrls.add(productUrl);

      const imgEl = $el.find('img').first();
      if (!title) {
        title = imgEl.attr('alt') || '';
      }
      title = title.replace(/\s+/g, ' ').trim();

      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://aftabrayaneh.com${imageUrl}`;
      }

      if (productUrl.startsWith('/')) {
        productUrl = `https://aftabrayaneh.com${productUrl}`;
      }

      const rawPrice = $el.find('.price').first().text().trim();
      const priceToman = cleanPrice(rawPrice);

      if (!title || priceToman <= 0) return;

      const priceRial = priceToman * 10;
      const cardText = $el.text();
      const isOutOfStock =
        cardText.includes('ناموجود') ||
        cardText.includes('عدم موجودی') ||
        $el.find('.out-of-stock').length > 0;
      const inStock = !isOutOfStock;

      const id = `aftab-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'آفتاب رایانه',
        storeKey: 'aftabrayaneh',
        storeUrl: 'https://aftabrayaneh.com',
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
