# Search Functionality - Quick Reference

## 🚀 Key Features

- **600ms debounce** - Prevents excessive API calls
- **Request cancellation** - Cancels outdated requests
- **Visual feedback** - Typing indicators and loading states
- **Multi-source data** - BGG API → Supabase → CSV fallback
- **Smart ranking** - Exact matches, fuzzy search, base game priority

## ⚡ Performance Settings

```typescript
// Debounce timing
const DEBOUNCE_DELAY = 600 // milliseconds

// Rate limiting
const BGG_RATE_LIMIT = 5000 // 5 seconds between API calls

// Cache durations
const GAME_CACHE_DURATION = 60 // days
const SEARCH_CACHE_DURATION = 1 // hour (planned)
```

## 🎯 Search Flow

```
User types → 600ms delay → BGG API → Metadata → Results
                ↓
            Cancel previous request
                ↓
            Show typing indicator
                ↓
            Display results with ranking
```

## 🔧 Implementation Checklist

### Frontend Setup

- [ ] Import `debounce` from `lodash`
- [ ] Add `useRef` for `AbortController`
- [ ] Set up state variables (`isTyping`, `isSearching`, etc.)
- [ ] Implement cleanup effect

### Backend Setup

- [ ] Configure rate limiting in `bgg-service.ts`
- [ ] Set up Supabase caching
- [ ] Implement CSV fallback
- [ ] Add error handling

### UI Components

- [ ] Add typing indicator (animated dots)
- [ ] Add loading spinner
- [ ] Add error message display
- [ ] Style with brand colors

## 🐛 Common Issues & Fixes

### Search Not Triggering

```typescript
// Check minimum length
if (query.length < 2) return

// Verify debounce is working
console.log('Debounce triggered:', query)
```

### Requests Not Cancelling

```typescript
// Ensure AbortController is set up
const abortController = new AbortController()
fetch(url, { signal: abortController.signal })

// Cancel previous request
if (abortControllerRef.current) {
  abortControllerRef.current.abort()
}
```

### Encoding Issues

```typescript
// Use arrayBuffer for UTF-8 handling
const buffer = await response.arrayBuffer()
const decoder = new TextDecoder('utf-8')
const text = decoder.decode(buffer)
```

## 📊 Search Ranking Weights

| **Factor**      | **Weight** | **Description**              |
| --------------- | ---------- | ---------------------------- |
| Exact Match     | 1,000,000  | Perfect name match           |
| Alternate Exact | 800,000    | Perfect alternate name       |
| Fuzzy Match     | 0-50,000   | Partial word similarity      |
| Base Game       | 10,000     | Base games over expansions   |
| BGG Rank        | 0-1,000    | Lower rank = higher score    |
| Rating          | 0-1,000    | Higher rating = higher score |
| Year            | 0-100      | Newer games get bonus        |

## 🎨 UI States

### Typing State

```tsx
{
  isTyping && searchTerm.length >= 2 && !isSearching && (
    <div className="typing-indicator">
      <div className="dot animate-bounce"></div>
      <div
        className="dot animate-bounce"
        style={{ animationDelay: '0.1s' }}
      ></div>
      <div
        className="dot animate-bounce"
        style={{ animationDelay: '0.2s' }}
      ></div>
    </div>
  )
}
```

### Loading State

```tsx
{
  isSearching && (
    <div className="loading-state">
      <Loader2 className="animate-spin" />
      <span>Searching...</span>
    </div>
  )
}
```

### Error State

```tsx
{
  searchError && (
    <div className="error-state">
      <p>{searchError}</p>
    </div>
  )
}
```

## 🔍 Testing Commands

### Test Search API

```bash
curl "http://localhost:3000/api/bgg/search?query=Wingspan"
```

### Test Debounce

```typescript
// Type quickly and check console logs
// Should see cancelled requests
```

### Test Encoding

```bash
curl "http://localhost:3000/api/bgg/search?query=Sp%C4%81rnotie"
```

## 📝 Code Snippets

### Basic Search Implementation

```typescript
const debouncedSearch = useCallback(
  debounce(async (query: string) => {
    if (query.length < 2) return

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch(
        `/api/bgg/search?query=${encodeURIComponent(query)}`,
        {
          signal: abortControllerRef.current.signal,
        }
      )

      const data = await response.json()
      setSearchResults(data.results)
    } catch (error) {
      if (error.name === 'AbortError') return
      setSearchError(error.message)
    }
  }, 600),
  []
)
```

### State Management

```typescript
const [searchTerm, setSearchTerm] = useState('')
const [searchResults, setSearchResults] = useState([])
const [isSearching, setIsSearching] = useState(false)
const [isTyping, setIsTyping] = useState(false)
const [searchError, setSearchError] = useState(null)
const abortControllerRef = useRef(null)
```

## 🚨 Important Notes

1. **Always cancel previous requests** to prevent race conditions
2. **Use UTF-8 encoding** for international characters
3. **Respect BGG API rate limits** (5-15 second delays)
4. **Provide visual feedback** for all user actions
5. **Handle errors gracefully** with fallback options

## 📚 Related Files

- `app/list-game/page.tsx` - Main search implementation
- `lib/bgg-service.ts` - BGG API integration
- `app/api/bgg/search/route.ts` - Search API endpoint
- `docs/search-functionality.md` - Full documentation

---

_Quick reference for developers - see full docs for detailed explanations_
