import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateUserProfile } from '@/lib/user-service';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { username, country, preferred_language, vat_number } = body;

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

    const updatedProfile = await updateUserProfile({
      username,
      country,
      preferred_language: preferred_language || 'en',
      vat_number: vat_number || null,
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
