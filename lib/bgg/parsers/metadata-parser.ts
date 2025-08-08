// Metadata Parser for BGG Service
// Handles parsing BGG metadata XML responses using modern XML parsing

import { 
  parseXML,
  extractText, 
  extractStats, 
  extractLinks, 
  extractNames, 
  extractVersions,
  validateXML, 
  cleanXML
} from './xml-parser'
import type { BGGAPIMetadata } from '../types'

export class MetadataParser {
  /**
   * Parse BGG metadata XML response
   */
  parseMetadataXML(xmlText: string): BGGAPIMetadata[] {
    if (!validateXML(xmlText)) {
      console.error('Invalid XML structure for metadata response')
      return []
    }
    
    const cleanedXml = cleanXML(xmlText)
    const parsed = parseXML(cleanedXml)
    if (!parsed) return []
    
    const metadata: BGGAPIMetadata[] = []
    
    // Navigate to items
    const itemsData = parsed.items?.item
    if (!itemsData) return metadata
    
    // Handle both single item and array of items
    const itemArray = Array.isArray(itemsData) ? itemsData : [itemsData]
    
    itemArray.forEach((item: any) => {
      // Skip version items - only process boardgame and boardgameexpansion items
      if (item.type === 'boardgameversion') {
        return
      }
      
      const parsedItem = this.parseMetadataItem(item)
      if (parsedItem) {
        metadata.push(parsedItem)
      }
    })
    
    return metadata
  }

  /**
   * Parse individual metadata item
   */
  private parseMetadataItem(item: any): BGGAPIMetadata | null {
    try {
      const id = String(item.id || '')
      if (!id) return null
      
      const searchType = item.type
      if (!searchType || (searchType !== 'boardgame' && searchType !== 'boardgameexpansion')) {
        return null
      }
      
      // Extract names (primary and alternate) from parsed object
      const names = this.extractNamesFromObject(item)
      if (!names.primary) return null
      
      // Extract statistics from parsed object
      const stats = this.extractStatsFromObject(item)
      
      // Extract basic information
      const yearpublished = item.yearpublished?.value || item.yearpublished || ''
      const minplayers = item.minplayers?.value || item.minplayers || ''
      const maxplayers = item.maxplayers?.value || item.maxplayers || ''
      const playingtime = item.playingtime?.value || item.playingtime || ''
      const minage = item.minage?.value || item.minage || ''
      const description = item.description || ''
      const thumbnail = item.thumbnail || ''
      const image = item.image || ''
      
      // Extract links for mechanics and categories from parsed object
      const mechanics = this.extractLinksFromObject(item, 'boardgamemechanic').map(link => link.value)
      const categories = this.extractLinksFromObject(item, 'boardgamecategory').map(link => link.value)
      
      // Inbound link analysis for true type classification
      const inboundLinks = this.extractLinksFromObject(item).filter(l => (l.type === 'boardgameexpansion' || l.type === 'boardgameintegration') && !!l.inbound)
      const hasInboundExpansion = inboundLinks.length > 0
      const trueType = hasInboundExpansion ? 'boardgameexpansion' : (searchType === 'boardgameexpansion' ? 'boardgameexpansion' : 'boardgame')
      
      // Extract versions if available from parsed object
      const versions = this.extractVersionsFromObject(item)
      
      return {
        id,
        name: names.primary,
        yearpublished: yearpublished ? String(yearpublished).trim() : undefined,
        rank: stats.rank || undefined,
        bayesaverage: stats.bayesaverage || undefined,
        thumbnail: thumbnail || undefined,
        image: image || undefined,
        alternateNames: names.alternates,
        type: trueType,
        minplayers: minplayers ? String(minplayers).trim() : undefined,
        maxplayers: maxplayers ? String(maxplayers).trim() : undefined,
        playingtime: playingtime ? String(playingtime).trim() : undefined,
        minage: minage ? String(minage).trim() : undefined,
        description: description || undefined,
        weight: stats.weight || undefined,
        mechanics,
        categories,
        versions,
        hasInboundExpansionLink: hasInboundExpansion
      }
      
    } catch (error) {
      console.error('Error parsing metadata item:', error)
      return null
    }
  }

