import { BGGService, type BGGSearchResult } from './bgg'

async function testBGGAPI() {
  try {
    console.log('🧪 Testing BGG API integration...')
    
    const bggService = new BGGService()
    
    // Test 1: BGG API search
    console.log('\n🔍 Test 1: BGG API search for "Wingspan"')
    const results = await bggService.searchGames('Wingspan')
    
    console.log(`✅ Found ${results.length} results`)
    
    if (results.length > 0) {
      console.log('Top 3 results:')
      results.slice(0, 3).forEach((result: BGGSearchResult, index: number) => {
        console.log(`  ${index + 1}. ${result.name} (${result.type})`)
        console.log(`     ID: ${result.id}, Year: ${result.yearpublished}`)
        console.log(`     Rank: ${result.rank || 'N/A'}, Rating: ${result.bayesaverage || 'N/A'}`)
        console.log(`     Thumbnail: ${result.thumbnail ? 'Yes' : 'No'}`)
        console.log(`     BGG Link: ${result.bggLink || 'N/A'}`)
        if (result.alternateNames && result.alternateNames.length > 0) {
          console.log(`     Alternate names: ${result.alternateNames.join(', ')}`)
        }
        console.log('')
      })
    }
    
    console.log('\n🎉 BGG API test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBGGAPI() 