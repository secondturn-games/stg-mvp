// Memory Cache for BGG Service
// Handles in-memory caching of search results and popular queries

import type { SearchCacheEntry, PopularQuery, BGGSearchResult, SearchFilters } from '../types'

export class MemoryCache {
  private searchCache: Map<string, SearchCacheEntry> = new Map()
  private popularQueries: Map<string, PopularQuery> = new Map()
  
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes
  private readonly POPULAR_QUERY_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly MAX_CACHE_SIZE = 1000
  private readonly MAX_POPULAR_QUERIES = 100

  /**
   * Get cached search results
   */
  getCachedSearch(query: string, filters?: SearchFilters): BGGSearchResult[] | null {
    const cacheKey = this.buildCacheKey(query, filters)
    const entry = this.searchCache.get(cacheKey)
    
    if (!entry) return null
    
    const now = Date.now()
    if (now - entry.timestamp > this.CACHE_TTL) {
      this.searchCache.delete(cacheKey)
      return null
    }
    
    return entry.results
  }

  /**
   * Set cached search results
   */
  setCachedSearch(query: string, results: BGGSearchResult[], searchTime: number, filters?: SearchFilters): void {
    const cacheKey = this.buildCacheKey(query, filters)
    
    // Clean up old entries if cache is full
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      this.cleanupOldEntries()
    }
    
    this.searchCache.set(cacheKey, {
      query,
      results,
      timestamp: Date.now(),
      searchTime
    })
    
    // Update popular queries
    this.updatePopularQueries(query, searchTime)
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; hitRate: number; popularQueries: PopularQuery[] } {
    const totalQueries = this.popularQueries.size
    const totalSearches = Array.from(this.popularQueries.values()).reduce((sum, query) => sum + query.count, 0)
    const hitRate = totalSearches > 0 ? (totalSearches - totalQueries) / totalSearches : 0
    
    return {
      size: this.searchCache.size,
      hitRate,
      popularQueries: this.getPopularQueries()
    }
  }

  /**
   * Get popular queries
   */
  getPopularQueries(): PopularQuery[] {
    const now = Date.now()
    const validQueries: PopularQuery[] = []
    
    for (const [query, data] of this.popularQueries) {
      if (now - data.lastSearched <= this.POPULAR_QUERY_TTL) {
        validQueries.push({ ...data, query })
      } else {
        this.popularQueries.delete(query)
      }
    }
    
    return validQueries.sort((a, b) => b.count - a.count)
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.searchCache.clear()
    this.popularQueries.clear()
  }

  /**
   * Clear search cache for specific query
   */
  clearSearchCacheForQuery(query: string, filters?: SearchFilters): void {
    const cacheKey = this.buildCacheKey(query, filters)
    this.searchCache.delete(cacheKey)
  }

  /**
   * Build cache key from query and filters
   */
  private buildCacheKey(query: string, filters?: SearchFilters): string {
    const normalizedQuery = query.toLowerCase().trim()
    const filterString = filters ? JSON.stringify(filters) : ''
    return `${normalizedQuery}:${filterString}`
  }

  /**
   * Update popular queries tracking
   */
  private updatePopularQueries(query: string, searchTime: number): void {
    const normalizedQuery = query.toLowerCase().trim()
    const now = Date.now()
    
    const existing = this.popularQueries.get(normalizedQuery)
    if (existing) {
      existing.count++
      existing.lastSearched = now
      existing.avgSearchTime = (existing.avgSearchTime + searchTime) / 2
    } else {
      // Clean up old entries if we're at the limit
      if (this.popularQueries.size >= this.MAX_POPULAR_QUERIES) {
        this.cleanupOldPopularQueries()
      }
      
      this.popularQueries.set(normalizedQuery, {
        query: normalizedQuery,
        count: 1,
        lastSearched: now,
        avgSearchTime: searchTime
      })
    }
  }

  /**
   * Clean up old cache entries
   */
  private cleanupOldEntries(): void {
    const now = Date.now()
    const entriesToDelete: string[] = []
    
    for (const [key, entry] of this.searchCache) {
      if (now - entry.timestamp > this.CACHE_TTL) {
        entriesToDelete.push(key)
      }
    }
    
    entriesToDelete.forEach(key => this.searchCache.delete(key))
    
    // If still too many entries, remove oldest ones
    if (this.searchCache.size >= this.MAX_CACHE_SIZE) {
      const sortedEntries = Array.from(this.searchCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
      
      const toRemove = sortedEntries.slice(0, this.searchCache.size - this.MAX_CACHE_SIZE + 100)
      toRemove.forEach(([key]) => this.searchCache.delete(key))
    }
  }

  /**
   * Clean up old popular queries
   */
  private cleanupOldPopularQueries(): void {
    const now = Date.now()
    const queriesToDelete: string[] = []
    
    for (const [query, data] of this.popularQueries) {
      if (now - data.lastSearched > this.POPULAR_QUERY_TTL) {
        queriesToDelete.push(query)
      }
    }
    
    queriesToDelete.forEach(query => this.popularQueries.delete(query))
    
    // If still too many, remove least popular ones
    if (this.popularQueries.size >= this.MAX_POPULAR_QUERIES) {
      const sortedQueries = Array.from(this.popularQueries.entries())
        .sort((a, b) => a[1].count - b[1].count)
      
      const toRemove = sortedQueries.slice(0, this.popularQueries.size - this.MAX_POPULAR_QUERIES + 10)
      toRemove.forEach(([query]) => this.popularQueries.delete(query))
    }
  }

  /**
   * Get cache size
   */
  getSize(): number {
    return this.searchCache.size
  }

  /**
   * Check if cache is empty
   */
  isEmpty(): boolean {
    return this.searchCache.size === 0
  }

  /**
   * Get cache keys for debugging
   */
  getCacheKeys(): string[] {
    return Array.from(this.searchCache.keys())
  }
}
