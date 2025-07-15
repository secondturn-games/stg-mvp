-- Fix Auction Schema - Add missing columns
-- Run this in your Supabase SQL editor

-- 1. Add auction status enum
CREATE TYPE auction_status AS ENUM ('active', 'ended', 'cancelled', 'reserved');

-- 2. Add missing columns to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS status auction_status DEFAULT 'active';
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES users(id);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS minimum_bid DECIMAL(10,2) DEFAULT 1.00;

-- 3. Update existing auctions to have proper status
UPDATE auctions SET status = 'active' WHERE status IS NULL;

-- 4. Enhanced RLS policies for auctions
DROP POLICY IF EXISTS "Anyone can view auctions" ON auctions;
CREATE POLICY "Anyone can view active auctions" ON auctions
  FOR SELECT USING (status = 'active' OR status = 'ended');

CREATE POLICY "Users can view their own auctions" ON auctions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = auctions.listing_id 
      AND listings.seller_id = public.auth_uid()
    )
  );

CREATE POLICY "Authenticated users can insert auctions" ON auctions
  FOR INSERT WITH CHECK (
    public.auth_role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = auctions.listing_id 
      AND listings.seller_id = public.auth_uid()
    )
  );

CREATE POLICY "Users can update their own auctions" ON auctions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE listings.id = auctions.listing_id 
      AND listings.seller_id = public.auth_uid()
    )
  );

-- 5. Enhanced RLS policies for bids
DROP POLICY IF EXISTS "Anyone can view bids" ON bids;
CREATE POLICY "Anyone can view bids for active auctions" ON bids
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM auctions 
      WHERE auctions.id = bids.auction_id 
      AND auctions.status = 'active'
    )
  );

CREATE POLICY "Users can view their own bids" ON bids
  FOR SELECT USING (public.auth_uid() = bidder_id);

CREATE POLICY "Authenticated users can insert bids" ON bids
  FOR INSERT WITH CHECK (
    public.auth_uid() = bidder_id AND
    EXISTS (
      SELECT 1 FROM auctions 
      WHERE auctions.id = bids.auction_id 
      AND auctions.status = 'active'
    )
  );

-- 6. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON auctions(winner_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at); 