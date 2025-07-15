-- Fix 1: Add missing avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Fix 2: Disable RLS on games table temporarily to allow inserts
ALTER TABLE games DISABLE ROW LEVEL SECURITY;

-- Fix 3: Create a policy to allow authenticated users to insert games
CREATE POLICY "Allow authenticated users to insert games" ON games
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Fix 4: Create a policy to allow all users to select games
CREATE POLICY "Allow all users to select games" ON games
    FOR SELECT USING (true);

-- Fix 5: Create a policy to allow authenticated users to update games
CREATE POLICY "Allow authenticated users to update games" ON games
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Re-enable RLS on games table
ALTER TABLE games ENABLE ROW LEVEL SECURITY; 