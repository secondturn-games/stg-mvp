import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { 
  getUserNotifications, 
  markNotificationsAsRead, 
  getUnreadNotificationCount,
  createNotification 
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const unreadOnly = searchParams.get('unread') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const countOnly = searchParams.get('count') === 'true';

    if (countOnly) {
      // Get unread count only
      const count = await getUnreadNotificationCount(profile.id);
      return NextResponse.json({
        success: true,
        count,
      });
    } else {
      // Get notifications
      const notifications = await getUserNotifications(
        profile.id,
        limit,
        offset,
        unreadOnly
      );

      return NextResponse.json({
        success: true,
        notifications,
      });
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch notifications' },
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
    const { 
      notification_type, 
      title, 
      message, 
      data, 
      priority, 
      expires_at 
    } = body;

    // Validate required fields
    if (!notification_type || !title || !message) {
      return NextResponse.json(
        { success: false, error: 'Notification type, title, and message are required' },
        { status: 400 }
      );
    }

    // Validate notification type
    const validTypes = [
      'price_alert', 'wishlist_match', 'new_message', 'listing_viewed',
      'review_received', 'badge_earned', 'collection_update', 'market_activity',
      'system_announcement', 'trade_request', 'sale_completed', 'payment_received',
      'security_alert', 'recommendation'
    ];

    if (!validTypes.includes(notification_type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid notification type' },
        { status: 400 }
      );
    }

    // Create notification
    const notificationId = await createNotification(
      profile.id,
      notification_type,
      title,
      message,
      data || {},
      priority || 'normal',
      expires_at
    );

    return NextResponse.json({
      success: true,
      notificationId,
      message: 'Notification created successfully',
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notification' },
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
    const { action, notificationIds } = body;

    if (action === 'mark_read') {
      // Mark notifications as read
      const updatedCount = await markNotificationsAsRead(
        profile.id,
        notificationIds
      );

      return NextResponse.json({
        success: true,
        updatedCount,
        message: `Marked ${updatedCount} notifications as read`,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error updating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update notifications' },
      { status: 500 }
    );
  }
} 