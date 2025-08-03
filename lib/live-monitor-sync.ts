import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
const envPath = join(process.cwd(), '.env.local')
config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function liveMonitorSync() {
  let lastCount = 0
  let startTime = Date.now()
  
  console.log('🔍 Starting live sync monitoring...')
  console.log('Press Ctrl+C to stop monitoring\n')
  
  while (true) {
    try {
      const { count, error } = await supabase
        .from('csv_games')
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        console.error('❌ Error checking count:', error)
        break
      }
      
      const currentCount = count || 0
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const change = currentCount - lastCount
      const changeRate = change > 0 ? `+${change}` : change.toString()
      
      // Clear console and show current status
      console.clear()
      console.log('🔄 LIVE SYNC MONITORING')
      console.log('='.repeat(50))
      console.log(`📊 Current games in database: ${currentCount.toLocaleString()}`)
      console.log(`📈 Progress: ${currentCount}/167,219 (${((currentCount / 167219) * 100).toFixed(1)}%)`)
      console.log(`⏱️  Elapsed time: ${elapsed}s`)
      console.log(`📈 Change since last check: ${changeRate}`)
      
      if (currentCount === 167219) {
        console.log('\n🎉 SYNC COMPLETED!')
        console.log(`✅ Total time: ${elapsed}s`)
        console.log(`✅ All ${currentCount.toLocaleString()} games synced`)
        break
      } else if (currentCount > 0) {
        console.log('\n🔄 Sync in progress...')
        console.log('⏳ Waiting for next update...')
      } else {
        console.log('\n⏳ Waiting for sync to start...')
      }
      
      lastCount = currentCount
      
      // Wait 2 seconds before next check
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } catch (error) {
      console.error('❌ Monitoring error:', error)
      break
    }
  }
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
  console.log('\n\n🛑 Monitoring stopped by user')
  process.exit(0)
})

// Run live monitoring
liveMonitorSync() 