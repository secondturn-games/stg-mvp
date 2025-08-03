import { createServerSupabaseClient } from '@/lib/db'
import { processDescription, decodeHtmlEntities, limitLines } from './utils'
import { parse } from 'csv-parse/sync'

// Add new interfaces for caching and performance monitoring
interface SearchCacheEntry {
  query: string
  results: BGGSearchResult[]
  timestamp: number
  searchTime: number
}

interface PopularQuery {
  query: string
  count: number
  lastSearched: number
  avgSearchTime: number
}

interface BGGSearchResult {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  type?: string
  alternateNames?: string[]
  abstracts_rank?: string
  cgs_rank?: string
  childrensgames_rank?: string
  familygames_rank?: string
  partygames_rank?: string
  strategygames_rank?: string
  thematic_rank?: string
  wargames_rank?: string
  thumbnail?: string // Add thumbnail field
  bggLink?: string // Add BGG link field
}

// New interface for BGG API search results
interface BGGAPISearchItem {
  id: string
  name: string
  type: string
  yearpublished?: string
}

// New interface for BGG API metadata
interface BGGAPIMetadata {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  thumbnail?: string
  image?: string
  alternateNames?: string[]
  type: string
  // Add missing fields for full game details
  minplayers?: string
  maxplayers?: string
  playingtime?: string
  minage?: string
  description?: string
  weight?: string
  mechanics?: string[]
  categories?: string[]
  versions?: BGGGameVersion[] // Add versions field
}

interface BGGGameDetails {
  id: string
  name: string
  yearpublished: string
  minplayers: string
  maxplayers: string
  playingtime: string
  minage: string
  description: string
  thumbnail: string
  image: string
  rating: string
  weight: string
  rank: string
  mechanics: string[]
  categories: string[]
  alternateNames: string[] // Add alternate names array
  versions?: BGGGameVersion[] // Add versions array
}

interface BGGGameVersion {
  id: string
  name: string
  yearpublished: string
  publisher: string
  language: string
  productcode: string
  thumbnail: string
  image: string
  width: string
  length: string
  depth: string
  weight: string
}

interface CSVGameData {
  id: string
  name: string
  yearpublished: string
  rank: string
  bayesaverage: string
  is_expansion: string
  abstracts_rank: string
  cgs_rank: string
  childrensgames_rank: string
  familygames_rank: string
  partygames_rank: string
  strategygames_rank: string
  thematic_rank: string
  wargames_rank: string
}

interface BGGSearchProps {
  onGameSelect: (game: BGGGameDetails | null) => void
  selectedGameId?: string
  gameType?: 'base-game' | 'expansion' | 'bundle' // Add game type prop
}

class BGGService {
  private csvData: CSVGameData[] | null = null
  private lastApiCall: number = 0 // Rate limiting
  
  // Add new caching and performance properties
  private searchCache: Map<string, SearchCacheEntry> = new Map()
  private popularQueries: Map<string, PopularQuery> = new Map()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes
  private readonly POPULAR_QUERY_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly MAX_CACHE_SIZE = 1000
  private readonly MAX_POPULAR_QUERIES = 100

  // Clear CSV cache for debugging
  clearCSVCache(): void {
    this.csvData = null
  }

