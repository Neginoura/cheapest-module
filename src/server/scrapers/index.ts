import { ProductItem, SearchResponse, StoreStatus, StoreKey, SearchMode } from './types.js';
import { scrapeECA } from './eca.js';
import { scrapeDaneshjookit } from './daneshjookit.js';
import { scrapeCafeRobot } from './caferobot.js';
import { scrapeIranMicro } from './iranmicro.js';
import { scrapeRoboEq } from './roboeq.js';
import { scrapeJavanElec } from './javanelec.js';
import { scrapeMCLC } from './mclc.js';
import { scrapeJamtronic } from './jamtronic.js';
import { scrapeRobochip } from './robochip.js';
import { scrapeAftabRayaneh } from './aftabrayaneh.js';
import { calculateRelevanceScore, isExactMatch } from './utils.js';

interface StoreScraperConfig {
  key: StoreKey;
  name: string;
  url: string;
  fn: (query: string, timeoutMs?: number) => Promise<ProductItem[]>;
}

const STORES: StoreScraperConfig[] = [
  { key: 'eca', name: 'فروشگاه ECA', url: 'https://eshop.eca.ir', fn: scrapeECA },
  { key: 'roboeq', name: 'روبوایکیو (RoboEq)', url: 'https://roboeq.ir', fn: scrapeRoboEq },
  { key: 'djk', name: 'دانشجو کیت', url: 'https://daneshjookit.com', fn: scrapeDaneshjookit },
  { key: 'caferobot', name: 'کافه ربات', url: 'https://thecaferobot.com/store/', fn: scrapeCafeRobot },
  { key: 'iranmicro', name: 'ایران میکرو', url: 'https://iran-micro.com', fn: scrapeIranMicro },
  { key: 'javanelec', name: 'جوان الکترونیک', url: 'https://www.javanelec.com', fn: scrapeJavanElec },
  { key: 'mclc', name: 'مکاترونیک (MCLC)', url: 'https://mclc.ir', fn: scrapeMCLC },
  { key: 'jamtronic', name: 'جم ترونیک', url: 'https://jamtronic.com', fn: scrapeJamtronic },
  { key: 'robochip', name: 'ربوچیپ', url: 'https://robochip.ir', fn: scrapeRobochip },
  { key: 'aftabrayaneh', name: 'آفتاب رایانه', url: 'https://aftabrayaneh.com', fn: scrapeAftabRayaneh },
];

