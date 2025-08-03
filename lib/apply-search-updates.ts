import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function applySearchUpdates() {
  try {
    console.log('🔧 Applying PostgreSQL search updates...')

    // 1. Enable pg_trgm extension
    console.log('📦 Enabling pg_trgm extension...')
    const { error: extError } = await supabase.rpc('exec_sql', {
      sql: 'CREATE EXTENSION IF NOT EXISTS pg_trgm;'
    })
    
    if (extError) {
      console.error('❌ Failed to enable pg_trgm:', extError)
      return
    }
    console.log('✅ pg_trgm extension enabled')

    // 2. Create GIN index for fuzzy search
    console.log('🔍 Creating GIN index for fuzzy search...')
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_csv_games_name_trgm 
        ON csv_games USING gin (name gin_trgm_ops);
      `
    })
    
    if (indexError) {
      console.error('❌ Failed to create GIN index:', indexError)
      return
    }
    console.log('✅ GIN index created')

    // 3. Create full-text search index
    console.log('📝 Creating full-text search index...')
    const { error: ftsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_csv_games_name_fts 
        ON csv_games USING gin (to_tsvector('english', name));
      `
    })
    
    if (ftsError) {
      console.error('❌ Failed to create FTS index:', ftsError)
      return
    }
    console.log('✅ Full-text search index created')

    // 4. Create composite index
    console.log('🎯 Creating composite index...')
    const { error: compError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_csv_games_search 
        ON csv_games (is_expansion, rank, bayesaverage) 
        WHERE rank IS NOT NULL AND bayesaverage IS NOT NULL;
      `
    })
    
    if (compError) {
      console.error('❌ Failed to create composite index:', compError)
      return
    }
    console.log('✅ Composite index created')

    // 5. Create search function
    console.log('🔧 Creating search function...')
    const { error: funcError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION search_boardgames(term text)
        RETURNS TABLE (
          id text,
          name text,
          yearpublished text,
          rank text,
          bayesaverage text,
          is_expansion text,
          abstracts_rank text,
          cgs_rank text,
          childrensgames_rank text,
          familygames_rank text,
          partygames_rank text,
          strategygames_rank text,
          thematic_rank text,
          wargames_rank text,
          score float
        )
        AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            csv_games.id,
            csv_games.name,
            csv_games.yearpublished,
            csv_games.rank,
            csv_games.bayesaverage,
            csv_games.is_expansion,
            csv_games.abstracts_rank,
            csv_games.cgs_rank,
            csv_games.childrensgames_rank,
            csv_games.familygames_rank,
            csv_games.partygames_rank,
            csv_games.strategygames_rank,
            csv_games.thematic_rank,
            csv_games.wargames_rank,
            (
              -- Exact match boost (highest priority)
              CASE WHEN lower(csv_games.name) = lower(term) THEN 1000000 ELSE 0 END +
              
              -- Fuzzy match using pg_trgm similarity (0-1 scale, multiplied by 50000)
              similarity(csv_games.name, term) * 50000 +
              
              -- Base game priority (base games get 10000 bonus)
              CASE WHEN csv_games.is_expansion = '0' THEN 10000 ELSE 0 END +
              
              -- BGG rank bonus (lower rank = higher score, max 1000 bonus for rank 1)
              CASE 
                WHEN csv_games.rank IS NOT NULL AND csv_games.rank != '0' 
                THEN GREATEST(0, 1000 - CAST(csv_games.rank AS INTEGER))
                ELSE 0 
              END +
              
              -- Rating bonus (higher rating = higher score, max 1000 bonus for 10.0 rating)
              CASE 
                WHEN csv_games.bayesaverage IS NOT NULL AND csv_games.bayesaverage != '0'
                THEN CAST(csv_games.bayesaverage AS FLOAT) * 100
                ELSE 0 
              END +
              
              -- Year bonus (newer games get slight bonus, max 100 bonus for 2024)
              CASE 
                WHEN csv_games.yearpublished IS NOT NULL AND csv_games.yearpublished != '0'
                THEN GREATEST(0, CAST(csv_games.yearpublished AS INTEGER) - 1900) * 0.1
                ELSE 0 
              END
            ) AS score
          FROM csv_games
          WHERE 
            -- Fuzzy match using pg_trgm (similarity threshold 0.1)
            csv_games.name % term 
            OR 
            -- Full-text search
            to_tsvector('english', csv_games.name) @@ plainto_tsquery(term)
            OR
            -- Partial match fallback
            lower(csv_games.name) LIKE lower('%' || term || '%')
          ORDER BY score DESC
          LIMIT 50;
        END;
        $$ LANGUAGE plpgsql;
      `
    })
    
    if (funcError) {
      console.error('❌ Failed to create search function:', funcError)
      return
    }
    console.log('✅ Search function created')

    console.log('🎉 All PostgreSQL search updates applied successfully!')
    
  } catch (error) {
    console.error('❌ Error applying search updates:', error)
  }
}

applySearchUpdates() 