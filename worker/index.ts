import { searchAllStores, getSupportedStores } from '../src/server/scrapers/index.js';

export interface Env {
  ENVIRONMENT?: string;
}

const POPULAR_MODULES = [
  { name: 'ESP32', category: 'میکروکنترلر و وای‌فای', query: 'ESP32' },
  { name: 'آردوینو Uno', category: 'بردهای امبدد', query: 'Arduino Uno' },
  { name: 'ماژول رله ۵ ولت', category: 'سوئیچینگ و قدرت', query: 'ماژول رله 5 ولت' },
  { name: 'سنسور دما DHT22', category: 'سنسورها', query: 'سنسور DHT22' },
  { name: 'ماژول شارژر باتری TP4056', category: 'تغذیه و پاور', query: 'ماژول TP4056' },
  { name: 'نمایشگر OLED I2C', category: 'نمایشگرها', query: 'نمایشگر OLED I2C' },
  { name: 'ماژول بلوتوث HC-05', category: 'ارتباطات بی‌سیم', query: 'ماژول HC-05' },
  { name: 'سنسور التراسونیک SR04', category: 'سنسورهای فاصله', query: 'سنسور SR04' },
  { name: 'درایور موتور L298N', category: 'رباتیک و موتور', query: 'درایور L298N' },
  { name: 'رزبری پای پیکو', category: 'بردهای امبدد', query: 'Raspberry Pi Pico' },
  { name: 'سنسور PIR حرکتی HC-SR501', category: 'سنسورها', query: 'سنسور HC-SR501' },
  { name: 'ماژول کاهنده ولتاژ LM2596', category: 'تغذیه و پاور', query: 'ماژول LM2596' },
];

// Short-term in-memory cache for search queries (60 seconds TTL)
interface CacheEntry {
  data: unknown;
  expiresAt: number;
}
const searchCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

/**
 * Returns dynamic CORS headers supporting https://cheapest-modules.pages.dev, localhost, or any web client.
 */
function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '*';
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

/**
 * Helper to build JSON Response with appropriate status, extra headers, and CORS headers.
 */
function jsonResponse(
  data: unknown,
  status = 200,
  request?: Request,
  extraHeaders: Record<string, string> = {}
): Response {
  const cors = request ? getCorsHeaders(request) : { 'Access-Control-Allow-Origin': '*' };
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...cors,
      ...extraHeaders,
    },
  });
}

export default {
  async fetch(request: Request, _env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const cors = getCorsHeaders(request);

      // 1. Handle CORS preflight OPTIONS requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: cors,
        });
      }

      // Only allow GET requests for the API
      if (request.method !== 'GET') {
        return jsonResponse({ error: 'Method not allowed' }, 405, request);
      }

      const pathname = url.pathname.replace(/\/+$/, '') || '/';

      // 2. GET /api/health
      if (pathname === '/api/health' || pathname === '/health') {
        return jsonResponse(
          {
            status: 'ok',
            service: 'cheapest-module-worker',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
          },
          200,
          request,
          { 'Cache-Control': 'no-cache' }
        );
      }

      // 3. GET /api/stores
      if (pathname === '/api/stores') {
        return jsonResponse(getSupportedStores(), 200, request, {
          'Cache-Control': 'public, max-age=3600',
        });
      }

      // 4. GET /api/popular
      if (pathname === '/api/popular') {
        return jsonResponse(POPULAR_MODULES, 200, request, {
          'Cache-Control': 'public, max-age=1800',
        });
      }

      // 5. GET /api/search?q=...&mode=exact|broad
      if (pathname === '/api/search') {
        const q = (url.searchParams.get('q') || '').trim();
        const mode = (url.searchParams.get('mode') === 'broad' ? 'broad' : 'exact');

        if (!q) {
          return jsonResponse(
            {
              error: 'لطفاً نام ماژول یا قطعه مورد نظر را وارد نمایید.',
            },
            400,
            request
          );
        }

        // Check in-memory cache to prevent subrequest pressure on repeat queries
        const cacheKey = `${q.toLowerCase()}:${mode}`;
        const cached = searchCache.get(cacheKey);
        if (cached && cached.expiresAt > Date.now()) {
          return jsonResponse(cached.data, 200, request, {
            'X-Cache': 'HIT',
            'Cache-Control': 'public, max-age=60',
          });
        }

        try {
          const results = await searchAllStores(q, mode);

          // Save in cache (prune if exceeds 150 items)
          if (searchCache.size > 150) {
            const oldestKey = searchCache.keys().next().value;
            if (oldestKey) searchCache.delete(oldestKey);
          }
          searchCache.set(cacheKey, {
            data: results,
            expiresAt: Date.now() + CACHE_TTL_MS,
          });

          return jsonResponse(results, 200, request, {
            'X-Cache': 'MISS',
            'Cache-Control': 'public, max-age=60',
          });
        } catch (err: any) {
          console.error('Worker search error:', err);
          return jsonResponse(
            {
              error: 'سرور موقتاً در حال پردازش حجم بالای درخواست‌ها است (خطای ۵۰۳).',
              details: err?.message,
              retryAfter: 2,
            },
            503,
            request,
            { 'Retry-After': '2' }
          );
        }
      }

      // 6. Root / info
      if (pathname === '/') {
        return jsonResponse(
          {
            name: 'Cheapest Module Cloudflare Worker API',
            status: 'running',
            endpoints: [
              '/api/health',
              '/api/stores',
              '/api/popular',
              '/api/search?q=ESP32&mode=exact',
            ],
            client: 'https://cheapest-modules.pages.dev',
          },
          200,
          request
        );
      }

      return jsonResponse({ error: 'Endpoint Not Found', path: pathname }, 404, request);
    } catch (topLevelError: any) {
      console.error('Worker unexpected error:', topLevelError);
      return jsonResponse(
        {
          error: 'خطای موقت در ارتباط با ورکر (۵۰۳). لطفاً مجدداً امتحان کنید.',
          details: topLevelError?.message,
          retryAfter: 3,
        },
        503,
        request,
        { 'Retry-After': '3' }
      );
    }
  },
};
