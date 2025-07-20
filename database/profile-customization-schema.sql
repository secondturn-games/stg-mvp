-- Enhanced Profile Customization Schema
-- Add to existing database schema

-- Add profile customization fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cover_image_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'friends'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_email BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_location BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS show_activity BOOLEAN DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'auto'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "email_notifications": true,
  "push_notifications": true,
  "price_alerts": true,
  "new_messages": true,
  "review_notifications": true,
  "badge_notifications": true
}';

-- Create profile_views table for tracking profile visits
CREATE TABLE IF NOT EXISTS profile_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'profile_page', 'listing', 'search', etc.
  metadata JSONB DEFAULT '{}'
);

-- Create user_preferences table for advanced settings
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  preference_key TEXT NOT NULL,
  preference_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, preference_key)
);

-- Create profile_highlights table for featured content
CREATE TABLE IF NOT EXISTS profile_highlights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  highlight_type TEXT NOT NULL CHECK (highlight_type IN ('listing', 'review', 'achievement', 'custom')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_id ON profile_views(viewed_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewer_id ON profile_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON profile_views(viewed_at);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_key ON user_preferences(preference_key);

CREATE INDEX IF NOT EXISTS idx_profile_highlights_user_id ON profile_highlights(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_highlights_type ON profile_highlights(highlight_type);
CREATE INDEX IF NOT EXISTS idx_profile_highlights_active ON profile_highlights(is_active);

-- Create updated_at triggers
CREATE TRIGGER update_user_preferences_updated_at 
  BEFORE UPDATE ON user_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profile_highlights_updated_at 
  BEFORE UPDATE ON profile_highlights 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_highlights ENABLE ROW LEVEL SECURITY;

-- Profile views policies
CREATE POLICY "Users can view their own profile views" ON profile_views
  FOR SELECT USING (viewed_id = auth_uid());

CREATE POLICY "Users can create profile views" ON profile_views
  FOR INSERT WITH CHECK (viewer_id = auth_uid());

-- User preferences policies
CREATE POLICY "Users can manage their own preferences" ON user_preferences
  FOR ALL USING (user_id = auth_uid());

-- Profile highlights policies
CREATE POLICY "Users can view public highlights" ON profile_highlights
  FOR SELECT USING (
    is_active = TRUE AND 
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = profile_highlights.user_id 
      AND users.profile_visibility = 'public'
    )
  );

CREATE POLICY "Users can manage their own highlights" ON profile_highlights
  FOR ALL USING (user_id = auth_uid());

-- Functions for profile customization
CREATE OR REPLACE FUNCTION get_user_profile_stats(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  stats JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_listings', COALESCE(listings_count, 0),
    'active_listings', COALESCE(active_listings_count, 0),
    'total_sales', COALESCE(sales_count, 0),
    'total_purchases', COALESCE(purchases_count, 0),
    'profile_views', COALESCE(views_count, 0),
    'member_since', created_at,
    'last_active', last_active
  ) INTO stats
  FROM (
    SELECT 
      u.created_at,
      u.last_active,
      COUNT(DISTINCT l.id) as listings_count,
      COUNT(DISTINCT CASE WHEN l.status = 'active' THEN l.id END) as active_listings_count,
      COUNT(DISTINCT CASE WHEN t.seller_id = u.id AND t.payment_status = 'completed' THEN t.id END) as sales_count,
      COUNT(DISTINCT CASE WHEN t.buyer_id = u.id AND t.payment_status = 'completed' THEN t.id END) as purchases_count,
      COUNT(DISTINCT pv.id) as views_count
    FROM users u
    LEFT JOIN listings l ON l.seller_id = u.id
    LEFT JOIN transactions t ON (t.seller_id = u.id OR t.buyer_id = u.id)
    LEFT JOIN profile_views pv ON pv.viewed_id = u.id
    WHERE u.id = user_uuid
    GROUP BY u.id, u.created_at, u.last_active
  ) user_stats;
  
  RETURN stats;
END;
$$ LANGUAGE plpgsql;

-- Function to update profile view count
CREATE OR REPLACE FUNCTION record_profile_view(
  viewer_uuid UUID,
  viewed_uuid UUID,
  view_source TEXT DEFAULT 'profile_page'
)
RETURNS VOID AS $$
BEGIN
  -- Don't record self-views
  IF viewer_uuid = viewed_uuid THEN
    RETURN;
  END IF;
  
  INSERT INTO profile_views (viewer_id, viewed_id, source)
  VALUES (viewer_uuid, viewed_uuid, view_source)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql; 