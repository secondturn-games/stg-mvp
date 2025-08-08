// Database Cache for BGG Service
// Handles Supabase caching of game metadata and details

import { createServerSupabaseClient } from '@/lib/db'
import type { BGGAPIMetadata, BGGGameDetails } from '../types'

export class DatabaseCache {
  private readonly CACHE_TTL = 60 * 24 * 60 * 60 * 1000 // 60 days
  
  private parseInteger(value?: string): number | null {
    if (value === undefined || value === null) return null
    const n = parseInt(String(value), 10)
    return Number.isFinite(n) ? n : null
  }
  
  private parseFloatSafe(value?: string): number | null {
    if (value === undefined || value === null) return null
    const n = parseFloat(String(value))
    return Number.isFinite(n) ? n : null
  }

  /**
   * Get cached metadata for multiple games
   */
  async getCachedMetadata(gameIds: string[]): Promise<BGGAPIMetadata[]> {
    if (gameIds.length === 0) return []
    
    try {
      const supabase = createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from('games')
        .select('id, name, year_published, bgg_rank, bgg_rating, thumbnail, image, alternate_names, min_players, max_players, playing_time, min_age, description, bgg_weight, mechanics, categories, game_type, versions')
        .in('id', gameIds)
        .gte('updated_at', new Date(Date.now() - this.CACHE_TTL).toISOString())
      
      if (error) {
        console.error('Supabase cache query error:', error)
        return []
      }
      
      if (!data || data.length === 0) {
        return []
      }
      
      // Convert Supabase data to BGGAPIMetadata format
      return data.map((game: any) => {
        return {
          id: game.id,
          name: game.name,
          yearpublished: game.year_published?.toString(),
          rank: game.bgg_rank?.toString(),
          bayesaverage: game.bgg_rating?.toString(),
          thumbnail: game.thumbnail,
          image: game.image,
          alternateNames: game.alternate_names || [],
          type: game.game_type === 'expansion' ? 'boardgameexpansion' : 'boardgame',
          minplayers: game.min_players?.toString(),
          maxplayers: game.max_players?.toString(),
          playingtime: game.playing_time?.toString(),
          minage: game.min_age?.toString(),
          description: game.description,
          weight: game.bgg_weight?.toString(),
          mechanics: game.mechanics || [],
          categories: game.categories || [],
          versions: game.versions || []
        }
      })
      
    } catch (error) {
      console.error('Error fetching cached metadata:', error)
      return []
    }
  }

  /**
   * Get cached game data for a single game
   */
  async getCachedGameData(gameId: string): Promise<BGGGameDetails | null> {
    try {
      const supabase = createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .gte('updated_at', new Date(Date.now() - this.CACHE_TTL).toISOString())
        .single()
      
      if (error || !data) {
        return null
      }
      
      return {
        id: data.id,
        name: data.name,
        yearpublished: data.year_published?.toString() || '',
        minplayers: data.min_players?.toString() || '',
        maxplayers: data.max_players?.toString() || '',
        playingtime: data.playing_time?.toString() || '',
        minage: data.min_age?.toString() || '',
        description: data.description || '',
        thumbnail: data.thumbnail || '',
        image: data.image || '',
        rating: data.bgg_rating?.toString() || '',
        weight: data.bgg_weight?.toString() || '',
        rank: data.bgg_rank?.toString() || '',
        mechanics: data.mechanics || [],
        categories: data.categories || [],
        alternateNames: data.alternate_names || [],
        versions: data.versions || [],
        type: data.game_type === 'expansion' ? 'boardgameexpansion' : 'boardgame'
      }
      
    } catch (error) {
      console.error('Error fetching cached game data:', error)
      return null
    }
  }

