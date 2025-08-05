#!/usr/bin/env node

/**
 * Script to populate Supabase games table with top 100 ranked games from BGG
 * Usage: node scripts/populate-top-games.js
 */

import { createClient } from '@supabase/supabase-js'
import fetch from 'node-fetch'

// Configuration
const BATCH_SIZE = 20 // BGG API allows max 20 IDs per request
const RATE_LIMIT_DELAY = 2000 // 2 seconds between requests
const TOP_GAMES_COUNT = 100

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
  if (!text) return text
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
}

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Parse BGG XML response for game metadata
function parseBGGMetadataXML(xmlText) {
  const items = []
  
  try {
    // Find all item elements
    const itemRegex = /<item[^>]*type="(boardgame|boardgameexpansion)"[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g
    let match
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      const gameType = match[1]
      const gameId = match[2]
      const itemContent = match[3]
      
      // Parse basic metadata
      const nameMatch = itemContent.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
      const yearMatch = itemContent.match(/<yearpublished[^>]*value="([^"]*)"/)
      const rankMatch = itemContent.match(/<rank[^>]*type="subtype"[^>]*value="([^"]*)"/)
      const ratingMatch = itemContent.match(/<average[^>]*value="([^"]*)"/)
      const thumbnailMatch = itemContent.match(/<thumbnail>(.*?)<\/thumbnail>/)
      const imageMatch = itemContent.match(/<image>(.*?)<\/image>/)

      // Parse new fields for full game details
      const minPlayersMatch = itemContent.match(/<minplayers[^>]*value="([^"]*)"/)
      const maxPlayersMatch = itemContent.match(/<maxplayers[^>]*value="([^"]*)"/)
      const playingTimeMatch = itemContent.match(/<playingtime[^>]*value="([^"]*)"/)
      const minAgeMatch = itemContent.match(/<minage[^>]*value="([^"]*)"/)
      const descriptionMatch = itemContent.match(/<description>(.*?)<\/description>/)
      const weightMatch = itemContent.match(/<averageweight[^>]*value="([^"]*)"/)

      // Parse mechanics
      const mechanics = []
      const mechanicsRegex = /<link[^>]*type="boardgamemechanic"[^>]*value="([^"]*)"[^>]*>/g
      let mechanicsMatch
      while ((mechanicsMatch = mechanicsRegex.exec(itemContent)) !== null) {
        mechanics.push(decodeHtmlEntities(mechanicsMatch[1]))
      }

      // Parse categories
      const categories = []
      const categoriesRegex = /<link[^>]*type="boardgamecategory"[^>]*value="([^"]*)"[^>]*>/g
      let categoriesMatch
      while ((categoriesMatch = categoriesRegex.exec(itemContent)) !== null) {
        categories.push(decodeHtmlEntities(categoriesMatch[1]))
      }

      // Parse alternate names
      const alternateNames = []
      const alternateNameRegex = /<name[^>]*type="alternate"[^>]*value="([^"]*)"[^>]*>/g
      let alternateNameMatch
      while ((alternateNameMatch = alternateNameRegex.exec(itemContent)) !== null) {
        const decodedName = decodeHtmlEntities(alternateNameMatch[1])
        alternateNames.push(decodedName)
      }

      if (nameMatch) {
        items.push({
          id: gameId,
          name: decodeHtmlEntities(nameMatch[1]),
          yearpublished: yearMatch?.[1],
          rank: rankMatch?.[1],
          bayesaverage: ratingMatch?.[1],
          thumbnail: thumbnailMatch?.[1],
          image: imageMatch?.[1],
          alternateNames,
          type: gameType,
          minplayers: minPlayersMatch?.[1],
          maxplayers: maxPlayersMatch?.[1],
          playingtime: playingTimeMatch?.[1],
          minage: minAgeMatch?.[1],
          description: descriptionMatch?.[1] ? decodeHtmlEntities(descriptionMatch[1]) : undefined,
          weight: weightMatch?.[1],
          mechanics,
          categories
        })
      }
    }
  } catch (error) {
    console.error('Error parsing BGG metadata XML:', error)
  }

  return items
}

