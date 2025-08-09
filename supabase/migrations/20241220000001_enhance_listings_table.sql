-- Add missing columns to listings table to match form data structure
-- Migration: Enhance listings table for complete listing functionality

-- Add new columns to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS local_area TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS shipping_methods JSONB DEFAULT '[]'::jsonb;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS shipping_costs JSONB DEFAULT '{}'::jsonb;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS extras_categories TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS extras_notes TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS included_items TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE listings ADD COLUMN IF NOT EXISTS version_name TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS version_id TEXT;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS sale_type TEXT DEFAULT 'fixed-price' CHECK (sale_type IN ('fixed-price', 'auction', 'bundle', 'trade', 'giveaway'));

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_sale_type ON listings(sale_type);
CREATE INDEX IF NOT EXISTS idx_listings_local_area ON listings(local_area) WHERE local_area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_listings_extras ON listings USING gin(extras_categories) WHERE array_length(extras_categories, 1) > 0;
CREATE INDEX IF NOT EXISTS idx_listings_shipping ON listings USING gin(shipping_methods) WHERE shipping_methods != '[]'::jsonb;

-- Add comments for documentation
COMMENT ON COLUMN listings.local_area IS 'Specific local area within city for pickup';
COMMENT ON COLUMN listings.shipping_methods IS 'Array of shipping method names';
COMMENT ON COLUMN listings.shipping_costs IS 'Object mapping shipping methods to costs';
COMMENT ON COLUMN listings.extras_categories IS 'Array of extra/add-on categories';
COMMENT ON COLUMN listings.extras_notes IS 'Free text notes about extras/add-ons';
COMMENT ON COLUMN listings.included_items IS 'Array of items included with the game';
COMMENT ON COLUMN listings.version_name IS 'Specific version/edition name';
COMMENT ON COLUMN listings.version_id IS 'BGG version ID if applicable';
COMMENT ON COLUMN listings.sale_type IS 'Type of sale: fixed-price, auction, bundle, trade, giveaway';

-- Update existing records to have default sale_type
UPDATE listings SET sale_type = 'fixed-price' WHERE sale_type IS NULL;
