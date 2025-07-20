-- Game Collection Management Schema
-- Add to existing database schema

-- Create game_collections table for user's personal library
CREATE TABLE IF NOT EXISTS game_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_title TEXT NOT NULL,
  game_category TEXT,
  game_condition TEXT CHECK (game_condition IN ('new', 'like_new', 'good', 'fair', 'poor')),
  acquisition_date DATE,
  acquisition_price DECIMAL(10,2),
  current_value DECIMAL(10,2),
  notes TEXT,
  is_for_sale BOOLEAN DEFAULT FALSE,
  is_for_trade BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wishlist table for games user wants
CREATE TABLE IF NOT EXISTS wishlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_title TEXT NOT NULL,
  game_category TEXT,
  max_price DECIMAL(10,2),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  notes TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create collection_categories table for organizing games
CREATE TABLE IF NOT EXISTS collection_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  icon TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game_collection_categories junction table
CREATE TABLE IF NOT EXISTS game_collection_categories (
  game_collection_id UUID REFERENCES game_collections(id) ON DELETE CASCADE,
  category_id UUID REFERENCES collection_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (game_collection_id, category_id)
);

-- Create game_play_sessions table for tracking play time
CREATE TABLE IF NOT EXISTS game_play_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_collection_id UUID REFERENCES game_collections(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  duration_minutes INTEGER,
  players_count INTEGER DEFAULT 1,
  notes TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create game_ratings table for user ratings
CREATE TABLE IF NOT EXISTS game_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_title TEXT NOT NULL,
  rating INTEGER CHECK (rating BETWEEN 1 AND 10) NOT NULL,
  review TEXT,
  complexity_rating INTEGER CHECK (complexity_rating BETWEEN 1 AND 10),
  replayability_rating INTEGER CHECK (replayability_rating BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create collection_statistics table for aggregated stats
CREATE TABLE IF NOT EXISTS collection_statistics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  total_games INTEGER DEFAULT 0,
  total_value DECIMAL(10,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  most_played_game TEXT,
  total_play_time_minutes INTEGER DEFAULT 0,
  games_for_sale INTEGER DEFAULT 0,
  games_for_trade INTEGER DEFAULT 0,
  wishlist_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_collections_user_id ON game_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_game_collections_category ON game_collections(game_category);
CREATE INDEX IF NOT EXISTS idx_game_collections_for_sale ON game_collections(is_for_sale);
CREATE INDEX IF NOT EXISTS idx_game_collections_for_trade ON game_collections(is_for_trade);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_category ON wishlist(game_category);
CREATE INDEX IF NOT EXISTS idx_wishlist_priority ON wishlist(priority);

CREATE INDEX IF NOT EXISTS idx_collection_categories_user_id ON collection_categories(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_categories_default ON collection_categories(is_default);

CREATE INDEX IF NOT EXISTS idx_game_play_sessions_user_id ON game_play_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_play_sessions_game_id ON game_play_sessions(game_collection_id);
CREATE INDEX IF NOT EXISTS idx_game_play_sessions_date ON game_play_sessions(session_date);

CREATE INDEX IF NOT EXISTS idx_game_ratings_user_id ON game_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_game_ratings_title ON game_ratings(game_title);

CREATE INDEX IF NOT EXISTS idx_collection_statistics_user_id ON collection_statistics(user_id);

-- Create updated_at triggers
CREATE TRIGGER update_game_collections_updated_at 
  BEFORE UPDATE ON game_collections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishlist_updated_at 
  BEFORE UPDATE ON wishlist 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collection_categories_updated_at 
  BEFORE UPDATE ON collection_categories 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_game_ratings_updated_at 
  BEFORE UPDATE ON game_ratings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE game_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_collection_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_play_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_statistics ENABLE ROW LEVEL SECURITY;

-- Game collections policies
CREATE POLICY "Users can view public collections" ON game_collections
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can manage their own collections" ON game_collections
  FOR ALL USING (user_id = auth_uid());

-- Wishlist policies
CREATE POLICY "Users can view public wishlists" ON wishlist
  FOR SELECT USING (is_public = TRUE);

CREATE POLICY "Users can manage their own wishlists" ON wishlist
  FOR ALL USING (user_id = auth_uid());

-- Collection categories policies
CREATE POLICY "Users can manage their own categories" ON collection_categories
  FOR ALL USING (user_id = auth_uid());

-- Game collection categories policies
CREATE POLICY "Users can manage their own game categories" ON game_collection_categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM game_collections 
      WHERE game_collections.id = game_collection_categories.game_collection_id 
      AND game_collections.user_id = auth_uid()
    )
  );

-- Game play sessions policies
CREATE POLICY "Users can manage their own play sessions" ON game_play_sessions
  FOR ALL USING (user_id = auth_uid());

-- Game ratings policies
CREATE POLICY "Users can view all ratings" ON game_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own ratings" ON game_ratings
  FOR ALL USING (user_id = auth_uid());

-- Collection statistics policies
CREATE POLICY "Users can view public statistics" ON collection_statistics
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own statistics" ON collection_statistics
  FOR ALL USING (user_id = auth_uid());

-- Functions for collection management
CREATE OR REPLACE FUNCTION update_collection_statistics(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  total_games_count INTEGER;
  total_value_sum DECIMAL(10,2);
  avg_rating_val DECIMAL(3,2);
  most_played_game_name TEXT;
  total_play_time INTEGER;
  for_sale_count INTEGER;
  for_trade_count INTEGER;
  wishlist_count_val INTEGER;
BEGIN
  -- Calculate total games
  SELECT COUNT(*) INTO total_games_count
  FROM game_collections
  WHERE user_id = user_uuid;

  -- Calculate total value
  SELECT COALESCE(SUM(current_value), 0) INTO total_value_sum
  FROM game_collections
  WHERE user_id = user_uuid;

  -- Calculate average rating
  SELECT COALESCE(AVG(gr.rating), 0) INTO avg_rating_val
  FROM game_ratings gr
  WHERE gr.user_id = user_uuid;

  -- Find most played game
  SELECT gc.game_title INTO most_played_game_name
  FROM game_collections gc
  JOIN (
    SELECT game_collection_id, COUNT(*) as play_count
    FROM game_play_sessions
    WHERE user_id = user_uuid
    GROUP BY game_collection_id
    ORDER BY play_count DESC
    LIMIT 1
  ) ps ON gc.id = ps.game_collection_id;

  -- Calculate total play time
  SELECT COALESCE(SUM(duration_minutes), 0) INTO total_play_time
  FROM game_play_sessions
  WHERE user_id = user_uuid;

  -- Count games for sale/trade
  SELECT COUNT(*) INTO for_sale_count
  FROM game_collections
  WHERE user_id = user_uuid AND is_for_sale = TRUE;

  SELECT COUNT(*) INTO for_trade_count
  FROM game_collections
  WHERE user_id = user_uuid AND is_for_trade = TRUE;

  -- Count wishlist items
  SELECT COUNT(*) INTO wishlist_count_val
  FROM wishlist
  WHERE user_id = user_uuid;

  -- Insert or update statistics
  INSERT INTO collection_statistics (
    user_id, total_games, total_value, average_rating, 
    most_played_game, total_play_time_minutes, games_for_sale, 
    games_for_trade, wishlist_count
  ) VALUES (
    user_uuid, total_games_count, total_value_sum, avg_rating_val,
    most_played_game_name, total_play_time, for_sale_count,
    for_trade_count, wishlist_count_val
  ) ON CONFLICT (user_id) DO UPDATE SET
    total_games = EXCLUDED.total_games,
    total_value = EXCLUDED.total_value,
    average_rating = EXCLUDED.average_rating,
    most_played_game = EXCLUDED.most_played_game,
    total_play_time_minutes = EXCLUDED.total_play_time_minutes,
    games_for_sale = EXCLUDED.games_for_sale,
    games_for_trade = EXCLUDED.games_for_trade,
    wishlist_count = EXCLUDED.wishlist_count,
    last_updated = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get collection overview
CREATE OR REPLACE FUNCTION get_collection_overview(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  overview JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_games', COALESCE(total_games, 0),
    'total_value', COALESCE(total_value, 0),
    'average_rating', COALESCE(average_rating, 0),
    'most_played_game', most_played_game,
    'total_play_time_hours', COALESCE(total_play_time_minutes, 0) / 60,
    'games_for_sale', COALESCE(games_for_sale, 0),
    'games_for_trade', COALESCE(games_for_trade, 0),
    'wishlist_count', COALESCE(wishlist_count, 0),
    'categories_count', (
      SELECT COUNT(*) FROM collection_categories WHERE user_id = user_uuid
    ),
    'recent_additions', (
      SELECT jsonb_agg(jsonb_build_object(
        'game_title', game_title,
        'added_date', created_at
      ))
      FROM game_collections
      WHERE user_id = user_uuid
      ORDER BY created_at DESC
      LIMIT 5
    )
  ) INTO overview
  FROM collection_statistics
  WHERE user_id = user_uuid;
  
  RETURN overview;
END;
$$ LANGUAGE plpgsql;

-- Function to search games in collection
CREATE OR REPLACE FUNCTION search_collection(
  user_uuid UUID,
  search_term TEXT,
  category_filter TEXT DEFAULT NULL,
  condition_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  game_title TEXT,
  game_category TEXT,
  game_condition TEXT,
  current_value DECIMAL(10,2),
  is_for_sale BOOLEAN,
  is_for_trade BOOLEAN,
  rating INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gc.id,
    gc.game_title,
    gc.game_category,
    gc.game_condition,
    gc.current_value,
    gc.is_for_sale,
    gc.is_for_trade,
    gr.rating
  FROM game_collections gc
  LEFT JOIN game_ratings gr ON gc.game_title = gr.game_title AND gr.user_id = user_uuid
  WHERE gc.user_id = user_uuid
    AND (
      gc.game_title ILIKE '%' || search_term || '%'
      OR gc.game_category ILIKE '%' || search_term || '%'
    )
    AND (category_filter IS NULL OR gc.game_category = category_filter)
    AND (condition_filter IS NULL OR gc.game_condition = condition_filter)
  ORDER BY gc.game_title;
END;
$$ LANGUAGE plpgsql; 