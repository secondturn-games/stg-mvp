import { createClient } from '@supabase/supabase-js'

// Create a singleton Supabase client to avoid multiple instances
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Use a global variable to ensure singleton pattern works in browser
declare global {
  var __supabaseClient: ReturnType<typeof createClient> | undefined
}

export const supabase = globalThis.__supabaseClient || createClient(supabaseUrl, supabaseAnonKey)

// Store the instance globally to prevent recreation
if (!globalThis.__supabaseClient) {
  globalThis.__supabaseClient = supabase
} 