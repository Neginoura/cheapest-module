import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeJamtronic(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://jamtronic.com/?s=${encodeURIComponent(query)}&post_type=product`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Jamtronic returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];
  const visitedUrls = new Set<string>();

  $('.product.type-product').each((i, el) => {
    try {
      const $el = $(el);
      const titleLink = $el.find('.wd-entities-title a, .product-title a, h2 a, h3 a, a.product-image-link').first();
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
        imageUrl = `https://jamtronic.com${imageUrl}`;
      }

      if (productUrl.startsWith('/')) {
        productUrl = `https://jamtronic.com${productUrl}`;
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

      const id = `jam-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'جم ترونیک (Jamtronic)',
        storeKey: 'jamtronic',
        storeUrl: 'https://jamtronic.com',
        storeBadgeColor: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900',
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
