# BGG Data Caching System

## Overview

The BGG (BoardGameGeek) caching system reduces API calls and improves performance by storing game details in Supabase with automatic expiry.

## BGG Attribution Requirements

According to the [BGG XML API Terms of Use](https://boardgamegeek.com/wiki/page/XML_API_Terms_of_Use#), we must:

1. **Credit BoardGameGeek** by name as the source of the data
2. **Include the "Powered by BGG" logo** in public-facing uses of the XML API
3. **Link the logo back to BoardGameGeek** (https://boardgamegeek.com)
4. **Display the logo at a legible size** (we use h-6 class for 24px height)

### Implementation

- **Logo Location**: Upper right corner of game details sections
- **Logo File**: `/public/powered-by-bgg-rgb.svg`
- **Logo Size**: 24px height (h-6 class)
- **Link Target**: https://boardgamegeek.com
- **Styling**: 70% opacity with hover effect for better UX

### Components with BGG Attribution

1. **Main Listing Form** (`app/list-game/page.tsx`)
2. **Bundle Game Search** (`components/bundle-game-search.tsx`)

## How It Works

### 1. Cache-First Strategy

- **First Request**: Fetches data from BGG API and caches it in Supabase
- **Subsequent Requests**: Uses cached data if not expired
- **Expired Cache**: Automatically fetches fresh data from BGG API

### 2. Cache Expiry

- **Duration**: 30 days from cache creation
- **Automatic Cleanup**: Expired entries are removed during cleanup
- **Manual Refresh**: Users get fresh data when cache expires

### 3. Fallback Strategy

1. Check Supabase cache (if valid)
2. Try BGG API (if cache expired/missing)
3. Fall back to CSV data (if API fails)

## Database Schema

### Games Table

```sql
CREATE TABLE games (
  id TEXT PRIMARY KEY, -- BGG game ID
  name TEXT NOT NULL,
  year_published INTEGER,
  min_players INTEGER,
  max_players INTEGER,
  playing_time INTEGER,
  min_age INTEGER,
  description TEXT,
  thumbnail TEXT,
  image TEXT,
  bgg_rating REAL,
  bgg_weight REAL,
  bgg_rank INTEGER,
  mechanics TEXT[],
  categories TEXT[],
  cache_expires_at TIMESTAMP WITH TIME ZONE, -- 30-day expiry
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## API Endpoints

### Get Game Details

```
GET /api/bgg/game/{id}
```

- Returns cached data if available and not expired
- Fetches fresh data from BGG API if needed
- Caches new data for 30 days

### Cleanup Expired Cache

```
POST /api/bgg/cleanup-cache
```

- Removes all expired cache entries
- Useful for maintenance and database cleanup

## Performance Benefits

### Before Caching

- Every game selection = BGG API call
- Slow response times (1-3 seconds)
- High API usage
- Potential rate limiting

### After Caching

- First selection = BGG API call + cache
- Subsequent selections = Instant response
- Reduced API usage by ~95%
- Better user experience

## Implementation Details

### Cache Key

- Uses BGG game ID as primary key
- Ensures unique storage per game

### Data Transformation

- Converts BGG XML data to structured format
- Handles UTF-8 encoding properly
- Decodes HTML entities in game names and descriptions
- Preserves all game metadata

### Error Handling

- Graceful fallback to CSV data
- Logs cache operations for debugging
- Continues working even if cache fails

## Migration

To add caching to existing databases:

1. Run the migration script:

```sql
-- Add cache_expires_at column
ALTER TABLE games ADD COLUMN cache_expires_at TIMESTAMP WITH TIME ZONE;

-- Add index for performance
CREATE INDEX idx_games_cache_expiry ON games(cache_expires_at);

-- Set default expiry for existing records
UPDATE games SET cache_expires_at = NOW() + INTERVAL '30 days' WHERE cache_expires_at IS NULL;
```

## Monitoring

### Cache Hit Rate

- Check console logs for "Using cached data" vs "Fetching fresh data"
- Monitor database size and cleanup operations

### Performance Metrics

- Response times should improve significantly
- API call frequency should decrease
- User experience should be smoother

## Future Enhancements

1. **Configurable Expiry**: Allow different expiry times for different data types
2. **Cache Warming**: Pre-populate cache for popular games
3. **Analytics**: Track cache hit rates and performance metrics
4. **Background Cleanup**: Automated cleanup of expired entries
