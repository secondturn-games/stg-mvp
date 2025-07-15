-- Add game_title column to listings table
ALTER TABLE listings ADD COLUMN IF NOT EXISTS game_title TEXT; 