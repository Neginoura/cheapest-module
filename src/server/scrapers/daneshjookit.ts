import * as cheerio from 'cheerio';
import { ProductItem } from './types.js';
import { COMMON_HEADERS, cleanPrice, formatPersianNumber } from './utils.js';

export async function scrapeDaneshjookit(query: string, timeoutMs = 6500): Promise<ProductItem[]> {
  const url = `https://daneshjookit.com/search?controller=search&s=${encodeURIComponent(query)}&order=product.price.asc`;

  const response = await fetch(url, {
    headers: COMMON_HEADERS,
    signal: AbortSignal.timeout(timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`Daneshjookit returned status ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);
  const items: ProductItem[] = [];

  const selector = '#js-product-list article.ajax_block_product, #products article.ajax_block_product, .products-grid article';
  let elements = $(selector);

  if (elements.length === 0) {
    elements = $('article.ajax_block_product');
  }

  elements.each((i, el) => {
    try {
      const $el = $(el);
      const titleLink = $el.find('.s_title_block a, h2 a, h3 a, a.product-thumbnail').first();
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
        imageUrl = `https://daneshjookit.com${imageUrl}`;
      }

      if (productUrl.startsWith('/')) {
        productUrl = `https://daneshjookit.com${productUrl}`;
      }

      const rawPrice = $el.find('.product-price, .price').first().text().trim();
      const priceToman = cleanPrice(rawPrice);

      if (!title || priceToman <= 0) return;

      const priceRial = priceToman * 10;
      const cardText = $el.text();
      const inStock = !cardText.includes('ناموجود') && !cardText.includes('عدم موجودی') && $el.find('.out-of-stock').length === 0;

      const id = `djk-${i}-${priceToman}`;

      items.push({
        id,
        title,
        priceToman,
        priceRial,
        formattedPriceToman: formatPersianNumber(priceToman),
        formattedPriceRial: formatPersianNumber(priceRial),
        storeName: 'دانشجو کیت',
        storeKey: 'djk',
        storeUrl: 'https://daneshjookit.com',
        storeBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900',
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
