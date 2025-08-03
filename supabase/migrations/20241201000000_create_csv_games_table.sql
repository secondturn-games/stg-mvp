-- Create csv_games table for storing CSV data
CREATE TABLE IF NOT EXISTS csv_games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  yearpublished TEXT,
  rank TEXT,
  bayesaverage TEXT,
  average TEXT,
  usersrated TEXT,
  is_expansion TEXT,
  abstracts_rank TEXT,
  cgs_rank TEXT,
  childrensgames_rank TEXT,
  familygames_rank TEXT,
  partygames_rank TEXT,
  strategygames_rank TEXT,
  thematic_rank TEXT,
  wargames_rank TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_csv_games_name ON csv_games(name);
CREATE INDEX IF NOT EXISTS idx_csv_games_is_expansion ON csv_games(is_expansion);
CREATE INDEX IF NOT EXISTS idx_csv_games_rank ON csv_games(rank);
CREATE INDEX IF NOT EXISTS idx_csv_games_familygames_rank ON csv_games(familygames_rank);
CREATE INDEX IF NOT EXISTS idx_csv_games_strategygames_rank ON csv_games(strategygames_rank);
CREATE INDEX IF NOT EXISTS idx_csv_games_partygames_rank ON csv_games(partygames_rank);
CREATE INDEX IF NOT EXISTS idx_csv_games_thematic_rank ON csv_games(thematic_rank);

-- Enable Row Level Security (RLS)
ALTER TABLE csv_games ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read csv_games
CREATE POLICY "Allow authenticated users to read csv_games" ON csv_games
  FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow service role to manage csv_games
CREATE POLICY "Allow service role to manage csv_games" ON csv_games
  FOR ALL USING (auth.role() = 'service_role');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_csv_games_updated_at 
  BEFORE UPDATE ON csv_games 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 