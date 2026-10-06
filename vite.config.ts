import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: false,
        },
        includeAssets: [
          'icon-192.png',
          'icon-512.png',
          'icon-192.svg',
          'icon-512.svg',
        ],
        manifest: {
          id: '/',
          name: 'ارزان‌ترین ماژول | مقایسه قیمت قطعات الکترونیک',
          short_name: 'ارزان‌ترین ماژول',
          description: 'سامانه هوشمند استعلام و مقایسه لحظه‌ای قیمت ماژول‌ها و قطعات الکترونیکی در فروشگاه‌های معتبر ایرانی با رتبه‌بندی ارزان‌ترین و صدور پیش‌فاکتور.',
          theme_color: '#0f172a',
          background_color: '#0f172a',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          dir: 'rtl',
          lang: 'fa-IR',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon-192.svg',
              sizes: '192x192',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/icon-512.svg',
              sizes: '512x512',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 15,
                  maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\/api\/popular/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'api-popular-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24, // 24 hours
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
