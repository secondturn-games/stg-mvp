#!/usr/bin/env node

/**
 * Simple script to populate Supabase games table with top 100 ranked games from BGG
 * Uses the existing BGGService class
 * Usage: node scripts/populate-top-games-simple.js
 */

import { BGGService } from '../lib/bgg-service.js'
import { createClient } from '@supabase/supabase-js'

// Configuration
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

// Helper function to delay execution
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
          'User-Agent': 'SecondTurnGames/1.0 (contact@secondturn.games)',
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
    
    // Step 2: Use BGGService to fetch and cache metadata
    const bggService = new BGGService()
    
    console.log(`📦 Fetching metadata for ${gameIds.length} games...`)
    
    // Fetch metadata in batches of 20 (BGG API limit)
    const batchSize = 20
    const allMetadata = []
    
    for (let i = 0; i < gameIds.length; i += batchSize) {
      const batch = gameIds.slice(i, i + batchSize)
      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(gameIds.length / batchSize)} (${batch.length} games)...`)
      
      // Use the existing fetchGameMetadata method
      const metadata = await bggService['fetchGameMetadata'](batch)
      allMetadata.push(...metadata)
      
      // Rate limiting between batches
      if (i + batchSize < gameIds.length) {
        console.log(`⏳ Waiting 2 seconds before next batch...`)
        await delay(2000)
      }
    }
    
    console.log(`📊 Total metadata collected: ${allMetadata.length} games`)
    
    // Step 3: Cache all games using the existing cacheMetadataBatch method
    await bggService['cacheMetadataBatch'](allMetadata)
    
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