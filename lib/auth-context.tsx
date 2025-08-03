'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './db'
import type { User as UserProfile } from '@/types'

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await loadProfile(session.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error loading profile:', error)
        return
      }

      // Use database fields directly (they now match our TypeScript interface)
      setProfile(data)


    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const signUp = async (email: string, password: string, profileData: Partial<UserProfile>) => {
    try {
      // Map TypeScript fields to database fields for the trigger
      const authData = {
        username: profileData.username,
        full_name: profileData.full_name,
        city: profileData.city,
        country: profileData.country,
        language: profileData.language
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: authData
        }
      })

      if (error) return { error }

      // Profile will be created automatically by the trigger
      return { error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      // Map TypeScript fields back to database fields
      const dbUpdates: any = {}
      
      if (updates.username !== undefined) dbUpdates.username = updates.username
      if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name
      if (updates.city !== undefined) dbUpdates.city = updates.city
      if (updates.country !== undefined) dbUpdates.country = updates.country
      if (updates.language !== undefined) dbUpdates.language = updates.language
      if (updates.bio !== undefined) dbUpdates.bio = updates.bio

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id)

      if (error) return { error }

      // Reload profile
      await loadProfile(user.id)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 