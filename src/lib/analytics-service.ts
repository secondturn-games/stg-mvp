import { supabase } from './supabase';

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_data: Record<string, any>;
  session_id?: string;
  user_agent?: string;
  ip_address?: string;
  created_at: string;
}

export interface UserMetric {
  id: string;
  user_id: string;
  metric_date: string;
  metric_type: string;
  metric_value: number;
  metric_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface PerformanceTrend {
  id: string;
  user_id: string;
  trend_type: string;
  period_start: string;
  period_end: string;
  trend_data: Record<string, any>;
  created_at: string;
}

export interface UserInsight {
  id: string;
  user_id: string;
  insight_type: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  is_read: boolean;
  is_actioned: boolean;
  metadata: Record<string, any>;
  created_at: string;
  expires_at?: string;
}

export interface DashboardWidget {
  id: string;
  user_id: string;
  widget_type: string;
  widget_config: Record<string, any>;
  is_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSummary {
  total_views: number;
  total_listings: number;
  total_sales: number;
  total_revenue: number;
  total_reviews: number;
  avg_daily_views: number;
  avg_daily_revenue: number;
  best_performing_day?: string;
}

// Record an analytics event
export async function recordAnalyticsEvent(
  userId: string,
  eventType: string,
  eventData: Record<string, any> = {},
  sessionId?: string
): Promise<void> {
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      user_id: userId,
      event_type: eventType,
      event_data: eventData,
      session_id: sessionId,
    });

  if (error) {
    console.error('Error recording analytics event:', error);
  }
}

// Get user's analytics summary
export async function getUserAnalyticsSummary(
  userId: string,
  daysBack: number = 30
): Promise<AnalyticsSummary | null> {
  const { data, error } = await supabase
    .rpc('get_user_analytics_summary', { 
      user_uuid: userId, 
      days_back: daysBack 
    });

  if (error) {
    console.error('Error fetching analytics summary:', error);
    return null;
  }

  return data;
}

// Get user metrics for a date range
export async function getUserMetrics(
  userId: string,
  startDate: string,
  endDate: string,
  metricTypes?: string[]
): Promise<UserMetric[]> {
  let query = supabase
    .from('user_metrics')
    .select('*')
    .eq('user_id', userId)
    .gte('metric_date', startDate)
    .lte('metric_date', endDate)
    .order('metric_date', { ascending: true });

  if (metricTypes && metricTypes.length > 0) {
    query = query.in('metric_type', metricTypes);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user metrics:', error);
    return [];
  }

  return data || [];
}

// Get performance trends
export async function getPerformanceTrends(
  userId: string,
  trendType?: string,
  limit: number = 10
): Promise<PerformanceTrend[]> {
  let query = supabase
    .from('performance_trends')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (trendType) {
    query = query.eq('trend_type', trendType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching performance trends:', error);
    return [];
  }

  return data || [];
}

// Get user insights
export async function getUserInsights(
  userId: string,
  includeRead: boolean = false,
  limit: number = 20
): Promise<UserInsight[]> {
  let query = supabase
    .from('user_insights')
    .select('*')
    .eq('user_id', userId)
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!includeRead) {
    query = query.eq('is_read', false);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching user insights:', error);
    return [];
  }

  return data || [];
}

// Mark insight as read
export async function markInsightAsRead(insightId: string): Promise<void> {
  const { error } = await supabase
    .from('user_insights')
    .update({ is_read: true })
    .eq('id', insightId);

  if (error) {
    console.error('Error marking insight as read:', error);
  }
}

// Mark insight as actioned
export async function markInsightAsActioned(insightId: string): Promise<void> {
  const { error } = await supabase
    .from('user_insights')
    .update({ is_actioned: true })
    .eq('id', insightId);

  if (error) {
    console.error('Error marking insight as actioned:', error);
  }
}

// Get dashboard widgets
export async function getDashboardWidgets(userId: string): Promise<DashboardWidget[]> {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .select('*')
    .eq('user_id', userId)
    .eq('is_enabled', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching dashboard widgets:', error);
    return [];
  }

  return data || [];
}

