import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAuction, getAuctions } from '@/lib/database';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'active';

    const auctions = await getAuctions({ page, limit, status });

    return NextResponse.json({
      success: true,
      data: auctions,
    });
  } catch (error) {
    console.error('Error fetching auctions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch auctions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const auction = await createAuction(body);

    return NextResponse.json({
      success: true,
      data: auction,
    });
  } catch (error) {
    console.error('Error creating auction:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create auction' },
      { status: 500 }
    );
  }
}
