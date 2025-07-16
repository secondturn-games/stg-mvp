import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { updateUserProfile } from '@/lib/user-service';
import { userProfileSchema, validateInput } from '@/lib/validation';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input using Zod schema
    let validatedData;
    try {
      validatedData = validateInput(userProfileSchema, body);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error },
        { status: 400 }
      );
    }

    const { username, country, preferred_language, vat_number } = validatedData;

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