// Update dashboard widget
export async function updateDashboardWidget(
  widgetId: string,
  updates: Partial<DashboardWidget>
): Promise<void> {
  const { error } = await supabase
    .from('dashboard_widgets')
    .update(updates)
    .eq('id', widgetId);

  if (error) {
    console.error('Error updating dashboard widget:', error);
  }
}

// Create dashboard widget
export async function createDashboardWidget(
  userId: string,
  widgetType: string,
  config: Record<string, any> = {}
): Promise<string> {
  const { data, error } = await supabase
    .from('dashboard_widgets')
    .insert({
      user_id: userId,
      widget_type: widgetType,
      widget_config: config,
    })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating dashboard widget:', error);
    throw new Error('Failed to create dashboard widget');
  }

  return data.id;
}

// Get recent activity
export async function getRecentActivity(
  userId: string,
  limit: number = 20
): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recent activity:', error);
    return [];
  }

  return data || [];
}

// Calculate and store daily metrics
export async function calculateDailyMetrics(
  userId: string,
  targetDate: string
): Promise<void> {
  const { error } = await supabase
    .rpc('calculate_daily_metrics', { 
      user_uuid: userId, 
      target_date: targetDate 
    });

  if (error) {
    console.error('Error calculating daily metrics:', error);
  }
}

// Generate insights based on user data
export async function generateUserInsights(userId: string): Promise<void> {
  // Get user's recent performance data
  const summary = await getUserAnalyticsSummary(userId, 30);
  if (!summary) return;

  const insights: Array<Partial<UserInsight>> = [];

  // Revenue insights
  if (summary.total_revenue > 0) {
    const avgRevenue = summary.avg_daily_revenue;
    if (avgRevenue > 50) {
      insights.push({
        user_id: userId,
        insight_type: 'performance_improvement',
        title: 'Strong Revenue Performance',
        description: `Your average daily revenue of €${avgRevenue.toFixed(2)} is excellent! Consider expanding your inventory to capitalize on this momentum.`,
        priority: 'high',
      });
    }
  }

  // Views insights
  if (summary.total_views > 0) {
    const avgViews = summary.avg_daily_views;
    if (avgViews < 5) {
      insights.push({
        user_id: userId,
        insight_type: 'performance_improvement',
        title: 'Low Listing Visibility',
        description: 'Your listings are receiving few views. Consider improving photos, descriptions, or pricing to increase visibility.',
        priority: 'medium',
      });
    }
  }

  // Sales insights
  if (summary.total_sales === 0 && summary.total_listings > 0) {
    insights.push({
      user_id: userId,
      insight_type: 'pricing_suggestion',
      title: 'No Sales Yet',
      description: 'You have active listings but no sales. Consider reviewing your pricing strategy or improving your listings.',
      priority: 'high',
    });
  }

  // Create insights in database
  for (const insight of insights) {
    const { error } = await supabase
      .from('user_insights')
      .insert({
        ...insight,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      });

    if (error) {
      console.error('Error creating insight:', error);
    }
  }
}

// Get chart data for widgets
export async function getChartData(
  userId: string,
  metricType: string,
  days: number = 30
): Promise<Array<{ date: string; value: number }>> {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const metrics = await getUserMetrics(userId, startDate, endDate, [metricType]);

  return metrics.map(metric => ({
    date: metric.metric_date,
    value: metric.metric_value,
  }));
}

// Get top performing categories
export async function getTopPerformingCategories(userId: string): Promise<Array<{ category: string; count: number; revenue: number }>> {
  const { data, error } = await supabase
    .from('listings')
    .select('category, status, price')
    .eq('seller_id', userId)
    .eq('status', 'sold');

  if (error) {
    console.error('Error fetching top performing categories:', error);
    return [];
  }

  const categoryStats = data.reduce((acc, listing) => {
    const category = listing.category || 'Unknown';
    if (!acc[category]) {
      acc[category] = { count: 0, revenue: 0 };
    }
    acc[category].count += 1;
    acc[category].revenue += listing.price || 0;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  return Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      count: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
} 