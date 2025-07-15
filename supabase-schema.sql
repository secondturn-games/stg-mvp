-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create custom types
CREATE TYPE user_language AS ENUM ('en', 'et', 'lv', 'lt');
CREATE TYPE user_country AS ENUM ('EE', 'LV', 'LT');
CREATE TYPE listing_type AS ENUM ('fixed', 'auction', 'trade');
CREATE TYPE listing_condition AS ENUM ('new', 'like_new', 'very_good', 'good', 'acceptable');
CREATE TYPE listing_status AS ENUM ('active', 'sold', 'cancelled', 'reserved');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  verified_seller BOOLEAN DEFAULT FALSE,
  preferred_language user_language DEFAULT 'en',
  country user_country NOT NULL,
  bank_verified BOOLEAN DEFAULT FALSE,
  vat_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bgg_id INTEGER UNIQUE,
  title JSONB NOT NULL, -- Multi-language titles: {"en": "Catan", "et": "Catan", "lv": "Katāna"}
  year_published INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  playing_time INTEGER,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings table
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  listing_type listing_type NOT NULL DEFAULT 'fixed',
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'EUR',
  condition listing_condition NOT NULL,
  location_country user_country NOT NULL,
  location_city TEXT NOT NULL,
  shipping_options JSONB DEFAULT '{}', -- {"omniva": true, "dpd": true, "pickup": true}
  photos JSONB DEFAULT '[]', -- Array of image URLs
  description JSONB DEFAULT '{}', -- Multi-language descriptions
  status listing_status DEFAULT 'active',
  verified_photos BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auctions table
CREATE TABLE auctions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  starting_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  reserve_price DECIMAL(10,2),
  bid_increment DECIMAL(10,2) DEFAULT 1.00,
  end_time TIMESTAMPTZ NOT NULL,
  extension_time INTEGER DEFAULT 300, -- 5 minutes in seconds
  buy_now_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bids table
CREATE TABLE bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  bidder_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  is_proxy BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_flagged BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID, -- Will reference transactions table when created
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  verified_purchase BOOLEAN DEFAULT TRUE,
  photos JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  vat_amount DECIMAL(10,2) DEFAULT 0,
  escrow_status TEXT DEFAULT 'pending',
  stripe_payment_intent TEXT,
  shipping_method TEXT,
  tracking_number TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User collections table
CREATE TABLE user_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_id UUID REFERENCES games(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('own', 'want', 'trade', 'sold')) NOT NULL,
  condition listing_condition,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, game_id)
);

-- Shipping labels table
CREATE TABLE shipping_labels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  carrier TEXT CHECK (carrier IN ('omniva', 'dpd')) NOT NULL,
  label_url TEXT,
  tracking_number TEXT,
  pickup_point_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_users_verified_seller ON users(verified_seller);

CREATE INDEX idx_games_bgg_id ON games(bgg_id);
CREATE INDEX idx_games_title ON games USING GIN (title);
CREATE INDEX idx_games_year_published ON games(year_published);

CREATE INDEX idx_listings_seller_id ON listings(seller_id);
CREATE INDEX idx_listings_game_id ON listings(game_id);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_location_country ON listings(location_country);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_created_at ON listings(created_at);

CREATE INDEX idx_auctions_listing_id ON auctions(listing_id);
CREATE INDEX idx_auctions_end_time ON auctions(end_time);

CREATE INDEX idx_bids_auction_id ON bids(auction_id);
CREATE INDEX idx_bids_bidder_id ON bids(bidder_id);
CREATE INDEX idx_bids_amount ON bids(amount);

CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_recipient_id ON messages(recipient_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);

CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

CREATE INDEX idx_transactions_buyer_id ON transactions(buyer_id);
CREATE INDEX idx_transactions_seller_id ON transactions(seller_id);
CREATE INDEX idx_transactions_listing_id ON transactions(listing_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_user_collections_user_id ON user_collections(user_id);
CREATE INDEX idx_user_collections_game_id ON user_collections(game_id);
CREATE INDEX idx_user_collections_status ON user_collections(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_collections_updated_at BEFORE UPDATE ON user_collections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_labels ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Games policies (public read, authenticated insert/update)
CREATE POLICY "Anyone can view games" ON games
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert games" ON games
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update games" ON games
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Listings policies
CREATE POLICY "Anyone can view active listings" ON listings
  FOR SELECT USING (status = 'active');

CREATE POLICY "Users can view their own listings" ON listings
  FOR SELECT USING (auth.uid() = seller_id);

CREATE POLICY "Users can insert their own listings" ON listings
  FOR INSERT WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own listings" ON listings
  FOR UPDATE USING (auth.uid() = seller_id);

-- Auctions policies
CREATE POLICY "Anyone can view auctions" ON auctions
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert auctions" ON auctions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update auctions" ON auctions
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Bids policies
CREATE POLICY "Anyone can view bids" ON bids
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert bids" ON bids
  FOR INSERT WITH CHECK (auth.uid() = bidder_id);

-- Messages policies
CREATE POLICY "Users can view messages they sent or received" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Reviews policies
CREATE POLICY "Anyone can view reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can insert reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

-- Transactions policies
CREATE POLICY "Users can view their own transactions" ON transactions
  FOR SELECT USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can insert transactions" ON transactions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User collections policies
CREATE POLICY "Users can view their own collections" ON user_collections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own collections" ON user_collections
  FOR ALL USING (auth.uid() = user_id);

-- Shipping labels policies
CREATE POLICY "Users can view their own shipping labels" ON shipping_labels
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = shipping_labels.transaction_id 
      AND (transactions.buyer_id = auth.uid() OR transactions.seller_id = auth.uid())
    )
  );

-- Insert some sample data
INSERT INTO games (title, year_published, min_players, max_players, playing_time) VALUES
  ('{"en": "Catan", "et": "Catan", "lv": "Katāna", "lt": "Katanas"}', 1995, 3, 4, 90),
  ('{"en": "Ticket to Ride", "et": "Ticket to Ride", "lv": "Ticket to Ride", "lt": "Ticket to Ride"}', 2004, 2, 5, 60),
  ('{"en": "Carcassonne", "et": "Carcassonne", "lv": "Carcassonne", "lt": "Carcassonne"}', 2000, 2, 5, 45);

-- Create a function to get current user ID (for RLS)
CREATE OR REPLACE FUNCTION auth.uid() RETURNS UUID AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'sub',
    current_setting('request.jwt.claims', true)::json->>'user_id'
  )::UUID;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a function to get current user role
CREATE OR REPLACE FUNCTION auth.role() RETURNS TEXT AS $$
BEGIN
  RETURN COALESCE(
    current_setting('request.jwt.claims', true)::json->>'role',
    'anonymous'
  );
END;
$$ LANGUAGE plpgsql STABLE; 