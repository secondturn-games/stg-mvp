import { supabase } from './supabase'
import type { Tables, Inserts, Updates } from './supabase'

// User operations
export async function createUser(userData: Inserts<'users'>) {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }

  return data
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

export async function updateUser(id: string, updates: Updates<'users'>) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating user:', error)
    throw error
  }

  return data
}

// Game operations
export async function createGame(gameData: Inserts<'games'>) {
  const { data, error } = await supabase
    .from('games')
    .insert(gameData)
    .select()
    .single()

  if (error) {
    console.error('Error creating game:', error)
    throw error
  }

  return data
}

export async function getGameById(id: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching game:', error)
    return null
  }

  return data
}

export async function searchGames(query: string, language: string = 'en') {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .textSearch(`title->${language}`, query)
    .limit(20)

  if (error) {
    console.error('Error searching games:', error)
    return []
  }

  return data
}

// Listing operations
export async function createListing(listingData: Inserts<'listings'>) {
  const { data, error } = await supabase
    .from('listings')
    .insert(listingData)
    .select()
    .single()

  if (error) {
    console.error('Error creating listing:', error)
    throw error
  }

  return data
}

export async function getListingById(id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      users!listings_seller_id_fkey(*),
      games!listings_game_id_fkey(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching listing:', error)
    return null
  }

  return data
}

export async function getListingsBySeller(sellerId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(`
      *,
      games!listings_game_id_fkey(*)
    `)
    .eq('seller_id', sellerId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching seller listings:', error)
    return []
  }

  return data
}

export async function searchListings(filters: {
  query?: string
  country?: string
  condition?: string
  minPrice?: number
  maxPrice?: number
  language?: string
}) {
  let query = supabase
    .from('listings')
    .select(`
      *,
      users!listings_seller_id_fkey(*),
      games!listings_game_id_fkey(*)
    `)
    .eq('status', 'active')

  if (filters.country) {
    query = query.eq('location_country', filters.country)
  }

  if (filters.condition) {
    query = query.eq('condition', filters.condition)
  }

  if (filters.minPrice) {
    query = query.gte('price', filters.minPrice)
  }

  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  const { data, error } = await query
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error searching listings:', error)
    return []
  }

  return data
}

// Utility functions
export async function getBalticCountries() {
  return [
    { code: 'EE', name: 'Estonia', nameLocal: 'Eesti' },
    { code: 'LV', name: 'Latvia', nameLocal: 'Latvija' },
    { code: 'LT', name: 'Lithuania', nameLocal: 'Lietuva' },
  ]
}

export async function getLanguages() {
  return [
    { code: 'en', name: 'English' },
    { code: 'et', name: 'Eesti' },
    { code: 'lv', name: 'Latviešu' },
    { code: 'lt', name: 'Lietuvių' },
  ]
}

export async function getConditions() {
  return [
    { code: 'new', name: 'New' },
    { code: 'like_new', name: 'Like New' },
    { code: 'very_good', name: 'Very Good' },
    { code: 'good', name: 'Good' },
    { code: 'acceptable', name: 'Acceptable' },
  ]
} 