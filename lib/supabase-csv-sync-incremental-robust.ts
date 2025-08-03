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

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export async function syncCSVIncrementalRobust() {
  try {
    console.log('🔄 Starting robust incremental CSV sync...')
    
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
    
    // 3. Get existing data from database (in chunks to avoid memory issues)
    console.log('📥 Fetching existing data...')
    const existingGames = new Map<string, any>()
    let offset = 0
    const chunkSize = 1000
    
    while (true) {
      const { data: chunk, error: fetchError } = await supabase
        .from('csv_games')
        .select('*')
        .range(offset, offset + chunkSize - 1)
      
      if (fetchError) {
        console.error('❌ Error fetching chunk:', fetchError)
        return
      }
      
      if (!chunk || chunk.length === 0) break
      
      chunk.forEach((game: any) => existingGames.set(game.id, game))
      offset += chunkSize
      
      console.log(`📥 Fetched ${existingGames.size} existing games...`)
      
      // Small delay to avoid rate limiting
      await delay(100)
    }
    
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
    
    // 5. Insert new games (smaller batches with delays)
    if (toInsert.length > 0) {
      console.log('📥 Inserting new games...')
      const batchSize = 50 // Smaller batches
      
      for (let i = 0; i < toInsert.length; i += batchSize) {
        const batch = toInsert.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(toInsert.length / batchSize)
        
        console.log(`📥 Inserting batch ${batchNumber}/${totalBatches} (${batch.length} games)...`)
        
        const { error: insertError } = await supabase
          .from('csv_games')
          .insert(batch)
        
        if (insertError) {
          console.error(`❌ Error inserting batch ${batchNumber}:`, insertError)
          console.log('🔄 Retrying in 5 seconds...')
          await delay(5000)
          
          // Retry once
          const { error: retryError } = await supabase
            .from('csv_games')
            .insert(batch)
          
          if (retryError) {
            console.error(`❌ Retry failed for batch ${batchNumber}:`, retryError)
            return
          }
        }
        
        console.log(`✅ Batch ${batchNumber} completed`)
        
        // Delay between batches to avoid rate limiting
        if (i + batchSize < toInsert.length) {
          console.log('⏳ Waiting 2 seconds before next batch...')
          await delay(2000)
        }
      }
    }
    
    // 6. Update changed games (smaller batches with delays)
    if (toUpdate.length > 0) {
      console.log('🔄 Updating changed games...')
      const batchSize = 50 // Smaller batches
      
      for (let i = 0; i < toUpdate.length; i += batchSize) {
        const batch = toUpdate.slice(i, i + batchSize)
        const batchNumber = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(toUpdate.length / batchSize)
        
        console.log(`🔄 Updating batch ${batchNumber}/${totalBatches} (${batch.length} games)...`)
        
        const { error: updateError } = await supabase
          .from('csv_games')
          .upsert(batch, { onConflict: 'id' })
        
        if (updateError) {
          console.error(`❌ Error updating batch ${batchNumber}:`, updateError)
          console.log('🔄 Retrying in 5 seconds...')
          await delay(5000)
          
          // Retry once
          const { error: retryError } = await supabase
            .from('csv_games')
            .upsert(batch, { onConflict: 'id' })
          
          if (retryError) {
            console.error(`❌ Retry failed for batch ${batchNumber}:`, retryError)
            return
          }
        }
        
        console.log(`✅ Batch ${batchNumber} completed`)
        
        // Delay between batches to avoid rate limiting
        if (i + batchSize < toUpdate.length) {
          console.log('⏳ Waiting 2 seconds before next batch...')
          await delay(2000)
        }
      }
    }
    
    // 7. Verify final count
    const { count } = await supabase
      .from('csv_games')
      .select('*', { count: 'exact', head: true })
    
    console.log(`🎉 Robust sync completed!`)
    console.log(`📊 Final database count: ${count}`)
    console.log(`📈 Total processed: ${csvRecords.length}`)
    
  } catch (error) {
    console.error('❌ Robust incremental sync failed:', error)
  }
}

// Run sync if called directly
if (require.main === module) {
  syncCSVIncrementalRobust()
    .then(() => {
      console.log('🎉 Robust incremental sync completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Robust incremental sync failed:', error)
      process.exit(1)
    })
} 