  /**
   * Parse game details XML response
   */
  parseGameDetailsXML(xmlText: string): BGGAPIMetadata | null {
    if (!validateXML(xmlText)) {
      console.error('Invalid XML structure for game details response')
      return null
    }
    
    const cleanedXml = cleanXML(xmlText)
    const parsed = parseXML(cleanedXml)
    if (!parsed) return null
    
    // Find the main game item (not version items) - can be boardgame or boardgameexpansion
    const itemsData = parsed.items?.item
    if (!itemsData) return null
    
    const itemArray = Array.isArray(itemsData) ? itemsData : [itemsData]
    const mainGame = itemArray.find((item: any) => item.type === 'boardgame' || item.type === 'boardgameexpansion')
    
    if (!mainGame) return null
    
    const base = this.parseMetadataItem(mainGame)
    if (!base) return null

    // IMPORTANT: versions are outside the inner item; parse from full XML
    const versions = extractVersions(cleanedXml)

    // IMPORTANT: stats are also parsed from the full XML to ensure we get them
    const stats = extractStats(cleanedXml)
    const mechanics = extractLinks(cleanedXml, 'boardgamemechanic').map(link => link.value)
    const categories = extractLinks(cleanedXml, 'boardgamecategory').map(link => link.value)

    return {
      ...base,
      bayesaverage: stats.bayesaverage || base.bayesaverage,
      weight: stats.weight || base.weight,
      rank: stats.rank || base.rank,
      mechanics: (mechanics && mechanics.length > 0) ? mechanics : base.mechanics,
      categories: (categories && categories.length > 0) ? categories : base.categories,
      versions: (versions && versions.length > 0) ? versions : base.versions
    }
  }

  /**
   * Parse versions XML response
   */
  parseVersionsXML(xmlText: string): Array<{
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
  }> {
    if (!validateXML(xmlText)) {
      console.error('Invalid XML structure for versions response')
      return []
    }
    
    return extractVersions(cleanXML(xmlText))
  }

  /**
   * Validate metadata
   */
  validateMetadata(metadata: BGGAPIMetadata): boolean {
    if (!metadata) return false
    
    // Check required fields
    if (!metadata.id || !metadata.name || !metadata.type) {
      return false
    }
    
    // Check type validity
    if (metadata.type !== 'boardgame' && metadata.type !== 'boardgameexpansion') {
      return false
    }
    
    return true
  }

  /**
   * Filter metadata by type
   */
  filterByType(metadata: BGGAPIMetadata[], type: 'boardgame' | 'boardgameexpansion'): BGGAPIMetadata[] {
    return metadata.filter(item => item.type === type)
  }

  /**
   * Sort metadata by rank
   */
  sortByRank(metadata: BGGAPIMetadata[]): BGGAPIMetadata[] {
    return metadata.sort((a, b) => {
      const rankA = a.rank ? parseInt(a.rank) : Infinity
      const rankB = b.rank ? parseInt(b.rank) : Infinity
      
      if (isNaN(rankA) && isNaN(rankB)) return 0
      if (isNaN(rankA)) return 1
      if (isNaN(rankB)) return -1
      
      return rankA - rankB
    })
  }

  /**
   * Sort metadata by rating
   */
  sortByRating(metadata: BGGAPIMetadata[]): BGGAPIMetadata[] {
    return metadata.sort((a, b) => {
      const ratingA = a.bayesaverage ? parseFloat(a.bayesaverage) : 0
      const ratingB = b.bayesaverage ? parseFloat(b.bayesaverage) : 0
      
      if (isNaN(ratingA) && isNaN(ratingB)) return 0
      if (isNaN(ratingA)) return 1
      if (isNaN(ratingB)) return -1
      
      return ratingB - ratingA // Higher rating first
    })
  }

  /**
   * Sort metadata by year
   */
  sortByYear(metadata: BGGAPIMetadata[]): BGGAPIMetadata[] {
    return metadata.sort((a, b) => {
      const yearA = a.yearpublished ? parseInt(a.yearpublished) : 0
      const yearB = b.yearpublished ? parseInt(b.yearpublished) : 0
      
      if (isNaN(yearA) && isNaN(yearB)) return 0
      if (isNaN(yearA)) return 1
      if (isNaN(yearB)) return -1
      
      return yearB - yearA // Newer first
    })
  }

  /**
   * Remove duplicates from metadata
   */
  removeDuplicates(metadata: BGGAPIMetadata[]): BGGAPIMetadata[] {
    const seen = new Set<string>()
    return metadata.filter(item => {
      if (seen.has(item.id)) {
        return false
      }
      seen.add(item.id)
      return true
    })
  }

  /**
   * Limit metadata results
   */
  limitResults(metadata: BGGAPIMetadata[], limit: number = 50): BGGAPIMetadata[] {
    return metadata.slice(0, limit)
  }

