import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createConnectAccount, createAccountLink } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
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
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    // Check if user already has a Stripe account
    if (profile.stripe_account_id) {
      return NextResponse.json(
        { success: false, error: 'Stripe account already exists' },
        { status: 400 }
      );
    }

    // Create Stripe Connect account
    const accountResult = await createConnectAccount(
      profile.email,
      profile.country.toLowerCase()
    );

    if (!accountResult.success) {
      return NextResponse.json(
        { success: false, error: accountResult.error },
        { status: 500 }
      );
    }

    // Update user profile with Stripe account ID
    const { error: updateError } = await supabase
      .from('users')
      .update({ stripe_account_id: accountResult.accountId })
      .eq('id', profile.id);

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update user profile' },
        { status: 500 }
      );
    }

    // Create account link for onboarding
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const accountLinkResult = await createAccountLink(
      accountResult.accountId!,
      `${baseUrl}/profile/payments/connect/refresh`,
      `${baseUrl}/profile/payments/connect/return`
    );

    if (!accountLinkResult.success) {
      return NextResponse.json(
        { success: false, error: accountLinkResult.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      accountId: accountResult.accountId,
      onboardingUrl: accountLinkResult.url,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create Stripe Connect account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile with Stripe account info
    const { data: profile } = await supabase
      .from('users')
      .select('stripe_account_id, payment_verified, payout_enabled')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      hasStripeAccount: !!profile.stripe_account_id,
      paymentVerified: profile.payment_verified,
      payoutEnabled: profile.payout_enabled,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to get Connect account status' },
      { status: 500 }
    );
  }
} 