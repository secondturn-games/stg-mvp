-- Analytics Dashboard Schema
-- Add to existing database schema

-- Create analytics_events table for tracking user actions
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'listing_viewed',
    'listing_created',
    'listing_updated',
    'listing_deleted',
    'purchase_made',
    'sale_completed',
    'review_given',
    'review_received',
    'profile_viewed',
    'search_performed',
    'filter_applied',
    'wishlist_added',
    'wishlist_removed',
    'message_sent',
    'message_received',
    'badge_earned',
    'login',
    'logout'
  )),
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_metrics table for aggregated statistics
CREATE TABLE IF NOT EXISTS user_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL,
  metric_type TEXT NOT NULL CHECK (metric_type IN (
    'daily_views',
    'daily_listings',
    'daily_sales',
    'daily_purchases',
    'daily_revenue',
    'daily_spent',
    'daily_reviews',
    'daily_messages',
    'daily_searches',
    'daily_wishlist_adds'
  )),
  metric_value INTEGER DEFAULT 0,
  metric_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, metric_date, metric_type)
);

-- Create performance_trends table for historical data
CREATE TABLE IF NOT EXISTS performance_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trend_type TEXT NOT NULL CHECK (trend_type IN (
    'listing_performance',
    'sales_performance',
    'reputation_trend',
    'engagement_trend',
    'revenue_trend'
  )),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  trend_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_insights table for AI-generated insights
CREATE TABLE IF NOT EXISTS user_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL CHECK (insight_type IN (
    'performance_improvement',
    'market_opportunity',
    'pricing_suggestion',
    'timing_recommendation',
    'category_insight',
    'competitor_analysis'
  )),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_read BOOLEAN DEFAULT FALSE,
  is_actioned BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

-- Create dashboard_widgets table for user preferences
CREATE TABLE IF NOT EXISTS dashboard_widgets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  widget_type TEXT NOT NULL CHECK (widget_type IN (
    'revenue_chart',
    'sales_chart',
    'views_chart',
    'reputation_chart',
    'recent_activity',
    'top_performers',
    'market_trends',
    'insights_feed'
  )),
  widget_config JSONB DEFAULT '{}',
  is_enabled BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_user_metrics_user_id ON user_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metrics_date ON user_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_user_metrics_type ON user_metrics(metric_type);

