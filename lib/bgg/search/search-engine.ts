// Search Engine for BGG Service
// Main search logic and orchestration

import { BGGAPIClient } from '../api/client'
import { CacheManager } from '../cache/cache-manager'
import { SearchParser } from '../parsers/search-parser'
import { MetadataParser } from '../parsers/metadata-parser'
import { calculateEnhancedSimilarity } from '../utils/similarity'
import { extractLinks } from '../parsers/xml-parser'
import type { 
  BGGSearchResult, 
  BGGAPIMetadata, 
  BGGAPISearchItem, 
  SearchFilters 
} from '../types'

export class SearchEngine {
  private apiClient: BGGAPIClient
  private cacheManager: CacheManager
  private searchParser: SearchParser
  private metadataParser: MetadataParser

  constructor(apiClient: BGGAPIClient, cacheManager: CacheManager) {
    this.apiClient = apiClient
    this.cacheManager = cacheManager
    this.searchParser = new SearchParser()
    this.metadataParser = new MetadataParser()
  }

  /**
   * Main search method
   */
  async searchGames(query: string, filters?: SearchFilters): Promise<BGGSearchResult[]> {
    const startTime = Date.now()
    
    // Check memory cache first
    const cachedResults = this.cacheManager.getCachedSearch(query, filters)
    if (cachedResults) {
      console.log(`🎯 Cache hit for query: "${query}"`)
      return cachedResults
    }

    console.log(`🔍 Searching BGG for: "${query}"`)
    
    try {
      // Perform BGG API search (includes type correction)
      const searchResults = await this.performBGGSearch(query, filters)
      
      // Fetch metadata for filtered results only
      const metadata = await this.fetchMetadataForResults(searchResults)
      
      // Combine and rank results
      const combinedResults = this.combineSearchWithMetadata(searchResults, metadata)
      
      // Final filter: ensure expansions are filtered out when searching for base games
      const filteredResults = filters?.gameType === 'base-game' 
        ? combinedResults.filter(result => result.type !== 'boardgameexpansion')
        : combinedResults
      
      const rankedResults = this.rankSearchResults(filteredResults, query)
      
      // Cache results
      const searchTime = Date.now() - startTime
      this.cacheManager.setCachedSearch(query, rankedResults, searchTime, filters)
      
      console.log(`✅ Search completed in ${searchTime}ms, found ${rankedResults.length} results`)
      return rankedResults
      
    } catch (error) {
      console.error(`❌ Search failed for query "${query}":`, error)
      throw error
    }
  }

  /**
   * Perform BGG API search
   */
  private async performBGGSearch(query: string, filters?: SearchFilters): Promise<BGGAPISearchItem[]> {
    const gameType = this.getGameTypeForSearch(filters)

    const qlen = query.trim().length
    let results: BGGAPISearchItem[] = []

    if (qlen >= 4) {
      // Exact first
      results = await this.searchBGGAPI(query, true, gameType)
      if (results.length > 0) return results
      // Fuzzy fallback
      results = await this.searchBGGAPI(query, false, gameType)
    } else {
      // Short queries: skip exact per docs, go fuzzy directly
      results = await this.searchBGGAPI(query, false, gameType)
    }

    // Second-stage type correction using metadata inbound link analysis
    if (results.length > 0 && (gameType === 'boardgame' || gameType === 'boardgameexpansion')) {
      const ids = results.slice(0, 15).map(r => r.id)
      try {
        const xml = await this.apiClient.getBatchMetadata(ids)
        const metas = this.metadataParser.parseMetadataXML(xml)
        const metaById = new Map(metas.map(m => [m.id, m]))

        const beforeCount = results.length
        results = results.filter(r => {
          const m = metaById.get(r.id)
          if (!m) return false
          
          // Use the metadata type directly (it already includes inbound link analysis)
          const isExpansion = m.type === 'boardgameexpansion'
          const targetIsExpansion = gameType === 'boardgameexpansion'
          const shouldKeep = targetIsExpansion ? isExpansion : !isExpansion
          
          if (!shouldKeep) {
            console.log(`🔍 Type correction: filtering out ${r.id} (${r.name}) - search type: ${r.type}, metadata type: ${m.type}, target: ${gameType}`)
          }
          
          return shouldKeep
        })
        const afterCount = results.length
        if (beforeCount !== afterCount) {
          console.log(`🔍 Type correction: filtered ${beforeCount - afterCount} results (${beforeCount} -> ${afterCount})`)
        }
      } catch (e) {
        console.warn('Type correction skipped due to metadata error:', e)
      }
    }

    return results
  }

