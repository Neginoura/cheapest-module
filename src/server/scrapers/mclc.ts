import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeMCLC(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://mclc.ir/index.php?dispatch=products.search&q=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`MCLC returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];
  const visitedUrls = new Set<string>();

  $('.product-thumb').each((i, el) => {
    try {
      const $el = $(el);
      const linkEl = $el.find('a[href*=".html"]').first();
      let productUrl = linkEl.attr('href') || '';
      if (!productUrl || visitedUrls.has(productUrl)) return;
      visitedUrls.add(productUrl);

      if (productUrl.startsWith('/')) {
        productUrl = `https://mclc.ir${productUrl}`;
      }

      const imgEl = $el.find('img').first();
      let title = imgEl.attr('alt') || imgEl.attr('title') || $el.find('.caption h4 a, h4 a, .name a').text().trim();
      title = title.replace(/\s+/g, ' ').trim();

      if (!title) {
        const slug = productUrl.split('/').pop()?.replace('.html', '') || '';
        title = decodeURIComponent(slug).replace(/-/g, ' ');
      }

      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://mclc.ir${imageUrl}`;
      }

      const rawPrice = $el.find('.price, .price-new, .price-tax').text().trim();
      const priceRial = cleanPrice(rawPrice);

      if (!title || priceRial <= 0) return;

      const priceToman = Math.round(priceRial / 10);
      const cardText = $el.text();
      const inStock = !cardText.includes('ناموجود') && !cardText.includes('عدم موجودی');

      const id = `mclc-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'مکاترونیک (MCLC)',
        storeKey: 'mclc',
        storeUrl: 'https://mclc.ir',
        storeBadgeColor: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-900',
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
