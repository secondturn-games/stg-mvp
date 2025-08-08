// Search Parser for BGG Service
// Handles parsing BGG search XML responses using modern XML parsing

import { parseXML, validateXML, cleanXML, decodeHtmlEntities } from './xml-parser'
import type { BGGAPISearchItem } from '../types'

export class SearchParser {
  /**
   * Parse BGG search XML response
   */
  parseSearchXML(xmlText: string): BGGAPISearchItem[] {
    if (!validateXML(xmlText)) {
      console.error('Invalid XML structure for search response')
      return []
    }
    
    const cleanedXml = cleanXML(xmlText)
    const parsed = parseXML(cleanedXml)
    if (!parsed) return []
    
    const items: BGGAPISearchItem[] = []
    
    // Navigate to items
    const itemsData = parsed.items?.item
    if (!itemsData) return items
    
    // Handle both single item and array of items
    const itemArray = Array.isArray(itemsData) ? itemsData : [itemsData]
    
    itemArray.forEach((item: any) => {
      const parsedItem = this.parseSearchItem(item)
      if (parsedItem) {
        items.push(parsedItem)
      }
    })
    
    return items
  }

  /**
   * Parse individual search item
   */
  private parseSearchItem(item: any): BGGAPISearchItem | null {
    try {
      const id = String(item.id || '')
      if (!id) return null
      
      // Extract name from item
      let name = ''
      if (item.name) {
        const nameElements = Array.isArray(item.name) ? item.name : [item.name]
        const primaryName = nameElements.find((n: any) => n.type === 'primary')
        name = primaryName ? String(primaryName.value || '') : String(nameElements[0]?.value || '')
      }
      if (!name) return null
      
      // Decode HTML entities in the name
      name = decodeHtmlEntities(name)
      
      // Extract year published
      const yearpublished = item.yearpublished?.value || item.yearpublished || ''
      
      // Extract type
      const type = item.type || 'boardgame'
      
      return {
        id,
        name: name.trim(),
        type: type,
        yearpublished: yearpublished ? String(yearpublished).trim() : undefined
      }
      
    } catch (error) {
      console.error('Error parsing search item:', error)
      return null
    }
  }

  /**
   * Parse search results with additional metadata
   */
  parseSearchResultsWithMetadata(xmlText: string): BGGAPISearchItem[] {
    if (!validateXML(xmlText)) {
      console.error('Invalid XML structure for search results with metadata')
      return []
    }
    
    const cleanedXml = cleanXML(xmlText)
    const parsed = parseXML(cleanedXml)
    if (!parsed) return []
    
    const items: BGGAPISearchItem[] = []
    
    // Navigate to items
    const itemsData = parsed.items?.item
    if (!itemsData) return items
    
    // Handle both single item and array of items
    const itemArray = Array.isArray(itemsData) ? itemsData : [itemsData]
    
    itemArray.forEach((item: any) => {
      // Skip version items
      if (item.type === 'boardgameversion') {
        return
      }
      
      const parsedItem = this.parseSearchItemWithMetadata(item)
      if (parsedItem) {
        items.push(parsedItem)
      }
    })
    
    return items
  }

  /**
   * Parse search item with additional metadata
   */
  private parseSearchItemWithMetadata(item: any): BGGAPISearchItem | null {
    try {
      const id = String(item.id || '')
      if (!id) return null
      
      // Extract name from item
      let name = ''
      if (item.name) {
        const nameElements = Array.isArray(item.name) ? item.name : [item.name]
        const primaryName = nameElements.find((n: any) => n.type === 'primary')
        name = primaryName ? String(primaryName.value || '') : String(nameElements[0]?.value || '')
      }
      if (!name) return null
      
      // Decode HTML entities in the name
      name = decodeHtmlEntities(name)
      
      // Extract year published
      const yearpublished = item.yearpublished?.value || item.yearpublished || ''
      
      // Extract type
      const type = item.type || 'boardgame'
      
      return {
        id,
        name: name.trim(),
        type: type,
        yearpublished: yearpublished ? String(yearpublished).trim() : undefined
      }
      
    } catch (error) {
      console.error('Error parsing search item with metadata:', error)
      return null
    }
  }

  /**
   * Parse search results from CSV data (fallback)
   */
  parseCSVSearchResults(csvData: any[]): BGGAPISearchItem[] {
    return csvData
      .filter(item => item && item.id && item.name)
      .map(item => ({
        id: item.id.toString(),
        name: item.name,
        type: item.is_expansion === '1' ? 'boardgameexpansion' : 'boardgame',
        yearpublished: item.yearpublished || undefined
      }))
  }

  /**
   * Validate search results
   */
  validateSearchResults(results: BGGAPISearchItem[]): boolean {
    if (!Array.isArray(results)) return false
    
    return results.every(result => 
      result && 
      typeof result.id === 'string' && 
      typeof result.name === 'string' &&
      result.id.length > 0 &&
      result.name.length > 0
    )
  }

  /**
   * Filter search results by type
   */
  filterByType(results: BGGAPISearchItem[], type: 'boardgame' | 'boardgameexpansion'): BGGAPISearchItem[] {
    return results.filter(item => item.type === type)
  }

  /**
   * Sort search results by relevance
   */
  sortByRelevance(results: BGGAPISearchItem[], query: string): BGGAPISearchItem[] {
    const normalizedQuery = query.toLowerCase().trim()
    
    return results.sort((a, b) => {
      const aName = a.name.toLowerCase()
      const bName = b.name.toLowerCase()
      
      // Exact match gets highest priority
      if (aName === normalizedQuery && bName !== normalizedQuery) return -1
      if (bName === normalizedQuery && aName !== normalizedQuery) return 1
      
      // Starts with query gets second priority
      const aStartsWith = aName.startsWith(normalizedQuery)
      const bStartsWith = bName.startsWith(normalizedQuery)
      if (aStartsWith && !bStartsWith) return -1
      if (bStartsWith && !aStartsWith) return 1
      
      // Contains query gets third priority
      const aContains = aName.includes(normalizedQuery)
      const bContains = bName.includes(normalizedQuery)
      if (aContains && !bContains) return -1
      if (bContains && !aContains) return 1
      
      // Alphabetical order for tie-breaking
      return aName.localeCompare(bName)
    })
  }

  /**
   * Limit search results
   */
  limitResults(results: BGGAPISearchItem[], limit: number = 50): BGGAPISearchItem[] {
    return results.slice(0, limit)
  }

  /**
   * Remove duplicates from search results
   */
  removeDuplicates(results: BGGAPISearchItem[]): BGGAPISearchItem[] {
    const seen = new Set<string>()
    return results.filter(item => {
      if (seen.has(item.id)) {
        return false
      }
      seen.add(item.id)
      return true
    })
  }
}
