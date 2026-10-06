export type StoreKey =
  | 'eca'
  | 'roboeq'
  | 'djk'
  | 'caferobot'
  | 'iranmicro'
  | 'javanelec'
  | 'mclc'
  | 'jamtronic'
  | 'robochip'
  | 'aftabrayaneh';

export type SearchMode = 'exact' | 'broad';

export interface ProductItem {
  id: string;
  title: string;
  priceToman: number;
  priceRial: number;
  formattedPriceToman: string;
  formattedPriceRial: string;
  storeName: string;
  storeKey: StoreKey;
  storeUrl: string;
  storeBadgeColor: string;
  productUrl: string;
  imageUrl: string;
  inStock: boolean;
  score?: number;
  isCheapest?: boolean;
}

export interface BookmarkedItem extends ProductItem {
  quantity: number;
}

export interface StoreStatus {
  key: StoreKey;
  name: string;
  url: string;
  status: 'success' | 'empty' | 'error' | 'timeout';
  itemCount: number;
  responseTimeMs: number;
  error?: string;
}

export interface SearchResponse {
  query: string;
  searchMode?: SearchMode;
  results: ProductItem[];
  totalResults: number;
  cheapestItem: ProductItem | null;
  averagePriceToman: number;
  highestPriceToman: number;
  stores: StoreStatus[];
  searchTimestamp: string;
}

export type SortOption = 'price_asc' | 'price_desc' | 'relevance';
export type CurrencyMode = 'toman' | 'rial';
export type ViewMode = 'grid' | 'table';

export interface FilterState {
  stores: StoreKey[];
  inStockOnly: boolean;
  minPrice: number;
  maxPrice: number;
  sortBy: SortOption;
}
