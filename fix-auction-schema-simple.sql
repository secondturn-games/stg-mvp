-- Fix Auction Schema - Add missing columns only
-- Run this in your Supabase SQL editor

-- 1. Add auction status enum (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE auction_status AS ENUM ('active', 'ended', 'cancelled', 'reserved');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Add missing columns to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS status auction_status DEFAULT 'active';
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES users(id);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS minimum_bid DECIMAL(10,2) DEFAULT 1.00;

-- 3. Update existing auctions to have proper status
UPDATE auctions SET status = 'active' WHERE status IS NULL;

-- 4. Add indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON auctions(winner_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at); 