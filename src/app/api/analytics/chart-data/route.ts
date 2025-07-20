import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getChartData } from '@/lib/analytics-service';
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
    const metricType = searchParams.get('metric') || 'daily_views';
    const days = parseInt(searchParams.get('days') || '30');

    // Validate metric type
    const validMetrics = [
      'daily_views',
      'daily_listings',
      'daily_sales',
      'daily_purchases',
      'daily_revenue',
      'daily_spent',
      'daily_reviews',
      'daily_messages',
      'daily_searches',
      'daily_wishlist_adds',
    ];

    if (!validMetrics.includes(metricType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid metric type' },
        { status: 400 }
      );
    }

    // Get chart data
    const chartData = await getChartData(profile.id, metricType, days);

    return NextResponse.json({
      success: true,
      data: chartData,
    });
  } catch (error) {
    console.error('Error fetching chart data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch chart data' },
      { status: 500 }
    );
  }
} 