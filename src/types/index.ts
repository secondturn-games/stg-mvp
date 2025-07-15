// Database Types
export interface User {
  id: string;
  clerk_id: string;
  username: string;
  email: string;
  location_city?: string;
  location_country?: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  title: Record<string, string>; // Multi-language support
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  game_id: string;
  listing_type: 'fixed' | 'auction' | 'trade';
  price?: number;
  currency: 'EUR';
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  location_country: string;
  location_city: string;
  shipping_options: {
    omniva: boolean;
    dpd: boolean;
    pickup: boolean;
  };
  photos: string[];
  description: Record<string, string>;
  status: 'active' | 'sold' | 'inactive';
  verified_photos: boolean;
  created_at: string;
  updated_at: string;
}

export interface Auction {
  id: string;
  listing_id: string;
  starting_price: number;
  current_price: number;
  reserve_price?: number;
  bid_increment: number;
  end_time: string;
  extension_time?: string;
  buy_now_price?: number;
  status: 'active' | 'ended' | 'cancelled';
  winner_id?: string;
  minimum_bid: number;
  bid_count: number;
  created_at: string;
  updated_at: string;
}

export interface Bid {
  id: string;
  auction_id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
}

export interface Transaction {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  currency: 'EUR';
  status: 'pending' | 'completed' | 'cancelled';
  payment_method: string;
  created_at: string;
  updated_at: string;
}

// Form Types
export interface ListingFormData {
  id?: string;
  gameTitle: string;
  gameId: string | null;
  listingType: 'fixed' | 'auction' | 'trade';
  price: string;
  currency: 'EUR';
  condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable';
  locationCity: string;
  description: string;
  images: string[];
  photos?: string[];
  shippingOptions: {
    omniva: boolean;
    dpd: boolean;
    pickup: boolean;
  };
  // Auction-specific fields
  startingPrice: string;
  auctionDays: string;
  endTime: string;
  reservePrice: string;
  buyNowPrice: string;
  bidIncrement: string;
}

export interface GameSuggestion {
  id: string;
  title: Record<string, string>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ActionResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// UI Types
export interface ToastMessage {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export interface FilterOptions {
  priceRange: [number, number];
  condition: string[];
  location: string[];
  listingType: string[];
}

export interface SortOptions {
  field: 'price' | 'created_at' | 'end_time';
  direction: 'asc' | 'desc';
}

// Regional Settings
export interface RegionalSettings {
  locale: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

// Search Types
export interface SearchFilters {
  query: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string[];
  location?: string[];
  listingType?: string[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
