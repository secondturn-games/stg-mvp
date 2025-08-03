# CSV to Supabase Sync System

This document explains the complete CSV to Supabase sync system for the boardgames data, including setup, usage, and troubleshooting.

## Overview

The sync system allows you to store CSV data in a Supabase table for better performance and querying capabilities. The system includes multiple sync strategies and monitoring tools.

## Architecture

### Search Priority (New Implementation)

1. **Primary**: Supabase `csv_games` table (fastest)
2. **Fallback**: BGG API (for new games)
3. **Final Fallback**: CSV file (for offline scenarios)

### Sync Strategies

- **Full Sync**: Complete rewrite of all data
- **Incremental Sync**: Only process changed/new records
- **Robust Incremental**: Enhanced with error handling and rate limiting

## Setup

### 1. Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Create csv_games table for storing CSV data
CREATE TABLE IF NOT EXISTS csv_games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  yearpublished TEXT,
  rank TEXT,
  bayesaverage TEXT,
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
```

### 2. Environment Variables

Ensure you have these environment variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### 3. Install Dependencies

The sync scripts use `tsx` which is already in your devDependencies.

## Available Scripts

### Sync Scripts

```bash
# Full sync (complete rewrite)
npm run sync:csv

# Incremental sync (only changed/new records)
npm run sync:csv:incremental

# Robust incremental sync (with error handling and rate limiting)
npm run sync:csv:robust
```

### Monitoring Scripts

```bash
# One-time status check
npm run monitor:sync

# Live monitoring (continuous updates)
npm run monitor:sync:live

# Diagnostic check
npm run sync:diagnostics
```

## Usage Scenarios

### Initial Setup

1. **Create the table** using the SQL above
2. **Run full sync** to populate all data:
   ```bash
   npm run sync:csv
   ```

### Regular Updates

When you update your CSV file:

1. **Replace** `public/boardgames_ranks.csv` with your new file
2. **Run incremental sync**:
   ```bash
   npm run sync:csv:robust
   ```

### Monitoring Progress

```bash
# Check current status
npm run monitor:sync

# Watch live progress
npm run monitor:sync:live
```

## Sync Strategies Explained

### 1. Full Sync (`sync:csv`)

- **Use case**: Initial setup or complete data reset
- **Process**: Deletes all data, inserts all CSV records
- **Pros**: Simple, guaranteed consistency
- **Cons**: Slow, high database load
- **Time**: ~5-10 minutes for 167K records

### 2. Incremental Sync (`sync:csv:incremental`)

- **Use case**: Regular updates
- **Process**: Compares CSV with database, only updates changes
- **Pros**: Fast, efficient, safe
- **Cons**: Requires existing data
- **Time**: ~30 seconds for typical updates

### 3. Robust Incremental Sync (`sync:csv:robust`)

- **Use case**: Large datasets or unreliable connections
- **Process**: Enhanced incremental with error handling
- **Features**:
  - Smaller batches (50 records)
  - Delays between batches (2 seconds)
  - Automatic retry on failures
  - Chunked data fetching
- **Pros**: Most reliable, handles rate limits
- **Cons**: Slower than basic incremental
- **Time**: ~2-3 minutes for large updates

## Performance Comparison

| Method      | Speed  | Database Load | Reliability | Use Case        |
| ----------- | ------ | ------------- | ----------- | --------------- |
| Full Sync   | Slow   | High          | High        | Initial setup   |
| Incremental | Fast   | Low           | High        | Regular updates |
| Robust      | Medium | Low           | Very High   | Large datasets  |

## Troubleshooting

### Common Issues

#### 1. Environment Variables Not Found

```bash
Error: NEXT_PUBLIC_SUPABASE_URL environment variable is required
```

**Solution**: Ensure `.env.local` exists with correct credentials

#### 2. Rate Limiting

```bash
Error: Too many requests
```

**Solution**: Use `sync:csv:robust` which includes delays and retries

#### 3. Connection Timeouts

```bash
Error: Request timeout
```

**Solution**: Use smaller batch sizes or check network connection

#### 4. Permission Denied

```bash
Error: Permission denied
```

**Solution**: Verify `SUPABASE_SERVICE_ROLE_KEY` is correct

### Diagnostic Commands

```bash
# Check environment and connectivity
npm run sync:diagnostics

# Monitor sync progress
npm run monitor:sync:live

# Check current data count
npm run monitor:sync
```

## Data Schema

### CSV Columns (Ignored)

- `average` - Not used (using `bayesaverage` instead)
- `usersrated` - Not used in application

### CSV Columns (Used)

- `id` - BGG game ID (Primary Key)
- `name` - Game name
- `yearpublished` - Publication year
- `rank` - Overall BGG rank
- `bayesaverage` - Bayesian average rating
- `is_expansion` - Expansion flag (0/1)
- `abstracts_rank` - Abstract games rank
- `cgs_rank` - CGS rank
- `childrensgames_rank` - Children's games rank
- `familygames_rank` - Family games rank
- `partygames_rank` - Party games rank
- `strategygames_rank` - Strategy games rank
- `thematic_rank` - Thematic games rank
- `wargames_rank` - War games rank

## Best Practices

### 1. Regular Updates

- Use incremental sync for regular updates
- Monitor progress during large syncs
- Keep CSV file in `public/boardgames_ranks.csv`

### 2. Performance Optimization

- Use robust sync for large datasets
- Monitor database performance during syncs
- Consider off-peak hours for large updates

### 3. Data Integrity

- Always backup before major changes
- Verify sync completion with monitoring
- Check data counts after sync

### 4. Error Handling

- Use robust sync for unreliable connections
- Monitor logs for errors
- Retry failed syncs

## Integration with Application

### Search Flow

1. **Primary**: Supabase `csv_games` table
2. **Fallback**: BGG API
3. **Final Fallback**: CSV file

### Code Integration

```typescript
// The BGGService automatically uses Supabase-first approach
const results = await bggService.searchGames(query)
```

## Maintenance

### Regular Tasks

1. **Monitor sync performance**
2. **Update CSV file** as needed
3. **Run incremental syncs** for updates
4. **Check database health** periodically

### Cleanup

```sql
-- Remove unused columns (if needed)
ALTER TABLE csv_games DROP COLUMN average;
ALTER TABLE csv_games DROP COLUMN usersrated;
```

## Support

For issues or questions:

1. Run diagnostics: `npm run sync:diagnostics`
2. Check logs for error messages
3. Verify environment variables
4. Test connectivity to Supabase

## Future Enhancements

- Automated sync scheduling
- Real-time sync notifications
- Advanced filtering options
- Performance analytics
- Backup and restore procedures
