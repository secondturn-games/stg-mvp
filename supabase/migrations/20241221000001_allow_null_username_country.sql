-- Allow null values for country field only
-- Username will be automatically set to email address

-- Update country field to allow null values and remove default
ALTER TABLE users ALTER COLUMN country DROP NOT NULL;
ALTER TABLE users ALTER COLUMN country DROP DEFAULT;

-- Add comment explaining the change
COMMENT ON COLUMN users.country IS 'Country can be null initially, will be set during profile completion';
