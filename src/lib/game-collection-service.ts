import { supabase } from './supabase';

export interface GameCollection {
  id: string;
  user_id: string;
  game_title: string;
  game_category?: string;
  game_condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  acquisition_date?: string;
  acquisition_price?: number;
  current_value?: number;
  notes?: string;
  is_for_sale: boolean;
  is_for_trade: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  game_title: string;
  game_category?: string;
  max_price?: number;
  priority: 'low' | 'medium' | 'high';
  notes?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionCategory {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface GamePlaySession {
  id: string;
  user_id: string;
  game_collection_id: string;
  session_date: string;
  duration_minutes?: number;
  players_count: number;
  notes?: string;
  rating?: number;
  created_at: string;
}

export interface GameRating {
  id: string;
  user_id: string;
  game_title: string;
  rating: number;
  review?: string;
  complexity_rating?: number;
  replayability_rating?: number;
  created_at: string;
  updated_at: string;
}

export interface CollectionOverview {
  total_games: number;
  total_value: number;
  average_rating: number;
  most_played_game?: string;
  total_play_time_hours: number;
  games_for_sale: number;
  games_for_trade: number;
  wishlist_count: number;
  categories_count: number;
  recent_additions: Array<{
    game_title: string;
    added_date: string;
  }>;
}

// Add game to collection
export async function addGameToCollection(
  userId: string,
  gameData: Omit<GameCollection, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('game_collections')
    .insert({
      user_id: userId,
      ...gameData,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding game to collection:', error);
    throw new Error('Failed to add game to collection');
  }

  // Update collection statistics
  await updateCollectionStatistics(userId);

  return data.id;
}

// Get user's game collection
export async function getGameCollection(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<GameCollection[]> {
  const { data, error } = await supabase
    .from('game_collections')
    .select('*')
    .eq('user_id', userId)
    .order('game_title', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching game collection:', error);
    return [];
  }

  return data || [];
}

// Update game in collection
export async function updateGameInCollection(
  gameId: string,
  updates: Partial<GameCollection>
): Promise<void> {
  const { error } = await supabase
    .from('game_collections')
    .update(updates)
    .eq('id', gameId);

  if (error) {
    console.error('Error updating game in collection:', error);
    throw new Error('Failed to update game in collection');
  }
}

// Remove game from collection
export async function removeGameFromCollection(
  gameId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('game_collections')
    .delete()
    .eq('id', gameId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing game from collection:', error);
    throw new Error('Failed to remove game from collection');
  }

  // Update collection statistics
  await updateCollectionStatistics(userId);
}

// Add game to wishlist
export async function addToWishlist(
  userId: string,
  wishlistData: Omit<WishlistItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('wishlist')
    .insert({
      user_id: userId,
      ...wishlistData,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error adding to wishlist:', error);
    throw new Error('Failed to add to wishlist');
  }

  return data.id;
}

// Get user's wishlist
export async function getWishlist(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<WishlistItem[]> {
  const { data, error } = await supabase
    .from('wishlist')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }

  return data || [];
}

// Remove from wishlist
export async function removeFromWishlist(
  wishlistId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from('wishlist')
    .delete()
    .eq('id', wishlistId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error removing from wishlist:', error);
    throw new Error('Failed to remove from wishlist');
  }
}

// Create collection category
export async function createCollectionCategory(
  userId: string,
  categoryData: Omit<CollectionCategory, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('collection_categories')
    .insert({
      user_id: userId,
      ...categoryData,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating collection category:', error);
    throw new Error('Failed to create collection category');
  }

  return data.id;
}

// Get user's collection categories
export async function getCollectionCategories(userId: string): Promise<CollectionCategory[]> {
  const { data, error } = await supabase
    .from('collection_categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching collection categories:', error);
    return [];
  }

  return data || [];
}

// Add game to category
export async function addGameToCategory(
  gameId: string,
  categoryId: string
): Promise<void> {
  const { error } = await supabase
    .from('game_collection_categories')
    .insert({
      game_collection_id: gameId,
      category_id: categoryId,
    });

  if (error) {
    console.error('Error adding game to category:', error);
    throw new Error('Failed to add game to category');
  }
}

// Remove game from category
export async function removeGameFromCategory(
  gameId: string,
  categoryId: string
): Promise<void> {
  const { error } = await supabase
    .from('game_collection_categories')
    .delete()
    .eq('game_collection_id', gameId)
    .eq('category_id', categoryId);

  if (error) {
    console.error('Error removing game from category:', error);
    throw new Error('Failed to remove game from category');
  }
}

// Record play session
export async function recordPlaySession(
  userId: string,
  sessionData: Omit<GamePlaySession, 'id' | 'user_id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('game_play_sessions')
    .insert({
      user_id: userId,
      ...sessionData,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error recording play session:', error);
    throw new Error('Failed to record play session');
  }

  return data.id;
}

// Get play sessions for a game
export async function getPlaySessions(
  gameId: string,
  userId: string,
  limit: number = 20
): Promise<GamePlaySession[]> {
  const { data, error } = await supabase
    .from('game_play_sessions')
    .select('*')
    .eq('game_collection_id', gameId)
    .eq('user_id', userId)
    .order('session_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching play sessions:', error);
    return [];
  }

  return data || [];
}

// Rate a game
export async function rateGame(
  userId: string,
  ratingData: Omit<GameRating, 'id' | 'user_id' | 'created_at' | 'updated_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('game_ratings')
    .upsert({
      user_id: userId,
      ...ratingData,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error rating game:', error);
    throw new Error('Failed to rate game');
  }

  return data.id;
}

// Get game rating
export async function getGameRating(
  gameTitle: string,
  userId: string
): Promise<GameRating | null> {
  const { data, error } = await supabase
    .from('game_ratings')
    .select('*')
    .eq('game_title', gameTitle)
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching game rating:', error);
    return null;
  }

  return data;
}

// Get collection overview
export async function getCollectionOverview(userId: string): Promise<CollectionOverview | null> {
  const { data, error } = await supabase
    .rpc('get_collection_overview', { user_uuid: userId });

  if (error) {
    console.error('Error fetching collection overview:', error);
    return null;
  }

  return data;
}

// Search collection
export async function searchCollection(
  userId: string,
  searchTerm: string,
  categoryFilter?: string,
  conditionFilter?: string
): Promise<GameCollection[]> {
  const { data, error } = await supabase
    .rpc('search_collection', {
      user_uuid: userId,
      search_term: searchTerm,
      category_filter: categoryFilter,
      condition_filter: conditionFilter,
    });

  if (error) {
    console.error('Error searching collection:', error);
    return [];
  }

  return data || [];
}

// Update collection statistics
export async function updateCollectionStatistics(userId: string): Promise<void> {
  const { error } = await supabase
    .rpc('update_collection_statistics', { user_uuid: userId });

  if (error) {
    console.error('Error updating collection statistics:', error);
  }
}

// Get games for sale/trade
export async function getGamesForSale(
  userId?: string,
  forSale: boolean = true,
  forTrade: boolean = false,
  limit: number = 20
): Promise<GameCollection[]> {
  let query = supabase
    .from('game_collections')
    .select('*')
    .eq('is_public', true);

  if (forSale && forTrade) {
    query = query.or('is_for_sale.eq.true,is_for_trade.eq.true');
  } else if (forSale) {
    query = query.eq('is_for_sale', true);
  } else if (forTrade) {
    query = query.eq('is_for_trade', true);
  }

  if (userId) {
    query = query.neq('user_id', userId); // Exclude user's own games
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching games for sale:', error);
    return [];
  }

  return data || [];
}

// Get games by category
export async function getGamesByCategory(
  userId: string,
  category: string
): Promise<GameCollection[]> {
  const { data, error } = await supabase
    .from('game_collections')
    .select('*')
    .eq('user_id', userId)
    .eq('game_category', category)
    .order('game_title', { ascending: true });

  if (error) {
    console.error('Error fetching games by category:', error);
    return [];
  }

  return data || [];
}

// Get collection statistics
export async function getCollectionStats(userId: string): Promise<any> {
  const { data, error } = await supabase
    .from('collection_statistics')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching collection stats:', error);
    return null;
  }

  return data;
}

// Get recent additions
export async function getRecentAdditions(
  userId: string,
  limit: number = 10
): Promise<GameCollection[]> {
  const { data, error } = await supabase
    .from('game_collections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent additions:', error);
    return [];
  }

  return data || [];
} 