import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database types for TypeScript
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          verified_seller: boolean
          preferred_language: 'en' | 'et' | 'lv' | 'lt'
          country: 'EE' | 'LV' | 'LT'
          bank_verified: boolean
          vat_number: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          verified_seller?: boolean
          preferred_language?: 'en' | 'et' | 'lv' | 'lt'
          country?: 'EE' | 'LV' | 'LT'
          bank_verified?: boolean
          vat_number?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          verified_seller?: boolean
          preferred_language?: 'en' | 'et' | 'lv' | 'lt'
          country?: 'EE' | 'LV' | 'LT'
          bank_verified?: boolean
          vat_number?: string | null
          created_at?: string
        }
      }
      games: {
        Row: {
          id: string
          bgg_id: number | null
          title: Record<string, string> // Multi-language titles
          year_published: number | null
          min_players: number | null
          max_players: number | null
          playing_time: number | null
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          bgg_id?: number | null
          title: Record<string, string>
          year_published?: number | null
          min_players?: number | null
          max_players?: number | null
          playing_time?: number | null
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          bgg_id?: number | null
          title?: Record<string, string>
          year_published?: number | null
          min_players?: number | null
          max_players?: number | null
          playing_time?: number | null
          image_url?: string | null
          created_at?: string
        }
      }
      listings: {
        Row: {
          id: string
          seller_id: string
          game_id: string
          listing_type: 'fixed' | 'auction' | 'trade'
          price: number | null
          currency: string
          condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
          location_country: string
          location_city: string
          shipping_options: Record<string, any>
          photos: string[]
          description: Record<string, string>
          status: 'active' | 'sold' | 'cancelled' | 'reserved'
          verified_photos: boolean
          created_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          game_id: string
          listing_type: 'fixed' | 'auction' | 'trade'
          price?: number | null
          currency?: string
          condition: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
          location_country: string
          location_city: string
          shipping_options?: Record<string, any>
          photos?: string[]
          description?: Record<string, string>
          status?: 'active' | 'sold' | 'cancelled' | 'reserved'
          verified_photos?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          game_id?: string
          listing_type?: 'fixed' | 'auction' | 'trade'
          price?: number | null
          currency?: string
          condition?: 'new' | 'like_new' | 'very_good' | 'good' | 'acceptable'
          location_country?: string
          location_city?: string
          shipping_options?: Record<string, any>
          photos?: string[]
          description?: Record<string, string>
          status?: 'active' | 'sold' | 'cancelled' | 'reserved'
          verified_photos?: boolean
          created_at?: string
        }
      }
      auctions: {
        Row: {
          id: string
          listing_id: string
          starting_price: number
          current_price: number
          reserve_price: number | null
          bid_increment: number
          end_time: string
          extension_time: number
          buy_now_price: number | null
          status: 'active' | 'ended' | 'cancelled' | 'reserved'
          winner_id: string | null
          minimum_bid: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          starting_price: number
          current_price: number
          reserve_price?: number | null
          bid_increment?: number
          end_time: string
          extension_time?: number
          buy_now_price?: number | null
          status?: 'active' | 'ended' | 'cancelled' | 'reserved'
          winner_id?: string | null
          minimum_bid?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          starting_price?: number
          current_price?: number
          reserve_price?: number | null
          bid_increment?: number
          end_time?: string
          extension_time?: number
          buy_now_price?: number | null
          status?: 'active' | 'ended' | 'cancelled' | 'reserved'
          winner_id?: string | null
          minimum_bid?: number
          created_at?: string
          updated_at?: string
        }
      }
      bids: {
        Row: {
          id: string
          auction_id: string
          bidder_id: string
          amount: number
          is_proxy: boolean
          created_at: string
        }
        Insert: {
          id?: string
          auction_id: string
          bidder_id: string
          amount: number
          is_proxy?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          auction_id?: string
          bidder_id?: string
          amount?: number
          is_proxy?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 