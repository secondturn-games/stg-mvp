// Data transformation utilities for BGG service

import type { BGGAPIMetadata, BGGGameDetails, BGGSearchResult } from '../types'

/**
 * Decode HTML entities in text
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text
  
  // Decode named entities first
  let decoded = text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')

  // Decode numeric entities (decimal), including zero-padded forms like &#039;
  decoded = decoded.replace(/&#(\d+);/g, (_, dec: string) => {
    const codePoint = parseInt(dec, 10)
    if (isNaN(codePoint)) return _
    try { return String.fromCodePoint(codePoint) } catch { return _ }
  })

  // Decode numeric entities (hex) like &#x27;
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => {
    const codePoint = parseInt(hex, 16)
    if (isNaN(codePoint)) return _
    try { return String.fromCodePoint(codePoint) } catch { return _ }
  })

  return decoded
}

/**
 * Convert BGG API metadata to search result format
 */
export function convertMetadataToSearchResult(metadata: BGGAPIMetadata): BGGSearchResult {
  return {
    id: metadata.id,
    name: metadata.name,
    yearpublished: metadata.yearpublished,
    rank: metadata.rank,
    bayesaverage: metadata.bayesaverage,
    type: metadata.type,
    alternateNames: metadata.alternateNames,
    thumbnail: metadata.thumbnail,
    bggLink: `https://boardgamegeek.com/boardgame/${metadata.id}`
  }
}

/**
 * Convert BGG game details to metadata format
 */
export function convertGameDetailsToMetadata(gameDetails: BGGGameDetails): BGGAPIMetadata {
  return {
    id: gameDetails.id,
    name: gameDetails.name,
    yearpublished: gameDetails.yearpublished,
    rank: gameDetails.rank,
    bayesaverage: gameDetails.rating,
    thumbnail: gameDetails.thumbnail,
    image: gameDetails.image,
    alternateNames: gameDetails.alternateNames,
    type: gameDetails.type || 'boardgame',
    minplayers: gameDetails.minplayers,
    maxplayers: gameDetails.maxplayers,
    playingtime: gameDetails.playingtime,
    minage: gameDetails.minage,
    description: gameDetails.description,
    weight: gameDetails.weight,
    mechanics: gameDetails.mechanics,
    categories: gameDetails.categories,
    versions: gameDetails.versions
  }
}

/**
 * Convert search results to game details format
 */
export function convertSearchResultToGameDetails(searchResult: BGGSearchResult): Partial<BGGGameDetails> {
  return {
    id: searchResult.id,
    name: searchResult.name,
    yearpublished: searchResult.yearpublished || '',
    minplayers: '',
    maxplayers: '',
    playingtime: '',
    minage: '',
    description: '',
    thumbnail: searchResult.thumbnail || '',
    image: '',
    rating: searchResult.bayesaverage || '',
    weight: '',
    rank: searchResult.rank || '',
    mechanics: [],
    categories: [],
    alternateNames: searchResult.alternateNames || [],
    type: searchResult.type
  }
}

/**
 * Sanitize and validate game data
 */
export function sanitizeGameData(data: any): any {
  if (!data) return data
  
  // Remove null/undefined values
  const sanitized = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value != null)
  )
  
  // Ensure arrays are actually arrays
  Object.keys(sanitized).forEach(key => {
    const value = (sanitized as any)[key]
    if (value && typeof value === 'object' && 'length' in value && !Array.isArray(value)) {
      ;(sanitized as any)[key] = Array.from(value as any)
    }
  })
  
  return sanitized
}

/**
 * Create BGG link for a game
 */
export function createBGGLink(id: string): string {
  return `https://boardgamegeek.com/boardgame/${id}`
}

export function extractGameIdFromURL(url: string): string | null {
  const match = url.match(/boardgame\/(\d+)/)
  return match ? match[1] : null
}

export function formatGameName(name: string): string {
  return name.trim()
}

export function formatVersionName(name: string): string {
  return name.trim()
}
