# Search Functionality Documentation

## Overview

The search functionality in the SecondTurn board game marketplace provides users with an intelligent, responsive search experience for finding games to list. The system combines multiple data sources with optimized performance and user feedback.

## Architecture

### Data Sources (Priority Order)

1. **BGG API** - Primary source for real-time game data
2. **Supabase Cache** - Cached game data for faster subsequent searches
3. **CSV Fallback** - Local data for offline/fallback scenarios

### Search Flow

```
User Input → Debounce (600ms) → BGG API → Metadata Fetch → Results Display
                ↓
            Supabase Cache (if BGG fails)
                ↓
            CSV Data (if all else fails)
```

## User Experience

### Search Timing & Behavior

| **User Action**        | **Delay** | **Visual Feedback**        | **API Call** |
| ---------------------- | --------- | -------------------------- | ------------ |
| **Type 1st char**      | 0ms       | Typing indicator (dots)    | ❌ None      |
| **Type 2nd char**      | 0ms       | Typing indicator (dots)    | ❌ None      |
| **Stop typing**        | **600ms** | "Searching..." spinner     | ✅ BGG API   |
| **Continue typing**    | **600ms** | Cancel previous, start new | ✅ BGG API   |
| **Delete to <2 chars** | 0ms       | Clear results              | ❌ None      |

### Visual Indicators

#### Typing Indicator

- **When**: User is typing and has ≥2 characters
- **Appearance**: Three animated orange dots
- **Location**: Right side of search input
- **Animation**: Bounce effect with staggered delays

#### Search State

- **When**: API request is in progress
- **Appearance**: Spinning loader + "Searching..." text
- **Location**: Center of results area

#### Error State

- **When**: Search fails or returns error
- **Appearance**: Red background with error message
- **Location**: Below search input

## Technical Implementation

### Debounced Search

```typescript
const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    const trimmedQuery = query.trim()

    // Minimum length validation
    if (!trimmedQuery || trimmedQuery.length < 2) {
      setSearchResults([])
      setSearchError('')
      setIsTyping(false)
      return
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    // Perform search with cancellation support
    const response = await fetch(
      `/api/bgg/search?query=${encodeURIComponent(trimmedQuery)}`,
      {
        signal: abortControllerRef.current.signal,
      }
    )

    // Handle response...
  }, 600), // 600ms delay for optimal UX
  []
)
```

### Request Cancellation

```typescript
// Abort controller for cancelling previous requests
const abortControllerRef = useRef<AbortController | null>(null)

// Cleanup on component unmount
useEffect(() => {
  return () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }
}, [])
```

### State Management

```typescript
const [searchTerm, setSearchTerm] = useState('')
const [searchResults, setSearchResults] = useState<BGGSearchResult[]>([])
const [isSearching, setIsSearching] = useState(false)
const [searchError, setSearchError] = useState<string | null>(null)
const [isTyping, setIsTyping] = useState(false)
```

## Search Results Ranking

### Priority System

1. **Exact Match** (1,000,000 points) - Perfect name match
2. **Alternate Name Exact Match** (800,000 points) - Perfect alternate name match
3. **Fuzzy Similarity** (0-50,000 points) - Partial word matches
4. **Alternate Name Fuzzy Match** (0-25,000 points) - Partial alternate name matches
5. **Base Game Priority** (10,000 points) - Base games over expansions
6. **BGG Rank** (0-1,000 points) - Lower rank = higher score
7. **Rating** (0-1,000 points) - Higher rating = higher score
8. **Year Published** (0-100 points) - Newer games get slight bonus

### Example Ranking

```
"Wingspan" search results:
1. Wingspan (base-game) - Exact match + base game + high rank
2. Wingspan Asia (base-game) - Fuzzy match + base game
3. Wingspan: European Expansion (expansion) - Fuzzy match + expansion
4. Wingspan: Oceania Expansion (expansion) - Fuzzy match + expansion
```

## Data Sources & Caching

### BGG API Integration

- **Search Endpoint**: `/xmlapi2/search?query={query}&type=boardgame&exact=0`
- **Metadata Endpoint**: `/xmlapi2/thing?id={ids}&stats=1`
- **Rate Limiting**: 5-15 second delays between calls
- **Encoding**: UTF-8 with `arrayBuffer()` and `TextDecoder`

