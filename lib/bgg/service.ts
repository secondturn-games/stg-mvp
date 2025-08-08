// Main BGG Service
// Orchestrates all modules and provides the public API

import { BGGAPIClient } from './api/client'
import { CacheManager } from './cache/cache-manager'
import { SearchEngine } from './search/search-engine'
import { MetadataParser } from './parsers/metadata-parser'
import { DEFAULT_BGG_CONFIG } from './api/endpoints'
import type { 
  BGGSearchResult, 
  BGGGameDetails, 
  BGGAPIMetadata, 
  SearchFilters,
  CacheStats 
} from './types'

export class BGGService {
  private apiClient: BGGAPIClient
  private cacheManager: CacheManager
  private searchEngine: SearchEngine
  private metadataParser: MetadataParser

  constructor(config = DEFAULT_BGG_CONFIG) {
    this.apiClient = new BGGAPIClient(config)
    this.cacheManager = new CacheManager()
    this.searchEngine = new SearchEngine(this.apiClient, this.cacheManager)
    this.metadataParser = new MetadataParser()
  }

  /**
   * Search for games
   */
  async searchGames(query: string, filters?: SearchFilters): Promise<BGGSearchResult[]> {
    if (!query || query.trim().length === 0) {
      return []
    }

    try {
      return await this.searchEngine.searchGames(query.trim(), filters)
    } catch (error) {
      console.error('Search failed:', error)
      return []
    }
  }

  /**
   * Get game details by ID
   */
  async getGameDetails(gameId: string, gameType: 'boardgame' | 'boardgameexpansion' = 'boardgame'): Promise<BGGGameDetails | null> {
    if (!gameId) return null

    try {
      // Check cache first
      const cachedData = await this.cacheManager.getCachedGameData(gameId)
      if (cachedData) {
        const missingCore = !cachedData.minplayers || !cachedData.maxplayers || !cachedData.playingtime || !cachedData.minage || !cachedData.yearpublished
        const missingVersions = !cachedData.versions || cachedData.versions.length <= 1
        const missingStats = !cachedData.rating || !cachedData.weight || !cachedData.rank
        const missingLinks = !cachedData.mechanics || cachedData.mechanics.length === 0 || !cachedData.categories || cachedData.categories.length === 0

        if (!missingCore && !missingVersions && !missingStats && !missingLinks) {
          console.log(`🎯 Cache hit for game details: ${gameId}`)
          return cachedData
        }

        // Try to refresh incomplete cached data
        try {
          const xmlResponse = await this.apiClient.getGameDetails(gameId, gameType)
          const metadata = this.metadataParser.parseGameDetailsXML(xmlResponse)
          if (metadata) {
            const refreshed: BGGGameDetails = {
              id: metadata.id,
              name: metadata.name,
              yearpublished: metadata.yearpublished || cachedData.yearpublished || '',
              minplayers: metadata.minplayers || cachedData.minplayers || '',
              maxplayers: metadata.maxplayers || cachedData.maxplayers || '',
              playingtime: metadata.playingtime || cachedData.playingtime || '',
              minage: metadata.minage || cachedData.minage || '',
              description: metadata.description || cachedData.description || '',
              thumbnail: metadata.thumbnail || cachedData.thumbnail || '',
              image: metadata.image || cachedData.image || '',
              rating: metadata.bayesaverage || cachedData.rating || '',
              weight: metadata.weight || cachedData.weight || '',
              rank: metadata.rank || cachedData.rank || '',
              mechanics: metadata.mechanics || cachedData.mechanics || [],
              categories: metadata.categories || cachedData.categories || [],
              alternateNames: metadata.alternateNames || cachedData.alternateNames || [],
              versions: (metadata.versions && metadata.versions.length > 0) ? metadata.versions : (cachedData.versions || []),
              type: metadata.type || cachedData.type
            }
            await this.cacheManager.cacheGameData(refreshed)
            return refreshed
          }
        } catch (e) {
          console.warn(`Failed to refresh cached game details for ${gameId}:`, e)
          return cachedData
        }

        return cachedData
      }

      console.log(`🔍 Fetching game details for: ${gameId}`)

      // Fetch from BGG API
      const xmlResponse = await this.apiClient.getGameDetails(gameId, gameType)
      const metadata = this.metadataParser.parseGameDetailsXML(xmlResponse)
      
      if (!metadata) {
        console.error(`Failed to parse game details for ${gameId}`)
        return null
      }

      // Convert to BGGGameDetails format
      const gameDetails: BGGGameDetails = {
        id: metadata.id,
        name: metadata.name,
        yearpublished: metadata.yearpublished || '',
        minplayers: metadata.minplayers || '',
        maxplayers: metadata.maxplayers || '',
        playingtime: metadata.playingtime || '',
        minage: metadata.minage || '',
        description: metadata.description || '',
        thumbnail: metadata.thumbnail || '',
        image: metadata.image || '',
        rating: metadata.bayesaverage || '',
        weight: metadata.weight || '',
        rank: metadata.rank || '',
        mechanics: metadata.mechanics || [],
        categories: metadata.categories || [],
        alternateNames: metadata.alternateNames || [],
        versions: metadata.versions || [],
        type: metadata.type
      }

      // Cache the result
      await this.cacheManager.cacheGameData(gameDetails)

      return gameDetails

    } catch (error) {
      console.error(`Failed to get game details for ${gameId}:`, error)
      return null
    }
  }

