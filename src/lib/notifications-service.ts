import { supabase } from './supabase';

export interface Notification {
  id: string;
  user_id: string;
  notification_type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  is_read: boolean;
  is_actioned: boolean;
  expires_at?: string;
  created_at: string;
}

export interface PriceAlert {
  id: string;
  user_id: string;
  game_title: string;
  target_price: number;
  current_price?: number;
  alert_type: 'below' | 'above' | 'change';
  is_active: boolean;
  last_checked: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  notification_type: string;
  email_enabled: boolean;
  push_enabled: boolean;
  in_app_enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly' | 'never';
  quiet_hours_start: string;
  quiet_hours_end: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationTemplate {
  id: string;
  template_type: string;
  title_template: string;
  message_template: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Create a notification
export async function createNotification(
  userId: string,
  notificationType: string,
  title: string,
  message: string,
  data: Record<string, any> = {},
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  expiresAt?: string
): Promise<string> {
  const { data: result, error } = await supabase
    .rpc('create_notification', {
      user_uuid: userId,
      notification_type: notificationType,
      title,
      message,
      data,
      priority,
      expires_at: expiresAt,
    });

  if (error) {
    console.error('Error creating notification:', error);
    throw new Error('Failed to create notification');
  }

  return result;
}

// Get user notifications
export async function getUserNotifications(
  userId: string,
  limit: number = 50,
  offset: number = 0,
  unreadOnly: boolean = false
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }

  return data || [];
}

// Mark notifications as read
export async function markNotificationsAsRead(
  userId: string,
  notificationIds?: string[]
): Promise<number> {
  const { data, error } = await supabase
    .rpc('mark_notifications_read', {
      user_uuid: userId,
      notification_ids: notificationIds,
    });

  if (error) {
    console.error('Error marking notifications as read:', error);
    return 0;
  }

  return data || 0;
}

// Get unread notification count
export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { data, error } = await supabase
    .rpc('get_unread_notification_count', { user_uuid: userId });

  if (error) {
    console.error('Error fetching unread count:', error);
    return 0;
  }

  return data || 0;
}

// Create price alert
export async function createPriceAlert(
  userId: string,
  gameTitle: string,
  targetPrice: number,
  alertType: 'below' | 'above' | 'change' = 'below'
): Promise<string> {
  const { data, error } = await supabase
    .rpc('create_price_alert', {
      user_uuid: userId,
      game_title: gameTitle,
      target_price: targetPrice,
      alert_type: alertType,
    });

  if (error) {
    console.error('Error creating price alert:', error);
    throw new Error('Failed to create price alert');
  }

  return data;
}

// Get user's price alerts
export async function getPriceAlerts(userId: string): Promise<PriceAlert[]> {
  const { data, error } = await supabase
    .from('price_alerts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching price alerts:', error);
    return [];
  }

  return data || [];
}

// Update price alert
export async function updatePriceAlert(
  alertId: string,
  updates: Partial<PriceAlert>
): Promise<void> {
  const { error } = await supabase
    .from('price_alerts')
    .update(updates)
    .eq('id', alertId);

  if (error) {
    console.error('Error updating price alert:', error);
    throw new Error('Failed to update price alert');
  }
}

// Delete price alert
export async function deletePriceAlert(alertId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('price_alerts')
    .delete()
    .eq('id', alertId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting price alert:', error);
    throw new Error('Failed to delete price alert');
  }
}

// Check price alerts (for background job)
export async function checkPriceAlerts(): Promise<Array<{
  alert_id: string;
  user_id: string;
  game_title: string;
  target_price: number;
  current_price: number;
  alert_type: string;
}>> {
  const { data, error } = await supabase
    .rpc('check_price_alerts');

  if (error) {
    console.error('Error checking price alerts:', error);
    return [];
  }

  return data || [];
}

// Get notification preferences
export async function getNotificationPreferences(userId: string): Promise<Record<string, any>> {
  const { data, error } = await supabase
    .rpc('get_notification_preferences', { user_uuid: userId });

  if (error) {
    console.error('Error fetching notification preferences:', error);
    return {};
  }

  return data || {};
}

// Update notification preferences
export async function updateNotificationPreferences(
  userId: string,
  notificationType: string,
  preferences: Partial<NotificationPreference>
): Promise<void> {
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({
      user_id: userId,
      notification_type: notificationType,
      ...preferences,
    });

  if (error) {
    console.error('Error updating notification preferences:', error);
    throw new Error('Failed to update notification preferences');
  }
}

// Check if user should receive notification
export async function shouldSendNotification(
  userId: string,
  notificationType: string,
  deliveryMethod: 'email' | 'push' | 'in_app'
): Promise<boolean> {
  const { data, error } = await supabase
    .rpc('should_send_notification', {
      user_uuid: userId,
      notification_type: notificationType,
      delivery_method: deliveryMethod,
    });

  if (error) {
    console.error('Error checking notification preferences:', error);
    return true; // Default to sending if error
  }

  return data || true;
}