CREATE INDEX IF NOT EXISTS idx_performance_trends_user_id ON performance_trends(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_trends_type ON performance_trends(trend_type);
CREATE INDEX IF NOT EXISTS idx_performance_trends_period ON performance_trends(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_user_insights_user_id ON user_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_user_insights_type ON user_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_user_insights_priority ON user_insights(priority);
CREATE INDEX IF NOT EXISTS idx_user_insights_read ON user_insights(is_read);

CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_user_id ON dashboard_widgets(user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_widgets_type ON dashboard_widgets(widget_type);

-- Create updated_at triggers
CREATE TRIGGER update_user_metrics_updated_at 
  BEFORE UPDATE ON user_metrics 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dashboard_widgets_updated_at 
  BEFORE UPDATE ON dashboard_widgets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_widgets ENABLE ROW LEVEL SECURITY;

-- Analytics events policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth_role() = 'service_role');

-- User metrics policies
CREATE POLICY "Users can view their own metrics" ON user_metrics
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can manage user metrics" ON user_metrics
  FOR ALL USING (auth_role() = 'service_role');

-- Performance trends policies
CREATE POLICY "Users can view their own trends" ON performance_trends
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can manage performance trends" ON performance_trends
  FOR ALL USING (auth_role() = 'service_role');

-- User insights policies
CREATE POLICY "Users can view their own insights" ON user_insights
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "Users can update their own insights" ON user_insights
  FOR UPDATE USING (user_id = auth_uid());

CREATE POLICY "System can create user insights" ON user_insights
  FOR INSERT WITH CHECK (auth_role() = 'service_role');

-- Dashboard widgets policies
CREATE POLICY "Users can manage their own widgets" ON dashboard_widgets
  FOR ALL USING (user_id = auth_uid());

-- Functions for analytics
CREATE OR REPLACE FUNCTION record_analytics_event(
  user_uuid UUID,
  event_type TEXT,
  event_data JSONB DEFAULT '{}',
  session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  INSERT INTO analytics_events (user_id, event_type, event_data, session_id)
  VALUES (user_uuid, event_type, event_data, session_id);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate daily metrics
CREATE OR REPLACE FUNCTION calculate_daily_metrics(user_uuid UUID, target_date DATE)
RETURNS VOID AS $$
DECLARE
  daily_views INTEGER;
  daily_listings INTEGER;
  daily_sales INTEGER;
  daily_purchases INTEGER;
  daily_revenue DECIMAL(10,2);
  daily_spent DECIMAL(10,2);
  daily_reviews INTEGER;
  daily_messages INTEGER;
  daily_searches INTEGER;
  daily_wishlist_adds INTEGER;
BEGIN
  -- Calculate daily views
  SELECT COUNT(*) INTO daily_views
  FROM analytics_events
  WHERE user_id = user_uuid 
    AND event_type = 'listing_viewed'
    AND DATE(created_at) = target_date;

  -- Calculate daily listings
  SELECT COUNT(*) INTO daily_listings
  FROM analytics_events
  WHERE user_id = user_uuid 
    AND event_type IN ('listing_created', 'listing_updated')
    AND DATE(created_at) = target_date;

  -- Calculate daily sales
  SELECT COUNT(*) INTO daily_sales
  FROM transactions
  WHERE seller_id = user_uuid 
    AND payment_status = 'completed'
    AND DATE(created_at) = target_date;

  -- Calculate daily purchases
  SELECT COUNT(*) INTO daily_purchases
  FROM transactions
  WHERE buyer_id = user_uuid 
    AND payment_status = 'completed'
    AND DATE(created_at) = target_date;

  -- Calculate daily revenue
  SELECT COALESCE(SUM(amount), 0) INTO daily_revenue
  FROM transactions
  WHERE seller_id = user_uuid 
    AND payment_status = 'completed'
    AND DATE(created_at) = target_date;

  -- Calculate daily spent
  SELECT COALESCE(SUM(amount), 0) INTO daily_spent
  FROM transactions
  WHERE buyer_id = user_uuid 
    AND payment_status = 'completed'
    AND DATE(created_at) = target_date;

  -- Calculate daily reviews
  SELECT COUNT(*) INTO daily_reviews
  FROM reviews
  WHERE reviewer_id = user_uuid 
    AND DATE(created_at) = target_date;

  -- Calculate daily messages
  SELECT COUNT(*) INTO daily_messages
  FROM analytics_events
  WHERE user_id = user_uuid 
    AND event_type IN ('message_sent', 'message_received')
    AND DATE(created_at) = target_date;

  -- Calculate daily searches
  SELECT COUNT(*) INTO daily_searches
  FROM analytics_events
  WHERE user_id = user_uuid 
    AND event_type = 'search_performed'
    AND DATE(created_at) = target_date;

  -- Calculate daily wishlist adds
  SELECT COUNT(*) INTO daily_wishlist_adds
  FROM analytics_events
  WHERE user_id = user_uuid 
    AND event_type = 'wishlist_added'
    AND DATE(created_at) = target_date;

  -- Insert or update metrics
  INSERT INTO user_metrics (user_id, metric_date, metric_type, metric_value)
  VALUES 
    (user_uuid, target_date, 'daily_views', daily_views),
    (user_uuid, target_date, 'daily_listings', daily_listings),
    (user_uuid, target_date, 'daily_sales', daily_sales),
    (user_uuid, target_date, 'daily_purchases', daily_purchases),
    (user_uuid, target_date, 'daily_revenue', daily_revenue),
    (user_uuid, target_date, 'daily_spent', daily_spent),
    (user_uuid, target_date, 'daily_reviews', daily_reviews),
    (user_uuid, target_date, 'daily_messages', daily_messages),
    (user_uuid, target_date, 'daily_searches', daily_searches),
    (user_uuid, target_date, 'daily_wishlist_adds', daily_wishlist_adds)
  ON CONFLICT (user_id, metric_date, metric_type)
  DO UPDATE SET 
    metric_value = EXCLUDED.metric_value,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to get user analytics summary
CREATE OR REPLACE FUNCTION get_user_analytics_summary(user_uuid UUID, days_back INTEGER DEFAULT 30)
RETURNS JSONB AS $$
DECLARE
  summary JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_views', COALESCE(SUM(metric_value), 0),
    'total_listings', COALESCE(SUM(metric_value), 0),
    'total_sales', COALESCE(SUM(metric_value), 0),
    'total_revenue', COALESCE(SUM(metric_value), 0),
    'total_reviews', COALESCE(SUM(metric_value), 0),
    'avg_daily_views', COALESCE(AVG(metric_value), 0),
    'avg_daily_revenue', COALESCE(AVG(metric_value), 0),
    'best_performing_day', (
      SELECT metric_date 
      FROM user_metrics 
      WHERE user_id = user_uuid 
        AND metric_type = 'daily_revenue'
        AND metric_date >= CURRENT_DATE - days_back
      ORDER BY metric_value DESC 
      LIMIT 1
    )
  ) INTO summary
  FROM user_metrics
  WHERE user_id = user_uuid 
    AND metric_date >= CURRENT_DATE - days_back
    AND metric_type IN ('daily_views', 'daily_listings', 'daily_sales', 'daily_revenue', 'daily_reviews');
  
  RETURN summary;
END;
$$ LANGUAGE plpgsql; 