### Supabase Caching

- **Games Table**: 60-day cache for individual game data
- **Search Cache**: 1-hour cache for search results (planned)
- **PostgreSQL Search**: Advanced full-text search with `pg_trgm`

### CSV Fallback

- **File**: `boardgames_ranks.csv`
- **Sync**: Incremental updates via admin interface
- **Columns**: ID, name, year, rank, rating, expansion flag, category ranks

## Performance Optimizations

### Frontend Optimizations

- **Debouncing**: 600ms delay prevents excessive API calls
- **Request Cancellation**: AbortController cancels outdated requests
- **State Management**: Prevents duplicate searches
- **Memory Cleanup**: Proper cleanup on component unmount

### Backend Optimizations

- **Rate Limiting**: Prevents BGG API abuse
- **Caching**: Reduces API calls and improves response times
- **Batch Requests**: Fetches metadata for multiple games at once
- **Error Handling**: Graceful fallbacks between data sources

## Error Handling

### Network Errors

- **Timeout**: Automatic retry with exponential backoff
- **Rate Limit**: Respect BGG API limits with delays
- **Connection**: Fallback to cached data

### Data Errors

- **Encoding**: UTF-8 handling for international characters
- **Parsing**: Robust XML parsing with error recovery
- **Validation**: Input sanitization and length checks

### User Feedback

- **Clear Messages**: Specific error descriptions
- **Recovery Options**: Suggestions for retry or alternative search
- **Graceful Degradation**: Continue working with available data

## Configuration

### Debounce Timing

```typescript
// Current: 600ms
// Recommended range: 500-800ms
// Too fast (<300ms): Excessive API calls
// Too slow (>1000ms): Poor responsiveness
```

### Rate Limiting

```typescript
// BGG API delays: 5-15 seconds
// Prevents API abuse while maintaining responsiveness
```

### Cache Durations

```typescript
// Games table: 60 days
// Search cache: 1 hour (planned)
// CSV data: Real-time sync
```

## Testing

### Manual Testing Scenarios

1. **Typing Speed**: Fast vs slow typing behavior
2. **Network Conditions**: Slow/fast internet
3. **Character Encoding**: International characters (ā, ž, etc.)
4. **Error Conditions**: Network failures, API errors
5. **Edge Cases**: Very short/long queries

### Automated Testing

```typescript
// Test debounce timing
// Test request cancellation
// Test error handling
// Test state management
```

## Future Enhancements

### Planned Features

1. **Search Cache Table**: 1-hour cache for search results
2. **Progressive Enhancement**: Adaptive debounce timing
3. **Search Analytics**: Track popular searches
4. **Smart Suggestions**: Auto-complete based on user history
5. **Offline Support**: Enhanced CSV fallback

### Performance Improvements

1. **CDN Caching**: Cache static search results
2. **Database Indexing**: Optimize PostgreSQL search
3. **Request Batching**: Batch multiple search requests
4. **Predictive Loading**: Pre-load likely search results

## Troubleshooting

### Common Issues

#### Search Not Triggering

- Check minimum character length (2 chars)
- Verify debounce timing (600ms)
- Check for JavaScript errors in console

#### Slow Search Results

- Check network connectivity
- Verify BGG API status
- Check rate limiting delays

#### Missing Results

- Verify BGG API response
- Check Supabase cache status
- Validate CSV data sync

#### Encoding Issues

- Ensure UTF-8 encoding throughout
- Check BGG API response encoding
- Verify frontend display encoding

### Debug Information

```typescript
// Enable debug logging
console.log(`🔍 Frontend: Starting search for "${query}"`)
console.log(`✅ BGG API: Search completed, found ${results.length} results`)
console.log(`❌ Search error: ${error.message}`)
```

## API Reference

### Search Endpoint

```
GET /api/bgg/search?query={searchTerm}

Response:
{
  "success": boolean,
  "results": BGGSearchResult[],
  "error": string (optional)
}
```

### BGGSearchResult Interface

```typescript
interface BGGSearchResult {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  type?: 'base-game' | 'expansion'
  alternateNames?: string[]
  thumbnail?: string
  bggLink?: string
  // Category ranks...
}
```

---

_Last updated: [Current Date]_
_Version: 1.0_
