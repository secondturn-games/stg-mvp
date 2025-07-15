-- Temporarily disable RLS on auctions table
-- Run this in your Supabase SQL editor

-- Disable RLS on auctions table
ALTER TABLE auctions DISABLE ROW LEVEL SECURITY;

-- Also disable RLS on bids table for now
ALTER TABLE bids DISABLE ROW LEVEL SECURITY; 