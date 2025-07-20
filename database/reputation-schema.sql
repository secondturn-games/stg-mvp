-- Reputation & Trust System Schema
-- Add to existing database schema

-- Add reputation fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS reputation_score INTEGER DEFAULT 100;
ALTER TABLE users ADD COLUMN IF NOT EXISTS response_rate DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.00;
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';

-- Create trust_badges table
CREATE TABLE IF NOT EXISTS trust_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL CHECK (badge_type IN (
    'verified_seller',
    'fast_shipper', 
    'great_communicator',
    'top_rated',
    'power_seller',
    'trusted_buyer'
  )),
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create reviews table (enhanced)
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID REFERENCES transactions(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reviewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
  comment TEXT,
  review_type TEXT NOT NULL CHECK (review_type IN ('buyer', 'seller')),
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  shipping_rating INTEGER CHECK (shipping_rating BETWEEN 1 AND 5),
  item_condition_rating INTEGER CHECK (item_condition_rating BETWEEN 1 AND 5),
  verified_purchase BOOLEAN DEFAULT TRUE,
  is_flagged BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_activity table for tracking actions
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'listing_created',
    'listing_sold',
    'purchase_made',
    'review_given',
    'review_received',
    'message_sent',
    'message_responded',
    'profile_updated',
    'badge_earned'
  )),
  points_change INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create response_tracking table
CREATE TABLE IF NOT EXISTS response_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL,
  message_id UUID NOT NULL,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  response_time_seconds INTEGER,
  is_responded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trust_badges_user_id ON trust_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_trust_badges_type ON trust_badges(badge_type);
CREATE INDEX IF NOT EXISTS idx_trust_badges_active ON trust_badges(is_active);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewer_id ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_id ON reviews(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_reviews_transaction_id ON reviews(transaction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_type ON reviews(review_type);

CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at);

CREATE INDEX IF NOT EXISTS idx_response_tracking_recipient_id ON response_tracking(recipient_id);
CREATE INDEX IF NOT EXISTS idx_response_tracking_conversation_id ON response_tracking(conversation_id);

-- Create updated_at triggers
CREATE TRIGGER update_trust_badges_updated_at 
  BEFORE UPDATE ON trust_badges 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
  BEFORE UPDATE ON reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_activity_updated_at 
  BEFORE UPDATE ON user_activity 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_tracking ENABLE ROW LEVEL SECURITY;

-- Trust badges policies
CREATE POLICY "Users can view all trust badges" ON trust_badges
  FOR SELECT USING (true);

CREATE POLICY "Users can manage their own badges" ON trust_badges
  FOR ALL USING (auth_uid() = user_id);

-- Reviews policies
CREATE POLICY "Users can view all reviews" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their transactions" ON reviews
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions 
      WHERE transactions.id = reviews.transaction_id 
      AND (transactions.buyer_id = auth_uid() OR transactions.seller_id = auth_uid())
    )
  );

CREATE POLICY "Users can update their own reviews" ON reviews
  FOR UPDATE USING (reviewer_id = auth_uid());

-- User activity policies
CREATE POLICY "Users can view their own activity" ON user_activity
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can manage user activity" ON user_activity
  FOR ALL USING (auth_role() = 'service_role');

-- Response tracking policies
CREATE POLICY "Users can view their response tracking" ON response_tracking
  FOR SELECT USING (recipient_id = auth_uid() OR sender_id = auth_uid());

CREATE POLICY "System can manage response tracking" ON response_tracking
  FOR ALL USING (auth_role() = 'service_role');

-- Functions for reputation calculations
CREATE OR REPLACE FUNCTION calculate_user_reputation(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  base_score INTEGER := 100;
  activity_bonus INTEGER := 0;
  review_bonus INTEGER := 0;
  badge_bonus INTEGER := 0;
BEGIN
  -- Calculate activity bonus
  SELECT COALESCE(SUM(points_change), 0) INTO activity_bonus
  FROM user_activity 
  WHERE user_id = user_uuid;
  
  -- Calculate review bonus
  SELECT COALESCE(SUM(
    CASE 
      WHEN rating = 5 THEN 10
      WHEN rating = 4 THEN 5
      WHEN rating = 3 THEN 0
      WHEN rating = 2 THEN -5
      WHEN rating = 1 THEN -10
    END
  ), 0) INTO review_bonus
  FROM reviews 
  WHERE reviewed_id = user_uuid;
  
  -- Calculate badge bonus
  SELECT COALESCE(SUM(
    CASE badge_type
      WHEN 'verified_seller' THEN 20
      WHEN 'fast_shipper' THEN 15
      WHEN 'great_communicator' THEN 15
      WHEN 'top_rated' THEN 10
      WHEN 'power_seller' THEN 25
      WHEN 'trusted_buyer' THEN 10
      ELSE 0
    END
  ), 0) INTO badge_bonus
  FROM trust_badges 
  WHERE user_id = user_uuid AND is_active = TRUE;
  
  RETURN GREATEST(0, base_score + activity_bonus + review_bonus + badge_bonus);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate response rate
CREATE OR REPLACE FUNCTION calculate_response_rate(user_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  total_messages INTEGER;
  responded_messages INTEGER;
  response_rate DECIMAL(3,2);
BEGIN
  SELECT COUNT(*), COUNT(CASE WHEN is_responded THEN 1 END)
  INTO total_messages, responded_messages
  FROM response_tracking 
  WHERE recipient_id = user_uuid;
  
  IF total_messages = 0 THEN
    RETURN 0.00;
  END IF;
  
  response_rate := (responded_messages::DECIMAL / total_messages::DECIMAL) * 100;
  RETURN ROUND(response_rate, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate average rating
CREATE OR REPLACE FUNCTION calculate_average_rating(user_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT COALESCE(AVG(rating), 0.00) INTO avg_rating
  FROM reviews 
  WHERE reviewed_id = user_uuid AND moderation_status = 'approved';
  
  RETURN ROUND(avg_rating, 2);
END;
$$ LANGUAGE plpgsql; 