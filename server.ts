import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchAllStores, getSupportedStores } from './src/server/scrapers/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// In-memory cache for search queries (60 seconds TTL)
const searchCache = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL_MS = 60 * 1000;

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

async function startServer() {
  const app = express();

  // Enable CORS for external frontends (if hosted on Cloudflare Pages, Vercel, or custom domains)
  app.use((_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (_req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.use(express.json());

  // Prevent text/html MIME type errors if browser attempts to fetch sw.js in dev mode
  app.get(['/sw.js', '/dev-sw.js'], (_req: Request, res: Response) => {
    res.type('application/javascript').send('// Service Worker placeholder');
  });

  // API: Search electronic modules across Iranian stores
  app.get('/api/search', async (req: Request, res: Response) => {
    const query = String(req.query.q || '').trim();
    const mode = (String(req.query.mode || 'exact') === 'broad' ? 'broad' : 'exact');
    if (!query) {
      return res.status(400).json({ error: 'لطفاً نام ماژول یا قطعه مورد نظر را وارد نمایید.' });
    }

    // Check in-memory cache
    const cacheKey = `${query.toLowerCase()}:${mode}`;
    const cached = searchCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      res.setHeader('X-Cache', 'HIT');
      return res.json(cached.data);
    }

    try {
      const response = await searchAllStores(query, mode);

      // Save to cache (limit size to 200 items)
      if (searchCache.size > 200) {
        const oldest = searchCache.keys().next().value;
        if (oldest) searchCache.delete(oldest);
      }
      searchCache.set(cacheKey, {
        data: response,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      res.setHeader('X-Cache', 'MISS');
      return res.json(response);
    } catch (error: any) {
      console.error('Error during searchAllStores:', error);
      return res.status(500).json({
        error: 'خطایی در استعلام از فروشگاه‌ها رخ داد. لطفاً مجدداً تلاش فرمایید.',
        details: error?.message,
      });
    }
  });

  // API: Supported stores list
  app.get('/api/stores', (_req: Request, res: Response) => {
    res.json(getSupportedStores());
  });

  // API: Popular search queries
  app.get('/api/popular', (_req: Request, res: Response) => {
    res.json(POPULAR_MODULES);
  });

  // API: Health check endpoint (Used by Render.com health checks)
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'cheapest-module-server',
      platform: 'render',
      timestamp: new Date().toISOString(),
    });
  });

  // Serve Frontend SPA
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Bind to 0.0.0.0 for Render.com and cloud environments
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT} in ${isProduction ? 'production' : 'development'} mode`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
