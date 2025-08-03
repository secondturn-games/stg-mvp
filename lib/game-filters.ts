// Game filtering utilities for the marketplace

export interface GameFilterOptions {
  // Basic filters
  minPrice?: number
  maxPrice?: number
  condition?: string[]
  location?: string[]
  
  // Game-specific filters
  minPlayers?: number
  maxPlayers?: number
  minAge?: number
  maxAge?: number
  minPlayTime?: number
  maxPlayTime?: number
  
  // BGG filters
  minRating?: number
  maxRating?: number
  minWeight?: number
  maxWeight?: number
  maxRank?: number // Lower rank = better game
  
  // Category filters
  mechanics?: string[]
  categories?: string[]
  
  // Year filters
  minYear?: number
  maxYear?: number
}

export interface GameListing {
  id: string
  title: string
  price: number
  condition: string
  city: string
  country: string
  bgg_id?: string
  bgg_data?: {
    minplayers?: number
    maxplayers?: number
    minage?: number
    playingtime?: number
    bgg_rating?: number
    bgg_weight?: number
    bgg_rank?: number
    year_published?: number
    mechanics?: string[]
    categories?: string[]
  }
}

// Filter games based on criteria
export function filterGames(games: GameListing[], filters: GameFilterOptions): GameListing[] {
  return games.filter(game => {
    // Price filter
    if (filters.minPrice && game.price < filters.minPrice) return false
    if (filters.maxPrice && game.price > filters.maxPrice) return false
    
    // Condition filter
    if (filters.condition && filters.condition.length > 0) {
      if (!filters.condition.includes(game.condition)) return false
    }
    
    // Location filter
    if (filters.location && filters.location.length > 0) {
      if (!filters.location.includes(game.city) && !filters.location.includes(game.country)) return false
    }
    
    // BGG data filters (only if game has BGG data)
    if (game.bgg_data) {
      const bgg = game.bgg_data
      
      // Player count filter
      if (filters.minPlayers && bgg.minplayers && bgg.minplayers < filters.minPlayers) return false
      if (filters.maxPlayers && bgg.maxplayers && bgg.maxplayers > filters.maxPlayers) return false
      
      // Age filter
      if (filters.minAge && bgg.minage && bgg.minage < filters.minAge) return false
      if (filters.maxAge && bgg.minage && bgg.minage > filters.maxAge) return false
      
      // Play time filter
      if (filters.minPlayTime && bgg.playingtime && bgg.playingtime < filters.minPlayTime) return false
      if (filters.maxPlayTime && bgg.playingtime && bgg.playingtime > filters.maxPlayTime) return false
      
      // Rating filter
      if (filters.minRating && bgg.bgg_rating && bgg.bgg_rating < filters.minRating) return false
      if (filters.maxRating && bgg.bgg_rating && bgg.bgg_rating > filters.maxRating) return false
      
      // Weight filter
      if (filters.minWeight && bgg.bgg_weight && bgg.bgg_weight < filters.minWeight) return false
      if (filters.maxWeight && bgg.bgg_weight && bgg.bgg_weight > filters.maxWeight) return false
      
      // Rank filter (lower rank = better game)
      if (filters.maxRank && bgg.bgg_rank && bgg.bgg_rank > filters.maxRank) return false
      
      // Year filter
      if (filters.minYear && bgg.year_published && bgg.year_published < filters.minYear) return false
      if (filters.maxYear && bgg.year_published && bgg.year_published > filters.maxYear) return false
      
      // Mechanics filter
      if (filters.mechanics && filters.mechanics.length > 0) {
        if (!bgg.mechanics || !filters.mechanics.some(m => bgg.mechanics!.includes(m))) return false
      }
      
      // Categories filter
      if (filters.categories && filters.categories.length > 0) {
        if (!bgg.categories || !filters.categories.some(c => bgg.categories!.includes(c))) return false
      }
    }
    
    return true
  })
}

// Get unique values for filter options
export function getUniqueFilterValues(games: GameListing[]) {
  const values = {
    conditions: new Set<string>(),
    cities: new Set<string>(),
    countries: new Set<string>(),
    mechanics: new Set<string>(),
    categories: new Set<string>(),
    years: new Set<number>(),
  }
  
  games.forEach(game => {
    values.conditions.add(game.condition)
    values.cities.add(game.city)
    values.countries.add(game.country)
    
    if (game.bgg_data) {
      if (game.bgg_data.mechanics) {
        game.bgg_data.mechanics.forEach(m => values.mechanics.add(m))
      }
      if (game.bgg_data.categories) {
        game.bgg_data.categories.forEach(c => values.categories.add(c))
      }
      if (game.bgg_data.year_published) {
        values.years.add(game.bgg_data.year_published)
      }
    }
  })
  
  return {
    conditions: Array.from(values.conditions).sort(),
    cities: Array.from(values.cities).sort(),
    countries: Array.from(values.countries).sort(),
    mechanics: Array.from(values.mechanics).sort(),
    categories: Array.from(values.categories).sort(),
    years: Array.from(values.years).sort((a, b) => b - a), // Most recent first
  }
}

// Weight categories for easy filtering
export const WEIGHT_CATEGORIES = {
  LIGHT: { min: 1.0, max: 2.0, label: 'Light (1.0-2.0)' },
  LIGHT_MEDIUM: { min: 2.0, max: 3.0, label: 'Light-Medium (2.0-3.0)' },
  MEDIUM: { min: 3.0, max: 4.0, label: 'Medium (3.0-4.0)' },
  MEDIUM_HEAVY: { min: 4.0, max: 5.0, label: 'Medium-Heavy (4.0-5.0)' },
  HEAVY: { min: 5.0, max: 5.0, label: 'Heavy (5.0+)' },
}

// Player count categories
export const PLAYER_CATEGORIES = {
  SOLO: { min: 1, max: 1, label: 'Solo (1 player)' },
  TWO_PLAYER: { min: 2, max: 2, label: 'Two Player (2 players)' },
  FAMILY: { min: 2, max: 4, label: 'Family (2-4 players)' },
  PARTY: { min: 4, max: 8, label: 'Party (4+ players)' },
  LARGE_GROUP: { min: 6, max: 12, label: 'Large Group (6+ players)' },
}

// Play time categories
export const PLAY_TIME_CATEGORIES = {
  QUICK: { min: 0, max: 30, label: 'Quick (0-30 min)' },
  SHORT: { min: 30, max: 60, label: 'Short (30-60 min)' },
  MEDIUM: { min: 60, max: 120, label: 'Medium (60-120 min)' },
  LONG: { min: 120, max: 180, label: 'Long (120-180 min)' },
  EPIC: { min: 180, max: 999, label: 'Epic (180+ min)' },
} 