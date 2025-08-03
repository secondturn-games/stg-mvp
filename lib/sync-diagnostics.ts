import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
const envPath = join(process.cwd(), '.env.local')
config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runDiagnostics() {
  console.log('🔍 Running sync diagnostics...\n')
  
  try {
    // 1. Check table exists and structure
    console.log('1️⃣ Checking table structure...')
    const { data: tableInfo, error: tableError } = await supabase
      .from('csv_games')
      .select('*')
      .limit(1)
    
    if (tableError) {
      console.error('❌ Table error:', tableError)
      return
    }
    console.log('✅ Table accessible')
    
    // 2. Check current count
    console.log('\n2️⃣ Checking current data count...')
    const { count, error: countError } = await supabase
      .from('csv_games')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Count error:', countError)
      return
    }
    console.log(`📊 Current count: ${count}`)
    
    // 3. Test small insert
    console.log('\n3️⃣ Testing small insert...')
    const testData = {
      id: 'test-sync-' + Date.now(),
      name: 'Test Game',
      yearpublished: '2024',
      rank: '999999',
      bayesaverage: '0.0',
      average: '0.0',
      usersrated: '0',
      is_expansion: '0'
    }
    
    const { error: insertError } = await supabase
      .from('csv_games')
      .insert(testData)
    
    if (insertError) {
      console.error('❌ Insert test failed:', insertError)
      console.log('🔍 This might indicate rate limiting or permission issues')
    } else {
      console.log('✅ Insert test successful')
      
      // Clean up test data
      await supabase
        .from('csv_games')
        .delete()
        .eq('id', testData.id)
    }
    
    // 4. Check recent activity
    console.log('\n4️⃣ Checking recent activity...')
    const { data: recentData, error: recentError } = await supabase
      .from('csv_games')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(5)
    
    if (recentError) {
      console.error('❌ Recent data error:', recentError)
    } else {
      console.log('📅 Recent entries:')
      recentData?.forEach((item: any, index: number) => {
        console.log(`   ${index + 1}. ${item.name} (${item.id}) - ${item.created_at}`)
      })
    }
    
    // 5. Check for any ongoing processes
    console.log('\n5️⃣ Checking for potential issues...')
    console.log('🔍 Common issues:')
    console.log('   • Rate limiting: Too many requests per minute')
    console.log('   • Connection timeout: Network issues')
    console.log('   • Memory limits: Large dataset processing')
    console.log('   • Concurrent operations: Multiple syncs running')
    
    console.log('\n💡 Recommendations:')
    console.log('   • Try smaller batch sizes (50 instead of 100)')
    console.log('   • Add delays between batches')
    console.log('   • Check Supabase dashboard for errors')
    console.log('   • Consider using Supabase CLI for large imports')
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error)
  }
}

// Run diagnostics
runDiagnostics() 