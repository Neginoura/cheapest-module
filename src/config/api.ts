/**
 * API Configuration for Render.com & Full-Stack Deployment.
 *
 * On Render.com (unified Web Service):
 * - Frontend and backend run on the exact same host and domain.
 * - Relative URLs (/api/...) work out of the box with zero CORS issues,
 *   zero subrequest limits, and zero 503 errors.
 *
 * If you host the frontend separately (e.g. on Cloudflare Pages or Vercel)
 * and point to a Render backend, set VITE_API_BASE_URL in your environment:
 * e.g. VITE_API_BASE_URL="https://cheapest-module.onrender.com"
 */

export const API_BASE_URL: string = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) || ''
).replace(/\/+$/, '');

/**
 * Returns the resolved API endpoint URL.
 *
 * @example
 * getApiUrl('/api/search')  -> '/api/search' (or 'https://my-app.onrender.com/api/search' if VITE_API_BASE_URL set)
 * getApiUrl('/api/health')  -> '/api/health'
 * getApiUrl('/api/popular') -> '/api/popular'
 * getApiUrl('/api/stores')  -> '/api/stores'
 */
export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!API_BASE_URL) {
    return cleanPath;
  }
  return `${API_BASE_URL}${cleanPath}`;
}
