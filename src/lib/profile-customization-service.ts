import { supabase } from './supabase';

export interface ProfileCustomization {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  social_links: {
    website?: string;
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    youtube?: string;
    twitch?: string;
    discord?: string;
  };
  profile_visibility: 'public' | 'private' | 'friends';
  show_email: boolean;
  show_location: boolean;
  show_activity: boolean;
  theme_preference: 'light' | 'dark' | 'auto';
  notification_preferences: {
    email_notifications: boolean;
    push_notifications: boolean;
    price_alerts: boolean;
    new_messages: boolean;
    review_notifications: boolean;
    badge_notifications: boolean;
  };
}

export interface ProfileHighlight {
  id: string;
  highlight_type: 'listing' | 'review' | 'achievement' | 'custom';
  title: string;
  description?: string;
  image_url?: string;
  link_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

export interface UserPreference {
  key: string;
  value: any;
}

// Get user's profile customization data
export async function getProfileCustomization(userId: string): Promise<ProfileCustomization | null> {
  const { data: user, error } = await supabase
    .from('users')
    .select(`
      display_name,
      bio,
      avatar_url,
      cover_image_url,
      social_links,
      profile_visibility,
      show_email,
      show_location,
      show_activity,
      theme_preference,
      notification_preferences
    `)
    .eq('id', userId)
    .single();

  if (error || !user) {
    return null;
  }

  return {
    display_name: user.display_name,
    bio: user.bio,
    avatar_url: user.avatar_url,
    cover_image_url: user.cover_image_url,
    social_links: user.social_links || {},
    profile_visibility: user.profile_visibility || 'public',
    show_email: user.show_email || false,
    show_location: user.show_location !== false,
    show_activity: user.show_activity !== false,
    theme_preference: user.theme_preference || 'light',
    notification_preferences: user.notification_preferences || {
      email_notifications: true,
      push_notifications: true,
      price_alerts: true,
      new_messages: true,
      review_notifications: true,
      badge_notifications: true,
    },
  };
}

// Update user's profile customization
export async function updateProfileCustomization(
  userId: string,
  updates: Partial<ProfileCustomization>
): Promise<void> {
  const { error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId);

  if (error) {
    console.error('Error updating profile customization:', error);
    throw new Error('Failed to update profile customization');
  }
}

// Get user's profile highlights
export async function getProfileHighlights(userId: string): Promise<ProfileHighlight[]> {
  const { data: highlights, error } = await supabase
    .from('profile_highlights')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching profile highlights:', error);
    return [];
  }

  return highlights || [];
}

// Create a profile highlight
export async function createProfileHighlight(
  userId: string,
  highlight: Omit<ProfileHighlight, 'id' | 'user_id' | 'created_at'>
): Promise<string> {
  const { data, error } = await supabase
    .from('profile_highlights')
    .insert({
      user_id: userId,
      ...highlight,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating profile highlight:', error);
    throw new Error('Failed to create profile highlight');
  }

  return data.id;
}

// Update a profile highlight
export async function updateProfileHighlight(
  highlightId: string,
  updates: Partial<ProfileHighlight>
): Promise<void> {
  const { error } = await supabase
    .from('profile_highlights')
    .update(updates)
    .eq('id', highlightId);

  if (error) {
    console.error('Error updating profile highlight:', error);
    throw new Error('Failed to update profile highlight');
  }
}

// Delete a profile highlight
export async function deleteProfileHighlight(highlightId: string): Promise<void> {
  const { error } = await supabase
    .from('profile_highlights')
    .delete()
    .eq('id', highlightId);

  if (error) {
    console.error('Error deleting profile highlight:', error);
    throw new Error('Failed to delete profile highlight');
  }
}

// Get user preference
export async function getUserPreference(
  userId: string,
  key: string
): Promise<any> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('preference_value')
    .eq('user_id', userId)
    .eq('preference_key', key)
    .single();

  if (error || !data) {
    return null;
  }

  return data.preference_value;
}

// Set user preference
export async function setUserPreference(
  userId: string,
  key: string,
  value: any
): Promise<void> {
  const { error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      preference_key: key,
      preference_value: value,
    });

  if (error) {
    console.error('Error setting user preference:', error);
    throw new Error('Failed to set user preference');
  }
}

// Record profile view
export async function recordProfileView(
  viewerId: string,
  viewedId: string,
  source: string = 'profile_page'
): Promise<void> {
  // Don't record self-views
  if (viewerId === viewedId) {
    return;
  }

  const { error } = await supabase
    .from('profile_views')
    .insert({
      viewer_id: viewerId,
      viewed_id: viewedId,
      source,
    });

  if (error) {
    console.error('Error recording profile view:', error);
  }
}

// Get user's profile statistics
export async function getUserProfileStats(userId: string): Promise<any> {
  const { data, error } = await supabase
    .rpc('get_user_profile_stats', { user_uuid: userId });

  if (error) {
    console.error('Error fetching profile stats:', error);
    return null;
  }

  return data;
}

// Upload avatar image
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/avatar.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading avatar:', error);
    throw new Error('Failed to upload avatar');
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Upload cover image
export async function uploadCoverImage(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/cover.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('covers')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    console.error('Error uploading cover image:', error);
    throw new Error('Failed to upload cover image');
  }

  const { data: urlData } = supabase.storage
    .from('covers')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// Generate avatar placeholder
export function generateAvatarPlaceholder(username: string): string {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
  ];
  
  const colorIndex = username.charCodeAt(0) % colors.length;
  const color = colors[colorIndex];
  
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=${color.replace('bg-', '').replace('-500', '')}&color=fff&size=200`;
}

// Validate social links
export function validateSocialLinks(socialLinks: Record<string, string>): Record<string, string> {
  const validLinks: Record<string, string> = {};
  
  Object.entries(socialLinks).forEach(([platform, url]) => {
    if (url && url.trim()) {
      // Basic URL validation
      try {
        new URL(url.startsWith('http') ? url : `https://${url}`);
        validLinks[platform] = url.trim();
      } catch {
        // Invalid URL, skip it
      }
    }
  });
  
  return validLinks;
} 