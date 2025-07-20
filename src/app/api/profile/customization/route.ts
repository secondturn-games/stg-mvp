import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getProfileCustomization, 
  updateProfileCustomization,
  validateSocialLinks 
} from '@/lib/profile-customization-service';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const customization = await getProfileCustomization(profile.id);

    if (!customization) {
      return NextResponse.json(
        { success: false, error: 'Profile customization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customization,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile customization' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
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
      notification_preferences,
    } = body;

    // Get user profile
    const { data: profile } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Validate profile visibility
    if (profile_visibility && !['public', 'private', 'friends'].includes(profile_visibility)) {
      return NextResponse.json(
        { success: false, error: 'Invalid profile visibility' },
        { status: 400 }
      );
    }

    // Validate theme preference
    if (theme_preference && !['light', 'dark', 'auto'].includes(theme_preference)) {
      return NextResponse.json(
        { success: false, error: 'Invalid theme preference' },
        { status: 400 }
      );
    }

    // Validate and clean social links
    const validatedSocialLinks = social_links ? validateSocialLinks(social_links) : {};

    // Prepare updates
    const updates: any = {};
    
    if (display_name !== undefined) updates.display_name = display_name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (cover_image_url !== undefined) updates.cover_image_url = cover_image_url;
    if (Object.keys(validatedSocialLinks).length > 0) updates.social_links = validatedSocialLinks;
    if (profile_visibility !== undefined) updates.profile_visibility = profile_visibility;
    if (show_email !== undefined) updates.show_email = show_email;
    if (show_location !== undefined) updates.show_location = show_location;
    if (show_activity !== undefined) updates.show_activity = show_activity;
    if (theme_preference !== undefined) updates.theme_preference = theme_preference;
    if (notification_preferences !== undefined) updates.notification_preferences = notification_preferences;

    // Update profile customization
    await updateProfileCustomization(profile.id, updates);

    return NextResponse.json({
      success: true,
      message: 'Profile customization updated successfully',
    });
  } catch (error) {
    console.error('Error updating profile customization:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update profile customization' },
      { status: 500 }
    );
  }
} 