export async function searchAllStores(query: string, mode: SearchMode = 'broad'): Promise<SearchResponse> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) {
    return {
      query: '',
      searchMode: mode,
      results: [],
      totalResults: 0,
      cheapestItem: null,
      averagePriceToman: 0,
      highestPriceToman: 0,
      stores: STORES.map(s => ({
        key: s.key,
        name: s.name,
        url: s.url,
        status: 'empty',
        itemCount: 0,
        responseTimeMs: 0,
      })),
      searchTimestamp: new Date().toISOString(),
    };
  }

  const storeStatuses: StoreStatus[] = [];
  const rawItems: ProductItem[] = [];

  // Batch scrapers in small queues (e.g. 2-3 at a time) to prevent Cloudflare Worker resource/subrequest limits
  const BATCH_SIZE = 3;
  const STORE_TIMEOUT_MS = 4500;

  for (let i = 0; i < STORES.length; i += BATCH_SIZE) {
    const batch = STORES.slice(i, i + BATCH_SIZE);

    const batchPromises = batch.map(async (store) => {
      const startTime = Date.now();
      try {
        const fetchPromise = store.fn(trimmedQuery, STORE_TIMEOUT_MS);
        const timeoutPromise = new Promise<ProductItem[]>((_, reject) => {
          setTimeout(() => reject(new Error('timeout')), STORE_TIMEOUT_MS + 300);
        });

        const items = await Promise.race([fetchPromise, timeoutPromise]);
        const duration = Date.now() - startTime;
        storeStatuses.push({
          key: store.key,
          name: store.name,
          url: store.url,
          status: items.length > 0 ? 'success' : 'empty',
          itemCount: items.length,
          responseTimeMs: duration,
        });
        return items;
      } catch (err: any) {
        const duration = Date.now() - startTime;
        const isTimeout =
          err?.name === 'TimeoutError' ||
          err?.name === 'AbortError' ||
          err?.message?.includes('timeout') ||
          err?.message?.includes('aborted');

        storeStatuses.push({
          key: store.key,
          name: store.name,
          url: store.url,
          status: isTimeout ? 'timeout' : 'error',
          itemCount: 0,
          responseTimeMs: duration,
          error: isTimeout ? 'پایان زمان پاسخ‌دهی (Timeout)' : (err?.message || 'در دسترس نبود (رد شد)'),
        });
        return [];
      }
    });

    const settled = await Promise.allSettled(batchPromises);
    for (const res of settled) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        rawItems.push(...res.value);
      }
    }
  }

  // Calculate scores
  for (const item of rawItems) {
    item.score = calculateRelevanceScore(item.title, trimmedQuery);
  }

  // Exact Search Filtering vs Broad Search
  let filteredItems = rawItems;
  if (mode === 'exact') {
    filteredItems = rawItems.filter(item => isExactMatch(item.title, trimmedQuery));
  }

  // Sort items: IN-STOCK items FIRST, then by price ascending
  // Out-of-stock items come at the bottom, also sorted by price ascending
  filteredItems.sort((a, b) => {
    if (a.inStock && !b.inStock) return -1;
    if (!a.inStock && b.inStock) return 1;
    return a.priceToman - b.priceToman;
  });

  // Mark cheapest item: preference given to in-stock items
  let cheapestItem: ProductItem | null = null;
  const inStockItems = filteredItems.filter(i => i.inStock);
  if (inStockItems.length > 0) {
    cheapestItem = inStockItems[0];
    cheapestItem.isCheapest = true;
  } else if (filteredItems.length > 0) {
    cheapestItem = filteredItems[0];
    cheapestItem.isCheapest = true;
  }

  const prices = filteredItems.map(i => i.priceToman);
  const averagePriceToman = prices.length > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const highestPriceToman = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    query: trimmedQuery,
    searchMode: mode,
    results: filteredItems,
    totalResults: filteredItems.length,
    cheapestItem,
    averagePriceToman,
    highestPriceToman,
    stores: storeStatuses,
    searchTimestamp: new Date().toISOString(),
  };
}

export function getSupportedStores() {
  return STORES.map(s => ({
    key: s.key,
    name: s.name,
    url: s.url,
    description: getStoreDescription(s.key),
  }));
}

function getStoreDescription(key: StoreKey): string {
  switch (key) {
    case 'eca':
      return 'بزرگترین فروشگاه قطعات و ماژول‌های الکترونیکی و رباتیک در ایران';
    case 'roboeq':
      return 'فروشگاه جامع قطعات و تجهیزات الکترونیک و رباتیک کشور';
    case 'djk':
      return 'مرجع تخصصی انواع بردهای امبدد، ماژول‌های IoT و سنسورها';
    case 'caferobot':
      return 'فروشگاه تخصصی ساخت و رباتیک و بردهای میکروکنترلری';
    case 'iranmicro':
      return 'یکی از قدیمی‌ترین و مجهزترین تأمین‌کنندگان قطعات الکترونیک';
    case 'javanelec':
      return 'نخستین فروشگاه اینترنتی قطعات اورجینال و صنعتی ایران';
    case 'mclc':
      return 'فروشگاه تخصصی مکاترونیک، قطعات الکترونیک و ابزارآلات';
    case 'jamtronic':
      return 'فروشگاه آنلاین انواع ماژول‌ها، سنسورها و بردهای الکترونیکی';
    case 'robochip':
      return 'تأمین‌کننده انواع قطعات و ماژول‌های الکترونیکی و اینترنت اشیا';
    case 'aftabrayaneh':
      return 'واردکننده و عرضه‌کننده بردهای امبدد و ماژول‌های رباتیک';
    default:
      return 'فروشگاه معتبر قطعات الکترونیکی ایران';
  }
}
