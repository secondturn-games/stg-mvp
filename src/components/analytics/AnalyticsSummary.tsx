'use client';

import { TrendingUp, TrendingDown, Eye, Package, DollarSign, Star, Activity } from 'lucide-react';
import type { AnalyticsSummary } from '@/lib/analytics-service';

interface AnalyticsSummaryProps {
  summary: AnalyticsSummary;
  className?: string;
}

export default function AnalyticsSummary({ summary, className = '' }: AnalyticsSummaryProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return <Activity className="h-4 w-4 text-gray-500" />;
  };

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return 'text-green-600';
    if (current < previous) return 'text-red-600';
    return 'text-gray-600';
  };

  const cards = [
    {
      title: 'Total Views',
      value: summary.total_views,
      icon: Eye,
      color: 'bg-blue-500',
      trend: summary.avg_daily_views,
      trendLabel: 'avg daily',
    },
    {
      title: 'Total Listings',
      value: summary.total_listings,
      icon: Package,
      color: 'bg-green-500',
      trend: summary.total_listings / 30, // Assuming 30 days
      trendLabel: 'avg daily',
    },
    {
      title: 'Total Sales',
      value: summary.total_sales,
      icon: TrendingUp,
      color: 'bg-purple-500',
      trend: summary.total_sales / 30,
      trendLabel: 'avg daily',
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(summary.total_revenue),
      icon: DollarSign,
      color: 'bg-yellow-500',
      trend: summary.avg_daily_revenue,
      trendLabel: 'avg daily',
    },
    {
      title: 'Total Reviews',
      value: summary.total_reviews,
      icon: Star,
      color: 'bg-orange-500',
      trend: summary.total_reviews / 30,
      trendLabel: 'avg daily',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 ${className}`}>
      {cards.map((card, index) => {
        const Icon = card.icon;
        const trendValue = typeof card.trend === 'number' ? card.trend.toFixed(1) : card.trend;
        const isCurrency = card.title.includes('Revenue');
        
        return (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              {getTrendIcon(card.trend, card.trend * 0.9)} {/* Simple trend calculation */}
            </div>
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-gray-600">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">
                {isCurrency ? card.value : card.value.toLocaleString()}
              </p>
              <p className={`text-xs ${getTrendColor(card.trend, card.trend * 0.9)}`}>
                {trendValue} {card.trendLabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
} 