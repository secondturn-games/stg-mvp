#!/usr/bin/env node

// Simple test script to debug search functionality
import { BGGService } from './lib/bgg/index.js'

async function testSearch() {
  try {
    console.log('🧪 Testing BGG search...')
    
    const bggService = new BGGService()
    
    console.log('🔍 Searching for "wingspan"...')
    const results = await bggService.searchGames('wingspan')
    
    console.log(`✅ Found ${results.length} results`)
    
    if (results.length > 0) {
      console.log('Top 3 results:')
      results.slice(0, 3).forEach((result, index) => {
        console.log(`  ${index + 1}. ${result.name} (${result.type})`)
        console.log(`     ID: ${result.id}, Year: ${result.yearpublished}`)
      })
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error('Error stack:', error.stack)
  }
}

testSearch()
