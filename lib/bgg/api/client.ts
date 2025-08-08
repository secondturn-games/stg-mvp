// BGG API Client
// Handles all HTTP requests to the BGG API

import { parseXML } from '../parsers/xml-parser'
import type { BGGAPIConfig } from '../types'

export class BGGAPIClient {
  private config: BGGAPIConfig
  private lastApiCall: number = 0

  constructor(config: BGGAPIConfig) {
    this.config = config
  }

  /**
   * Make a GET request to BGG API
   */
  async get(endpoint: string, params?: Record<string, string>): Promise<string> {
    await this.enforceRateLimit()
    
    const url = this.buildUrl(endpoint, params)
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'application/xml; charset=utf-8',
        },
      })

      if (!response.ok) {
        throw new Error(`BGG API error: ${response.status} ${response.statusText}`)
      }

      // Use arrayBuffer() and TextDecoder for proper UTF-8 handling
      const buffer = await response.arrayBuffer()
      const decoder = new TextDecoder('utf-8')
      return decoder.decode(buffer)
      
    } catch (error) {
      console.error(`BGG API request failed for ${url}:`, error)
      throw error
    }
  }

  /**
   * Build URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.config.baseUrl)
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value)
        }
      })
    }
    
    return url.toString()
  }

  /**
   * Enforce rate limiting between API calls
   */
  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const timeSinceLastCall = now - this.lastApiCall
    const minDelay = this.config.rateLimitDelay
    
    if (timeSinceLastCall < minDelay) {
      const delay = minDelay - timeSinceLastCall
      await new Promise(resolve => setTimeout(resolve, delay))
    }
    
    this.lastApiCall = Date.now()
  }

  /**
   * Search for games using BGG API
   */
  async searchGames(query: string, gameType?: 'boardgame' | 'boardgameexpansion', exact?: boolean): Promise<string> {
    const params: Record<string, string> = {
      query: query,
      type: gameType || 'boardgame'
    }
    if (exact) params.exact = '1'
    
    return this.get('/xmlapi2/search', params)
  }

  /**
   * Get game details using BGG API
   */
  async getGameDetails(gameId: string, gameType: 'boardgame' | 'boardgameexpansion' = 'boardgame'): Promise<string> {
    const params: Record<string, string> = {
      id: gameId,
      stats: '1',
      versions: '1'
    }
    
    return this.get('/xmlapi2/thing', params)
  }

  /**
   * Get game versions using BGG API
   */
  async getGameVersions(gameId: string): Promise<string> {
    const params: Record<string, string> = {
      id: gameId,
      versions: '1'
    }
    
    return this.get('/xmlapi2/thing', params)
  }

  /**
   * Get metadata for multiple games (batch request)
   */
  async getBatchMetadata(gameIds: string[]): Promise<string> {
    const batchSize = this.config.maxBatchSize
    const batches = []
    
    for (let i = 0; i < gameIds.length; i += batchSize) {
      batches.push(gameIds.slice(i, i + batchSize))
    }
    
    const allResponses: string[] = []
    
    for (const batch of batches) {
      const params: Record<string, string> = {
        id: batch.join(','),
        stats: '1',
        versions: '1'
      }
      
      const response = await this.get('/xmlapi2/thing', params)
      allResponses.push(response)
    }
    
    // Combine all responses into a single XML
    return this.combineXMLResponses(allResponses)
  }

  /**
   * Combine multiple XML responses into one
   */
  private combineXMLResponses(responses: string[]): string {
    if (responses.length === 1) {
      return responses[0]
    }
    
    // Extract items from each response and combine them using modern XML parsing
    const allItems: any[] = []
    
    responses.forEach(response => {
      const parsed = parseXML(response)
      if (parsed?.items?.item) {
        const items = Array.isArray(parsed.items.item) ? parsed.items.item : [parsed.items.item]
        allItems.push(...items)
      }
    })
    
    // Convert back to XML string
    const itemsXml = allItems.map(item => {
      // Convert item object back to XML string
      const itemXml = this.objectToXml(item, 'item')
      return itemXml
    }).join('\n')
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<items termsofuse="https://boardgamegeek.com/xmlapi/termsofuse">
${itemsXml}
</items>`
  }

  /**
   * Convert object back to XML string (simplified)
   */
  private objectToXml(obj: any, tagName: string): string {
    if (typeof obj === 'string') {
      return `<${tagName}>${obj}</${tagName}>`
    }
    
    if (typeof obj === 'object' && obj !== null) {
      const attributes: string[] = []
      const children: string[] = []
      
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'id' || key === 'type') {
          attributes.push(`${key}="${value}"`)
        } else if (Array.isArray(value)) {
          value.forEach(item => {
            children.push(this.objectToXml(item, key))
          })
        } else if (typeof value === 'object' && value !== null) {
          children.push(this.objectToXml(value, key))
        } else if (value !== undefined && value !== null) {
          children.push(`<${key}>${value}</${key}>`)
        }
      }
      
      const attrStr = attributes.length > 0 ? ` ${attributes.join(' ')}` : ''
      const childrenStr = children.join('')
      
      return `<${tagName}${attrStr}>${childrenStr}</${tagName}>`
    }
    
    return `<${tagName}>${obj}</${tagName}>`
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<BGGAPIConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  /**
   * Get current configuration
   */
  getConfig(): BGGAPIConfig {
    return { ...this.config }
  }
}
