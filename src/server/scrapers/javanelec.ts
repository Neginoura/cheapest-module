import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeJavanElec(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://www.javanelec.com/shop?searchfilter=${encodeURIComponent(query)}`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`JavanElec returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];
  const visitedUrls = new Set<string>();

  $('a[href*="/shop/product/"]').each((i, el) => {
    try {
      const $a = $(el);
      let productUrl = $a.attr('href') || '';
      if (!productUrl || visitedUrls.has(productUrl)) return;
      visitedUrls.add(productUrl);

      if (productUrl.startsWith('/')) {
        productUrl = `https://www.javanelec.com${productUrl}`;
      }

      // Find the card container
      const container = $a.closest('div.product-item, div.item, div.col-xs-12, div.row, div');
      const containerText = container.text();

      // Title
      const imgEl = container.find('img').first();
      let title = imgEl.attr('alt') || imgEl.attr('title') || $a.text().trim();
      title = title.replace(/\s+/g, ' ').trim();
      if (!title || title.length < 3) {
        // Extract title from URL slug
        const slug = productUrl.split('/').pop() || '';
        title = decodeURIComponent(slug).replace(/-/g, ' ');
      }

      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('/')) {
        imageUrl = `https://www.javanelec.com${imageUrl}`;
      }

      // Price in Rials
      const priceMatch = containerText.match(/([۰-۹\d,٬]{4,})\s*ریال/);
      let priceRial = priceMatch ? cleanPrice(priceMatch[1]) : 0;
      if (!priceRial) {
        const anyNumber = containerText.match(/[۰-۹\d,٬]{5,}/);
        if (anyNumber) priceRial = cleanPrice(anyNumber[0]);
      }

      if (priceRial <= 0) return;

      const priceToman = Math.round(priceRial / 10);

      // Stock status
      const hasAddToCart = containerText.includes('اضافه به سبد') || containerText.includes('افزودن به سبد');
      const isUnavailable = containerText.includes('ناموجود') || containerText.includes('استعلام قیمت');
      const inStock = hasAddToCart && !isUnavailable;

      const id = `javan-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'جوان الکترونیک',
        storeKey: 'javanelec',
        storeUrl: 'https://www.javanelec.com',
        storeBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900',
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
