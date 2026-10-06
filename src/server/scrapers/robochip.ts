import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeRobochip(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://robochip.ir/?s=${encodeURIComponent(query)}&post_type=product`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Robochip returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];
  const visitedUrls = new Set<string>();

  $('li.product, div.product').each((i, el) => {
    try {
      const $el = $(el);
      const titleLink = $el.find('.woocommerce-loop-product__title, .name a, h2 a, h3 a, a').first();
      let title = titleLink.text().trim();
      let productUrl = titleLink.attr('href') || $el.find('a').first().attr('href') || '';

      if (!productUrl || visitedUrls.has(productUrl)) return;
      visitedUrls.add(productUrl);

      const imgEl = $el.find('img').first();
      if (!title || title.length < 3) {
        title = imgEl.attr('alt') || '';
      }
      title = title.replace(/\s+/g, ' ').trim();

      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://robochip.ir${imageUrl}`;
      }

      if (productUrl.startsWith('/')) {
        productUrl = `https://robochip.ir${productUrl}`;
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

      const id = `robochip-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'ربوچیپ (RoboChip)',
        storeKey: 'robochip',
        storeUrl: 'https://robochip.ir',
        storeBadgeColor: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900',
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