  /**
   * Get game metadata by ID
   */
  async getGameMetadata(gameId: string): Promise<BGGAPIMetadata | null> {
    if (!gameId) return null

    try {
      // Check cache first
      const cachedMetadata = await this.cacheManager.getCachedMetadata([gameId])
      if (cachedMetadata.length > 0) {
        return cachedMetadata[0]
      }

      // Fetch from BGG API
      const xmlResponse = await this.apiClient.getGameDetails(gameId)
      const metadata = this.metadataParser.parseGameDetailsXML(xmlResponse)
      
      if (metadata) {
        // Cache the result
        await this.cacheManager.cacheMetadataBatch([metadata])
      }

      return metadata

    } catch (error) {
      console.error(`Failed to get game metadata for ${gameId}:`, error)
      return null
    }
  }

  /**
   * Get game versions by ID
   */
  async getGameVersions(gameId: string): Promise<Array<{
    id: string
    name: string
    yearpublished: string
    publishers: string[]
    languages: string[]
    productcode: string
    thumbnail: string
    image: string
    width: string
    length: string
    depth: string
    weight: string
  }>> {
    if (!gameId) return []

    try {
      const xmlResponse = await this.apiClient.getGameVersions(gameId)
      return this.metadataParser.parseVersionsXML(xmlResponse)
    } catch (error) {
      console.error(`Failed to get game versions for ${gameId}:`, error)
      return []
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<CacheStats> {
    const stats = await this.cacheManager.getCacheStats()
    return {
      size: stats.memory.size,
      hitRate: stats.memory.hitRate,
      popularQueries: stats.memory.popularQueries
    }
  }

  /**
   * Get popular queries
   */
  getPopularQueries(): any[] {
    return this.cacheManager.getPopularQueries()
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    await this.cacheManager.clearAllCaches()
  }

  /**
   * Clear search cache for specific query
   */
  clearSearchCacheForQuery(query: string, filters?: SearchFilters): void {
    this.cacheManager.clearSearchCacheForQuery(query, filters)
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    await this.cacheManager.cleanupExpiredCache()
  }

  /**
   * Check if game is cached
   */
  async isGameCached(gameId: string): Promise<boolean> {
    return this.cacheManager.isGameCached(gameId)
  }

  /**
   * Get memory cache size
   */
  getMemoryCacheSize(): number {
    return this.cacheManager.getMemoryCacheSize()
  }

  /**
   * Check if memory cache is empty
   */
  isMemoryCacheEmpty(): boolean {
    return this.cacheManager.isMemoryCacheEmpty()
  }

  /**
   * Get memory cache keys for debugging
   */
  getMemoryCacheKeys(): string[] {
    return this.cacheManager.getMemoryCacheKeys()
  }

  /**
   * Update API configuration
   */
  updateConfig(newConfig: Partial<typeof DEFAULT_BGG_CONFIG>): void {
    this.apiClient.updateConfig(newConfig)
  }

  /**
   * Get current API configuration
   */
  getConfig() {
    return this.apiClient.getConfig()
  }

  /**
   * Warm up cache with popular games
   */
  async warmUpCache(popularGameIds: string[]): Promise<void> {
    await this.cacheManager.warmUpCache(popularGameIds)
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
    return this.cacheManager.getCacheEfficiency()
  }
}

// Export a singleton instance
export const bggService = new BGGService()
