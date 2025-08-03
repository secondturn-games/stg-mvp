import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPostgreSQLSearch() {
  try {
    console.log('🧪 Testing PostgreSQL search function...')

    // Test 1: Basic search
    console.log('\n🔍 Test 1: Searching for "Terraforming Mars"')
    const { data: test1, error: error1 } = await supabase.rpc('search_boardgames', { 
      term: 'Terraforming Mars' 
    })
    
    if (error1) {
      console.error('❌ Test 1 failed:', error1)
    } else {
      console.log('✅ Test 1 passed:', test1?.length || 0, 'results')
      if (test1 && test1.length > 0) {
        console.log('   Top result:', test1[0].name, '(Score:', test1[0].score.toFixed(2), ')')
      }
    }

    // Test 2: Fuzzy search
    console.log('\n🔍 Test 2: Searching for "Wngspn"')
    const { data: test2, error: error2 } = await supabase.rpc('search_boardgames', { 
      term: 'Wngspn' 
    })
    
    if (error2) {
      console.error('❌ Test 2 failed:', error2)
    } else {
      console.log('✅ Test 2 passed:', test2?.length || 0, 'results')
      if (test2 && test2.length > 0) {
        console.log('   Top result:', test2[0].name, '(Score:', test2[0].score.toFixed(2), ')')
      }
    }

    // Test 3: Word-based search
    console.log('\n🔍 Test 3: Searching for "Eclipse Dawn"')
    const { data: test3, error: error3 } = await supabase.rpc('search_boardgames', { 
      term: 'Eclipse Dawn' 
    })
    
    if (error3) {
      console.error('❌ Test 3 failed:', error3)
    } else {
      console.log('✅ Test 3 passed:', test3?.length || 0, 'results')
      if (test3 && test3.length > 0) {
        console.log('   Top result:', test3[0].name, '(Score:', test3[0].score.toFixed(2), ')')
      }
    }

    console.log('\n🎉 PostgreSQL search function tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testPostgreSQLSearch() 