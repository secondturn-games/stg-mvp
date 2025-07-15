-- Fix RLS policies for listings table

-- Allow authenticated users to insert their own listings
CREATE POLICY "Allow users to insert their own listings" ON listings
    FOR INSERT WITH CHECK (auth.uid()::text = seller_id::text);

-- Allow users to view all active listings
CREATE POLICY "Allow users to view active listings" ON listings
    FOR SELECT USING (status = 'active');

-- Allow users to view their own listings (all statuses)
CREATE POLICY "Allow users to view their own listings" ON listings
    FOR SELECT USING (auth.uid()::text = seller_id::text);

-- Allow users to update their own listings
CREATE POLICY "Allow users to update their own listings" ON listings
    FOR UPDATE USING (auth.uid()::text = seller_id::text);

-- Allow users to delete their own listings
CREATE POLICY "Allow users to delete their own listings" ON listings
    FOR DELETE USING (auth.uid()::text = seller_id::text); 