  /**
   * Cache metadata for multiple games
   */
  async cacheMetadataBatch(metadata: BGGAPIMetadata[]): Promise<void> {
    if (metadata.length === 0) return
    
    try {
      const supabase = createServerSupabaseClient()
      
      const cacheData = metadata.map(meta => ({
        id: meta.id,
        name: meta.name,
        year_published: this.parseInteger(meta.yearpublished),
        min_players: this.parseInteger(meta.minplayers),
        max_players: this.parseInteger(meta.maxplayers),
        playing_time: this.parseInteger(meta.playingtime),
        min_age: this.parseInteger(meta.minage),
        description: meta.description,
        thumbnail: meta.thumbnail,
        image: meta.image,
        bgg_rating: this.parseFloatSafe(meta.bayesaverage),
        bgg_weight: this.parseFloatSafe(meta.weight),
        bgg_rank: this.parseInteger(meta.rank),
        game_type: meta.type === 'boardgameexpansion' ? 'expansion' : 'base-game',
        mechanics: meta.mechanics || [],
        categories: meta.categories || [],
        alternate_names: meta.alternateNames || [],
        versions: meta.versions || [],
        updated_at: new Date().toISOString(),
        cache_expires_at: new Date(Date.now() + this.CACHE_TTL).toISOString()
      }))
      
      const { error } = await supabase
        .from('games')
        .upsert(cacheData)
      
      if (error) {
        console.error('Failed to cache metadata batch:', error)
      }
      
    } catch (error) {
      console.error('Failed to cache metadata batch:', error)
    }
  }

  /**
   * Cache game data for a single game
   */
  async cacheGameData(gameDetails: BGGGameDetails): Promise<void> {
    try {
      const supabase = createServerSupabaseClient()
      
      const cacheData = {
        id: gameDetails.id,
        name: gameDetails.name,
        year_published: this.parseInteger(gameDetails.yearpublished),
        min_players: this.parseInteger(gameDetails.minplayers),
        max_players: this.parseInteger(gameDetails.maxplayers),
        playing_time: this.parseInteger(gameDetails.playingtime),
        min_age: this.parseInteger(gameDetails.minage),
        description: gameDetails.description,
        thumbnail: gameDetails.thumbnail,
        image: gameDetails.image,
        bgg_rating: this.parseFloatSafe(gameDetails.rating),
        bgg_weight: this.parseFloatSafe(gameDetails.weight),
        bgg_rank: this.parseInteger(gameDetails.rank),
        game_type: gameDetails.type === 'boardgameexpansion' ? 'expansion' : 'base-game',
        mechanics: gameDetails.mechanics,
        categories: gameDetails.categories,
        alternate_names: gameDetails.alternateNames,
        versions: gameDetails.versions || [],
        updated_at: new Date().toISOString(),
        cache_expires_at: new Date(Date.now() + this.CACHE_TTL).toISOString()
      }
      
      const { error } = await supabase
        .from('games')
        .upsert(cacheData)
      
      if (error) {
        console.error('Failed to cache game data:', error)
      }
      
    } catch (error) {
      console.error('Failed to cache game data:', error)
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    try {
      const supabase = createServerSupabaseClient()
      
      const { error } = await supabase
        .from('games')
        .delete()
        .lt('cache_expires_at', new Date().toISOString())
      
      if (error) {
        console.error('Failed to cleanup expired cache:', error)
      }
      
    } catch (error) {
      console.error('Failed to cleanup expired cache:', error)
    }
  }

  /**
   * Check if game is cached and not expired
   */
  async isCached(gameId: string): Promise<boolean> {
    try {
      const supabase = createServerSupabaseClient()
      
      const { data, error } = await supabase
        .from('games')
        .select('id')
        .eq('id', gameId)
        .gte('updated_at', new Date(Date.now() - this.CACHE_TTL).toISOString())
        .single()
      
      return !error && !!data
      
    } catch (error) {
      return false
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{ total: number; expired: number; valid: number }> {
    try {
      const supabase = createServerSupabaseClient()
      
      const now = new Date().toISOString()
      const cutoff = new Date(Date.now() - this.CACHE_TTL).toISOString()
      
      const { count: total } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
      
      const { count: expired } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .lt('updated_at', cutoff)
      
      return {
        total: total || 0,
        expired: expired || 0,
        valid: (total || 0) - (expired || 0)
      }
      
    } catch (error) {
      console.error('Failed to get cache stats:', error)
      return { total: 0, expired: 0, valid: 0 }
    }
  }
}