  /**
   * Extract specific fields from metadata
   */
  extractFields(metadata: BGGAPIMetadata[], fields: (keyof BGGAPIMetadata)[]): Partial<BGGAPIMetadata>[] {
    return metadata.map(item => {
      const extracted: Partial<BGGAPIMetadata> = {}
      fields.forEach(field => {
        if (field in item) {
          (extracted as any)[field] = item[field]
        }
      })
      return extracted
    })
  }

  /**
   * Extract names from parsed object
   */
  private extractNamesFromObject(item: any): { primary: string; alternates: string[] } {
    const names = {
      primary: '',
      alternates: [] as string[]
    }
    
    if (item.name) {
      const nameElements = Array.isArray(item.name) ? item.name : [item.name]
      nameElements.forEach((name: any) => {
        if (typeof name === 'object' && name !== null && 'value' in name) {
          const nameValue = this.decodeHtmlEntities(String(name.value || ''))
          const nameType = String(name.type || '')
          
          if (nameType === 'primary') {
            names.primary = nameValue
          } else if (nameType === 'alternate') {
            // Filter out version-like names
            if (!this.isVersionName(nameValue)) {
              names.alternates.push(nameValue)
            }
          }
        }
      })
    }
    
    // Fallback: if no primary name found, use first alternate
    if (!names.primary && names.alternates.length > 0) {
      names.primary = names.alternates.shift() as string
    }
    
    return names
  }

  /**
   * Extract statistics from parsed object
   */
  private extractStatsFromObject(item: any): {
    average: string
    bayesaverage: string
    weight: string
    rank: string
  } {
    const stats = {
      average: '',
      bayesaverage: '',
      weight: '',
      rank: ''
    }
    
    if (item.statistics?.ratings) {
      const ratings = item.statistics.ratings
      
      if (ratings.average?.value) {
        stats.average = String(ratings.average.value)
      }
      
      if (ratings.bayesaverage?.value) {
        stats.bayesaverage = String(ratings.bayesaverage.value)
      }
      
      if (ratings.averageweight?.value) {
        stats.weight = String(ratings.averageweight.value)
      }
      
      if (ratings.ranks?.rank) {
        const ranks = Array.isArray(ratings.ranks.rank) ? ratings.ranks.rank : [ratings.ranks.rank]
        const boardgameRank = ranks.find((r: any) => r.name === 'boardgame')
        if (boardgameRank) {
          stats.rank = boardgameRank.value === 'Not Ranked' ? '' : String(boardgameRank.value || '')
        }
      }
    }
    
    return stats
  }

  /**
   * Extract links from parsed object
   */
  private extractLinksFromObject(item: any, type?: string): Array<{ id: string; type: string; value: string; inbound?: boolean }> {
    const links: Array<{ id: string; type: string; value: string; inbound?: boolean }> = []
    
    if (item.link) {
      const linkElements = Array.isArray(item.link) ? item.link : [item.link]
      linkElements.forEach((link: any) => {
        if (typeof link === 'object' && link !== null && 'id' in link && 'type' in link && 'value' in link) {
          if (!type || link.type === type) {
            links.push({
              id: String(link.id || ''),
              type: String(link.type || ''),
              value: this.decodeHtmlEntities(String(link.value || '')),
              inbound: link.inbound === 'true'
            })
          }
        }
      })
    }
    
    return links
  }

  /**
   * Extract versions from parsed object
   */
  private extractVersionsFromObject(item: any): Array<{
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
  }> {
    const versions: Array<{
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
    }> = []
    
    // For individual items, versions are not included in the item itself
    // They are parsed from the full XML response
    return versions
  }

  /**
   * Check if a name is likely a version name
   */
  private isVersionName(name: string): boolean {
    const versionPatterns = [
      /edition$/i,
      /version$/i,
      /edition\s+\d+/i,
      /version\s+\d+/i,
      /^\d{4}\s+edition/i,
      /^\d{4}\s+version/i,
      /edition\s+\d{4}/i,
      /version\s+\d{4}/i,
      /printing$/i,
      /print$/i,
      /reprint$/i,
      /deluxe/i,
      /premium/i,
      /collector/i,
      /limited/i,
      /special/i,
      /anniversary/i,
      /jubilee/i
    ]
    
    return versionPatterns.some(pattern => pattern.test(name))
  }

  /**
   * Decode HTML entities
   */
  private decodeHtmlEntities(text: string): string {
    if (!text) return ''
    
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec))
      .replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
  }
}
