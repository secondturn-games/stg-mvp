import { z } from 'zod';

// User profile validation schema
export const userProfileSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/, {
    message: 'Username can only contain letters, numbers, underscores, and hyphens',
  }),
  country: z.enum(['EE', 'LV', 'LT']),
  preferred_language: z.enum(['en', 'et', 'lv', 'lt']).optional(),
  vat_number: z.string().regex(/^[A-Z]{2}[0-9A-Z]+$/, {
    message: 'Invalid VAT number format',
  }).optional().nullable(),
});

// Listing creation validation schema
export const listingCreateSchema = z.object({
  gameTitle: z.string().min(1).max(200),
  listingType: z.enum(['fixed', 'auction', 'trade']),
  price: z.number().positive().optional(),
  currency: z.string().length(3).optional(),
  condition: z.enum(['new', 'like_new', 'very_good', 'good', 'acceptable']),
  locationCity: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  images: z.array(z.string().url()).max(10).optional(),
  shippingOptions: z.record(z.any()).optional(),
  // Auction-specific fields
  startingPrice: z.number().positive().optional(),
  auctionDays: z.number().int().min(1).max(30).optional(),
  endTime: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  reservePrice: z.number().positive().optional(),
  buyNowPrice: z.number().positive().optional(),
  bidIncrement: z.number().positive().optional(),
});

// Auction bid validation schema
export const auctionBidSchema = z.object({
  amount: z.number().positive(),
  isProxy: z.boolean().optional(),
});

// Search parameters validation schema
export const searchParamsSchema = z.object({
  query: z.string().max(100).optional(),
  category: z.string().max(50).optional(),
  condition: z.enum(['new', 'like_new', 'very_good', 'good', 'acceptable']).optional(),
  priceMin: z.number().positive().optional(),
  priceMax: z.number().positive().optional(),
  location: z.string().max(100).optional(),
  sortBy: z.enum(['price', 'date', 'relevance']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(50).optional(),
});

// Helper function to validate and sanitize input
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

// Helper function to safely validate input (returns null if invalid)
export function safeValidateInput<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  try {
    return schema.parse(data);
  } catch {
    return null;
  }
}