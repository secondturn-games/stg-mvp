import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createPaymentIntent, calculateFees } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Payment system is currently disabled' },
    { status: 503 }
  );
} 