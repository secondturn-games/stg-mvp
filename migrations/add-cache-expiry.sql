-- Migration: Add cache_expires_at column to games table
-- Run this in your Supabase SQL editor to add caching support

-- Add cache_expires_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'games' AND column_name = 'cache_expires_at'
    ) THEN
        ALTER TABLE games ADD COLUMN cache_expires_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Add index for cache expiry if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_games_cache_expiry ON games(cache_expires_at);

-- Update existing records to have a default expiry (30 days from now)
UPDATE games 
SET cache_expires_at = NOW() + INTERVAL '30 days'
WHERE cache_expires_at IS NULL; 