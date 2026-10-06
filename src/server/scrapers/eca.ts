import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeECA(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://eshop.eca.ir/search?s=${encodeURIComponent(query)}&order=product.price.asc`;
  
  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`ECA returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];

  $('.product-miniature').each((i, el) => {
    try {
      const $el = $(el);
      const linkEl = $el.find('a[href*="eshop.eca.ir"]').first();
      let productUrl = linkEl.attr('href') || $el.find('a').first().attr('href') || '';
      if (productUrl.startsWith('/')) {
        productUrl = `https://eshop.eca.ir${productUrl}`;
      }

      const imgEl = $el.find('img').first();
      let title = imgEl.attr('alt') || $el.find('.product-title, h3, h2').text().trim();
      title = title.replace(/\s+/g, ' ').trim();

      let imageUrl = imgEl.attr('data-src') || imgEl.attr('src') || '';
      if (imageUrl.startsWith('//')) {
        imageUrl = `https:${imageUrl}`;
      } else if (imageUrl.startsWith('/')) {
        imageUrl = `https://eshop.eca.ir${imageUrl}`;
      }

      const metaPrice = $el.find('meta[itemprop="price"]').attr('content');
      const rawPrice = $el.find('.product-price, .price').first().text().trim();

      let priceRial = metaPrice ? parseInt(metaPrice, 10) : cleanPrice(rawPrice);
      if (!priceRial || isNaN(priceRial)) {
        priceRial = cleanPrice(rawPrice);
      }

      if (!title || priceRial <= 0) return;

      const priceToman = Math.round(priceRial / 10);

      // Check stock status
      const cardText = $el.text();
      const hasOutOfStockTag = $el.find('.out-of-stock, .unavailable, .sold-out').length > 0;
      const saysUnavailable = cardText.includes('ناموجود') || cardText.includes('عدم موجودی');
      const inStock = !hasOutOfStockTag && !saysUnavailable;

      const id = $el.attr('data-id-product') ? `eca-${$el.attr('data-id-product')}` : `eca-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'فروشگاه ECA',
        storeKey: 'eca',
        storeUrl: 'https://eshop.eca.ir',
        storeBadgeColor: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900',
        productUrl,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=300&q=80',
        inStock,
      });
    } catch {
      // Continue parsing other items
    }
  });

  return items;
}
