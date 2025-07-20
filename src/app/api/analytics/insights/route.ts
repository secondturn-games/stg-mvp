import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getUserInsights, markInsightAsRead, markInsightAsActioned } from '@/lib/analytics-service';
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeRead = searchParams.get('includeRead') === 'true';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Get user insights
    const insights = await getUserInsights(profile.id, includeRead, limit);

    return NextResponse.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error('Error fetching user insights:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user insights' },
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
    const { insightId, action } = body;

    if (!insightId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['read', 'actioned'].includes(action)) {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Perform action
    if (action === 'read') {
      await markInsightAsRead(insightId);
    } else if (action === 'actioned') {
      await markInsightAsActioned(insightId);
    }

    return NextResponse.json({
      success: true,
      message: `Insight marked as ${action}`,
    });
  } catch (error) {
    console.error('Error updating insight:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update insight' },
      { status: 500 }
    );
  }
} 