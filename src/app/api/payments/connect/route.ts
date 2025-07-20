import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createConnectAccount, createAccountLink } from '@/lib/stripe';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Payment system is currently disabled' },
    { status: 503 }
  );
}

export async function GET(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Payment system is currently disabled' },
    { status: 503 }
  );
} 