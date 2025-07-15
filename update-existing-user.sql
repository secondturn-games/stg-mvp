-- Update existing user profile with clerk_id
-- Replace 'YOUR_CLERK_USER_ID' with your actual Clerk user ID

-- First, let's see what users exist
SELECT id, email, username, clerk_id FROM users;

-- Then update your existing user profile
-- Replace 'YOUR_CLERK_USER_ID' with your actual Clerk user ID from the browser
UPDATE users 
SET clerk_id = 'YOUR_CLERK_USER_ID' 
WHERE email = 'your-email@example.com'; -- Replace with your actual email

-- Verify the update
SELECT id, email, username, clerk_id FROM users WHERE clerk_id IS NOT NULL; 