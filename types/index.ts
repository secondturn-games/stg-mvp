// User types
export interface User {
  id: string
  email: string
  username: string
  full_name?: string
  avatar?: string
  bio?: string
  city: string
  country: 'estonia' | 'latvia' | 'lithuania'
  language: 'en' | 'et' | 'lv' | 'lt'
  is_verified: boolean
  rating: number
  review_count: number
  created_at: string
  updated_at: string
}

// Game types
export interface Game {
  id: string // BGG ID
  name: string
  year_published?: number
  min_players?: number
  max_players?: number
  playing_time?: number
  min_age?: number
  description?: string
  thumbnail?: string
  image?: string
  bgg_rating?: number
  bgg_weight?: number
  bgg_rank?: number
  mechanics: string[]
  categories: string[]
  created_at: string
  updated_at: string
}

// Listing types
export interface Listing {
  id: string
  title: string
  description: string
  condition: 'new' | 'like-new' | 'very-good' | 'good' | 'fair' | 'poor'
  condition_notes?: string
  price: number
  currency: string
  city: string
  country: string
  pickup_radius: number
  trading_options: string[]
  images: string[]
  status: string
  is_active: boolean
  view_count: number
  favorite_count: number
  bgg_id?: string
  bgg_data?: any
  created_at: string
  updated_at: string
  
  // Relations
  user_id: string
  user: User
  game_id?: string
  game?: Game
}

// Message types
export interface Message {
  id: string
  content: string
  is_read: boolean
  created_at: string
  
  // Relations
  sender_id: string
  sender: User
  listing_id: string
  listing: Listing
}

// Review types
export interface Review {
  id: string
  rating: number
  comment?: string
  created_at: string
  
  // Relations
  reviewer_id: string
  reviewer: User
  reviewed_user_id: string
  reviewedUser: User
}

// Form types
export interface CreateListingForm {
  title: string
  description: string
  condition: string
  condition_notes?: string
  price: number
  city: string
  country: string
  pickup_radius: number
  trading_options: string[]
  images: File[]
  game_id?: string
}

export interface CreateUserForm {
  email: string
  username: string
  full_name?: string
  city: string
  country: string
  language: string
}

// Search and filter types
export interface SearchFilters {
  query?: string
  minPrice?: number
  maxPrice?: number
  condition?: string[]
  city?: string
  country?: string
  sortBy?: 'price' | 'date' | 'popularity'
  sortOrder?: 'asc' | 'desc'
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
} 