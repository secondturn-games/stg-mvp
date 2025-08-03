-- Second Turn Games Database Schema
-- This documents the actual database structure used by the application

-- Enable PostgreSQL extensions for advanced search
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for fuzzy search on game names
CREATE INDEX IF NOT EXISTS idx_csv_games_name_trgm 
ON csv_games USING gin (name gin_trgm_ops);

-- Create full-text search index
CREATE INDEX IF NOT EXISTS idx_csv_games_name_fts 
ON csv_games USING gin (to_tsvector('english', name));

-- Create composite index for better performance
CREATE INDEX IF NOT EXISTS idx_csv_games_search 
ON csv_games (is_expansion, rank, bayesaverage) 
WHERE rank IS NOT NULL AND bayesaverage IS NOT NULL;

-- Create advanced search function with composite scoring (updated with more lenient fuzzy matching)
CREATE OR REPLACE FUNCTION search_boardgames(term text)
RETURNS TABLE (
  id text,
  name text,
  yearpublished text,
  rank text,
  bayesaverage text,
  is_expansion text,
  abstracts_rank text,
  cgs_rank text,
  childrensgames_rank text,
  familygames_rank text,
  partygames_rank text,
  strategygames_rank text,
  thematic_rank text,
  wargames_rank text,
  score float
)
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    csv_games.id,
    csv_games.name,
    csv_games.yearpublished,
    csv_games.rank,
    csv_games.bayesaverage,
    csv_games.is_expansion,
    csv_games.abstracts_rank,
    csv_games.cgs_rank,
    csv_games.childrensgames_rank,
    csv_games.familygames_rank,
    csv_games.partygames_rank,
    csv_games.strategygames_rank,
    csv_games.thematic_rank,
    csv_games.wargames_rank,
    (
      -- Exact match boost (highest priority)
      CASE WHEN lower(csv_games.name) = lower(term) THEN 1000000 ELSE 0 END +
      
      -- Fuzzy match using pg_trgm similarity (0-1 scale, multiplied by 50000)
      similarity(csv_games.name, term) * 50000 +
      
      -- Base game priority (base games get 10000 bonus)
      CASE WHEN csv_games.is_expansion = '0' THEN 10000 ELSE 0 END +
      
      -- BGG rank bonus (lower rank = higher score, max 1000 bonus for rank 1)
      CASE 
        WHEN csv_games.rank IS NOT NULL AND csv_games.rank != '0' 
        THEN GREATEST(0, 1000 - CAST(csv_games.rank AS INTEGER))
        ELSE 0 
      END +
      
      -- Rating bonus (higher rating = higher score, max 1000 bonus for 10.0 rating)
      CASE 
        WHEN csv_games.bayesaverage IS NOT NULL AND csv_games.bayesaverage != '0'
        THEN CAST(csv_games.bayesaverage AS FLOAT) * 100
        ELSE 0 
      END +
      
      -- Year bonus (newer games get slight bonus, max 100 bonus for 2024)
      CASE 
        WHEN csv_games.yearpublished IS NOT NULL AND csv_games.yearpublished != '0'
        THEN GREATEST(0, CAST(csv_games.yearpublished AS INTEGER) - 1900) * 0.1
        ELSE 0 
      END
    ) AS score
  FROM csv_games
  WHERE 
    -- Fuzzy match using pg_trgm (more lenient similarity threshold 0.05)
    similarity(csv_games.name, term) > 0.05
    OR 
    -- Full-text search
    to_tsvector('english', csv_games.name) @@ plainto_tsquery(term)
    OR
    -- Partial match fallback
    lower(csv_games.name) LIKE lower('%' || term || '%')
  ORDER BY score DESC
  LIMIT 50;
END;
$$ LANGUAGE plpgsql;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar TEXT,
  bio TEXT,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'latvia',
  language TEXT NOT NULL DEFAULT 'en',
  is_verified BOOLEAN NOT NULL DEFAULT false,
  rating REAL NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Games table (BGG data cache)
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY, -- BGG game ID
  name TEXT NOT NULL,
  year_published INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  playing_time INTEGER,
  min_age INTEGER,
  description TEXT,
  thumbnail TEXT,
  image TEXT,
  bgg_rating REAL,
  bgg_weight REAL,
  bgg_rank INTEGER,
  game_type TEXT CHECK (game_type IN ('base-game', 'expansion')), -- Add game type column
  mechanics TEXT[], -- JSON array
  categories TEXT[], -- JSON array
  alternate_names TEXT[], -- JSON array of alternate names
  versions JSONB, -- Store version information as JSON array
  cache_expires_at TIMESTAMP WITH TIME ZONE, -- When cached data expires
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Listings table
CREATE TABLE IF NOT EXISTS listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  condition TEXT NOT NULL, -- new, like-new, very-good, good, fair, poor
  condition_notes TEXT,
  price REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  pickup_radius INTEGER NOT NULL DEFAULT 50, -- km
  trading_options TEXT[], -- JSON array
  images TEXT[], -- JSON array of image URLs
  status TEXT NOT NULL DEFAULT 'active', -- active, sold, archived, flagged
  is_active BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  favorite_count INTEGER NOT NULL DEFAULT 0,
  bgg_id TEXT, -- BGG game ID for metadata
  bgg_data JSONB, -- Store BGG metadata as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_id TEXT REFERENCES games(id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  sender_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  rating INTEGER NOT NULL, -- 1-5 stars
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  reviewer_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewed_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint
  UNIQUE(reviewer_id, reviewed_user_id)
);

-- Favorites table
CREATE TABLE IF NOT EXISTS favorites (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Unique constraint
  UNIQUE(user_id, listing_id)
);

-- Watchlist table
CREATE TABLE IF NOT EXISTS watchlist (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Foreign keys
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  
  -- Unique constraint
  UNIQUE(user_id, listing_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(country, city);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_listings_condition ON listings(condition);
CREATE INDEX IF NOT EXISTS idx_listings_bgg_id ON listings(bgg_id);
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_games_cache_expiry ON games(cache_expires_at);
CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type); -- Add index for game type
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);

-- Migration: Add game_type column to existing games table (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'game_type'
    ) THEN
        ALTER TABLE games ADD COLUMN game_type TEXT CHECK (game_type IN ('base-game', 'expansion'));
        CREATE INDEX IF NOT EXISTS idx_games_type ON games(game_type);
    END IF;
END $$; 