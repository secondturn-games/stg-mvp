import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { parse } from 'csv-parse/sync'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables
const envPath = join(process.cwd(), '.env.local')
config({ path: envPath })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

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

export async function syncCSVIncremental() {
  try {
    console.log('🔄 Starting incremental CSV sync...')
    
    // 1. Read CSV file
    const csvFilePath = './public/boardgames_ranks.csv'
    const csvContent = readFileSync(csvFilePath, 'utf-8')
    
    // 2. Parse CSV data
    const csvRecords = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as CSVGameData[]
    
    console.log(`📊 Found ${csvRecords.length} games in CSV`)
    
    // 3. Get existing data from database
    console.log('📥 Fetching existing data...')
    const { data: existingData, error: fetchError } = await supabase
      .from('csv_games')
      .select('*')
    
    if (fetchError) {
      console.error('❌ Error fetching existing data:', fetchError)
      return
    }
    
    const existingGames = new Map(existingData?.map((game: any) => [game.id, game]) || [])
    console.log(`📊 Found ${existingGames.size} existing games in database`)
    
    // 4. Compare and categorize changes
    const toInsert: CSVGameData[] = []
    const toUpdate: CSVGameData[] = []
    const unchanged: string[] = []
    
    for (const csvGame of csvRecords) {
      const existing = existingGames.get(csvGame.id)
      
      if (!existing) {
        toInsert.push(csvGame)
      } else {
        // Check if any field has changed
        const hasChanged = Object.keys(csvGame).some(key => {
          const csvValue = csvGame[key as keyof CSVGameData]
          const dbValue = (existing as any)[key]
          return csvValue !== dbValue
        })
        
        if (hasChanged) {
          toUpdate.push(csvGame)
        } else {
          unchanged.push(csvGame.id)
        }
      }
    }
    
    console.log(`📈 Changes detected:`)
    console.log(`  ➕ New games: ${toInsert.length}`)
    console.log(`  🔄 Updated games: ${toUpdate.length}`)
    console.log(`  ✅ Unchanged: ${unchanged.length}`)
    
    // 5. Insert new games
    if (toInsert.length > 0) {
      console.log('📥 Inserting new games...')
      const { error: insertError } = await supabase
        .from('csv_games')
        .insert(toInsert)
      
      if (insertError) {
        console.error('❌ Error inserting new games:', insertError)
        return
      }
      console.log(`✅ Inserted ${toInsert.length} new games`)
    }
    
    // 6. Update changed games
    if (toUpdate.length > 0) {
      console.log('🔄 Updating changed games...')
      
      // Update in batches to avoid overwhelming the database
      const batchSize = 100
      for (let i = 0; i < toUpdate.length; i += batchSize) {
        const batch = toUpdate.slice(i, i + batchSize)
        
        const { error: updateError } = await supabase
          .from('csv_games')
          .upsert(batch, { onConflict: 'id' })
        
        if (updateError) {
          console.error(`❌ Error updating batch ${Math.floor(i/batchSize) + 1}:`, updateError)
          return
        }
        
        console.log(`✅ Updated batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(toUpdate.length/batchSize)}`)
      }
    }
    
    // 7. Verify final count
    const { count } = await supabase
      .from('csv_games')
      .select('*', { count: 'exact', head: true })
    
    console.log(`🎉 Sync completed!`)
    console.log(`📊 Final database count: ${count}`)
    console.log(`📈 Total processed: ${csvRecords.length}`)
    
  } catch (error) {
    console.error('❌ Incremental sync failed:', error)
  }
}

// Run sync if called directly
if (require.main === module) {
  syncCSVIncremental()
    .then(() => {
      console.log('🎉 Incremental sync completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Incremental sync failed:', error)
      process.exit(1)
    })
} 