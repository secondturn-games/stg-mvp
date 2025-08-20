-- Update avatar trigger to include avatar field
-- This migration updates the existing trigger and populates avatars for existing users

-- First, update the trigger function to include avatar
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO users (
    id,
    email,
    username,
    full_name,
    avatar,
    city,
    country,
    language,
    is_verified,
    rating,
    review_count
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'city', 'Unknown'),
    COALESCE(NEW.raw_user_meta_data->>'country', NULL),
    COALESCE(NEW.raw_user_meta_data->>'language', 'en'),
    false,
    0,
    0
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users with their Google avatars
-- This will populate the avatar field for users who signed up via Google OAuth
UPDATE users 
SET avatar = auth_users.raw_user_meta_data->>'avatar_url'
FROM auth.users auth_users
WHERE users.id = auth_users.id 
  AND auth_users.raw_user_meta_data->>'avatar_url' IS NOT NULL
  AND users.avatar IS NULL;

-- Add comment explaining the avatar field
COMMENT ON COLUMN users.avatar IS 'User avatar URL, automatically populated from OAuth providers or manually set';
