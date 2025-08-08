// BGG Service - Main Export
// Exports the main service and all its components

export { BGGService, bggService } from './service'
export * from './types'

// Export individual modules for advanced usage
export { BGGAPIClient } from './api/client'
export { CacheManager } from './cache/cache-manager'
export { MemoryCache } from './cache/memory-cache'
export { DatabaseCache } from './cache/database-cache'
export { SearchEngine } from './search/search-engine'
export { SearchParser } from './parsers/search-parser'
export { MetadataParser } from './parsers/metadata-parser'
export * from './parsers/xml-parser'
export * from './utils/similarity'
export * from './utils/data-transformers'
export * from './api/endpoints'
