import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
const envPath = join(process.cwd(), '.env.local')
config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function monitorSync() {
  try {
    console.log('🔍 Monitoring sync progress...')
    
    const { count, error } = await supabase
      .from('csv_games')
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.error('❌ Error checking count:', error)
      return
    }
    
    console.log(`📊 Current games in database: ${count}`)
    console.log(`📈 Progress: ${count}/167,177 (${((count || 0) / 167177 * 100).toFixed(1)}%)`)
    
    if (count === 167177) {
      console.log('✅ Sync completed!')
    } else if (count && count > 0) {
      console.log('🔄 Sync in progress...')
    } else {
      console.log('⏳ Sync not started or no data yet')
    }
    
  } catch (error) {
    console.error('❌ Monitoring failed:', error)
  }
}

// Run monitoring
monitorSync() 