async function testBGGAPISimple() {
  try {
    console.log('🧪 Testing BGG API directly...')
    
    // Test 1: Direct BGG search API call
    console.log('\n🔍 Test 1: Direct BGG search for "Wingspan"')
    const searchUrl = 'https://boardgamegeek.com/xmlapi2/search?query=wingspan&type=boardgame&exact=0'
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'SecondTurnGames/1.0 (info@secondturn.games)',
        'Accept': 'application/xml; charset=utf-8',
      },
    })

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.status}`)
    }

    const xmlText = await response.text()
    console.log('✅ BGG search API response received')
    console.log(`Response length: ${xmlText.length} characters`)
    
    // Parse basic results
    const itemRegex = /<item[^>]*type="(boardgame|boardgameexpansion)"[^>]*id="(\d+)"[^>]*>([\s\S]*?)<\/item>/g
    let match
    let count = 0
    
    while ((match = itemRegex.exec(xmlText)) !== null && count < 5) {
      const gameType = match[1]
      const gameId = match[2]
      const itemContent = match[3]
      
      const nameMatch = itemContent.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
      const yearMatch = itemContent.match(/<yearpublished[^>]*value="(\d{4})"/)
      
      if (nameMatch) {
        count++
        console.log(`  ${count}. ${nameMatch[1]} (${gameType}, ID: ${gameId})`)
        if (yearMatch) {
          console.log(`     Year: ${yearMatch[1]}`)
        }
      }
    }
    
    console.log(`\n✅ Found ${count} games in search results`)
    
    // Test 2: Metadata API call for first result
    if (count > 0) {
      console.log('\n🔍 Test 2: Fetching metadata for first result')
      
      // Extract first game ID
      const firstMatch = xmlText.match(/<item[^>]*type="(boardgame|boardgameexpansion)"[^>]*id="(\d+)"[^>]*>/)
      if (firstMatch) {
        const gameId = firstMatch[2]
        const metadataUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameId}&type=boardgame&stats=1`
        
        console.log(`Fetching metadata for game ID: ${gameId}`)
        
        const metadataResponse = await fetch(metadataUrl, {
          headers: {
            'User-Agent': 'SecondTurnGames/1.0 (info@secondturn.games)',
            'Accept': 'application/xml; charset=utf-8',
          },
        })
        
        if (metadataResponse.ok) {
          const metadataXml = await metadataResponse.text()
          console.log('✅ Metadata API response received')
          
          // Parse basic metadata
          const nameMatch = metadataXml.match(/<name[^>]*type="primary"[^>]*value="([^"]*)"/)
          const rankMatch = metadataXml.match(/<rank[^>]*type="subtype"[^>]*value="([^"]*)"/)
          const ratingMatch = metadataXml.match(/<average[^>]*value="([^"]*)"/)
          const thumbnailMatch = metadataXml.match(/<thumbnail>(.*?)<\/thumbnail>/)
          
          if (nameMatch) {
            console.log(`  Game: ${nameMatch[1]}`)
            console.log(`  Rank: ${rankMatch?.[1] || 'N/A'}`)
            console.log(`  Rating: ${ratingMatch?.[1] || 'N/A'}`)
            console.log(`  Thumbnail: ${thumbnailMatch ? 'Yes' : 'No'}`)
          }
        } else {
          console.log(`❌ Metadata API error: ${metadataResponse.status}`)
        }
      }
    }
    
    console.log('\n🎉 BGG API direct test completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testBGGAPISimple() 