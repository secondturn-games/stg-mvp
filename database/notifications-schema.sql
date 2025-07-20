-- Smart Notifications Schema
-- Add to existing database schema

-- Create notifications table for all user notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'price_alert',
    'wishlist_match',
    'new_message',
    'listing_viewed',
    'review_received',
    'badge_earned',
    'collection_update',
    'market_activity',
    'system_announcement',
    'trade_request',
    'sale_completed',
    'payment_received',
    'security_alert',
    'recommendation'
  )),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  is_read BOOLEAN DEFAULT FALSE,
  is_actioned BOOLEAN DEFAULT FALSE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create price_alerts table for price monitoring
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  game_title TEXT NOT NULL,
  target_price DECIMAL(10,2) NOT NULL,
  current_price DECIMAL(10,2),
  alert_type TEXT DEFAULT 'below' CHECK (alert_type IN ('below', 'above', 'change')),
  is_active BOOLEAN DEFAULT TRUE,
  last_checked TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_preferences table for user settings
CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  push_enabled BOOLEAN DEFAULT TRUE,
  in_app_enabled BOOLEAN DEFAULT TRUE,
  frequency TEXT DEFAULT 'immediate' CHECK (frequency IN ('immediate', 'daily', 'weekly', 'never')),
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, notification_type)
);

-- Create notification_templates table for reusable templates
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_type TEXT NOT NULL,
  title_template TEXT NOT NULL,
  message_template TEXT NOT NULL,
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_delivery_log table for tracking delivery
CREATE TABLE IF NOT EXISTS notification_delivery_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  delivery_method TEXT NOT NULL CHECK (delivery_method IN ('email', 'push', 'in_app')),
  delivery_status TEXT NOT NULL CHECK (delivery_status IN ('pending', 'sent', 'delivered', 'failed')),
  delivery_data JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_active ON price_alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_price_alerts_game_title ON price_alerts(game_title);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_type ON notification_preferences(notification_type);

CREATE INDEX IF NOT EXISTS idx_notification_templates_type ON notification_templates(template_type);
CREATE INDEX IF NOT EXISTS idx_notification_templates_active ON notification_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_notification_id ON notification_delivery_log(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_delivery_log_status ON notification_delivery_log(delivery_status);

-- Create updated_at triggers
CREATE TRIGGER update_price_alerts_updated_at 
  BEFORE UPDATE ON price_alerts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at 
  BEFORE UPDATE ON notification_preferences 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at 
  BEFORE UPDATE ON notification_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_delivery_log ENABLE ROW LEVEL SECURITY;

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth_uid());

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (auth_role() = 'service_role');

-- Price alerts policies
CREATE POLICY "Users can manage their own price alerts" ON price_alerts
  FOR ALL USING (user_id = auth_uid());

-- Notification preferences policies
CREATE POLICY "Users can manage their own notification preferences" ON notification_preferences
  FOR ALL USING (user_id = auth_uid());

-- Notification templates policies (read-only for users)
CREATE POLICY "Users can view notification templates" ON notification_templates
  FOR SELECT USING (true);

CREATE POLICY "System can manage notification templates" ON notification_templates
  FOR ALL USING (auth_role() = 'service_role');

-- Notification delivery log policies
CREATE POLICY "Users can view their own delivery logs" ON notification_delivery_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM notifications 
      WHERE notifications.id = notification_delivery_log.notification_id 
      AND notifications.user_id = auth_uid()
    )
  );

CREATE POLICY "System can manage delivery logs" ON notification_delivery_log
  FOR ALL USING (auth_role() = 'service_role');

-- Functions for notifications
CREATE OR REPLACE FUNCTION create_notification(
  user_uuid UUID,
  notification_type TEXT,
  title TEXT,
  message TEXT,
  data JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'normal',
  expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, notification_type, title, message, data, priority, expires_at
  ) VALUES (
    user_uuid, notification_type, title, message, data, priority, expires_at
  ) RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function to create price alert
CREATE OR REPLACE FUNCTION create_price_alert(
  user_uuid UUID,
  game_title TEXT,
  target_price DECIMAL(10,2),
  alert_type TEXT DEFAULT 'below'
)
RETURNS UUID AS $$
DECLARE
  alert_id UUID;
BEGIN
  INSERT INTO price_alerts (
    user_id, game_title, target_price, alert_type
  ) VALUES (
    user_uuid, game_title, target_price, alert_type
  ) RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check price alerts
