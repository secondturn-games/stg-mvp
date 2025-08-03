import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local with absolute path
const envPath = join(process.cwd(), '.env.local')
console.log('🔍 Loading environment from:', envPath)
config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Debug: Show what environment variables are loaded
console.log('🔍 Environment check:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Set' : '❌ Missing')

// Check for required environment variables
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CSVGameData {
  id: string
  name: string
  yearpublished: string
  rank: string
  bayesaverage: string
  is_expansion: string
  abstracts_rank: string
  cgs_rank: string
  childrensgames_rank: string
  familygames_rank: string
  partygames_rank: string
  strategygames_rank: string
  thematic_rank: string
  wargames_rank: string
}

export async function syncCSVToSupabase() {
  try {
    console.log('🔄 Starting CSV to Supabase sync...')
    
    // 1. Read CSV file
    const csvFilePath = './public/boardgames_ranks.csv'
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    
    // 2. Parse CSV data
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVGameData[]
    
    console.log(`📊 Found ${records.length} games in CSV`)
    
    // 3. Clear existing data
    console.log('🗑️ Clearing existing data...')
    const { error: deleteError } = await supabase
      .from('csv_games')
      .delete()
      .neq('id', '')
    
    if (deleteError) {
      console.error('❌ Error clearing data:', deleteError)
      return
    }
    
    // 4. Insert new data
    console.log('📥 Inserting new data...')
    const { data, error } = await supabase
      .from('csv_games')
      .insert(records)
      .select()
    
    if (error) {
      console.error('❌ Error inserting data:', error)
      return
    }
    
    console.log(`✅ Successfully synced ${data?.length || 0} games to Supabase`)
    
    // 5. Verify data
    const { count } = await supabase
      .from('csv_games')
      .select('*', { count: 'exact', head: true })
    
    console.log(`🔍 Verification: ${count} games in database`)
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
  }
}

// Run sync if called directly
if (require.main === module) {
  syncCSVToSupabase()
    .then(() => {
      console.log('🎉 Sync completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Sync failed:', error)
      process.exit(1)
    })
} 