-- Auction System Schema Updates
-- Run this in your Supabase SQL editor to enhance the auction functionality

-- 1. Add auction status enum
CREATE TYPE auction_status AS ENUM ('active', 'ended', 'cancelled', 'reserved');

-- 2. Add status column to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS status auction_status DEFAULT 'active';

-- 3. Add winner_id column to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS winner_id UUID REFERENCES users(id);

-- 4. Add minimum_bid column to auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS minimum_bid DECIMAL(10,2) DEFAULT 1.00;

-- 5. Enhanced RLS policies for auctions
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

-- 6. Enhanced RLS policies for bids
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

-- 7. Create function to validate bid amount
CREATE OR REPLACE FUNCTION validate_bid_amount(
  p_auction_id UUID,
  p_bid_amount DECIMAL(10,2)
) RETURNS BOOLEAN AS $$
DECLARE
  auction_record RECORD;
  current_highest_bid DECIMAL(10,2);
BEGIN
  -- Get auction details
  SELECT * INTO auction_record FROM auctions WHERE id = p_auction_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Check if auction is still active
  IF auction_record.status != 'active' THEN
    RETURN FALSE;
  END IF;
  
  -- Get current highest bid
  SELECT COALESCE(MAX(amount), auction_record.starting_price) 
  INTO current_highest_bid 
  FROM bids 
  WHERE auction_id = p_auction_id;
  
  -- Validate bid amount
  IF p_bid_amount <= current_highest_bid THEN
    RETURN FALSE;
  END IF;
  
  -- Check minimum bid increment
  IF p_bid_amount < (current_highest_bid + auction_record.bid_increment) THEN
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to handle auction end
CREATE OR REPLACE FUNCTION handle_auction_end(p_auction_id UUID)
RETURNS VOID AS $$
DECLARE
  winning_bid RECORD;
  auction_record RECORD;
BEGIN
  -- Get auction details
  SELECT * INTO auction_record FROM auctions WHERE id = p_auction_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Get winning bid
  SELECT * INTO winning_bid 
  FROM bids 
  WHERE auction_id = p_auction_id 
  ORDER BY amount DESC, created_at ASC 
  LIMIT 1;
  
  -- Update auction status
  IF winning_bid IS NOT NULL THEN
    UPDATE auctions 
    SET status = 'ended', winner_id = winning_bid.bidder_id, current_price = winning_bid.amount
    WHERE id = p_auction_id;
    
    -- Update listing status
    UPDATE listings 
    SET status = 'sold' 
    WHERE id = auction_record.listing_id;
  ELSE
    UPDATE auctions 
    SET status = 'ended'
    WHERE id = p_auction_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger to auto-end auctions
CREATE OR REPLACE FUNCTION check_auction_end()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if auction has ended
  IF NEW.end_time <= NOW() AND NEW.status = 'active' THEN
    PERFORM handle_auction_end(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_check_auction_end ON auctions;
CREATE TRIGGER trigger_check_auction_end
  AFTER UPDATE ON auctions
  FOR EACH ROW
  EXECUTE FUNCTION check_auction_end();

-- 10. Create function to extend auction if bid is placed near end
CREATE OR REPLACE FUNCTION extend_auction_if_needed(p_auction_id UUID)
RETURNS VOID AS $$
DECLARE
  auction_record RECORD;
  time_until_end INTERVAL;
BEGIN
  -- Get auction details
  SELECT * INTO auction_record FROM auctions WHERE id = p_auction_id;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Calculate time until end
  time_until_end := auction_record.end_time - NOW();
  
  -- If less than extension_time remaining, extend the auction
  IF time_until_end <= INTERVAL '1 second' * auction_record.extension_time THEN
    UPDATE auctions 
    SET end_time = end_time + INTERVAL '1 second' * extension_time
    WHERE id = p_auction_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 11. Create trigger to extend auction on bid
CREATE OR REPLACE FUNCTION trigger_extend_auction()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM extend_auction_if_needed(NEW.auction_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_extend_auction ON bids;
CREATE TRIGGER trigger_extend_auction
  AFTER INSERT ON bids
  FOR EACH ROW
  EXECUTE FUNCTION trigger_extend_auction();

-- 12. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auctions_winner_id ON auctions(winner_id);
CREATE INDEX IF NOT EXISTS idx_bids_created_at ON bids(created_at);

-- 13. Create view for active auctions with listing details
CREATE OR REPLACE VIEW active_auctions AS
SELECT 
  a.id as auction_id,
  a.starting_price,
  a.current_price,
  a.reserve_price,
  a.bid_increment,
  a.end_time,
  a.buy_now_price,
  a.status,
  l.id as listing_id,
  l.seller_id,
  l.game_id,
  l.condition,
  l.location_city,
  l.location_country,
  l.photos,
  l.description,
  g.title,
  u.username as seller_username,
  COUNT(b.id) as bid_count
FROM auctions a
JOIN listings l ON a.listing_id = l.id
JOIN games g ON l.game_id = g.id
JOIN users u ON l.seller_id = u.id
LEFT JOIN bids b ON a.id = b.auction_id
WHERE a.status = 'active'
GROUP BY a.id, l.id, g.id, u.id;

-- 14. Create view for auction bids with user info
CREATE OR REPLACE VIEW auction_bids AS
SELECT 
  b.id,
  b.auction_id,
  b.bidder_id,
  b.amount,
  b.is_proxy,
  b.created_at,
  u.username as bidder_username
FROM bids b
JOIN users u ON b.bidder_id = u.id
ORDER BY b.amount DESC, b.created_at ASC; 