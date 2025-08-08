// Cache Manager for BGG Service
// Orchestrates memory and database caches for optimal performance

import { MemoryCache } from './memory-cache'
import { DatabaseCache } from './database-cache'
import type { BGGSearchResult, BGGAPIMetadata, BGGGameDetails, SearchFilters } from '../types'

export class CacheManager {
  private memoryCache: MemoryCache
  private databaseCache: DatabaseCache

  constructor() {
    this.memoryCache = new MemoryCache()
    this.databaseCache = new DatabaseCache()
  }

  /**
   * Get cached search results (memory cache only)
   */
  getCachedSearch(query: string, filters?: SearchFilters): BGGSearchResult[] | null {
    return this.memoryCache.getCachedSearch(query, filters)
  }

  /**
   * Set cached search results (memory cache only)
   */
  setCachedSearch(query: string, results: BGGSearchResult[], searchTime: number, filters?: SearchFilters): void {
    this.memoryCache.setCachedSearch(query, results, searchTime, filters)
  }

  /**
   * Get cached metadata for multiple games (database cache)
   */
  async getCachedMetadata(gameIds: string[]): Promise<BGGAPIMetadata[]> {
    return this.databaseCache.getCachedMetadata(gameIds)
  }

  /**
   * Get cached game data for a single game (database cache)
   */
  async getCachedGameData(gameId: string): Promise<BGGGameDetails | null> {
    return this.databaseCache.getCachedGameData(gameId)
  }

  /**
   * Cache metadata for multiple games (database cache)
   */
  async cacheMetadataBatch(metadata: BGGAPIMetadata[]): Promise<void> {
    await this.databaseCache.cacheMetadataBatch(metadata)
  }

  /**
   * Cache game data for a single game (database cache)
   */
  async cacheGameData(gameDetails: BGGGameDetails): Promise<void> {
    await this.databaseCache.cacheGameData(gameDetails)
  }

  /**
   * Get cache statistics from both caches
   */
  async getCacheStats(): Promise<{
    memory: { size: number; hitRate: number; popularQueries: any[] }
    database: { total: number; expired: number; valid: number }
  }> {
    const memoryStats = this.memoryCache.getCacheStats()
    const databaseStats = await this.databaseCache.getCacheStats()
    
    return {
      memory: memoryStats,
      database: databaseStats
    }
  }

  /**
   * Get popular queries (memory cache)
   */
  getPopularQueries(): any[] {
    return this.memoryCache.getPopularQueries()
  }

  /**
   * Clear all caches
   */
  async clearAllCaches(): Promise<void> {
    this.memoryCache.clearCache()
    // Note: We don't clear database cache as it's persistent
  }

  /**
   * Clear search cache for specific query (memory cache)
   */
  clearSearchCacheForQuery(query: string, filters?: SearchFilters): void {
    this.memoryCache.clearSearchCacheForQuery(query, filters)
  }

  /**
   * Clean up expired cache entries (database cache)
   */
  async cleanupExpiredCache(): Promise<void> {
    await this.databaseCache.cleanupExpiredCache()
  }

  /**
   * Check if game is cached in database
   */
  async isGameCached(gameId: string): Promise<boolean> {
    return this.databaseCache.isCached(gameId)
  }

  /**
   * Get memory cache size
   */
  getMemoryCacheSize(): number {
    return this.memoryCache.getSize()
  }

  /**
   * Check if memory cache is empty
   */
  isMemoryCacheEmpty(): boolean {
    return this.memoryCache.isEmpty()
  }

  /**
   * Get memory cache keys for debugging
   */
  getMemoryCacheKeys(): string[] {
    return this.memoryCache.getCacheKeys()
  }

  /**
   * Warm up cache with popular queries
   */
  async warmUpCache(popularGameIds: string[]): Promise<void> {
    // Pre-fetch popular games into database cache
    const uncachedIds = []
    
    for (const gameId of popularGameIds) {
      const isCached = await this.isGameCached(gameId)
      if (!isCached) {
        uncachedIds.push(gameId)
      }
    }
    
    if (uncachedIds.length > 0) {
      console.log(`Warming up cache with ${uncachedIds.length} popular games`)
      // Note: This would require calling the BGG API to fetch the data
      // Implementation depends on the search service
    }
  }

  /**
   * Get cache hit rate for memory cache
   */
  getMemoryCacheHitRate(): number {
    const stats = this.memoryCache.getCacheStats()
    return stats.hitRate
  }

  /**
   * Get cache efficiency metrics
   */
  async getCacheEfficiency(): Promise<{
    memoryHitRate: number
    databaseHitRate: number
    totalMemorySize: number
    totalDatabaseSize: number
    averageResponseTime: number
  }> {
    const memoryStats = this.memoryCache.getCacheStats()
    const databaseStats = await this.databaseCache.getCacheStats()
    
    // Calculate database hit rate (this would need to be tracked separately)
    const databaseHitRate = 0 // Placeholder - would need to track actual hits
    
    return {
      memoryHitRate: memoryStats.hitRate,
      databaseHitRate,
      totalMemorySize: memoryStats.size,
      totalDatabaseSize: databaseStats.total,
      averageResponseTime: 0 // Placeholder - would need to track actual response times
    }
  }
}