CREATE OR REPLACE FUNCTION check_price_alerts()
RETURNS TABLE (
  alert_id UUID,
  user_id UUID,
  game_title TEXT,
  target_price DECIMAL(10,2),
  current_price DECIMAL(10,2),
  alert_type TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pa.id,
    pa.user_id,
    pa.game_title,
    pa.target_price,
    pa.current_price,
    pa.alert_type
  FROM price_alerts pa
  WHERE pa.is_active = TRUE
    AND pa.current_price IS NOT NULL
    AND (
      (pa.alert_type = 'below' AND pa.current_price <= pa.target_price) OR
      (pa.alert_type = 'above' AND pa.current_price >= pa.target_price) OR
      (pa.alert_type = 'change' AND pa.current_price != pa.target_price)
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user notification preferences
CREATE OR REPLACE FUNCTION get_notification_preferences(user_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  preferences JSONB;
BEGIN
  SELECT jsonb_object_agg(notification_type, jsonb_build_object(
    'email_enabled', email_enabled,
    'push_enabled', push_enabled,
    'in_app_enabled', in_app_enabled,
    'frequency', frequency,
    'quiet_hours_start', quiet_hours_start,
    'quiet_hours_end', quiet_hours_end
  )) INTO preferences
  FROM notification_preferences
  WHERE user_id = user_uuid;
  
  RETURN COALESCE(preferences, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql;

-- Function to check if user should receive notification
CREATE OR REPLACE FUNCTION should_send_notification(
  user_uuid UUID,
  notification_type TEXT,
  delivery_method TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  preference RECORD;
  current_time TIME;
  quiet_start TIME;
  quiet_end TIME;
BEGIN
  -- Get user's notification preferences
  SELECT * INTO preference
  FROM notification_preferences
  WHERE user_id = user_uuid AND notification_type = notification_type;
  
  -- If no preference found, use defaults
  IF preference IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Check if delivery method is enabled
  CASE delivery_method
    WHEN 'email' THEN
      IF NOT preference.email_enabled THEN
        RETURN FALSE;
      END IF;
    WHEN 'push' THEN
      IF NOT preference.push_enabled THEN
        RETURN FALSE;
      END IF;
    WHEN 'in_app' THEN
      IF NOT preference.in_app_enabled THEN
        RETURN FALSE;
      END IF;
    ELSE
      RETURN FALSE;
  END CASE;
  
  -- Check quiet hours
  current_time := CURRENT_TIME;
  quiet_start := preference.quiet_hours_start;
  quiet_end := preference.quiet_hours_end;
  
  IF quiet_start > quiet_end THEN
    -- Quiet hours span midnight
    IF current_time >= quiet_start OR current_time <= quiet_end THEN
      RETURN FALSE;
    END IF;
  ELSE
    -- Quiet hours within same day
    IF current_time >= quiet_start AND current_time <= quiet_end THEN
      RETURN FALSE;
    END IF;
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notifications_read(
  user_uuid UUID,
  notification_ids UUID[] DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  IF notification_ids IS NULL THEN
    -- Mark all user's notifications as read
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE user_id = user_uuid AND is_read = FALSE;
  ELSE
    -- Mark specific notifications as read
    UPDATE notifications 
    SET is_read = TRUE 
    WHERE user_id = user_uuid AND id = ANY(notification_ids);
  END IF;
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
  count_val INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_val
  FROM notifications
  WHERE user_id = user_uuid AND is_read = FALSE;
  
  RETURN count_val;
END;
$$ LANGUAGE plpgsql;

-- Insert default notification templates
INSERT INTO notification_templates (template_type, title_template, message_template, variables) VALUES
('price_alert', 'Price Alert: {game_title}', 'The price for {game_title} has dropped to €{current_price}! Your target was €{target_price}.', '{"game_title", "current_price", "target_price"}'),
('wishlist_match', 'Wishlist Match Found', 'A game from your wishlist "{game_title}" is now available for €{price}!', '{"game_title", "price"}'),
('new_message', 'New Message from {sender_name}', 'You have a new message: "{message_preview}"', '{"sender_name", "message_preview"}'),
('review_received', 'New Review Received', 'You received a {rating}/10 review for your listing "{game_title}"', '{"rating", "game_title"}'),
('badge_earned', 'New Badge Earned: {badge_name}', 'Congratulations! You earned the "{badge_name}" badge.', '{"badge_name"}'),
('collection_update', 'Collection Update', 'Your collection value has changed by €{value_change}. New total: €{total_value}', '{"value_change", "total_value"}'),
('market_activity', 'Market Activity', 'There are {count} new listings in your favorite categories!', '{"count"}'),
('system_announcement', 'System Announcement', '{message}', '{"message"}'),
('trade_request', 'Trade Request', '{sender_name} wants to trade "{their_game}" for your "{your_game}"', '{"sender_name", "their_game", "your_game"}'),
('sale_completed', 'Sale Completed', 'Your listing "{game_title}" has been sold for €{price}!', '{"game_title", "price"}'),
('payment_received', 'Payment Received', 'You received €{amount} for your sale of "{game_title}"', '{"amount", "game_title"}'),
('security_alert', 'Security Alert', '{message}', '{"message"}'),
('recommendation', 'Game Recommendation', 'Based on your collection, you might like "{game_title}" (€{price})', '{"game_title", "price"}'); 