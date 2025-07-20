-- Gamification Elements Schema
-- Add to existing database schema

-- Create achievements table for badges and accomplishments
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'collection', 'trading', 'community', 'marketplace', 'social', 'special'
  )),
  points INTEGER NOT NULL DEFAULT 0,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  requirements JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_achievements table for tracking earned achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  progress JSONB DEFAULT '{}',
  UNIQUE(user_id, achievement_id)
);

-- Create user_levels table for experience and leveling system
CREATE TABLE IF NOT EXISTS user_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  level INTEGER DEFAULT 1,
  experience INTEGER DEFAULT 0,
  total_experience INTEGER DEFAULT 0,
  title TEXT DEFAULT 'Novice Collector',
  badges_earned INTEGER DEFAULT 0,
  achievements_earned INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create experience_log table for tracking XP sources
CREATE TABLE IF NOT EXISTS experience_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leaderboards table for different competition types
CREATE TABLE IF NOT EXISTS leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('weekly', 'monthly', 'all_time')),
  category TEXT NOT NULL CHECK (category IN (
    'collection_size', 'collection_value', 'trades_completed', 
    'sales_made', 'reviews_given', 'achievements_earned', 'experience_points'
  )),
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create leaderboard_entries table for competition results
CREATE TABLE IF NOT EXISTS leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  leaderboard_id UUID REFERENCES leaderboards(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER,
  score DECIMAL(15,2) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(leaderboard_id, user_id)
);

-- Create challenges table for time-limited events
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly', 'special')),
  requirements JSONB NOT NULL,
  rewards JSONB NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_challenges table for challenge participation
CREATE TABLE IF NOT EXISTS user_challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  progress JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  rewards_claimed BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, challenge_id)
);

