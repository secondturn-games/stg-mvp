// BGG Service Types
// All interfaces and types used across the BGG service modules

export interface SearchCacheEntry {
  query: string
  results: BGGSearchResult[]
  timestamp: number
  searchTime: number
}

export interface PopularQuery {
  query: string
  count: number
  lastSearched: number
  avgSearchTime: number
}

export interface BGGSearchResult {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  type?: string
  alternateNames?: string[]
  abstracts_rank?: string
  cgs_rank?: string
  childrensgames_rank?: string
  familygames_rank?: string
  partygames_rank?: string
  strategygames_rank?: string
  thematic_rank?: string
  wargames_rank?: string
  thumbnail?: string
  bggLink?: string
}

export interface BGGAPISearchItem {
  id: string
  name: string
  type: string
  yearpublished?: string
}

export interface BGGAPIMetadata {
  id: string
  name: string
  yearpublished?: string
  rank?: string
  bayesaverage?: string
  thumbnail?: string
  image?: string
  alternateNames?: string[]
  type: string
  minplayers?: string
  maxplayers?: string
  playingtime?: string
  minage?: string
  description?: string
  weight?: string
  mechanics?: string[]
  categories?: string[]
  versions?: BGGGameVersion[]
  hasInboundExpansionLink?: boolean
}

export interface BGGGameDetails {
  id: string
  name: string
  yearpublished: string
  minplayers: string
  maxplayers: string
  playingtime: string
  minage: string
  description: string
  thumbnail: string
  image: string
  rating: string
  weight: string
  rank: string
  mechanics: string[]
  categories: string[]
  alternateNames: string[]
  versions?: BGGGameVersion[]
  type?: string
}

export interface BGGGameVersion {
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
}

export interface CSVGameData {
  id: string
  name: string
  yearpublished: string
  rank: string
  bayesaverage: string
  is_expansion: string
  abstracts_rank: string
  cgs_rank: string
  childrensgames_rank: string
  familygames_rank: string
  partygames_rank: string
  strategygames_rank: string
  thematic_rank: string
  wargames_rank: string
}

export interface BGGSearchProps {
  onGameSelect: (game: BGGGameDetails | null) => void
  selectedGameId?: string
  gameType?: 'base-game' | 'expansion' | 'bundle'
}

export interface SearchFilters {
  gameType?: 'base-game' | 'expansion'
}

export interface CacheStats {
  size: number
  hitRate: number
  popularQueries: PopularQuery[]
}

export interface BGGAPIConfig {
  baseUrl: string
  userAgent: string
  rateLimitDelay: number
  maxBatchSize: number
  cacheTTL: number
}