// Get notification templates
export async function getNotificationTemplates(): Promise<NotificationTemplate[]> {
  const { data, error } = await supabase
    .from('notification_templates')
    .select('*')
    .eq('is_active', true)
    .order('template_type', { ascending: true });

  if (error) {
    console.error('Error fetching notification templates:', error);
    return [];
  }

  return data || [];
}

// Process notification template
export function processNotificationTemplate(
  template: NotificationTemplate,
  variables: Record<string, any>
): { title: string; message: string } {
  let title = template.title_template;
  let message = template.message_template;

  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    const placeholder = `{${key}}`;
    title = title.replace(new RegExp(placeholder, 'g'), String(value));
    message = message.replace(new RegExp(placeholder, 'g'), String(value));
  });

  return { title, message };
}

// Send notification with template
export async function sendNotificationWithTemplate(
  userId: string,
  templateType: string,
  variables: Record<string, any>,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<string> {
  // Get template
  const templates = await getNotificationTemplates();
  const template = templates.find(t => t.template_type === templateType);

  if (!template) {
    throw new Error(`Template not found for type: ${templateType}`);
  }

  // Process template
  const { title, message } = processNotificationTemplate(template, variables);

  // Create notification
  return await createNotification(userId, templateType, title, message, variables, priority);
}

// Send price alert notification
export async function sendPriceAlertNotification(
  userId: string,
  gameTitle: string,
  currentPrice: number,
  targetPrice: number
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'price_alert',
    {
      game_title: gameTitle,
      current_price: currentPrice.toFixed(2),
      target_price: targetPrice.toFixed(2),
    },
    'high'
  );
}

// Send wishlist match notification
export async function sendWishlistMatchNotification(
  userId: string,
  gameTitle: string,
  price: number
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'wishlist_match',
    {
      game_title: gameTitle,
      price: price.toFixed(2),
    },
    'normal'
  );
}

// Send review received notification
export async function sendReviewReceivedNotification(
  userId: string,
  gameTitle: string,
  rating: number
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'review_received',
    {
      game_title: gameTitle,
      rating,
    },
    'normal'
  );
}

// Send badge earned notification
export async function sendBadgeEarnedNotification(
  userId: string,
  badgeName: string
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'badge_earned',
    {
      badge_name: badgeName,
    },
    'high'
  );
}

// Send collection update notification
export async function sendCollectionUpdateNotification(
  userId: string,
  valueChange: number,
  totalValue: number
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'collection_update',
    {
      value_change: valueChange.toFixed(2),
      total_value: totalValue.toFixed(2),
    },
    'normal'
  );
}

// Send market activity notification
export async function sendMarketActivityNotification(
  userId: string,
  count: number
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'market_activity',
    {
      count,
    },
    'low'
  );
}

// Send trade request notification
export async function sendTradeRequestNotification(
  userId: string,
  senderName: string,
  theirGame: string,
  yourGame: string
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'trade_request',
    {
      sender_name: senderName,
      their_game: theirGame,
      your_game: yourGame,
    },
    'high'
  );
}

// Send sale completed notification
export async function sendSaleCompletedNotification(
  userId: string,
  gameTitle: string,
  price: number
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'sale_completed',
    {
      game_title: gameTitle,
      price: price.toFixed(2),
    },
    'high'
  );
}

// Send payment received notification
export async function sendPaymentReceivedNotification(
  userId: string,
  amount: number,
  gameTitle: string
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'payment_received',
    {
      amount: amount.toFixed(2),
      game_title: gameTitle,
    },
    'high'
  );
}

// Send security alert notification
export async function sendSecurityAlertNotification(
  userId: string,
  message: string
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'security_alert',
    {
      message,
    },
    'urgent'
  );
}

// Send recommendation notification
export async function sendRecommendationNotification(
  userId: string,
  gameTitle: string,
  price: number
): Promise<string> {
  return await sendNotificationWithTemplate(
    userId,
    'recommendation',
    {
      game_title: gameTitle,
      price: price.toFixed(2),
    },
    'low'
  );
}

// Bulk send notifications to multiple users
export async function sendBulkNotifications(
  userIds: string[],
  templateType: string,
  variables: Record<string, any>,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal'
): Promise<string[]> {
  const notificationIds: string[] = [];

  for (const userId of userIds) {
    try {
      const notificationId = await sendNotificationWithTemplate(
        userId,
        templateType,
        variables,
        priority
      );
      notificationIds.push(notificationId);
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
    }
  }

  return notificationIds;
}

// Delete expired notifications
export async function deleteExpiredNotifications(): Promise<number> {
  const { data, error } = await supabase
    .from('notifications')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .not('expires_at', 'is', null);

  if (error) {
    console.error('Error deleting expired notifications:', error);
    return 0;
  }

  return data || 0;
} 