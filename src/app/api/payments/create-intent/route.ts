import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { success: false, error: 'Payment system is currently disabled' },
    { status: 503 }
  );
} 