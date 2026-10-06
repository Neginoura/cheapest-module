/**
 * Utilities for cleaning and formatting prices, strings, and URLs for Iranian electronics stores
 */

export function cleanPrice(str: string | undefined | null): number {
  if (!str) return 0;
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arDigits = '٠١٢٣٤٥٦٧٨٩';
  let cleaned = String(str)
    .replace(/[۰-۹]/g, d => String(faDigits.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(arDigits.indexOf(d)));
  cleaned = cleaned.replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

export function formatPersianNumber(num: number): string {
  if (!num) return '۰';
  return num.toLocaleString('fa-IR');
}

export function formatEnglishWithCommas(num: number): string {
  if (!num) return '0';
  return num.toLocaleString('en-US');
}

export const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'fa,en-US;q=0.9,en;q=0.8',
  'Cache-Control': 'no-cache',
};

/**
 * Normalizes Persian and English text, digits, and separators for comparison
 */
export function normalizeElectronicsText(text: string): string {
  const faDigits = '۰۱۲۳۴۵۶۷۸۹';
  const arDigits = '٠١٢٣٤٥٦٧٨٩';
  return text
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[۰-۹]/g, d => String(faDigits.indexOf(d)))
    .replace(/[٠-٩]/g, d => String(arDigits.indexOf(d)))
    .replace(/[\/\\()\[\]+]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a product title strictly matches the exact model in the search query.
 * For example:
 * Query "ماژول بلوتوث M18" -> ONLY matches products containing "m18" or "m-18" or "m 18",
 * not generic bluetooth modules or HC-05.
 */
export function isExactMatch(title: string, query: string): boolean {
  const normTitle = normalizeElectronicsText(title);
  const normQuery = normalizeElectronicsText(query);

  const stopWords = new Set([
    'ماژول',
    'سنسور',
    'برد',
    'کیت',
    'با',
    'در',
    'برای',
    'به',
    'و',
    'از',
    'نوع',
    'مدل',
    'module',
    'sensor',
    'board',
    'kit',
  ]);

  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 0);
  const modelTokens = queryTokens.filter(t => !stopWords.has(t));

  // If the query was purely generic words like "ماژول سنسور", all words must exist in title
  if (modelTokens.length === 0) {
    return queryTokens.every(t => normTitle.includes(t));
  }

  // Model codes (e.g., "m18", "esp32", "dht22", "uno", "5v", "5", "ولت") must all match!
  const titleCompact = normTitle.replace(/[\s-_]/g, '');

  return modelTokens.every(token => {
    // Check direct word inclusion
    if (normTitle.includes(token)) return true;

    // Check hyphen-stripped inclusion (e.g. "m18" in "m-18" or "hc05" in "hc-05")
    const tokenCompact = token.replace(/[\s-_]/g, '');
    if (tokenCompact.length >= 2 && titleCompact.includes(tokenCompact)) {
      return true;
    }

    return false;
  });
}

export function calculateRelevanceScore(title: string, query: string): number {
  const normTitle = normalizeElectronicsText(title);
  const normQuery = normalizeElectronicsText(query);
  const queryTokens = normQuery.split(/\s+/).filter(t => t.length > 1);

  let score = 0;
  if (normTitle.includes(normQuery)) score += 60;

  for (const token of queryTokens) {
    if (normTitle.includes(token)) {
      score += 20;
    }
  }

  // Bonus for exact model presence
  if (isExactMatch(title, query)) {
    score += 40;
  }

  // Bonus for shorter titles (more precise match)
  score += Math.max(0, 30 - Math.min(title.length / 5, 30));

  return score;
}
