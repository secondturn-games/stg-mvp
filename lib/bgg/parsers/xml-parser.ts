// XML Parser for BGG Service
// Modern XML parsing using fast-xml-parser

import { XMLParser } from 'fast-xml-parser'

// Configure XML parser
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: 'text',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
  allowBooleanAttributes: true
})

/**
 * Parse XML string to JSON object
 */
export function parseXML(xml: string): any {
  try {
    return xmlParser.parse(xml)
  } catch (error) {
    console.error('XML parsing error:', error)
    return null
  }
}

/**
 * Extract text content from XML using fast-xml-parser
 */
export function extractText(xml: string, tagName: string): string {
  const parsed = parseXML(xml)
  if (!parsed) return ''
  
  const findText = (obj: any): string => {
    if (!obj || typeof obj !== 'object') return ''
    
    if (Array.isArray(obj)) {
      for (const item of obj) {
        const result = findText(item)
        if (result) return result
      }
    } else {
      if (tagName in obj) {
        const value = obj[tagName]
        if (typeof value === 'string') return value
        if (typeof value === 'object' && value !== null && 'text' in value) {
          return value.text || ''
        }
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          const result = findText(obj[key])
          if (result) return result
        }
      }
    }
    
    return ''
  }
  
  return findText(parsed)
}

/**
 * Extract all text content for a tag from XML
 */
export function extractAll(xml: string, tagName: string): string[] {
  const parsed = parseXML(xml)
  if (!parsed) return []
  
  const results: string[] = []
  
  const findAll = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => findAll(item))
    } else {
      if (tagName in obj) {
        const value = obj[tagName]
        if (Array.isArray(value)) {
          value.forEach(item => {
            if (typeof item === 'string') {
              results.push(item)
            } else if (typeof item === 'object' && item !== null && 'text' in item) {
              results.push(item.text || '')
            }
          })
        } else if (typeof value === 'string') {
          results.push(value)
        } else if (typeof value === 'object' && value !== null && 'text' in value) {
          results.push(value.text || '')
        }
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findAll(obj[key])
        }
      }
    }
  }
  
  findAll(parsed)
  return results
}

/**
 * Extract elements with specific attributes
 */
export function extractElementsWithAttributes(xml: string, tagName: string, attributes: string[]): Record<string, string>[] {
  const parsed = parseXML(xml)
  if (!parsed) return []
  
  const results: Record<string, string>[] = []
  
  const findAll = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => findAll(item))
    } else {
      if (tagName in obj) {
        const elements = Array.isArray(obj[tagName]) ? obj[tagName] : [obj[tagName]]
        elements.forEach((element: any) => {
          if (typeof element === 'object' && element !== null) {
            const result: Record<string, string> = {}
            let hasAttributes = false
            
            attributes.forEach(attr => {
              if (attr in element) {
                result[attr] = String(element[attr] || '')
                hasAttributes = true
              }
            })
            
            if (hasAttributes) {
              results.push(result)
            }
          }
        })
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findAll(obj[key])
        }
      }
    }
  }
  
  findAll(parsed)
  return results
}

/**
 * Extract nested elements
 */
export function extractNestedElements(xml: string, parentTag: string, childTag: string): any[] {
  const parsed = parseXML(xml)
  if (!parsed) return []
  
  const results: any[] = []
  
  const findNested = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => findNested(item))
    } else {
      if (parentTag in obj) {
        const parent = obj[parentTag]
        if (Array.isArray(parent)) {
          parent.forEach(item => {
            if (typeof item === 'object' && item !== null && childTag in item) {
              results.push(item[childTag])
            }
          })
        } else if (typeof parent === 'object' && parent !== null && childTag in parent) {
          results.push(parent[childTag])
        }
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findNested(obj[key])
        }
      }
    }
  }
  
  findNested(parsed)
  return results
}

/**
 * Extract statistics from XML
 */
export function extractStats(xml: string): {
  average: string
  bayesaverage: string
  weight: string
  rank: string
} {
  const parsed = parseXML(xml)
  if (!parsed) return { average: '', bayesaverage: '', weight: '', rank: '' }
  
  const stats = {
    average: '',
    bayesaverage: '',
    weight: '',
    rank: ''
  }
  
  const findStats = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => findStats(item))
    } else {
      if ('statistics' in obj && typeof obj.statistics === 'object' && obj.statistics !== null) {
        const statistics = obj.statistics
        if ('ratings' in statistics && typeof statistics.ratings === 'object' && statistics.ratings !== null) {
          const ratings = statistics.ratings
          
          if ('average' in ratings && typeof ratings.average === 'object' && ratings.average !== null) {
            stats.average = String(ratings.average.value || '')
          }
          
          if ('bayesaverage' in ratings && typeof ratings.bayesaverage === 'object' && ratings.bayesaverage !== null) {
            stats.bayesaverage = String(ratings.bayesaverage.value || '')
          }
          
          if ('averageweight' in ratings && typeof ratings.averageweight === 'object' && ratings.averageweight !== null) {
            stats.weight = String(ratings.averageweight.value || '')
          }
          
          if ('ranks' in ratings && typeof ratings.ranks === 'object' && ratings.ranks !== null) {
            const ranks = ratings.ranks
            if ('rank' in ranks) {
              const rankArray = Array.isArray(ranks.rank) ? ranks.rank : [ranks.rank]
              const boardgameRank = rankArray.find((r: any) => r.name === 'boardgame')
              if (boardgameRank) {
                stats.rank = boardgameRank.value === 'Not Ranked' ? '' : String(boardgameRank.value || '')
              }
            }
          }
        }
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findStats(obj[key])
        }
      }
    }
  }
  
  findStats(parsed)
  return stats
}

