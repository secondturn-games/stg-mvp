import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserAnalyticsSummary } from '@/lib/analytics-service';
import { supabase } from '@/lib/supabase';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import ChartWidget from '@/components/analytics/ChartWidget';
import InsightsWidget from '@/components/analytics/InsightsWidget';

export default async function AnalyticsDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!profile) {
    redirect('/profile/setup');
  }

  // Get analytics summary
  let summary = await getUserAnalyticsSummary(profile.id, 30);

  if (!summary) {
    // Return empty summary if no data
    summary = {
      total_views: 0,
      total_listings: 0,
      total_sales: 0,
      total_revenue: 0,
      total_reviews: 0,
      avg_daily_views: 0,
      avg_daily_revenue: 0,
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your performance, monitor trends, and get AI-powered insights.
          </p>
        </div>

        {/* Analytics Summary Cards */}
        <div className="mb-8">
          <AnalyticsSummary summary={summary} />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartWidget
            title="Revenue Trend"
            metricType="daily_revenue"
            chartType="line"
            days={30}
          />
          <ChartWidget
            title="Views Trend"
            metricType="daily_views"
            chartType="line"
            days={30}
          />
          <ChartWidget
            title="Sales Performance"
            metricType="daily_sales"
            chartType="bar"
            days={30}
          />
          <ChartWidget
            title="Listing Activity"
            metricType="daily_listings"
            chartType="bar"
            days={30}
          />
        </div>

        {/* Insights and Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartWidget
              title="Engagement Overview"
              metricType="daily_reviews"
              chartType="line"
              days={30}
            />
          </div>
          <div>
            <InsightsWidget />
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <ChartWidget
            title="Purchases"
            metricType="daily_purchases"
            chartType="bar"
            days={14}
          />
          <ChartWidget
            title="Messages"
            metricType="daily_messages"
            chartType="line"
            days={14}
          />
          <ChartWidget
            title="Searches"
            metricType="daily_searches"
            chartType="bar"
            days={14}
          />
          <ChartWidget
            title="Wishlist Activity"
            metricType="daily_wishlist_adds"
            chartType="line"
            days={14}
          />
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/listings/create"
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create New Listing
            </a>
            <a
              href="/profile/customize"
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Optimize Profile
            </a>
            <a
              href="/analytics/insights"
              className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              View All Insights
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 