// BGG API Endpoints Configuration

export const BGG_ENDPOINTS = {
  SEARCH: '/xmlapi2/search',
  THING: '/xmlapi2/thing',
  COLLECTION: '/xmlapi2/collection',
  USER: '/xmlapi2/user',
  FORUM: '/xmlapi2/forum',
  THREAD: '/xmlapi2/thread',
  FAMILY: '/xmlapi2/family',
  GUILD: '/xmlapi2/guild',
  PLAYS: '/xmlapi2/plays',
  HOT: '/xmlapi2/hot',
  TOP: '/xmlapi2/top'
} as const

export const BGG_GAME_TYPES = {
  BOARDGAME: 'boardgame',
  BOARDGAME_EXPANSION: 'boardgameexpansion',
  RPG: 'rpgitem',
  VIDEOGAME: 'videogame',
  BOARDGAME_ACCESSORY: 'boardgameaccessory'
} as const

export const BGG_SEARCH_PARAMS = {
  QUERY: 'query',
  TYPE: 'type',
  EXACT: 'exact'
} as const

export const BGG_THING_PARAMS = {
  ID: 'id',
  TYPE: 'type',
  STATS: 'stats',
  VERSIONS: 'versions',
  HISTORIC: 'historic',
  MARKETPLACE: 'marketplace',
  COMMENTS: 'comments',
  RATINGCOMMENTS: 'ratingcomments',
  PAGE: 'page',
  PAGESIZE: 'pagesize'
} as const

export const BGG_COLLECTION_PARAMS = {
  USERNAME: 'username',
  ID: 'id',
  BRIEF: 'brief',
  STATS: 'stats',
  OWN: 'own',
  RATED: 'rated',
  PLAYED: 'played',
  COMMENT: 'comment',
  TRADE: 'trade',
  WANT: 'want',
  WISHLIST: 'wishlist',
  WISHPRIORITY: 'wishlistpriority',
  WANTTOPPLAY: 'wanttoplay',
  WANTTOBUY: 'wanttobuy',
  PREVIOUSLYOWNED: 'previouslyowned',
  HASPARTS: 'hasparts',
  WANTPARTS: 'wantparts',
  MINBGG: 'minbgg',
  RATING: 'rating',
  MINRATING: 'minrating',
  MAXRATING: 'maxrating',
  MINRANK: 'minrank',
  MAXRANK: 'maxrank',
  MINPLAYS: 'minplays',
  MAXPLAYS: 'maxplays',
  SHOWPRIVATE: 'showprivate',
  COLLID: 'collid',
  MODIFIEDSINCE: 'modifiedsince',
  SUBTYPE: 'subtype',
  EXCLUDESUBTYPE: 'excludesubtype',
  FAMILY: 'family',
  EXCLUDEFAMILY: 'excludefamily'
} as const

export const BGG_USER_PARAMS = {
  NAME: 'name',
  BUDDIES: 'buddies',
  GUILDS: 'guilds',
  HOT: 'hot',
  TOP: 'top',
  DOMAIN: 'domain',
  PAGE: 'page'
} as const

export const BGG_FORUM_PARAMS = {
  ID: 'id',
  TYPE: 'type',
  PAGE: 'page'
} as const

export const BGG_THREAD_PARAMS = {
  ID: 'id',
  COUNT: 'count'
} as const

export const BGG_FAMILY_PARAMS = {
  ID: 'id',
  TYPE: 'type'
} as const

export const BGG_GUILD_PARAMS = {
  ID: 'id',
  MEMBERS: 'members',
  SORT: 'sort',
  PAGE: 'page'
} as const

export const BGG_PLAYS_PARAMS = {
  USERNAME: 'username',
  ID: 'id',
  MINDATE: 'mindate',
  MAXDATE: 'maxdate',
  SUBTYPE: 'subtype',
  PAGE: 'page'
} as const

export const BGG_HOT_PARAMS = {
  TYPE: 'type'
} as const

export const BGG_TOP_PARAMS = {
  TYPE: 'type',
  FAMILY: 'family'
} as const

// Default API configuration
export const DEFAULT_BGG_CONFIG = {
  baseUrl: 'https://boardgamegeek.com',
  userAgent: 'SecondTurnGames/1.0 (info@secondturn.games)',
  rateLimitDelay: 500, // 500ms minimum delay between requests
  maxBatchSize: 20, // Maximum IDs per batch request
  cacheTTL: 60 * 24 * 60 * 60 * 1000 // 60 days in milliseconds
} as const

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  SEARCH_DELAY: 1000, // 1 second for search requests
  DETAILS_DELAY: 500, // 500ms for details requests
  BATCH_DELAY: 1000, // 1 second for batch requests
  MAX_REQUESTS_PER_MINUTE: 60,
  MAX_REQUESTS_PER_HOUR: 1000
} as const

// Error messages
export const BGG_ERROR_MESSAGES = {
  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please try again later.',
  INVALID_GAME_ID: 'Invalid game ID provided.',
  GAME_NOT_FOUND: 'Game not found.',
  API_UNAVAILABLE: 'BGG API is currently unavailable.',
  NETWORK_ERROR: 'Network error occurred while fetching data.',
  INVALID_RESPONSE: 'Invalid response from BGG API.',
  PARSE_ERROR: 'Error parsing BGG API response.'
} as const

// HTTP status codes
export const BGG_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const