/**
 * Extract links from XML
 */
export function extractLinks(xml: string, type?: string): Array<{ id: string; type: string; value: string; inbound?: boolean }> {
  const parsed = parseXML(xml)
  if (!parsed) return []
  
  const links: Array<{ id: string; type: string; value: string; inbound?: boolean }> = []
  
  const findLinks = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => findLinks(item))
    } else {
      if ('link' in obj) {
        const linkElements = Array.isArray(obj.link) ? obj.link : [obj.link]
        linkElements.forEach((link: any) => {
          if (typeof link === 'object' && link !== null && 'id' in link && 'type' in link && 'value' in link) {
            if (!type || link.type === type) {
              links.push({
                id: String(link.id || ''),
                type: String(link.type || ''),
                value: decodeHtmlEntities(String(link.value || '')),
                inbound: link.inbound === 'true'
              })
            }
          }
        })
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findLinks(obj[key])
        }
      }
    }
  }
  
  findLinks(parsed)
  return links
}

/**
 * Extract names from XML (primary and alternate names)
 */
export function extractNames(xml: string): { primary: string; alternates: string[] } {
  const parsed = parseXML(xml)
  if (!parsed) return { primary: '', alternates: [] }
  
  const names = {
    primary: '',
    alternates: [] as string[]
  }
  
  const findNames = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => findNames(item))
    } else {
      if ('name' in obj) {
        const nameElements = Array.isArray(obj.name) ? obj.name : [obj.name]
        nameElements.forEach((name: any) => {
          if (typeof name === 'object' && name !== null && 'value' in name) {
            const nameValue = decodeHtmlEntities(String(name.value || ''))
            const nameType = String(name.type || '')
            
            if (nameType === 'primary') {
              names.primary = nameValue
            } else if (nameType === 'alternate') {
              // Filter out version-like names
              if (!isVersionName(nameValue)) {
                names.alternates.push(nameValue)
              }
            }
          }
        })
      }
      
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findNames(obj[key])
        }
      }
    }
  }
  
  findNames(parsed)
  
  // Fallback: if no primary name found, use first alternate
  if (!names.primary && names.alternates.length > 0) {
    names.primary = names.alternates.shift() as string
  }
  
  return names
}

/**
 * Extract version information from XML
 */
export function extractVersions(xml: string): Array<{
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
  const parsed = parseXML(xml)
  if (!parsed) return []
  
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
  
  const findVersions = (obj: any): void => {
    if (!obj || typeof obj !== 'object') return
    
    if (Array.isArray(obj)) {
      obj.forEach(item => findVersions(item))
    } else {
      // Check if this object is a version item
      if (obj.type === 'boardgameversion') {
        const version = {
          id: String(obj.id || ''),
          name: '',
          yearpublished: String(obj.yearpublished?.value || obj.yearpublished || ''),
          publishers: [] as string[],
          languages: [] as string[],
          productcode: String(obj.productcode?.value || obj.productcode || ''),
          thumbnail: String(obj.thumbnail || ''),
          image: String(obj.image || ''),
          width: String(obj.width?.value || obj.width || ''),
          length: String(obj.length?.value || obj.length || ''),
          depth: String(obj.depth?.value || obj.depth || ''),
          weight: String(obj.weight?.value || obj.weight || '')
        }
        
        // Extract name
        if (obj.name) {
          const nameElements = Array.isArray(obj.name) ? obj.name : [obj.name]
          const primaryName = nameElements.find((n: any) => n.type === 'primary')
          version.name = primaryName ? decodeHtmlEntities(String(primaryName.value || '')) : ''
        }
        
                    // Extract publishers and languages
            if (obj.link) {
              const links = Array.isArray(obj.link) ? obj.link : [obj.link]
              links.forEach((link: any) => {
                if (link.type === 'boardgamepublisher') {
                  version.publishers.push(decodeHtmlEntities(String(link.value || '')))
                } else if (link.type === 'boardgamelanguage' || link.type === 'language') {
                  version.languages.push(decodeHtmlEntities(String(link.value || '')))
                }
              })
            }
        
        if (version.id && version.name && version.name.trim() !== '') {
          versions.push(version)
        }
      }
      
      // Recursively search all object properties
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null) {
          findVersions(obj[key])
        }
      }
    }
  }
  
  findVersions(parsed)
  return versions
}

/**
 * Check if a name is likely a version name
 */
function isVersionName(name: string): boolean {
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
export function decodeHtmlEntities(text: string): string {
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

/**
 * Validate XML structure
 */
export function validateXML(xml: string): boolean {
  if (!xml || typeof xml !== 'string') return false
  
  // Basic XML structure validation
  const hasOpeningTag = /<[^>]+>/.test(xml)
  const hasClosingTag = /<\/[^>]+>/.test(xml)
  const hasItems = /<items/.test(xml)
  
  return hasOpeningTag && hasClosingTag && hasItems
}

/**
 * Clean XML content
 */
export function cleanXML(xml: string): string {
  if (!xml) return ''
  
  return xml
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Parse integer safely
 */
export function parseInteger(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  
  const parsed = parseInt(String(value), 10)
  return isNaN(parsed) ? null : parsed
}

/**
 * Parse float safely
 */
export function parseFloatSafe(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === '') return null
  
  const parsed = parseFloat(String(value))
  return isNaN(parsed) ? null : parsed
}

// Legacy functions for backward compatibility (deprecated)
export function extractAttribute(xml: string, tagName: string, attributeName: string): string {
  console.warn('extractAttribute is deprecated, use extractElementsWithAttributes instead')
  const elements = extractElementsWithAttributes(xml, tagName, [attributeName])
  return elements[0]?.[attributeName] || ''
}
