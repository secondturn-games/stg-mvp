import { createSupabaseClient } from './supabase';
import { auth, clerkClient } from '@clerk/nextjs/server';
import type { Updates } from './supabase';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  verified_seller: boolean;
  preferred_language: 'en' | 'et' | 'lv' | 'lt';
  country: 'EE' | 'LV' | 'LT';
  bank_verified: boolean;
  vat_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileData {
  email: string;
  username: string;
  country: 'EE' | 'LV' | 'LT';
  preferred_language?: 'en' | 'et' | 'lv' | 'lt';
}

// Create a new user profile in our database
export async function createUserProfile(
  userData: CreateUserProfileData
): Promise<UserProfile> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: userData.email,
      username: userData.username,
      country: userData.country,
      preferred_language: userData.preferred_language || 'en',
      verified_seller: false,
      bank_verified: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create user profile: ${error.message}`);
  }

  return data;
}

// Get current user's profile
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { userId } = await auth();

    if (!userId) {
      return null;
    }

    // Get user from Clerk to get email
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return null;
    }

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

// Update user profile
export async function updateUserProfile(
  updates: Partial<Updates<'users'>>
): Promise<UserProfile> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email = clerkUser.emailAddresses[0]?.emailAddress;

  if (!email) {
    throw new Error('User email not found');
  }

  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('email', email)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update user profile: ${error.message}`);
  }

  return data;
}

// Get user profile by ID
export async function getUserProfileById(
  userId: string
): Promise<UserProfile | null> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

// Check if user profile exists
export async function userProfileExists(email: string): Promise<boolean> {
  const supabase = createSupabaseClient();
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    return false;
  }

  return !!data;
}

// Get user statistics
export async function getUserStats(userId: string) {
  const supabase = createSupabaseClient();
  const [listingsResult, transactionsResult] = await Promise.all([
    supabase.from('listings').select('id, status').eq('seller_id', userId),
    supabase
      .from('transactions')
      .select('id, amount')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
  ]);

  const activeListings =
    listingsResult.data?.filter(l => l.status === 'active').length || 0;
  const totalListings = listingsResult.data?.length || 0;
  const totalTransactions = transactionsResult.data?.length || 0;
  const totalVolume =
    transactionsResult.data?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

  return {
    activeListings,
    totalListings,
    totalTransactions,
    totalVolume,
  };
}
