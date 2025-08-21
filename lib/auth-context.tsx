'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from './db'
import type { User as UserProfile } from '@/types'

interface AuthContextType {
  user: SupabaseUser | null
  profile: UserProfile | null
  loading: boolean
  isLoading: boolean
  signUp: (email: string, password: string, profile: Partial<UserProfile>) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isSigningOut, setIsSigningOut] = useState(false)

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
        // Don't update state if we're in the middle of signing out
        if (isSigningOut) {
          return
        }
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
  }, [isSigningOut])



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

      // Check if we need to sync avatar from auth.users (for OAuth users)
      if (data && !data.avatar) {
        try {
          const { data: authUser } = await supabase.auth.getUser()
          if (authUser?.user?.user_metadata?.avatar_url) {
            // Update the avatar in our users table
            await supabase
              .from('users')
              .update({ avatar: authUser.user.user_metadata.avatar_url })
              .eq('id', userId)
            
            // Reload profile with updated avatar
            const { data: updatedProfile } = await supabase
              .from('users')
              .select('*')
              .eq('id', userId)
              .single()
            
            if (updatedProfile) {
              setProfile(updatedProfile)
              return
            }
          }
        } catch (syncError) {
          console.error('Error syncing avatar:', syncError)
        }
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
        username: profileData.username || email, // Use email as default username
        city: profileData.city || 'Unknown', // Set default city if not provided
        country: profileData.country || null, // Allow null country
        // Set defaults for other fields
        full_name: null,
        language: 'en' // Default to English
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
    // Set flag to prevent auth state change interference
    setIsSigningOut(true)
    
    try {
      // Clear local state first to prevent race conditions
      setUser(null)
      setProfile(null)
      
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
    } catch (error) {
      console.error('Sign out error:', error)
      // State is already cleared, just throw the error
      throw error
    } finally {
      // Reset the flag after a short delay to allow auth state change to complete
      setTimeout(() => {
        setIsSigningOut(false)
      }, 1000)
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') }

    try {
      // Map TypeScript fields back to database fields
      const dbUpdates: any = {}
      
      if (updates.username !== undefined) dbUpdates.username = updates.username
      if (updates.full_name !== undefined) dbUpdates.full_name = updates.full_name
      if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar
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

  const refreshProfile = async () => {
    if (user) {
      await loadProfile(user.id)
    }
  }

  const value = {
    user,
    profile,
    loading,
    isLoading: loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshProfile
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