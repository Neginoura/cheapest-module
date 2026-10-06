import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeRoboEq(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://roboeq.ir/search/q/${encodeURIComponent(query)}/`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`RoboEq returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];

  $('table tr').each((i, el) => {
    try {
      const $tr = $(el);
      const titleLink = $tr.find('a.title').first();
      let title = titleLink.find('h2').text().trim() || titleLink.text().trim();
      let productUrl = titleLink.attr('href') || '';

      if (!title || !productUrl) return;

      if (productUrl.startsWith('/')) {
        productUrl = `https://roboeq.ir${productUrl}`;
      }

      // Clean title text (remove rating numbers if any)
      title = title.replace(/\s+/g, ' ').replace(/\d+\s*\(\s*\d+\s*رای\s*\)/, '').trim();

      const imgEl = $tr.find('img').first();
      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('/')) {
        imageUrl = `https://roboeq.ir${imageUrl}`;
      }

      const rowText = $tr.text();

      // Extract price (RoboEq shows price in Rials, e.g. "بهترین قیمت: 8,260,000" or with ریال)
      let priceRial = 0;
      const priceMatch = rowText.match(/قیمت[^:\d]*:\s*([۰-۹\d,٬]+)/) || rowText.match(/([۰-۹\d,٬]{4,})\s*(?:ریال|تومان)/);
      if (priceMatch) {
        priceRial = cleanPrice(priceMatch[1]);
      } else {
        // Fallback: search for largest number in row that looks like a price
        const nums = rowText.match(/[۰-۹\d,٬]{5,}/g);
        if (nums && nums.length > 0) {
          priceRial = cleanPrice(nums[0]);
        }
      }

      if (priceRial <= 0) return;

      const priceToman = Math.round(priceRial / 10);

      // Stock status check: check if row says "ناموجود" or "عدم موجودی"
      const isOutOfStock =
        rowText.includes('ناموجود') ||
        rowText.includes('عدم موجودی') ||
        $tr.find('.unavailable, .out-of-stock').length > 0;
      const inStock = !isOutOfStock;

      const id = `roboeq-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'روبوایکیو (RoboEq)',
        storeKey: 'roboeq',
        storeUrl: 'https://roboeq.ir',
        storeBadgeColor: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900',
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
