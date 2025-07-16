import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import { createUserProfile, userProfileExists } from '@/lib/user-service';
import { createSupabaseClient } from '@/lib/supabase';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      username,
      country,
      preferred_language,
    } = await request.json();

    // Validate required fields
    if (!username || !country) {
      return NextResponse.json(
        { error: 'Username and country are required' },
        { status: 400 }
      );
    }

    // Validate country
    const validCountries = ['EE', 'LV', 'LT'];
    if (!validCountries.includes(country)) {
      return NextResponse.json({ error: 'Invalid country' }, { status: 400 });
    }

    // Validate language
    const validLanguages = ['en', 'et', 'lv', 'lt'];
    if (preferred_language && !validLanguages.includes(preferred_language)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }

    // Get user email from Clerk
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(userId);
    const email = clerkUser.emailAddresses[0]?.emailAddress;

    if (!email) {
      return NextResponse.json({ error: 'Email not found' }, { status: 400 });
    }

    // Check if profile already exists
    const exists = await userProfileExists(email);
    if (exists) {
      return NextResponse.json(
        { error: 'Profile already exists' },
        { status: 409 }
      );
    }

    // Create user profile
    const { data, error } = await supabase
      .from('users')
      .insert({
        clerk_id: userId,
        username,
        email,
        country,
        preferred_language: preferred_language || 'en',
      })
      .select()
      .single();

    return NextResponse.json({
      success: true,
      profile: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create profile' },
      { status: 500 }
    );
  }
}
