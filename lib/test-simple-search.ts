import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSimpleSearch() {
  try {
    console.log('🧪 Testing simple search...')

    // Test basic Supabase query
    console.log('\n🔍 Test 1: Basic Supabase query')
    const { data: test1, error: error1 } = await supabase
      .from('csv_games')
      .select('*')
      .ilike('name', '%wingspan%')
      .limit(5)
    
    if (error1) {
      console.error('❌ Test 1 failed:', error1)
    } else {
      console.log('✅ Test 1 passed:', test1?.length || 0, 'results')
      if (test1 && test1.length > 0) {
        console.log('   First result:', test1[0].name)
      }
    }

    // Test PostgreSQL function
    console.log('\n🔍 Test 2: PostgreSQL function')
    const { data: test2, error: error2 } = await supabase.rpc('search_boardgames', { 
      term: 'wingspan' 
    })
    
    if (error2) {
      console.error('❌ Test 2 failed:', error2)
    } else {
      console.log('✅ Test 2 passed:', test2?.length || 0, 'results')
      if (test2 && test2.length > 0) {
        console.log('   First result:', test2[0].name, '(Score:', test2[0].score.toFixed(2), ')')
      }
    }

    console.log('\n🎉 Simple search tests completed!')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  }
}

testSimpleSearch() 