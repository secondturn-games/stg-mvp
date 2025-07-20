'use client';

import { useState, useEffect } from 'react';
import { BarChart3, LineChart, TrendingUp, TrendingDown } from 'lucide-react';

interface ChartDataPoint {
  date: string;
  value: number;
}

interface ChartWidgetProps {
  title: string;
  metricType: string;
  chartType?: 'line' | 'bar';
  days?: number;
  className?: string;
}

export default function ChartWidget({
  title,
  metricType,
  chartType = 'line',
  days = 30,
  className = '',
}: ChartWidgetProps) {
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(
          `/api/analytics/chart-data?metric=${metricType}&days=${days}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch chart data');
        }

        const result = await response.json();
        setData(result.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChartData();
  }, [metricType, days]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMetricLabel = (metricType: string) => {
    const labels: Record<string, string> = {
      daily_views: 'Views',
      daily_listings: 'Listings',
      daily_sales: 'Sales',
      daily_purchases: 'Purchases',
      daily_revenue: 'Revenue (€)',
      daily_spent: 'Spent (€)',
      daily_reviews: 'Reviews',
      daily_messages: 'Messages',
      daily_searches: 'Searches',
      daily_wishlist_adds: 'Wishlist Adds',
    };
    return labels[metricType] || metricType;
  };

  const calculateTrend = () => {
    if (data.length < 2) return { direction: 'neutral', percentage: 0 };
    
    const recent = data.slice(-7).reduce((sum, point) => sum + point.value, 0) / 7;
    const previous = data.slice(-14, -7).reduce((sum, point) => sum + point.value, 0) / 7;
    
    if (previous === 0) return { direction: 'neutral', percentage: 0 };
    
    const percentage = ((recent - previous) / previous) * 100;
    const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';
    
    return { direction, percentage: Math.abs(percentage) };
  };

  const trend = calculateTrend();

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Failed to load chart data</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{getMetricLabel(metricType)}</p>
        </div>
        <div className="flex items-center space-x-2">
          {trend.direction === 'up' && <TrendingUp className="h-4 w-4 text-green-500" />}
          {trend.direction === 'down' && <TrendingDown className="h-4 w-4 text-red-500" />}
          <span className={`text-sm ${
            trend.direction === 'up' ? 'text-green-600' : 
            trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend.percentage.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="h-48 flex items-end justify-between space-x-1">
        {data.map((point, index) => {
          const height = range > 0 ? ((point.value - minValue) / range) * 100 : 50;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="relative w-full">
                {chartType === 'bar' ? (
                  <div
                    className="bg-blue-500 rounded-t"
                    style={{ height: `${height}%` }}
                  />
                ) : (
                  <div className="relative">
                    {index > 0 && (
                      <svg
                        className="absolute inset-0 w-full h-full"
                        style={{ zIndex: 1 }}
                      >
                        <line
                          x1={`${((index - 1) / (data.length - 1)) * 100}%`}
                          y1={`${100 - ((data[index - 1].value - minValue) / range) * 100}%`}
                          x2={`${(index / (data.length - 1)) * 100}%`}
                          y2={`${100 - height}%`}
                          stroke="#3B82F6"
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>
                    )}
                    <div
                      className="w-2 h-2 bg-blue-500 rounded-full"
                      style={{ 
                        left: `${(index / (data.length - 1)) * 100}%`,
                        top: `${100 - height}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    />
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-500 mt-2">
                {formatDate(point.date)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Last {days} days • {data.length} data points
        </p>
      </div>
    </div>
  );
} 