-- Create streaks table for daily activity tracking
CREATE TABLE IF NOT EXISTS user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  streak_type TEXT DEFAULT 'daily' CHECK (streak_type IN ('daily', 'weekly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create milestones table for progress tracking
CREATE TABLE IF NOT EXISTS milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  threshold INTEGER NOT NULL,
  reward_points INTEGER DEFAULT 0,
  reward_achievement_id UUID REFERENCES achievements(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_milestones table for milestone progress
CREATE TABLE IF NOT EXISTS user_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE CASCADE,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
CREATE INDEX IF NOT EXISTS idx_achievements_rarity ON achievements(rarity);
CREATE INDEX IF NOT EXISTS idx_achievements_active ON achievements(is_active);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);

CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_level ON user_levels(level);
CREATE INDEX IF NOT EXISTS idx_user_levels_experience ON user_levels(experience);

CREATE INDEX IF NOT EXISTS idx_experience_log_user_id ON experience_log(user_id);
CREATE INDEX IF NOT EXISTS idx_experience_log_source ON experience_log(source);
CREATE INDEX IF NOT EXISTS idx_experience_log_created_at ON experience_log(created_at);

CREATE INDEX IF NOT EXISTS idx_leaderboards_type ON leaderboards(type);
CREATE INDEX IF NOT EXISTS idx_leaderboards_category ON leaderboards(category);
CREATE INDEX IF NOT EXISTS idx_leaderboards_active ON leaderboards(is_active);

CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_leaderboard_id ON leaderboard_entries(leaderboard_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_user_id ON leaderboard_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_rank ON leaderboard_entries(rank);
CREATE INDEX IF NOT EXISTS idx_leaderboard_entries_score ON leaderboard_entries(score);

CREATE INDEX IF NOT EXISTS idx_challenges_type ON challenges(type);
CREATE INDEX IF NOT EXISTS idx_challenges_active ON challenges(is_active);
CREATE INDEX IF NOT EXISTS idx_challenges_dates ON challenges(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_user_challenges_user_id ON user_challenges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_challenge_id ON user_challenges(challenge_id);
CREATE INDEX IF NOT EXISTS idx_user_challenges_completed ON user_challenges(completed);

CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_streaks_current ON user_streaks(current_streak);

CREATE INDEX IF NOT EXISTS idx_milestones_category ON milestones(category);
CREATE INDEX IF NOT EXISTS idx_milestones_active ON milestones(is_active);

CREATE INDEX IF NOT EXISTS idx_user_milestones_user_id ON user_milestones(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_milestone_id ON user_milestones(milestone_id);
CREATE INDEX IF NOT EXISTS idx_user_milestones_completed ON user_milestones(completed);

-- Create updated_at triggers
CREATE TRIGGER update_achievements_updated_at 
  BEFORE UPDATE ON achievements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_levels_updated_at 
  BEFORE UPDATE ON user_levels 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboards_updated_at 
  BEFORE UPDATE ON leaderboards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leaderboard_entries_updated_at 
  BEFORE UPDATE ON leaderboard_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at 
  BEFORE UPDATE ON challenges 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_challenges_updated_at 
  BEFORE UPDATE ON user_challenges 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_streaks_updated_at 
  BEFORE UPDATE ON user_streaks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_milestones_updated_at 
  BEFORE UPDATE ON milestones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_milestones_updated_at 
  BEFORE UPDATE ON user_milestones 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

-- Achievements policies (read-only for users, system can manage)
CREATE POLICY "Users can view achievements" ON achievements
  FOR SELECT USING (true);

CREATE POLICY "System can manage achievements" ON achievements
  FOR ALL USING (auth_role() = 'service_role');

-- User achievements policies
CREATE POLICY "Users can view their own achievements" ON user_achievements
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can manage user achievements" ON user_achievements
  FOR ALL USING (auth_role() = 'service_role');

-- User levels policies
CREATE POLICY "Users can view their own level" ON user_levels
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "Users can view public levels" ON user_levels
  FOR SELECT USING (true);

CREATE POLICY "System can manage user levels" ON user_levels
  FOR ALL USING (auth_role() = 'service_role');

-- Experience log policies
CREATE POLICY "Users can view their own experience log" ON experience_log
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can manage experience log" ON experience_log
  FOR ALL USING (auth_role() = 'service_role');

-- Leaderboards policies (public read, system manage)
CREATE POLICY "Users can view leaderboards" ON leaderboards
  FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboards" ON leaderboards
  FOR ALL USING (auth_role() = 'service_role');

-- Leaderboard entries policies
CREATE POLICY "Users can view leaderboard entries" ON leaderboard_entries
  FOR SELECT USING (true);

CREATE POLICY "System can manage leaderboard entries" ON leaderboard_entries
  FOR ALL USING (auth_role() = 'service_role');

-- Challenges policies
CREATE POLICY "Users can view challenges" ON challenges
  FOR SELECT USING (true);

CREATE POLICY "System can manage challenges" ON challenges
  FOR ALL USING (auth_role() = 'service_role');

-- User challenges policies
CREATE POLICY "Users can view their own challenges" ON user_challenges
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "Users can manage their own challenges" ON user_challenges
  FOR ALL USING (user_id = auth_uid());

-- User streaks policies
CREATE POLICY "Users can view their own streaks" ON user_streaks
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can manage user streaks" ON user_streaks
  FOR ALL USING (auth_role() = 'service_role');

-- Milestones policies
CREATE POLICY "Users can view milestones" ON milestones
  FOR SELECT USING (true);

CREATE POLICY "System can manage milestones" ON milestones
  FOR ALL USING (auth_role() = 'service_role');

-- User milestones policies
CREATE POLICY "Users can view their own milestones" ON user_milestones
  FOR SELECT USING (user_id = auth_uid());

CREATE POLICY "System can manage user milestones" ON user_milestones
  FOR ALL USING (auth_role() = 'service_role');

-- Functions for gamification
CREATE OR REPLACE FUNCTION calculate_level(experience INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Simple level calculation: every 1000 XP = 1 level
  RETURN GREATEST(1, FLOOR(experience / 1000) + 1);
END;
$$ LANGUAGE plpgsql;

-- Function to add experience to user
CREATE OR REPLACE FUNCTION add_experience(
  user_uuid UUID,
  amount INTEGER,
  source TEXT,
  description TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS VOID AS $$
DECLARE
  current_level INTEGER;
  new_level INTEGER;
  current_exp INTEGER;
  new_exp INTEGER;
BEGIN
  -- Get current user level
  SELECT level, experience INTO current_level, current_exp
  FROM user_levels
  WHERE user_id = user_uuid;
  
  -- If user doesn't have a level record, create one
  IF current_level IS NULL THEN
    INSERT INTO user_levels (user_id, level, experience, total_experience)
    VALUES (user_uuid, 1, 0, 0);
    current_level := 1;
    current_exp := 0;
  END IF;
  
  -- Calculate new experience and level
  new_exp := current_exp + amount;
  new_level := calculate_level(new_exp);
  
  -- Update user level
  UPDATE user_levels
  SET 
    level = new_level,
    experience = new_exp,
    total_experience = total_experience + amount,
    updated_at = NOW()
  WHERE user_id = user_uuid;
  
  -- Log experience gain
  INSERT INTO experience_log (user_id, source, amount, description, metadata)
  VALUES (user_uuid, source, amount, description, metadata);
  
  -- If level increased, create notification
  IF new_level > current_level THEN
    PERFORM create_notification(
      user_uuid,
      'badge_earned',
      'Level Up!',
      'Congratulations! You reached level ' || new_level || '!',
      jsonb_build_object('old_level', current_level, 'new_level', new_level),
      'high'
    );
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to check and award achievements
CREATE OR REPLACE FUNCTION check_achievements(user_uuid UUID)
RETURNS TABLE (
  achievement_id UUID,
  achievement_name TEXT,
  achievement_description TEXT,
  points INTEGER
) AS $$
DECLARE
  achievement_record RECORD;
  user_stats JSONB;
BEGIN
  -- Get user statistics
  SELECT jsonb_build_object(
    'total_games', COALESCE(total_games, 0),
    'total_value', COALESCE(total_value, 0),
    'games_for_sale', COALESCE(games_for_sale, 0),
    'games_for_trade', COALESCE(games_for_trade, 0),
    'wishlist_count', COALESCE(wishlist_count, 0),
    'level', COALESCE(ul.level, 1),
    'experience', COALESCE(ul.experience, 0),
    'achievements_earned', COALESCE(ul.achievements_earned, 0)
  ) INTO user_stats
  FROM collection_statistics cs
  LEFT JOIN user_levels ul ON cs.user_id = ul.user_id
  WHERE cs.user_id = user_uuid;
  
  -- Check each achievement
  FOR achievement_record IN
    SELECT * FROM achievements WHERE is_active = TRUE
  LOOP
    -- Check if user already has this achievement
    IF NOT EXISTS (
      SELECT 1 FROM user_achievements 
      WHERE user_id = user_uuid AND achievement_id = achievement_record.id
    ) THEN
      -- Check if requirements are met (simplified logic)
      -- In a real implementation, you'd have more complex requirement checking
      IF check_achievement_requirements(achievement_record.requirements, user_stats) THEN
        -- Award achievement
        INSERT INTO user_achievements (user_id, achievement_id)
        VALUES (user_uuid, achievement_record.id);
        
        -- Add experience points
        PERFORM add_experience(user_uuid, achievement_record.points, 'achievement', 
          'Achievement: ' || achievement_record.name);
        
        -- Update user level achievements count
        UPDATE user_levels
        SET achievements_earned = achievements_earned + 1
        WHERE user_id = user_uuid;
        
        -- Return achievement info
        achievement_id := achievement_record.id;
        achievement_name := achievement_record.name;
        achievement_description := achievement_record.description;
        points := achievement_record.points;
        RETURN NEXT;
      END IF;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Helper function to check achievement requirements
CREATE OR REPLACE FUNCTION check_achievement_requirements(
  requirements JSONB,
  user_stats JSONB
)
RETURNS BOOLEAN AS $$
DECLARE
  requirement_key TEXT;
  requirement_value NUMERIC;
  user_value NUMERIC;
BEGIN
  -- Simple requirement checking
  -- In a real implementation, you'd have more complex logic
  FOR requirement_key, requirement_value IN SELECT * FROM jsonb_each(requirements)
  LOOP
    user_value := COALESCE((user_stats->requirement_key)::NUMERIC, 0);
    IF user_value < requirement_value THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Function to update leaderboards
CREATE OR REPLACE FUNCTION update_leaderboard(
  leaderboard_uuid UUID
)
RETURNS VOID AS $$
DECLARE
  leaderboard_record RECORD;
  user_rank INTEGER := 1;
  user_record RECORD;
BEGIN
  -- Get leaderboard info
  SELECT * INTO leaderboard_record FROM leaderboards WHERE id = leaderboard_uuid;
  
  -- Clear existing entries
  DELETE FROM leaderboard_entries WHERE leaderboard_id = leaderboard_uuid;
  
  -- Insert new entries based on leaderboard type
  CASE leaderboard_record.category
    WHEN 'collection_size' THEN
      INSERT INTO leaderboard_entries (leaderboard_id, user_id, score, rank)
      SELECT 
        leaderboard_uuid,
        cs.user_id,
        cs.total_games::DECIMAL,
        ROW_NUMBER() OVER (ORDER BY cs.total_games DESC)
      FROM collection_statistics cs
      WHERE cs.total_games > 0;
      
    WHEN 'collection_value' THEN
      INSERT INTO leaderboard_entries (leaderboard_id, user_id, score, rank)
      SELECT 
        leaderboard_uuid,
        cs.user_id,
        cs.total_value,
        ROW_NUMBER() OVER (ORDER BY cs.total_value DESC)
      FROM collection_statistics cs
      WHERE cs.total_value > 0;
      
    WHEN 'experience_points' THEN
      INSERT INTO leaderboard_entries (leaderboard_id, user_id, score, rank)
      SELECT 
        leaderboard_uuid,
        ul.user_id,
        ul.total_experience::DECIMAL,
        ROW_NUMBER() OVER (ORDER BY ul.total_experience DESC)
      FROM user_levels ul
      WHERE ul.total_experience > 0;
      
    WHEN 'achievements_earned' THEN
      INSERT INTO leaderboard_entries (leaderboard_id, user_id, score, rank)
      SELECT 
        leaderboard_uuid,
        ul.user_id,
        ul.achievements_earned::DECIMAL,
        ROW_NUMBER() OVER (ORDER BY ul.achievements_earned DESC)
      FROM user_levels ul
      WHERE ul.achievements_earned > 0;
      
    ELSE
      -- Default case
      NULL;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Function to update user streak
CREATE OR REPLACE FUNCTION update_user_streak(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  streak_record RECORD;
  today DATE := CURRENT_DATE;
BEGIN
  -- Get or create user streak record
  SELECT * INTO streak_record FROM user_streaks WHERE user_id = user_uuid;
  
  IF streak_record IS NULL THEN
    -- Create new streak record
    INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_activity_date)
    VALUES (user_uuid, 1, 1, today);
  ELSE
    -- Check if user was active yesterday
    IF streak_record.last_activity_date = today - INTERVAL '1 day' THEN
      -- Continue streak
      UPDATE user_streaks
      SET 
        current_streak = current_streak + 1,
        longest_streak = GREATEST(longest_streak, current_streak + 1),
        last_activity_date = today,
        updated_at = NOW()
      WHERE user_id = user_uuid;
    ELSIF streak_record.last_activity_date != today THEN
      -- Break streak, start new one
      UPDATE user_streaks
      SET 
        current_streak = 1,
        last_activity_date = today,
        updated_at = NOW()
      WHERE user_id = user_uuid;
    END IF;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Insert default achievements
INSERT INTO achievements (name, description, icon, category, points, rarity, requirements) VALUES
-- Collection achievements
('First Game', 'Add your first game to your collection', '🎮', 'collection', 50, 'common', '{"total_games": 1}'),
('Growing Collection', 'Add 10 games to your collection', '📚', 'collection', 100, 'common', '{"total_games": 10}'),
('Serious Collector', 'Add 50 games to your collection', '🏆', 'collection', 250, 'rare', '{"total_games": 50}'),
('Master Collector', 'Add 100 games to your collection', '👑', 'collection', 500, 'epic', '{"total_games": 100}'),
('Valuable Collection', 'Have a collection worth €1000', '💰', 'collection', 200, 'rare', '{"total_value": 1000}'),
('Premium Collector', 'Have a collection worth €5000', '💎', 'collection', 500, 'epic', '{"total_value": 5000}'),

-- Trading achievements
('First Sale', 'Complete your first sale', '💼', 'trading', 100, 'common', '{"sales_completed": 1}'),
('Active Trader', 'Complete 10 sales', '🔄', 'trading', 250, 'rare', '{"sales_completed": 10}'),
('Trade Master', 'Complete 50 sales', '🎯', 'trading', 500, 'epic', '{"sales_completed": 50}'),

-- Community achievements
('First Review', 'Write your first review', '✍️', 'community', 50, 'common', '{"reviews_given": 1}'),
('Helpful Reviewer', 'Write 10 reviews', '📝', 'community', 200, 'rare', '{"reviews_given": 10}'),
('Community Expert', 'Write 50 reviews', '🌟', 'community', 500, 'epic', '{"reviews_given": 50}'),

-- Level achievements
('Novice', 'Reach level 5', '⭐', 'special', 100, 'common', '{"level": 5}'),
('Apprentice', 'Reach level 10', '⭐⭐', 'special', 250, 'rare', '{"level": 10}'),
('Expert', 'Reach level 25', '⭐⭐⭐', 'special', 500, 'epic', '{"level": 25}'),
('Master', 'Reach level 50', '👑', 'special', 1000, 'legendary', '{"level": 50}'),

-- Achievement milestones
('Achievement Hunter', 'Earn 10 achievements', '🏅', 'special', 300, 'rare', '{"achievements_earned": 10}'),
('Achievement Master', 'Earn 25 achievements', '🏆', 'special', 750, 'epic', '{"achievements_earned": 25}'),
('Achievement Legend', 'Earn 50 achievements', '👑', 'special', 1500, 'legendary', '{"achievements_earned": 50}');

-- Insert default milestones
INSERT INTO milestones (name, description, category, threshold, reward_points) VALUES
('First Steps', 'Add your first game', 'collection', 1, 50),
('Growing Up', 'Add 10 games', 'collection', 10, 100),
('Getting Serious', 'Add 25 games', 'collection', 25, 200),
('Dedicated Collector', 'Add 50 games', 'collection', 50, 400),
('Master Collector', 'Add 100 games', 'collection', 100, 800),
('First Sale', 'Complete your first sale', 'trading', 1, 100),
('Active Seller', 'Complete 10 sales', 'trading', 10, 250),
('Trade Expert', 'Complete 25 sales', 'trading', 25, 500),
('First Review', 'Write your first review', 'community', 1, 50),
('Helpful Member', 'Write 10 reviews', 'community', 10, 200),
('Community Pillar', 'Write 25 reviews', 'community', 25, 400); 