import { BookmarkedItem } from '../types';

const STORAGE_KEY = 'bookmarked_modules';
const BACKUP_KEY = 'bookmarked_modules_backup';

/**
 * Loads bookmarked items from localStorage with validation and fallback recovery.
 */
export function loadBookmarksFromStorage(): BookmarkedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(BACKUP_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.map((item: any) => ({
      ...item,
      id: String(item.id || item.productUrl || Math.random()),
      quantity: typeof item.quantity === 'number' && item.quantity > 0 ? item.quantity : 1,
    }));
  } catch (err) {
    console.error('Failed to load bookmarks from storage:', err);
    return [];
  }
}

/**
 * Reliably persists bookmarked items to localStorage and creates a backup copy.
 */
export function saveBookmarksToStorage(items: BookmarkedItem[]): void {
  try {
    const serialized = JSON.stringify(items);
    localStorage.setItem(STORAGE_KEY, serialized);
    // Maintain a secondary backup to protect against accidental corruption
    localStorage.setItem(BACKUP_KEY, serialized);
  } catch (err) {
    console.error('Failed to persist bookmarks to localStorage:', err);
  }
}

/**
 * Clears bookmarks from localStorage.
 */
export function clearBookmarksFromStorage(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
  } catch (err) {
    console.error('Failed to clear bookmarks from storage:', err);
  }
}
