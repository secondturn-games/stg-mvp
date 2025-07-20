import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getPriceAlerts, 
  createPriceAlert, 
  updatePriceAlert, 
  deletePriceAlert 
} from '@/lib/notifications-service';
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

    // Get price alerts
    const alerts = await getPriceAlerts(profile.id);

    return NextResponse.json({
      success: true,
      alerts,
    });
  } catch (error) {
    console.error('Error fetching price alerts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch price alerts' },
      { status: 500 }
    );
  }
}

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
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { game_title, target_price, alert_type } = body;

    // Validate required fields
    if (!game_title || !target_price) {
      return NextResponse.json(
        { success: false, error: 'Game title and target price are required' },
        { status: 400 }
      );
    }

    // Validate target price
    if (isNaN(target_price) || target_price <= 0) {
      return NextResponse.json(
        { success: false, error: 'Target price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate alert type
    const validAlertTypes = ['below', 'above', 'change'];
    if (alert_type && !validAlertTypes.includes(alert_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid alert type' },
        { status: 400 }
      );
    }

    // Create price alert
    const alertId = await createPriceAlert(
      profile.id,
      game_title,
      target_price,
      alert_type || 'below'
    );

    return NextResponse.json({
      success: true,
      alertId,
      message: 'Price alert created successfully',
    });
  } catch (error) {
    console.error('Error creating price alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create price alert' },
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
    const { alertId, updates } = body;

    if (!alertId || !updates) {
      return NextResponse.json(
        { success: false, error: 'Alert ID and updates are required' },
        { status: 400 }
      );
    }

    // Validate target price if provided
    if (updates.target_price && (isNaN(updates.target_price) || updates.target_price <= 0)) {
      return NextResponse.json(
        { success: false, error: 'Target price must be a positive number' },
        { status: 400 }
      );
    }

    // Validate alert type if provided
    if (updates.alert_type) {
      const validAlertTypes = ['below', 'above', 'change'];
      if (!validAlertTypes.includes(updates.alert_type)) {
        return NextResponse.json(
          { success: false, error: 'Invalid alert type' },
          { status: 400 }
        );
      }
    }

    // Update price alert
    await updatePriceAlert(alertId, updates);

    return NextResponse.json({
      success: true,
      message: 'Price alert updated successfully',
    });
  } catch (error) {
    console.error('Error updating price alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update price alert' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get('alertId');

    if (!alertId) {
      return NextResponse.json(
        { success: false, error: 'Alert ID is required' },
        { status: 400 }
      );
    }

    // Delete price alert
    await deletePriceAlert(alertId, profile.id);

    return NextResponse.json({
      success: true,
      message: 'Price alert deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting price alert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete price alert' },
      { status: 500 }
    );
  }
} 