export const BALTIC_COUNTRIES = ['EE', 'LV', 'LT'] as const;

export const LISTING_CONDITIONS = [
  'new',
  'like_new', 
  'very_good',
  'good',
  'acceptable'
] as const;

export const LISTING_TYPES = ['fixed', 'auction', 'trade'] as const;

export const CURRENCIES = ['EUR'] as const;

export const SHIPPING_OPTIONS = {
  omniva: 'Omniva',
  dpd: 'DPD',
  pickup: 'Local Pickup'
} as const;

export const AUCTION_STATUSES = ['active', 'ended', 'cancelled'] as const;

export const LISTING_STATUSES = ['active', 'sold', 'inactive'] as const;

export const BID_INCREMENT_OPTIONS = [1, 2, 5, 10, 20, 50] as const;

export const AUCTION_DURATION_OPTIONS = [
  { value: 1, label: '1 day' },
  { value: 3, label: '3 days' },
  { value: 7, label: '7 days' },
  { value: 14, label: '14 days' }
] as const;