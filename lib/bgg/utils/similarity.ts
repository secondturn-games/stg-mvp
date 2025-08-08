// Similarity and fuzzy matching utilities for BGG search

/**
 * Normalize query string for consistent matching
 */
export function normalizeQuery(query: string): string {
  return query
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
}

/**
 * Calculate enhanced similarity between two strings
 * Combines multiple similarity algorithms for better accuracy
 */
export function calculateEnhancedSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  
  const normalized1 = normalizeQuery(str1)
  const normalized2 = normalizeQuery(str2)
  
  if (normalized1 === normalized2) return 1.0
  
  // Exact match after normalization
  if (normalized1 === normalized2) return 1.0
  
  // Partial match (one string contains the other)
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.9
  }
  
  // Levenshtein distance
  const levenshteinScore = 1 - (levenshteinDistance(normalized1, normalized2) / Math.max(normalized1.length, normalized2.length))
  
  // Character similarity
  const charSimilarity = calculateCharacterSimilarity(normalized1, normalized2)
  
  // Word-based similarity
  const words1 = normalized1.split(' ')
  const words2 = normalized2.split(' ')
  const commonWords = words1.filter(word => words2.includes(word))
  const wordSimilarity = commonWords.length / Math.max(words1.length, words2.length)
  
  // Weighted combination
  return (levenshteinScore * 0.4) + (charSimilarity * 0.3) + (wordSimilarity * 0.3)
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}

/**
 * Calculate character-based similarity
 */
export function calculateCharacterSimilarity(str1: string, str2: string): number {
  const chars1 = new Set(str1.split(''))
  const chars2 = new Set(str2.split(''))
  
  const intersection = new Set([...chars1].filter(x => chars2.has(x)))
  const union = new Set([...chars1, ...chars2])
  
  return intersection.size / union.size
}

/**
 * Calculate basic similarity between two strings
 */
export function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0
  
  const normalized1 = normalizeQuery(str1)
  const normalized2 = normalizeQuery(str2)
  
  if (normalized1 === normalized2) return 1.0
  
  // Exact match
  if (normalized1 === normalized2) return 1.0
  
  // Partial match
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    return 0.8
  }
  
  // Word-based similarity
  const words1 = normalized1.split(' ')
  const words2 = normalized2.split(' ')
  const commonWords = words1.filter(word => words2.includes(word))
  
  if (commonWords.length === 0) return 0
  
  return commonWords.length / Math.max(words1.length, words2.length)
}
