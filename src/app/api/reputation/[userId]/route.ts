import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserReputation } from '@/lib/reputation-service';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const targetUserId = params.userId;
    const reputation = await getUserReputation(targetUserId);

    if (!reputation) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      reputation,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reputation' },
      { status: 500 }
    );
  }
} 