  /**
   * Search BGG API with specific parameters
   */
  private async searchBGGAPI(
    query: string,
    exact: boolean,
    gameType: 'boardgame' | 'boardgameexpansion'
  ): Promise<BGGAPISearchItem[]> {
    try {
      const xmlResponse = await this.apiClient.searchGames(query, gameType, exact)
      const searchItems = this.searchParser.parseSearchXML(xmlResponse)

      if (gameType) {
        return searchItems.filter(item => item.type === gameType)
      }

      return searchItems
    } catch (error) {
      console.error('BGG API search failed:', error)
      return []
    }
  }

  /**
   * Fetch metadata for search results
   */
  private async fetchMetadataForResults(searchResults: BGGAPISearchItem[]): Promise<BGGAPIMetadata[]> {
    if (searchResults.length === 0) return []
    
    // Get top 15 results for metadata
    const topResults = searchResults.slice(0, 15)
    const gameIds = topResults.map(item => item.id)
    
    // Check cache first
    const cachedMetadata = await this.cacheManager.getCachedMetadata(gameIds)
    const cachedIds = new Set(cachedMetadata.map(meta => meta.id))
    const uncachedIds = gameIds.filter(id => !cachedIds.has(id))
    
    let allMetadata = [...cachedMetadata]
    
    // Fetch uncached metadata from BGG API
    if (uncachedIds.length > 0) {
      try {
        const xmlResponse = await this.apiClient.getBatchMetadata(uncachedIds)
        const newMetadata = this.metadataParser.parseMetadataXML(xmlResponse)
        
        // Cache new metadata
        if (newMetadata.length > 0) {
          await this.cacheManager.cacheMetadataBatch(newMetadata)
          allMetadata.push(...newMetadata)
        }
        
      } catch (error) {
        console.error('Failed to fetch metadata for uncached games:', error)
      }
    }
    
    return allMetadata
  }

  /**
   * Combine search results with metadata
   */
  private combineSearchWithMetadata(
    searchResults: BGGAPISearchItem[], 
    metadata: BGGAPIMetadata[]
  ): BGGSearchResult[] {
    const metadataMap = new Map(metadata.map(meta => [meta.id, meta]))
    
    return searchResults
      .map(item => {
        const meta = metadataMap.get(item.id)
        
        return {
          id: item.id,
          name: item.name,
          yearpublished: item.yearpublished,
          rank: meta?.rank,
          bayesaverage: meta?.bayesaverage,
          type: meta?.type || item.type, // Use metadata type if available, fallback to search type
          alternateNames: meta?.alternateNames || [],
          thumbnail: meta?.thumbnail,
          bggLink: `https://boardgamegeek.com/boardgame/${item.id}`
        }
      })
  }

  /**
   * Rank search results by relevance
   */
  private rankSearchResults(results: BGGSearchResult[], query: string): BGGSearchResult[] {
    return results
      .map(result => ({
        ...result,
        score: this.calculateResultScore(result, query)
      }))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
  }

  /**
   * Calculate relevance score for a search result
   */
  private calculateResultScore(result: BGGSearchResult, query: string): number {
    let score = 0
    
    // Exact name match (highest priority)
    if (result.name.toLowerCase() === query.toLowerCase()) {
      score += 1000000
    }
    
    // Enhanced similarity score
    const similarity = calculateEnhancedSimilarity(result.name, query)
    score += similarity * 50000
    
    // Base game priority (if filtering is not applied)
    if (result.type === 'boardgame') {
      score += 10000
    }
    
    // BGG rank bonus (lower rank = higher score)
    if (result.rank && result.rank !== '0') {
      const rank = parseInt(result.rank)
      if (!isNaN(rank)) {
        score += Math.max(0, 1000 - rank)
      }
    }
    
    // Rating bonus
    if (result.bayesaverage && result.bayesaverage !== '0') {
      const rating = parseFloat(result.bayesaverage)
      if (!isNaN(rating)) {
        score += rating * 100
      }
    }
    
    // Year bonus (newer games get slight bonus)
    if (result.yearpublished && result.yearpublished !== '0') {
      const year = parseInt(result.yearpublished)
      if (!isNaN(year)) {
        score += Math.max(0, year - 1900) * 0.1
      }
    }
    
    return score
  }

  /**
   * Get game type for search based on filters
   */
  private getGameTypeForSearch(filters?: SearchFilters): 'boardgame' | 'boardgameexpansion' {
    if (!filters) return 'boardgame'
    
    switch (filters.gameType) {
      case 'expansion':
        return 'boardgameexpansion'
      case 'base-game':
      default:
        return 'boardgame'
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats() {
    return this.cacheManager.getCacheStats()
  }

  /**
   * Clear search cache
   */
  clearSearchCache(): void {
    this.cacheManager.clearAllCaches()
  }

  /**
   * Clear cache for specific query
   */
  clearCacheForQuery(query: string, filters?: SearchFilters): void {
    this.cacheManager.clearSearchCacheForQuery(query, filters)
  }
}