  // Query normalization for better search matching
  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      // Remove punctuation but keep spaces
      .replace(/[^\w\s]/g, ' ')
      // Normalize Unicode (important for Baltic alphabets)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
  }

  // Enhanced fuzzy matching with multiple algorithms
  private calculateEnhancedSimilarity(str1: string, str2: string): number {
    const s1 = this.normalizeQuery(str1)
    const s2 = this.normalizeQuery(str2)
    
    // 1. Exact match gets highest score
    if (s1 === s2) return 1.0
    
    // 2. Contains match
    if (s1.includes(s2) || s2.includes(s1)) return 0.9
    
    // 3. Word-based similarity
    const words1 = s1.split(/\s+/)
    const words2 = s2.split(/\s+/)
    
    const commonWords = words1.filter(word1 => 
      words2.some(word2 => {
        // Exact word match
        if (word1 === word2) return true
        // Word contains other word
        if (word1.includes(word2) || word2.includes(word1)) return true
        // Levenshtein distance for typos (simple implementation)
        return this.levenshteinDistance(word1, word2) <= Math.min(word1.length, word2.length) * 0.3
      })
    )
    
    const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length)
    
    // 4. Character-based similarity (for partial matches)
    const charSimilarity = this.calculateCharacterSimilarity(s1, s2)
    
    // 5. Combine scores with weights
    return (wordSimilarity * 0.7) + (charSimilarity * 0.3)
  }

  // Simple Levenshtein distance for typo tolerance
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null))
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1, // deletion
          matrix[j - 1][i] + 1, // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        )
      }
    }
    
    return matrix[str2.length][str1.length]
  }

  // Character-based similarity for partial matches
  private calculateCharacterSimilarity(str1: string, str2: string): number {
    const chars1 = str1.split('')
    const chars2 = str2.split('')
    
    const commonChars = chars1.filter(char1 => chars2.includes(char1))
    return commonChars.length / Math.max(chars1.length, chars2.length)
  }

  // Cache management methods
  private getCachedSearch(query: string, filters?: { gameType?: 'base-game' | 'expansion' }): BGGSearchResult[] | null {
    const normalizedQuery = this.normalizeQuery(query)
    const cacheKey = filters?.gameType ? `${normalizedQuery}:${filters.gameType}` : normalizedQuery
    const cached = this.searchCache.get(cacheKey)
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_TTL) {
      console.log(`📦 Cache hit for query: "${query}" with filters: ${JSON.stringify(filters)} (${cached.searchTime}ms)`)
      console.log(`📦 Cached results: ${cached.results.map(r => `${r.id}: ${r.name} (${r.type})`).join(', ')}`)
      return cached.results
    }
    
    return null
  }

  // Public methods for monitoring and analytics
  getCacheStats(): { size: number; hitRate: number; popularQueries: PopularQuery[] } {
    const popularQueriesArray = Array.from(this.popularQueries.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    return {
      size: this.searchCache.size,
      hitRate: 0, // Would need to track hits/misses over time
      popularQueries: popularQueriesArray
    }
  }

  // Clear search cache to force fresh results (useful for testing)
  clearSearchCache(): void {
    this.searchCache.clear()
    console.log('🗑️ Search cache cleared')
  }

  // Clear search cache for a specific query and filter
  clearSearchCacheForQuery(query: string, filters?: { gameType?: 'base-game' | 'expansion' }): void {
    const normalizedQuery = this.normalizeQuery(query)
    const cacheKey = filters?.gameType ? `${normalizedQuery}:${filters.gameType}` : normalizedQuery
    const deleted = this.searchCache.delete(cacheKey)
    console.log(`🗑️ Search cache cleared for "${query}" with filters: ${JSON.stringify(filters)} - Deleted: ${deleted}`)
  }

  getPopularQueries(): PopularQuery[] {
    return Array.from(this.popularQueries.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  clearCache(): void {
    this.searchCache.clear()
    this.popularQueries.clear()
    console.log('🗑️ Search cache cleared')
  }

  private setCachedSearch(query: string, results: BGGSearchResult[], searchTime: number, filters?: { gameType?: 'base-game' | 'expansion' }): void {
    const normalizedQuery = this.normalizeQuery(query)
    const cacheKey = filters?.gameType ? `${normalizedQuery}:${filters.gameType}` : normalizedQuery
    
    // Clean up old cache entries if we're at capacity
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.searchCache.keys().next().value
      if (oldestKey) {
        this.searchCache.delete(oldestKey)
      }
    }
    
    this.searchCache.set(cacheKey, {
      query: normalizedQuery,
      results,
      timestamp: Date.now(),
      searchTime
    })
    
    // Update popular queries
    this.updatePopularQueries(query, searchTime)
  }

  private updatePopularQueries(query: string, searchTime: number): void {
    const normalizedQuery = this.normalizeQuery(query)
    const existing = this.popularQueries.get(normalizedQuery)
    
    if (existing) {
      existing.count++
      existing.lastSearched = Date.now()
      existing.avgSearchTime = (existing.avgSearchTime + searchTime) / 2
    } else {
      this.popularQueries.set(normalizedQuery, {
        query: normalizedQuery,
        count: 1,
        lastSearched: Date.now(),
        avgSearchTime: searchTime
      })
    }
    
    // Clean up old popular queries
    const cutoff = Date.now() - this.POPULAR_QUERY_TTL
    for (const [key, value] of this.popularQueries.entries()) {
      if (value.lastSearched < cutoff) {
        this.popularQueries.delete(key)
      }
    }
  }

  // Rate limiting: enforce 1-2s delay between API calls
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastApiCall
    
    // Adaptive rate limiting: faster for metadata calls, slower for search calls
    const minDelay = 500 // 500ms minimum between calls
    const searchDelay = 1000 // 1 second for search calls
    
    if (timeSinceLastCall < minDelay) {
      const delay = minDelay - timeSinceLastCall
      console.log(`⏳ Rate limiting: waiting ${delay}ms before next API call`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastApiCall = Date.now()
  }

  // Load CSV data for fallback
  private async loadCSVData(): Promise<CSVGameData[]> {
    if (this.csvData) return this.csvData

    try {
      // Try reading directly from filesystem first
      const fs = require('fs')
      const path = require('path')
      
      try {
        const csvPath = path.join(process.cwd(), 'public', 'boardgames_ranks.csv')
        const csvText = fs.readFileSync(csvPath, 'utf8')
        
        // Use csv-parse library for proper CSV parsing
        const records = parse(csvText, {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        })
        
        this.csvData = records
          .map((record: any) => ({
            id: record.id,
            name: record.name,
            yearpublished: record.yearpublished,
            rank: record.rank,
            bayesaverage: record.bayesaverage,
            is_expansion: record.is_expansion,
            abstracts_rank: record.abstracts_rank,
            cgs_rank: record.cgs_rank,
            childrensgames_rank: record.childrensgames_rank,
            familygames_rank: record.familygames_rank,
            partygames_rank: record.partygames_rank,
            strategygames_rank: record.strategygames_rank,
            thematic_rank: record.thematic_rank,
            wargames_rank: record.wargames_rank,
          }))
          .filter((game: CSVGameData) => game.id && game.name)
        
        // Debug: check for Märklin entry
        if (process.env.NODE_ENV === 'development') {
          const marklinGame = this.csvData.find(g => g.name.includes('Märklin'))
          if (marklinGame) {
            console.log('Found Märklin in CSV:', marklinGame.name)
            console.log('Märklin bytes:', Buffer.from(marklinGame.name, 'utf8').toString('hex'))
          }
        }

        return this.csvData
      } catch (fsError) {
        console.log('Filesystem read failed, falling back to HTTP:', (fsError as Error).message)
      }

      // Fallback to HTTP method
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const response = await fetch(`${baseUrl}/boardgames_ranks.csv`, {
        headers: {
          'Accept': 'text/csv; charset=utf-8',
        }
      })
      
      // Ensure we get the response as UTF-8
      const buffer = await response.arrayBuffer()
      const csvText = new TextDecoder('utf-8').decode(buffer)
      
      // Use csv-parse library for proper CSV parsing
      const records = parse(csvText, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      })
      
      this.csvData = records
        .map((record: any) => ({
          id: record.id,
          name: record.name,
          yearpublished: record.yearpublished,
          rank: record.rank,
          bayesaverage: record.bayesaverage,
          is_expansion: record.is_expansion,
          abstracts_rank: record.abstracts_rank,
          cgs_rank: record.cgs_rank,
          childrensgames_rank: record.childrensgames_rank,
          familygames_rank: record.familygames_rank,
          partygames_rank: record.partygames_rank,
          strategygames_rank: record.strategygames_rank,
          thematic_rank: record.thematic_rank,
          wargames_rank: record.wargames_rank,
        }))
        .filter((game: CSVGameData) => game.id && game.name)

      return this.csvData
    } catch (error) {
      console.error('Failed to load CSV data:', error)
      return []
    }
  }

  // Search games with BGG API first, fallback to current system
  async searchGames(query: string, filters?: {
    gameType?: 'base-game' | 'expansion'
  }): Promise<BGGSearchResult[]> {
    if (!query.trim()) return []

    const startTime = Date.now()
    const normalizedQuery = this.normalizeQuery(query)
    const searchFilters = {
      gameType: filters?.gameType || 'base-game'
    }
    
    try {
      console.log(`🔍 Starting search for: "${query}" (normalized: "${normalizedQuery}") with filters:`, searchFilters)
      
      // 1. Check local cache first (fastest)
      console.log(`🔍 Checking cache for query: "${query}"`)
      const cachedResults = this.getCachedSearch(query, searchFilters)
      if (cachedResults) {
        const searchTime = Date.now() - startTime
        console.log(`📦 Cache hit! Search completed in ${searchTime}ms`)
        return cachedResults
      }
      console.log(`🔍 Cache miss, proceeding with BGG API search`)
      
      // 2. Search BGG API
      try {
        console.log(`🌐 Searching BGG API...`)
        const bggResults = await this.searchBGG(query, searchFilters)
        
        if (bggResults.length > 0) {
          const searchTime = Date.now() - startTime
          console.log(`✅ BGG API search successful, found ${bggResults.length} results in ${searchTime}ms`)
          
          // FINAL SAFETY FILTER: Double-check game types
          const finalResults = bggResults.filter(result => {
            if (searchFilters.gameType === 'base-game') {
              return result.type === 'base-game'
            } else if (searchFilters.gameType === 'expansion') {
              return result.type === 'expansion'
            }
            return true
          })
          
          console.log(`🔍 Final safety filter: ${finalResults.length} results (requested: ${searchFilters.gameType})`)
          
          // Cache the results
          this.setCachedSearch(query, finalResults, searchTime, searchFilters)
          return finalResults
        }
      } catch (bggError) {
        console.error('❌ BGG API search failed:', bggError)
      }
      
      // 3. No fallback - return empty results
      console.log(`📊 No fallback search available, returning empty results`)
      
      const searchTime = Date.now() - startTime
      console.log(`✅ Search completed, found 0 results in ${searchTime}ms`)
      
      return []

    } catch (error) {
      const searchTime = Date.now() - startTime
      console.error(`❌ Search failed after ${searchTime}ms:`, error)
      throw error
    }
  }

  // Search using BGG API with metadata fetching and game type filtering
  private async searchBGG(query: string, filters?: {
    gameType?: 'base-game' | 'expansion'
  }): Promise<BGGSearchResult[]> {
    try {
      console.log(`🔍 BGG API: Starting search for "${query}" with filters:`, filters)
      
      // 1. Search BGG API for initial results (hybrid exact + fuzzy)
      const searchResults = await this.searchBGGAPI(query, filters)
      
      if (searchResults.length === 0) {
        console.log('📭 BGG API: No search results found')
        return []
      }

      // 2. METADATA CHECK: Get correct types for filtering
      // We need this because BGG search API doesn't properly distinguish base games vs expansions
      const topResults = searchResults.slice(0, 15) // Reduced to 15 for faster performance
      let metadata: BGGAPIMetadata[] = []
      
      // Try to get cached metadata first (much faster)
      const cachedMetadata = await this.getCachedMetadata(topResults.map(item => item.id))
      
      if (cachedMetadata.length > 0) {
        console.log(`🔍 BGG API: Found ${cachedMetadata.length} cached metadata entries for type checking`)
        metadata = cachedMetadata
      } else {
        // Only fetch from BGG API if we don't have cached data
        console.log(`🔍 BGG API: No cached metadata found, fetching for type checking`)
        metadata = await this.fetchGameMetadata(topResults.map(item => item.id))
      }
      
      // Debug: Log metadata sources
      console.log(`🔍 BGG API: Metadata sources - Fresh: ${metadata.length}`)
      
      // 3. Convert search results - TRUST THE METADATA API TYPE (corrected by inbound links)
      const metadataMap = new Map(metadata.map(m => [m.id, m]))
      
      const resultsWithCorrectTypes = searchResults.map(searchItem => {
        const meta = metadataMap.get(searchItem.id)
        
        // TRUST THE METADATA API TYPE: Use the type corrected by inbound link analysis
        // This is the true type from BGG's /xmlapi2/thing API
        const gameType = meta?.type === 'boardgameexpansion' ? 'expansion' : 'base-game'
        
        console.log(`🔍 Type mapping for ${searchItem.id}: ${searchItem.name} - Search API type: ${searchItem.type}, Metadata API type: ${meta?.type} -> Our type: ${gameType}`)
        
        return {
          id: searchItem.id,
          name: meta?.name || searchItem.name, // Use metadata name if available
          yearpublished: meta?.yearpublished || searchItem.yearpublished,
          rank: meta?.rank,
          bayesaverage: meta?.bayesaverage,
          type: gameType, // TRUST METADATA API TYPE (corrected by inbound links)
          alternateNames: meta?.alternateNames || [],
          thumbnail: meta?.thumbnail,
          bggLink: `https://boardgamegeek.com/boardgame/${searchItem.id}`,
          // Category ranks will be populated from CSV data if available
          abstracts_rank: undefined,
          cgs_rank: undefined,
          childrensgames_rank: undefined,
          familygames_rank: undefined,
          partygames_rank: undefined,
          strategygames_rank: undefined,
          thematic_rank: undefined,
          wargames_rank: undefined,
        }
      })
      
      // 4. FINAL FILTER: Ensure only the correct game type is returned
      const filteredResults = resultsWithCorrectTypes.filter(result => {
        // Filter by game type - TRUST THE SEARCH API RESULTS
        const typeMatch = filters?.gameType === 'base-game' 
          ? result.type === 'base-game'
          : filters?.gameType === 'expansion'
          ? result.type === 'expansion'
          : true
        
        // Debug: Log filtering decisions
        console.log(`🔍 Final filter for ${result.id} (${result.name}): requested="${filters?.gameType}", actual="${result.type}", match=${typeMatch}`)
        
        return typeMatch
      })
      
      console.log(`🔍 BGG API: After final filtering: ${filteredResults.length} results (requested: ${filters?.gameType})`)
      
      // 5. Apply ranking logic
      const rankedResults = this.rankSearchResults(filteredResults, query)
      
      console.log(`✅ BGG API: Search completed, found ${rankedResults.length} results`)
      return rankedResults
      
    } catch (error) {
      console.error('❌ BGG API search failed:', error)
      throw error
    }
  }





  // Search BGG API for initial results with hybrid exact + fuzzy approach
  private async searchBGGAPI(query: string, filters?: {
    gameType?: 'base-game' | 'expansion'
  }): Promise<BGGAPISearchItem[]> {
    await this.enforceRateLimit()
    
    try {
      console.log(`🔍 BGG API: Starting search for "${query}" with filters:`, filters)
      
      // Optimized search strategy based on query length
      const queryLength = query.trim().length
      
      if (queryLength >= 4) {
        // For longer queries (4+ chars): Try exact search first, then fuzzy
        console.log(`🔍 BGG API: Query length ${queryLength} >= 4, trying exact search first...`)
        const exactResults = await this.performBGGSearch(query, true, filters)
        
        if (exactResults.length > 0) {
          console.log(`🔍 BGG API: Found ${exactResults.length} exact matches, skipping fuzzy search`)
          return exactResults
        }
        
        console.log(`🔍 BGG API: No exact matches found, trying fuzzy search`)
        await this.enforceRateLimit()
        const fuzzyResults = await this.performBGGSearch(query, false, filters)
        
        console.log(`🔍 BGG API: Found 0 exact matches, ${fuzzyResults.length} fuzzy matches`)
        return fuzzyResults
      } else {
        // For short queries (< 4 chars): Skip exact search, go straight to fuzzy
        console.log(`🔍 BGG API: Query length ${queryLength} < 4, skipping exact search, using fuzzy only`)
        const fuzzyResults = await this.performBGGSearch(query, false, filters)
        
        console.log(`🔍 BGG API: Found ${fuzzyResults.length} fuzzy matches`)
        return fuzzyResults
      }
    } catch (error) {
      console.error('BGG API search failed:', error)
      throw error
    }
  }

  // Helper method to perform BGG search with specified exact parameter
  private async performBGGSearch(query: string, exact: boolean, filters?: {
    gameType?: 'base-game' | 'expansion'
  }): Promise<BGGAPISearchItem[]> {
    const exactParam = exact ? '1' : '0'
    
    // Determine which types to search for based on filters
    const searchTypes: string[] = []
    if (filters?.gameType === 'base-game') {
      searchTypes.push('boardgame')
    } else if (filters?.gameType === 'expansion') {
      searchTypes.push('boardgameexpansion')
    } else {
      // This should never happen with the switcher, but fallback to base game
      console.warn('⚠️ No game type filter specified, defaulting to base game')
      searchTypes.push('boardgame')
    }
    
    console.log(`🔍 BGG API: Searching for types:`, searchTypes, `(filter: ${filters?.gameType})`)
    
    // Build URLs for the types we want to search
    const urls = searchTypes.map(type => 
      `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=${type}&exact=${exactParam}`
    )
    
    console.log(`🔍 BGG API: URLs to search:`, urls)
    
    // Search for each type and combine results
    const allResults: BGGAPISearchItem[] = []
    
    for (const url of urls) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout
        
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'SecondTurnGames/1.0 (contact@secondturn.games)',
              'Accept': 'application/xml; charset=utf-8',
            },
            signal: controller.signal,
          })
          
          clearTimeout(timeoutId)

          if (!response.ok) {
            console.error(`BGG API error for URL ${url}: ${response.status}`)
            continue
          }

          // Use arrayBuffer() and TextDecoder for proper UTF-8 handling
          const buffer = await response.arrayBuffer()
          const decoder = new TextDecoder('utf-8')
          const xmlText = decoder.decode(buffer)
          
          const results = this.parseBGGSearchXML(xmlText)
          console.log(`🔍 BGG API: Found ${results.length} results for URL: ${url}`)
          
          allResults.push(...results)
          
          // Rate limiting between requests
          if (urls.length > 1) {
            await this.enforceRateLimit()
          }
          
        } catch (error) {
          clearTimeout(timeoutId)
          if (error instanceof Error && error.name === 'AbortError') {
            console.error(`BGG API timeout for URL ${url}: Request took too long`)
          } else {
            console.error(`BGG API error for URL ${url}:`, error)
          }
          continue
        }
      } catch (error) {
        console.error(`BGG API error for URL ${url}:`, error)
        continue
      }
    }
    
    // Remove duplicates
    const uniqueResults = allResults.filter((result, index, self) => 
      index === self.findIndex(r => r.id === result.id)
    )
    
    console.log(`🔍 BGG API: Combined ${allResults.length} results, ${uniqueResults.length} unique results`)
    
    // Debug: Show first few results with their types
    console.log(`🔍 BGG API: First 5 results:`, uniqueResults.slice(0, 5).map(r => ({
      id: r.id,
      name: r.name,
      type: r.type
    })))
    
    return uniqueResults
  }

  // Get cached metadata from Supabase (much faster than API calls)
  private async getCachedMetadata(gameIds: string[]): Promise<BGGAPIMetadata[]> {
    if (gameIds.length === 0) return []
    
    try {
      const supabase = createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from('games')
        .select('id, name, year_published, bgg_rank, bgg_rating, thumbnail, image, alternate_names, min_players, max_players, playing_time, min_age, description, bgg_weight, mechanics, categories, game_type, versions')
        .in('id', gameIds)
        .gte('updated_at', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()) // 60 days cache
      
      if (error) {
        console.error('Supabase cache query error:', error)
        return []
      }
      
      if (!data || data.length === 0) {
        return []
      }
      
      // Convert Supabase data to BGGAPIMetadata format
      return data.map((game: any) => {
        // Debug: Log game type mapping for troubleshooting
        console.log(`🔍 Cached metadata type mapping for ${game.id} (${game.name}): game_type="${game.game_type}" -> type="${game.game_type === 'expansion' ? 'boardgameexpansion' : 'boardgame'}"`)
        
        return {
          id: game.id,
          name: game.name,
          yearpublished: game.year_published?.toString(),
          rank: game.bgg_rank?.toString(),
          bayesaverage: game.bgg_rating?.toString(),
          thumbnail: game.thumbnail,
          image: game.image,
          alternateNames: game.alternate_names || [],
          type: game.game_type === 'expansion' ? 'boardgameexpansion' : 'boardgame',
          // Add new fields
          minplayers: game.min_players?.toString(),
          maxplayers: game.max_players?.toString(),
          playingtime: game.playing_time?.toString(),
          minage: game.min_age?.toString(),
          description: game.description,
          weight: game.bgg_weight?.toString(),
          mechanics: game.mechanics || [],
          categories: game.categories || [],
          versions: game.versions || []
        }
      })
      
    } catch (error) {
      console.error('Error fetching cached metadata:', error)
      return []
    }
  }

  // Fetch metadata for multiple games (batch request)
  private async fetchGameMetadata(gameIds: string[]): Promise<BGGAPIMetadata[]> {
    if (gameIds.length === 0) return []
    
    await this.enforceRateLimit()
    
    // BGG API allows max 20 IDs per request
    const batchSize = 20
    const batches = []
    
    for (let i = 0; i < gameIds.length; i += batchSize) {
      batches.push(gameIds.slice(i, i + batchSize))
    }
    
    const allMetadata: BGGAPIMetadata[] = []
    
    for (const batch of batches) {
      const bggUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${batch.join(',')}&stats=1&versions=1`
      
      try {
        const response = await fetch(bggUrl, {
          headers: {
            'User-Agent': 'SecondTurnGames/1.0 (contact@secondturn.games)',
            'Accept': 'application/xml; charset=utf-8',
          },
        })

        if (!response.ok) {
          console.error(`BGG API metadata error: ${response.status}`)
          continue
        }

        // Use arrayBuffer() and TextDecoder for proper UTF-8 handling
        const buffer = await response.arrayBuffer()
        const decoder = new TextDecoder('utf-8')
        const xmlText = decoder.decode(buffer)
        
        // Debug: Log a snippet of the XML response
        console.log(`🔍 BGG API response snippet for batch ${batch.join(',')}:`)
        console.log(xmlText.substring(0, 500) + '...')
        
        const metadata = this.parseBGGMetadataXML(xmlText)
        allMetadata.push(...metadata)
        
        // Add delay between batches
        if (batches.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      } catch (error) {
        console.error('BGG API metadata fetch failed:', error)
      }
    }
    
    return allMetadata
  }

  // Combine search results with metadata
  private combineSearchWithMetadata(searchResults: BGGAPISearchItem[], metadata: BGGAPIMetadata[]): BGGSearchResult[] {
    const metadataMap = new Map(metadata.map(m => [m.id, m]))
    
    const results = searchResults.map(searchItem => {
      const meta = metadataMap.get(searchItem.id)
      
      // CRITICAL: Use the metadata type as the source of truth (from thing API)
      // The search API doesn't properly distinguish between base games and expansions
      // The thing API provides the correct type information
      const gameType = meta?.type === 'boardgameexpansion' ? 'expansion' : 'base-game'
      
      // Debug: Log the type mapping for each item
      console.log(`🔍 Type mapping for ${searchItem.id}: ${searchItem.name} - Search type: ${searchItem.type}, Metadata type: ${meta?.type} -> Our type: ${gameType}`)
      
      return {
        id: searchItem.id,
        name: meta?.name || searchItem.name, // metadata name should be primary name
        yearpublished: meta?.yearpublished || searchItem.yearpublished,
        rank: meta?.rank,
        bayesaverage: meta?.bayesaverage,
        type: gameType, // Use metadata type as source of truth
        alternateNames: meta?.alternateNames || [],
        thumbnail: meta?.thumbnail,
        bggLink: `https://boardgamegeek.com/boardgame/${searchItem.id}`,
        // Category ranks will be populated from CSV data if available
        abstracts_rank: undefined,
        cgs_rank: undefined,
        childrensgames_rank: undefined,
        familygames_rank: undefined,
        partygames_rank: undefined,
        strategygames_rank: undefined,
        thematic_rank: undefined,
        wargames_rank: undefined,
      }
    })
    
    // Debug: Log the final types of results
    console.log(`🔍 Final combined results types:`, results.map(r => `${r.id}: ${r.name} (${r.type})`))
    
    return results
  }

  // Rank search results (preserving current priority system)
  private rankSearchResults(results: BGGSearchResult[], query: string): BGGSearchResult[] {
    const queryLower = query.toLowerCase()
    
    return results.sort((a, b) => {
      let aScore = 0
      let bScore = 0

      // 1. EXACT MATCH (1,000,000 points) - SAME AS CURRENT
      if (a.name.toLowerCase() === queryLower) aScore += 1000000
      if (b.name.toLowerCase() === queryLower) bScore += 1000000

      // 2. ALTERNATE NAME EXACT MATCH (800,000 points) - NEW FEATURE
      if (a.alternateNames?.some(name => name.toLowerCase() === queryLower)) aScore += 800000
      if (b.alternateNames?.some(name => name.toLowerCase() === queryLower)) bScore += 800000

      // 3. ENHANCED FUZZY SIMILARITY (0-1 scale * 50000) - IMPROVED
      aScore += this.calculateEnhancedSimilarity(a.name, query) * 50000
      bScore += this.calculateEnhancedSimilarity(b.name, query) * 50000

      // 4. ALTERNATE NAME ENHANCED FUZZY MATCH (additional similarity points) - IMPROVED
      const aAltSimilarity = Math.max(...(a.alternateNames?.map(name => 
        this.calculateEnhancedSimilarity(name, query)
      ) || [0]))
      const bAltSimilarity = Math.max(...(b.alternateNames?.map(name => 
        this.calculateEnhancedSimilarity(name, query)
      ) || [0]))
      
      aScore += aAltSimilarity * 25000 // Half weight for alternate names
      bScore += bAltSimilarity * 25000

      // 5. BASE GAME PRIORITY - REMOVED (not needed with switcher)
      // Base games and expansions are now treated equally since user chooses type

      // 6. BGG RANK (lower rank = higher score, max 1000) - SAME AS CURRENT
      if (a.rank && !isNaN(parseInt(a.rank)) && parseInt(a.rank) > 0) {
        aScore += Math.max(0, 1000 - parseInt(a.rank))
      }
      if (b.rank && !isNaN(parseInt(b.rank)) && parseInt(b.rank) > 0) {
        bScore += Math.max(0, 1000 - parseInt(b.rank))
      }

      // 7. RATING (higher rating = higher score, max 1000) - SAME AS CURRENT
      if (a.bayesaverage && !isNaN(parseFloat(a.bayesaverage)) && parseFloat(a.bayesaverage) > 0) {
        aScore += parseFloat(a.bayesaverage) * 100
      }
      if (b.bayesaverage && !isNaN(parseFloat(b.bayesaverage)) && parseFloat(b.bayesaverage) > 0) {
        bScore += parseFloat(b.bayesaverage) * 100
      }

      // 8. YEAR (newer games get slight bonus, max 100) - SAME AS CURRENT
      if (a.yearpublished && !isNaN(parseInt(a.yearpublished)) && parseInt(a.yearpublished) > 0) {
        aScore += Math.max(0, parseInt(a.yearpublished) - 1900) * 0.1
      }
      if (b.yearpublished && !isNaN(parseInt(b.yearpublished)) && parseInt(b.yearpublished) > 0) {
        bScore += Math.max(0, parseInt(b.yearpublished) - 1900) * 0.1
      }

      return bScore - aScore
    })
  }

  // Fuzzy similarity calculation (similar to PostgreSQL pg_trgm)
  private calculateSimilarity(str1: string, str2: string): number {
    const s1 = str1.toLowerCase()
    const s2 = str2.toLowerCase()
    
    // Simple trigram-like similarity (can be enhanced)
    const words1 = s1.split(/\s+/)
    const words2 = s2.split(/\s+/)
    
    const commonWords = words1.filter(word1 => 
      words2.some(word2 => word2.includes(word1) || word1.includes(word2))
    )
    
    return commonWords.length / Math.max(words1.length, words2.length)
  }

  // Parse BGG search XML
  private parseBGGSearchXML(xmlText: string): BGGAPISearchItem[] {
    const items: BGGAPISearchItem[] = []
    const seenIds = new Set<string>() // Track seen game IDs to avoid duplicates
    
    try {
      // Find all item elements
      const itemRegex = /<item[^>]*type="(boardgame|boardgameexpansion)"[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g
      let match
      
      while ((match = itemRegex.exec(xmlText)) !== null) {
        const gameType = match[1]
        const gameId = match[2]
        const itemContent = match[3]
        
        // Skip if we've already seen this game ID (avoid duplicates)
        if (seenIds.has(gameId)) {
          continue
        }
        
        // Parse name - look for both primary and alternate names
        const primaryNameMatch = itemContent.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
        const alternateNameMatch = itemContent.match(/<name[^>]*type="alternate"[^>]*value="([^"]*)"/)
        const yearMatch = itemContent.match(/<yearpublished[^>]*value="(\d{4})"/)

        // Use primary name if available, otherwise use alternate name
        const nameMatch = primaryNameMatch || alternateNameMatch

        if (nameMatch) {
          seenIds.add(gameId) // Mark this ID as seen
          items.push({
            id: gameId,
            name: decodeHtmlEntities(nameMatch[1]),
            type: gameType,
            yearpublished: yearMatch?.[1]
          })
        }
      }
    } catch (error) {
      console.error('Error parsing BGG search XML:', error)
    }

    return items.slice(0, 100) // Limit to 100 results to get more comprehensive results
  }

  // Parse BGG metadata XML
  private parseBGGMetadataXML(xmlText: string): BGGAPIMetadata[] {
    const items: BGGAPIMetadata[] = []
    
    try {
      // First, parse all versions from the entire XML response
      const allVersions = this.parseVersionsXML(xmlText)
      console.log(`🔍 Parsed ${allVersions.length} versions from XML response`)
      
      // Find all item elements
      const itemRegex = /<item[^>]*type="(boardgame|boardgameexpansion)"[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g
      let match
      
      while ((match = itemRegex.exec(xmlText)) !== null) {
        const gameType = match[1]
        const gameId = match[2]
        const itemContent = match[3]
        
        // Parse basic metadata
        const nameMatch = itemContent.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
        const yearMatch = itemContent.match(/<yearpublished[^>]*value="([^"]*)"/)
        
        // Parse rank - look for rank in statistics section
        const rankMatch = itemContent.match(/<rank[^>]*type="subtype"[^>]*value="([^"]*)"/)
        
        // Parse rating - look for average in statistics section
        const ratingMatch = itemContent.match(/<average[^>]*value="([^"]*)"/)
        
        // Parse weight - look for averageweight in statistics section
        const weightMatch = itemContent.match(/<averageweight[^>]*value="([^"]*)"/)
        
        // Debug: Log the raw XML content for statistics parsing
        console.log(`🔍 Debug XML for ${gameId}:`, itemContent.substring(0, 1000))
        console.log(`🔍 Rank match:`, rankMatch)
        console.log(`🔍 Rating match:`, ratingMatch)
        console.log(`🔍 Weight match:`, weightMatch)
        
        const thumbnailMatch = itemContent.match(/<thumbnail>(.*?)<\/thumbnail>/)
        const imageMatch = itemContent.match(/<image>(.*?)<\/image>/)

        // Parse new fields for full game details
        const minPlayersMatch = itemContent.match(/<minplayers[^>]*value="([^"]*)"/)
        const maxPlayersMatch = itemContent.match(/<maxplayers[^>]*value="([^"]*)"/)
        const playingTimeMatch = itemContent.match(/<playingtime[^>]*value="([^"]*)"/)
        const minAgeMatch = itemContent.match(/<minage[^>]*value="([^"]*)"/)
        const descriptionMatch = itemContent.match(/<description>(.*?)<\/description>/)

        // Parse mechanics
        const mechanics: string[] = []
        const mechanicsRegex = /<link[^>]*type="boardgamemechanic"[^>]*value="([^"]*)"[^>]*>/g
        let mechanicsMatch
        while ((mechanicsMatch = mechanicsRegex.exec(itemContent)) !== null) {
          mechanics.push(decodeHtmlEntities(mechanicsMatch[1]))
        }

        // Parse categories
        const categories: string[] = []
        const categoriesRegex = /<link[^>]*type="boardgamecategory"[^>]*value="([^"]*)"[^>]*>/g
        let categoriesMatch
        while ((categoriesMatch = categoriesRegex.exec(itemContent)) !== null) {
          categories.push(decodeHtmlEntities(categoriesMatch[1]))
        }

        // Parse alternate names with improved encoding handling
        const alternateNames: string[] = []
        const alternateNameRegex = /<name[^>]*type="alternate"[^>]*value="([^"]*)"[^>]*>/g
        let alternateNameMatch
        while ((alternateNameMatch = alternateNameRegex.exec(itemContent)) !== null) {
          const decodedName = decodeHtmlEntities(alternateNameMatch[1])
          alternateNames.push(decodedName)
        }

        // 🔍 CRITICAL: Check for inbound expansion links to determine true game type
        // Look for <link type="boardgameexpansion" inbound="true"/> or <link type="boardgameintegration" inbound="true"/>
        const hasInboundExpansionLink = itemContent.includes('<link type="boardgameexpansion" inbound="true"') || 
                                       itemContent.includes('<link type="boardgameintegration" inbound="true"')
        
        // Determine true game type based on inbound links
        let trueGameType: string
        if (gameType === 'boardgameexpansion') {
          trueGameType = 'boardgameexpansion' // Already marked as expansion
        } else if (hasInboundExpansionLink) {
          trueGameType = 'boardgameexpansion' // Has inbound expansion link = it's an expansion
          console.log(`🔍 ${gameId} (${nameMatch?.[1]}): Marked as boardgame but has inbound expansion link → TRUE TYPE: expansion`)
        } else {
          trueGameType = 'boardgame' // No inbound expansion link = true base game
          console.log(`🔍 ${gameId} (${nameMatch?.[1]}): No inbound expansion links → TRUE TYPE: base-game`)
        }

        // Find versions that belong to this game
        // Note: BGG doesn't directly link versions to games in the XML, so we'll include all versions
        // In a more sophisticated implementation, we might need to make separate API calls
        const gameVersions: BGGGameVersion[] = allVersions

        if (nameMatch) {
          const item = {
            id: gameId,
            name: decodeHtmlEntities(nameMatch[1]),
            yearpublished: yearMatch?.[1],
            rank: rankMatch?.[1],
            bayesaverage: ratingMatch?.[1],
            thumbnail: thumbnailMatch?.[1],
            image: imageMatch?.[1],
            alternateNames,
            type: trueGameType, // Use the corrected type based on inbound links
            
            // Debug: Log the type from metadata API
            // This should be the correct type from BGG's thing API
            // Add new fields
            minplayers: minPlayersMatch?.[1],
            maxplayers: maxPlayersMatch?.[1],
            playingtime: playingTimeMatch?.[1],
            minage: minAgeMatch?.[1],
            description: descriptionMatch?.[1] ? decodeHtmlEntities(descriptionMatch[1]) : undefined,
            weight: weightMatch?.[1],
            mechanics,
            categories,
            versions: gameVersions // Add versions field
          }
          
          // Debug logging
          console.log(`🔍 Parsed game ${gameId}: ${item.name}`)
          console.log(`  - Type from thing API: ${item.type}`)
          console.log(`  - Rank: ${item.rank || 'N/A'}`)
          console.log(`  - Rating: ${item.bayesaverage || 'N/A'}`)
          console.log(`  - Weight: ${item.weight || 'N/A'}`)
          console.log(`  - Versions: ${item.versions.length}`)
          
          // Debug: Show a snippet of the XML content for this game
          console.log(`  - XML content snippet: ${itemContent.substring(0, 200)}...`)
          
          items.push(item)
        }
      }
    } catch (error) {
      console.error('Error parsing BGG metadata XML:', error)
    }

    return items
  }



  // Note: Sorting is now handled by PostgreSQL search function
  // The search_boardgames function returns results already sorted by relevance score

  // Get game details - check cache first, then BGG API
  async getGameDetails(gameId: string): Promise<BGGGameDetails | null> {
    // First, check if we have valid cached data
    const cachedData = await this.getCachedGameData(gameId)
    if (cachedData) {
      console.log(`Using cached data for game ${gameId}`)
      return cachedData
    }

    // If no valid cache, try BGG API
    try {
      console.log(`Fetching fresh data from BGG API for game ${gameId}`)
      const bggDetails = await this.getBGGDetails(gameId)
      if (bggDetails) {
        // Cache the detailed data for future use (60 days expiry)
        await this.cacheGameData(bggDetails)
        return bggDetails
      }
    } catch (error) {
      console.warn('BGG API failed for game details, falling back to CSV:', error)
    }

    // Fallback to CSV data if BGG API fails
    return this.getCSVDetails(gameId)
  }

  // Get metadata for a specific game (for populating search results with details)
  async getGameMetadata(gameId: string): Promise<BGGAPIMetadata | null> {
    try {
      // Check cache first
      const cachedMetadata = await this.getCachedMetadata([gameId])
      if (cachedMetadata.length > 0) {
        console.log(`📦 Cache hit for metadata ${gameId}: ${cachedMetadata[0].name}`)
        return cachedMetadata[0]
      }

      // Fetch from BGG API
      console.log(`🌐 Fetching metadata for ${gameId} from BGG API`)
      const metadata = await this.fetchGameMetadata([gameId])
      
      if (metadata.length > 0) {
        // Cache the metadata
        await this.cacheMetadataBatch(metadata)
        return metadata[0]
      }

      return null
    } catch (error) {
      console.error(`❌ Error fetching metadata for ${gameId}:`, error)
      return null
    }
  }

  // Get cached game data if it exists and hasn't expired
  private async getCachedGameData(gameId: string): Promise<BGGGameDetails | null> {
    const supabase = createServerSupabaseClient()
    
    try {
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single()

      if (error || !data) {
        return null
      }

      // Check if cache has expired (60 days)
      const cacheExpiresAt = new Date(data.cache_expires_at)
      const now = new Date()
      
      if (cacheExpiresAt <= now) {
        console.log(`Cache expired for game ${gameId}, will fetch fresh data`)
        return null
      }

      // Return cached data in the expected format
      return {
        id: data.id,
        name: decodeHtmlEntities(data.name),
        yearpublished: data.year_published?.toString() || '',
        minplayers: data.min_players?.toString() || '',
        maxplayers: data.max_players?.toString() || '',
        playingtime: data.playing_time?.toString() || '',
        minage: data.min_age?.toString() || '',
        description: data.description || '',
        thumbnail: data.thumbnail || '',
        image: data.image || '',
        rating: data.bgg_rating?.toString() || '',
        weight: data.bgg_weight?.toString() || '',
        rank: data.bgg_rank?.toString() || '',
        mechanics: data.mechanics || [],
        categories: data.categories || [],
        alternateNames: data.alternate_names || [], // Return alternate names from cache
        versions: data.versions || [], // Return versions from cache
      }
    } catch (error) {
      console.error('Failed to get cached game data:', error)
      return null
    }
  }

  // Get details using BGG API
  private async getBGGDetails(gameId: string): Promise<BGGGameDetails | null> {
    await this.enforceRateLimit() // Enforce rate limit
    const bggUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&type=boardgame&stats=1&versions=1`
    
    const response = await fetch(bggUrl, {
      headers: {
        'User-Agent': 'SecondTurnGames/1.0 (contact@secondturn.games)',
        'Accept': 'application/xml; charset=utf-8',
      },
    })

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.status}`)
    }

    // Use arrayBuffer() and TextDecoder for proper UTF-8 handling
    const buffer = await response.arrayBuffer()
    const decoder = new TextDecoder('utf-8')
    const xmlText = decoder.decode(buffer)
    
    // Parse the main game details
    const gameDetails = this.parseGameXML(xmlText)
    if (gameDetails) {
      // Parse versions from the full XML response
      gameDetails.versions = this.parseVersionsXML(xmlText)
    }
    return gameDetails
  }

  // Get details using CSV data
  private async getCSVDetails(gameId: string): Promise<BGGGameDetails | null> {
    const csvData = await this.loadCSVData()
    const game = csvData.find(g => g.id === gameId)
    
    if (!game) return null

    return {
      id: game.id,
      name: game.name,
      yearpublished: game.yearpublished,
      minplayers: '',
      maxplayers: '',
      playingtime: '',
      minage: '',
      description: '',
      thumbnail: '',
      image: '',
      rating: game.bayesaverage,
      weight: '',
      rank: game.rank,
      mechanics: [],
      categories: [],
      alternateNames: [], // No alternate names in CSV
    }
  }

  // Parse BGG search XML
  private parseSearchXML(xmlText: string): BGGSearchResult[] {
    const items: BGGSearchResult[] = []
    
    try {
      // Find all item elements
      const itemRegex = /<item[^>]*type="(boardgame|boardgameexpansion)"[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g
      let match
      
      while ((match = itemRegex.exec(xmlText)) !== null) {
        const gameType = match[1]
        const gameId = match[2]
        const itemContent = match[3]
        
        // Parse all names (primary and alternate)
        const nameMatches = itemContent.match(/<name[^>]*type="([^"]*)"[^>]*value="([^"]*)"[^>]*>/g) || []
        const names: Array<{type: string, value: string}> = []
        
        for (const nameMatch of nameMatches) {
          const typeMatch = nameMatch.match(/type="([^"]*)"/)
          const valueMatch = nameMatch.match(/value="([^"]*)"/)
          
          if (typeMatch && valueMatch) {
            names.push({
              type: typeMatch[1],
              value: valueMatch[1]
            })
          }
        }

        // Find year published
        const yearMatch = itemContent.match(/<yearpublished[^>]*value="(\d{4})"/)

        // Find thumbnail
        const thumbnailMatch = itemContent.match(/<thumbnail>(.*?)<\/thumbnail>/)

        // Prioritize primary name, fallback to first alternate name
        let selectedName = names.find(n => n.type === 'primary')?.value || names[0]?.value

        if (selectedName) {
          // Include all names for search matching
          const allNames = names.map(n => decodeHtmlEntities(n.value))
          
          items.push({
            id: gameId,
            name: decodeHtmlEntities(selectedName),
            yearpublished: yearMatch?.[1],
            type: gameType === 'boardgameexpansion' ? 'expansion' : 'base-game',
            alternateNames: allNames.filter((_, index) => names[index].type === 'alternate'), // Store alternate names separately
            thumbnail: thumbnailMatch?.[1] || undefined
          })
        }
      }
    } catch (error) {
      console.error('Error parsing BGG search XML:', error)
    }

    return items.slice(0, 15) // Increase limit to 15 for better variety
  }

  // Parse BGG game XML
  private parseGameXML(xmlText: string): BGGGameDetails | null {
    try {
      const idMatch = xmlText.match(/<item[^>]*id="(\d+)"/)
      const nameMatch = xmlText.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
      const yearMatch = xmlText.match(/<yearpublished[^>]*value="([^"]*)"/)
      const minPlayersMatch = xmlText.match(/<minplayers[^>]*value="([^"]*)"/)
      const maxPlayersMatch = xmlText.match(/<maxplayers[^>]*value="([^"]*)"/)
      const playingTimeMatch = xmlText.match(/<playingtime[^>]*value="([^"]*)"/)
      const minAgeMatch = xmlText.match(/<minage[^>]*value="([^"]*)"/)
      const descriptionMatch = xmlText.match(/<description>([\s\S]*?)<\/description>/)
      const thumbnailMatch = xmlText.match(/<thumbnail>(.*?)<\/thumbnail>/)
      const imageMatch = xmlText.match(/<image>(.*?)<\/image>/)
      const ratingMatch = xmlText.match(/<average[^>]*value="([^"]*)"/)
      const weightMatch = xmlText.match(/<averageweight[^>]*value="([^"]*)"/)
      const rankMatch = xmlText.match(/<rank[^>]*type="subtype"[^>]*value="([^"]*)"/)

      const mechanicMatches = xmlText.match(/<link[^>]*type="boardgamemechanic"[^>]*value="([^"]*)"[^>]*>/g) || []
      const categoryMatches = xmlText.match(/<link[^>]*type="boardgamecategory"[^>]*value="([^"]*)"[^>]*>/g) || []

      const mechanics = mechanicMatches
        .map((match) => {
          const valueMatch = match.match(/value="([^"]*)"/)
          return valueMatch ? valueMatch[1] : ""
        })
        .filter(Boolean)

      const categories = categoryMatches
        .map((match) => {
          const valueMatch = match.match(/value="([^"]*)"/)
          return valueMatch ? valueMatch[1] : ""
        })
        .filter(Boolean)

      // Extract alternate names
      const alternateNames: string[] = [];
      const alternateNameRegex = /<name[^>]*type="alternate"[^>]*value="([^"]*)"[^>]*>/g;
      let alternateNameMatch;
      while ((alternateNameMatch = alternateNameRegex.exec(xmlText)) !== null) {
        alternateNames.push(decodeHtmlEntities(alternateNameMatch[1]));
      }

      console.log(`Parsed ${alternateNames.length} alternate names for game ${idMatch?.[1]}`);

      if (!idMatch || !nameMatch) {
        return null
      }

      // Process description: remove HTML tags, decode entities, and limit to 5 lines
      let description = descriptionMatch?.[1] || ""
      
      description = description
        .replace(/<[^>]*>/g, "") // Remove HTML tags
        .trim()
      
      // Decode HTML entities first, then use utility function for line limiting
      description = decodeHtmlEntities(description)
      
      // Additional manual decoding for common HTML entities that might not be handled properly
      description = description
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#10;/g, '\n')  // Newline
        .replace(/&#13;/g, '\r')  // Carriage return
        .replace(/&#9;/g, '\t')   // Tab
        .replace(/&mdash;/g, '—') // Em dash
        .replace(/&ndash;/g, '–') // En dash
        .replace(/&hellip;/g, '…') // Ellipsis
        .replace(/&nbsp;/g, ' ')  // Non-breaking space
      
      description = limitLines(description, 5)

      return {
        id: idMatch[1],
        name: decodeHtmlEntities(nameMatch[1]),
        yearpublished: yearMatch?.[1] || "",
        minplayers: minPlayersMatch?.[1] || "",
        maxplayers: maxPlayersMatch?.[1] || "",
        playingtime: playingTimeMatch?.[1] || "",
        minage: minAgeMatch?.[1] || "",
        description: description,
        thumbnail: thumbnailMatch?.[1] || "",
        image: imageMatch?.[1] || "",
        rating: ratingMatch?.[1] || "",
        weight: weightMatch?.[1] || "",
        rank: rankMatch?.[1] || "",
        mechanics: mechanics.slice(0, 5),
        categories: categories.slice(0, 3),
        alternateNames: alternateNames, // Add alternate names to the result
      }
    } catch (error) {
      console.error("Error parsing game XML:", error)
      return null
    }
  }

  // Parse version information from BGG XML
  private parseVersionsXML(xmlText: string): BGGGameVersion[] {
    const versions: BGGGameVersion[] = []
    
    try {
      // Find all version items - look for items with type="boardgameversion"
      const versionRegex = /<item[^>]*type="boardgameversion"[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g
      let match
      
      while ((match = versionRegex.exec(xmlText)) !== null) {
        const versionId = match[1]
        const versionContent = match[2]
        
        // Parse version details
        const nameMatch = versionContent.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
        const yearMatch = versionContent.match(/<yearpublished[^>]*value="([^"]*)"/)
        const productCodeMatch = versionContent.match(/<productcode[^>]*value="([^"]*)"/)
        const widthMatch = versionContent.match(/<width[^>]*value="([^"]*)"/)
        const lengthMatch = versionContent.match(/<length[^>]*value="([^"]*)"/)
        const depthMatch = versionContent.match(/<depth[^>]*value="([^"]*)"/)
        const weightMatch = versionContent.match(/<weight[^>]*value="([^"]*)"/)
        const thumbnailMatch = versionContent.match(/<thumbnail>(.*?)<\/thumbnail>/)
        const imageMatch = versionContent.match(/<image>(.*?)<\/image>/)
        
        // Parse publisher - get the first publisher
        const publisherMatches = versionContent.match(/<link[^>]*type="boardgamepublisher"[^>]*value="([^"]*)"/g)
        let publisher = ""
        if (publisherMatches && publisherMatches.length > 0) {
          const firstPublisherMatch = publisherMatches[0].match(/value="([^"]*)"/)
          publisher = firstPublisherMatch ? firstPublisherMatch[1] : ""
        }
        
        // Parse language - get the first language
        const languageMatches = versionContent.match(/<link[^>]*type="language"[^>]*value="([^"]*)"/g)
        let language = ""
        if (languageMatches && languageMatches.length > 0) {
          const firstLanguageMatch = languageMatches[0].match(/value="([^"]*)"/)
          language = firstLanguageMatch ? firstLanguageMatch[1] : ""
        }
        
        if (nameMatch) {
          const version = {
            id: versionId,
            name: decodeHtmlEntities(nameMatch[1]),
            yearpublished: yearMatch?.[1] || "",
            publisher: publisher,
            language: language,
            productcode: productCodeMatch?.[1] || "",
            thumbnail: thumbnailMatch?.[1] || "",
            image: imageMatch?.[1] || "",
            width: widthMatch?.[1] || "",
            length: lengthMatch?.[1] || "",
            depth: depthMatch?.[1] || "",
            weight: weightMatch?.[1] || "",
          }
          
          versions.push(version)
        }
      }
    } catch (error) {
      console.error("Error parsing versions XML:", error)
    }
    
    return versions
  }

  // Cache metadata batch in database (for search results)
  private async cacheMetadataBatch(metadata: BGGAPIMetadata[]): Promise<void> {
    if (metadata.length === 0) return
    
    console.log(`💾 Caching ${metadata.length} metadata entries in Supabase...`)
    
    const supabase = createServerSupabaseClient()
    
    try {
      const cacheData = metadata.map(meta => {
        const cacheItem = {
          id: meta.id,
          name: meta.name,
          year_published: meta.yearpublished ? parseInt(meta.yearpublished) : null,
          min_players: meta.minplayers ? parseInt(meta.minplayers) : null,
          max_players: meta.maxplayers ? parseInt(meta.maxplayers) : null,
          playing_time: meta.playingtime ? parseInt(meta.playingtime) : null,
          min_age: meta.minage ? parseInt(meta.minage) : null,
          description: meta.description,
          thumbnail: meta.thumbnail,
          image: meta.image,
          bgg_rating: meta.bayesaverage ? parseFloat(meta.bayesaverage) : null,
          bgg_weight: meta.weight ? parseFloat(meta.weight) : null,
          bgg_rank: meta.rank ? parseInt(meta.rank) : null,
          game_type: meta.type === 'boardgameexpansion' ? 'expansion' : 'base-game',
          mechanics: meta.mechanics || [],
          categories: meta.categories || [],
          alternate_names: meta.alternateNames || [],
          versions: meta.versions || [], // Add versions field
          updated_at: new Date().toISOString(),
          cache_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // Cache for 60 days
        }
        
        // Debug logging for each item being cached
        console.log(`💾 Caching game ${meta.id}: ${meta.name}`)
        console.log(`  - BGG Rating: ${cacheItem.bgg_rating || 'N/A'}`)
        console.log(`  - BGG Weight: ${cacheItem.bgg_weight || 'N/A'}`)
        console.log(`  - BGG Rank: ${cacheItem.bgg_rank || 'N/A'}`)
        console.log(`  - Versions: ${cacheItem.versions.length}`)
        
        return cacheItem
      })
      
      const { data, error } = await supabase
        .from('games')
        .upsert(cacheData)
      
      if (error) {
        console.error('Failed to cache metadata batch:', error)
      } else {
        console.log(`✅ Successfully cached ${metadata.length} metadata entries in Supabase`)
      }
    } catch (error) {
      console.error('Failed to cache metadata batch:', error)
    }
  }

  // Cache game data in database
  async cacheGameData(gameDetails: BGGGameDetails): Promise<void> {
    console.log(`Attempting to cache game data for ${gameDetails.id}: ${gameDetails.name}`)
    console.log(`Alternate names count: ${gameDetails.alternateNames?.length || 0}`)
    console.log(`Versions count: ${gameDetails.versions?.length || 0}`)
    
    const supabase = createServerSupabaseClient()
    
    try {
      const cacheData = {
        id: gameDetails.id,
        name: decodeHtmlEntities(gameDetails.name),
        year_published: gameDetails.yearpublished ? parseInt(gameDetails.yearpublished) : null,
        min_players: gameDetails.minplayers ? parseInt(gameDetails.minplayers) : null,
        max_players: gameDetails.maxplayers ? parseInt(gameDetails.maxplayers) : null,
        playing_time: gameDetails.playingtime ? parseInt(gameDetails.playingtime) : null,
        min_age: gameDetails.minage ? parseInt(gameDetails.minage) : null,
        description: gameDetails.description,
        thumbnail: gameDetails.thumbnail,
        image: gameDetails.image,
        bgg_rating: gameDetails.rating ? parseFloat(gameDetails.rating) : null,
        bgg_weight: gameDetails.weight ? parseFloat(gameDetails.weight) : null,
        bgg_rank: gameDetails.rank ? parseInt(gameDetails.rank) : null,
        mechanics: gameDetails.mechanics,
        categories: gameDetails.categories,
        alternate_names: gameDetails.alternateNames, // Cache alternate names
        versions: gameDetails.versions || [], // Cache version information
        cache_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // Cache for 60 days
      }
      
      console.log(`Cache data prepared, attempting upsert...`)
      console.log(`Cache data keys: ${Object.keys(cacheData).join(', ')}`)
      
      const { data, error } = await supabase
        .from('games')
        .upsert(cacheData)
      
      if (error) {
        console.error('Failed to cache game data:', error)
        console.error('Error details:', error.message, error.details, error.hint)
      } else {
        console.log(`Successfully cached game data for ${gameDetails.id}`)
        console.log(`Upsert result:`, data)
      }
    } catch (error) {
      console.error('Failed to cache game data:', error)
      console.error('Error type:', typeof error)
      console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    }
  }

  // Clean up expired cache entries
  async cleanupExpiredCache(): Promise<void> {
    const supabase = createServerSupabaseClient()
    
    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .lt('cache_expires_at', new Date().toISOString())

      if (error) {
        console.error('Failed to cleanup expired cache:', error)
      } else {
        console.log('Expired cache entries cleaned up successfully')
      }
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error)
    }
  }

  // Note: Sorting is now handled by PostgreSQL search function
  // The search_boardgames function returns results already sorted by relevance score
}

// Create a singleton instance
const bggService = new BGGService()

export { bggService, BGGService }
export type { BGGSearchResult } 