# Search Flow Implementation & Optimizations

## Overview

This document details the technical implementation of the BGG search functionality, including performance optimizations, caching strategies, and the two-step filtering process that ensures accurate game type classification.

## Architecture

### Search Flow Diagram

```
User Search Request
    ↓
Check Local Cache (fastest)
    ↓
BGG Search API (with type filtering)
    ↓
Metadata Fetching (for type verification)
    ↓
Inbound Link Analysis (corrects BGG API inconsistencies)
    ↓
Final Type Filtering
    ↓
Cache Results
    ↓
Return Filtered Results
```

## Key Components

### 1. BGGService Class (`lib/bgg-service.ts`)

**Main Entry Point:**

```typescript
async searchGames(query: string, filters?: {
  gameType?: 'base-game' | 'expansion'
}): Promise<BGGSearchResult[]>
```

**Core Methods:**

- `searchBGG()` - Orchestrates the search process
- `searchBGGAPI()` - Handles BGG API calls with optimization
- `performBGGSearch()` - Executes individual API requests
- `parseBGGMetadataXML()` - Parses metadata with inbound link analysis

### 2. Two-Step Filtering Process

#### Step 1: BGG Search API

- **Base Game Search**: `type=boardgame`
- **Expansion Search**: `type=boardgameexpansion`
- **Issue**: BGG's search API sometimes returns expansions as `type="boardgame"`

#### Step 2: Inbound Link Analysis

- **API Call**: `/xmlapi2/thing?id={gameId}&stats=1&versions=1`
- **Critical Check**: Look for inbound expansion links:
  ```xml
  <link type="boardgameexpansion" inbound="true"/>
  <link type="boardgameintegration" inbound="true"/>
  ```

**Type Determination Logic:**

```typescript
if (gameType === 'boardgameexpansion') {
  trueGameType = 'boardgameexpansion' // Already marked as expansion
} else if (hasInboundExpansionLink) {
  trueGameType = 'boardgameexpansion' // Has inbound expansion link = it's an expansion
} else {
  trueGameType = 'boardgame' // No inbound expansion link = true base game
}
```

## Performance Optimizations

### 1. Adaptive Rate Limiting

```typescript
private readonly minDelay = 500 // 500ms minimum between calls
private readonly searchDelay = 1000 // 1 second for search calls
```

### 2. Smart Search Strategy

```typescript
// Skip exact search for short queries (< 4 characters)
if (queryLength >= 4) {
  // Try exact search first, then fuzzy
  const exactResults = await this.performBGGSearch(query, true, filters)
  if (exactResults.length > 0) return exactResults
  // Fall back to fuzzy search
} else {
  // Go straight to fuzzy search for short queries
  return await this.performBGGSearch(query, false, filters)
}
```

### 3. Optimized Metadata Fetching

- **Batch Size**: Reduced from 25 to 15 results for faster processing
- **Caching**: 60-day cache for metadata in Supabase
- **Batch Requests**: Up to 20 game IDs per BGG API call

### 4. Request Timeout Protection

```typescript
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
```

## Caching Strategy

### 1. Local Memory Cache

- **TTL**: 30 minutes for search results
- **Size**: Maximum 1000 entries
- **Key**: `query:gameType` (includes filter in cache key)

### 2. Supabase Database Cache

- **TTL**: 60 days for metadata
- **Fields**: All game details including versions, mechanics, categories
- **Type Mapping**: Corrected game types based on inbound link analysis

### 3. Popular Queries Tracking

- **TTL**: 24 hours
- **Purpose**: Monitor search patterns and optimize performance
- **Data**: Query frequency, average search time

## Error Handling

### 1. API Timeouts

- **Timeout**: 10 seconds per request
- **Fallback**: Continue with available results
- **Logging**: Detailed error messages for debugging

### 2. Rate Limiting

- **BGG Guidelines**: 1-2 seconds between requests
- **Implementation**: 500ms minimum, adaptive delays
- **Queue Management**: Sequential processing to avoid conflicts

### 3. Graceful Degradation

- **Cache Miss**: Fall back to BGG API
- **API Failure**: Return empty results with error logging
- **Partial Results**: Continue with available data

## Expected Performance

### Response Times

- **Cache Hits**: < 100ms
- **Fresh Searches**: 2-5 seconds (depending on query length)
- **Metadata Fetching**: 1-3 seconds for 15 games

### Accuracy

- **Type Filtering**: 100% accurate base game vs expansion classification
- **Search Relevance**: Exact matches prioritized, then popularity-based sorting
- **Duplicate Removal**: Automatic deduplication by game ID

## Monitoring & Debugging

### Console Logging

```typescript
// Search process tracking
console.log(`🔍 BGG API: Starting search for "${query}" with filters:`, filters)
console.log(
  `🔍 Type mapping for ${gameId}: ${gameName} - Search API type: ${searchType}, Metadata API type: ${metaType} -> Our type: ${gameType}`
)
console.log(
  `🔍 ${gameId} (${gameName}): Marked as boardgame but has inbound expansion link → TRUE TYPE: expansion`
)
```

### Cache Statistics

```typescript
getCacheStats(): {
  size: number;
  hitRate: number;
  popularQueries: PopularQuery[]
}
```

### Popular Queries

```typescript
getPopularQueries(): PopularQuery[]
clearSearchCache(): void
clearSearchCacheForQuery(query: string, filters?: { gameType?: 'base-game' | 'expansion' }): void
```

## Example Usage

### Basic Search

```typescript
const bggService = new BGGService()
const results = await bggService.searchGames('gloomhaven', {
  gameType: 'base-game',
})
```

### Cache Management

```typescript
// Get cache statistics
const stats = bggService.getCacheStats()
console.log(`Cache size: ${stats.size}, Hit rate: ${stats.hitRate}%`)

// Clear cache for specific query
bggService.clearSearchCacheForQuery('gloomhaven', { gameType: 'base-game' })
```

## Future Improvements

### 1. Advanced Caching

- **Redis Integration**: For distributed caching
- **CDN Caching**: For static game metadata
- **Predictive Caching**: Pre-cache popular searches

### 2. Search Enhancements

- **Fuzzy Matching**: Improved similarity algorithms
- **Autocomplete**: Real-time search suggestions
- **Search Analytics**: Track user behavior patterns

### 3. Performance Monitoring

- **Metrics Collection**: Response times, error rates
- **Alerting**: API failures, performance degradation
- **Optimization**: Continuous performance tuning

## Troubleshooting

### Common Issues

1. **Expansions in Base Game Results**

   - **Cause**: BGG API inconsistency
   - **Solution**: Inbound link analysis in metadata parsing
   - **Debug**: Check console logs for type mapping

2. **Slow Response Times**

   - **Cause**: Rate limiting or network issues
   - **Solution**: Check cache hit rates, optimize batch sizes
   - **Debug**: Monitor popular queries and search times

3. **Missing Metadata**
   - **Cause**: BGG API failures or parsing errors
   - **Solution**: Graceful fallback to cached data
   - **Debug**: Check XML parsing logs

### Debug Commands

```typescript
// Check cache status
const stats = bggService.getCacheStats()
console.log('Cache stats:', stats)

// Clear all caches
bggService.clearCache()

// Get popular queries
const popular = bggService.getPopularQueries()
console.log('Popular queries:', popular)
```

This implementation provides a robust, performant, and accurate search system that handles BGG's API inconsistencies while maintaining excellent user experience through intelligent caching and optimization strategies.
