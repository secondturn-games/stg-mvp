import { supabase } from './db'
import type { User } from '@/types'

export async function signUp(email: string, password: string, userData: Partial<User>) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: userData.username,
          full_name: userData.fullName,
          city: userData.city,
          country: userData.country,
          language: userData.language,
        },
      },
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function resetPassword(email: string) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${appUrl}/reset-password`,
    })
    if (error) throw error
  } catch (error) {
    console.error('Reset password error:', error)
    throw error
  }
}

export async function updatePassword(password: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })
    if (error) throw error
  } catch (error) {
    console.error('Update password error:', error)
    throw error
  }
} 