// Fetch top ranked games from BGG
async function fetchTopRankedGames() {
  console.log(`🔍 Fetching top ${TOP_GAMES_COUNT} ranked games from BGG...`)
  
  try {
    // Get top ranked games (boardgame type only, not expansions)
    const response = await fetch(
      `https://boardgamegeek.com/xmlapi2/search?type=boardgame&sort=rank&sorttype=rank&limit=${TOP_GAMES_COUNT}`,
      {
        headers: {
          'User-Agent': 'SecondTurnGames/1.0 (info@secondturn.games)',
          'Accept': 'application/xml; charset=utf-8',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.status}`)
    }

    const xmlText = await response.text()
    
    // Parse search results to get game IDs
    const gameIds = []
    const itemRegex = /<item[^>]*id="(\d+)"[^>]*>/g
    let match
    
    while ((match = itemRegex.exec(xmlText)) !== null) {
      gameIds.push(match[1])
    }

    console.log(`✅ Found ${gameIds.length} top ranked games`)
    return gameIds

  } catch (error) {
    console.error('❌ Error fetching top ranked games:', error)
    throw error
  }
}

// Fetch detailed metadata for a batch of games
async function fetchGameMetadataBatch(gameIds) {
  if (gameIds.length === 0) return []
  
  const bggUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameIds.join(',')}&stats=1`
  
  try {
    const response = await fetch(bggUrl, {
      headers: {
        'User-Agent': 'SecondTurnGames/1.0 (info@secondturn.games)',
        'Accept': 'application/xml; charset=utf-8',
      },
    })

    if (!response.ok) {
      throw new Error(`BGG API metadata error: ${response.status}`)
    }

    const xmlText = await response.text()
    return parseBGGMetadataXML(xmlText)

  } catch (error) {
    console.error('❌ Error fetching game metadata batch:', error)
    return []
  }
}

// Cache games in Supabase
async function cacheGames(metadata) {
  if (metadata.length === 0) return
  
  console.log(`💾 Caching ${metadata.length} games in Supabase...`)
  
  try {
    const cacheData = metadata.map(meta => ({
      id: meta.id,
      name: meta.name,
      year_published: meta.yearpublished ? parseInt(meta.yearpublished) : null,
      min_players: meta.minplayers ? parseInt(meta.minplayers) : null,
      max_players: meta.maxplayers ? parseInt(meta.maxplayers) : null,
      playing_time: meta.playingtime ? parseInt(meta.playingtime) : null,
      min_age: meta.minage ? parseInt(meta.minage) : null,
      description: meta.description,
      thumbnail: meta.thumbnail,
      image: meta.image,
      bgg_rating: meta.bayesaverage ? parseFloat(meta.bayesaverage) : null,
      bgg_weight: meta.weight ? parseFloat(meta.weight) : null,
      bgg_rank: meta.rank ? parseInt(meta.rank) : null,
      game_type: meta.type === 'boardgameexpansion' ? 'expansion' : 'base-game',
      mechanics: meta.mechanics || [],
      categories: meta.categories || [],
      alternate_names: meta.alternateNames || [],
      updated_at: new Date().toISOString(),
      cache_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), // Cache for 60 days
    }))
    
    const { data, error } = await supabase
      .from('games')
      .upsert(cacheData, { onConflict: 'id' })
    
    if (error) {
      throw new Error(`Failed to cache games: ${error.message}`)
    }
    
    console.log(`✅ Successfully cached ${metadata.length} games in Supabase`)
    return data

  } catch (error) {
    console.error('❌ Error caching games:', error)
    throw error
  }
}

// Main function
async function populateTopGames() {
  console.log('🚀 Starting to populate top ranked games...')
  
  try {
    // Step 1: Fetch top ranked game IDs
    const gameIds = await fetchTopRankedGames()
    
    if (gameIds.length === 0) {
      console.log('❌ No games found')
      return
    }
    
    // Step 2: Process games in batches
    const allMetadata = []
    
    for (let i = 0; i < gameIds.length; i += BATCH_SIZE) {
      const batch = gameIds.slice(i, i + BATCH_SIZE)
      console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(gameIds.length / BATCH_SIZE)} (${batch.length} games)...`)
      
      const metadata = await fetchGameMetadataBatch(batch)
      allMetadata.push(...metadata)
      
      // Rate limiting between batches
      if (i + BATCH_SIZE < gameIds.length) {
        console.log(`⏳ Waiting ${RATE_LIMIT_DELAY}ms before next batch...`)
        await delay(RATE_LIMIT_DELAY)
      }
    }
    
    console.log(`📊 Total metadata collected: ${allMetadata.length} games`)
    
    // Step 3: Cache all games in Supabase
    await cacheGames(allMetadata)
    
    console.log('🎉 Successfully populated top ranked games!')
    
    // Step 4: Show summary
    const summary = allMetadata.map(game => ({
      rank: game.rank || 'N/A',
      name: game.name,
      year: game.yearpublished || 'N/A',
      rating: game.bayesaverage || 'N/A'
    }))
    
    console.log('\n📋 Top 10 Games Summary:')
    summary.slice(0, 10).forEach(game => {
      console.log(`  ${game.rank}. ${game.name} (${game.year}) - Rating: ${game.rating}`)
    })
    
  } catch (error) {
    console.error('❌ Failed to populate top games:', error)
    process.exit(1)
  }
}

// Run the script
populateTopGames() 