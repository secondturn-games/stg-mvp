-- Add clerk_id field to users table
ALTER TABLE users ADD COLUMN clerk_id TEXT UNIQUE;

-- Create index for clerk_id
CREATE INDEX idx_users_clerk_id ON users(clerk_id);

-- Update the users table to make email nullable since Clerk will handle email
ALTER TABLE users ALTER COLUMN email DROP NOT NULL; 