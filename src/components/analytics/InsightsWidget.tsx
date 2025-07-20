'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import type { UserInsight } from '@/lib/analytics-service';

interface InsightsWidgetProps {
  className?: string;
}

export default function InsightsWidget({ className = '' }: InsightsWidgetProps) {
  const [insights, setInsights] = useState<UserInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/analytics/insights?includeRead=false&limit=5');

        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }

        const result = await response.json();
        setInsights(result.insights || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  const handleMarkAsRead = async (insightId: string) => {
    try {
      const response = await fetch('/api/analytics/insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insightId,
          action: 'read',
        }),
      });

      if (response.ok) {
        setInsights(prev => prev.filter(insight => insight.id !== insightId));
      }
    } catch (error) {
      console.error('Error marking insight as read:', error);
    }
  };

  const handleMarkAsActioned = async (insightId: string) => {
    try {
      const response = await fetch('/api/analytics/insights', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          insightId,
          action: 'actioned',
        }),
      });

      if (response.ok) {
        setInsights(prev => prev.filter(insight => insight.id !== insightId));
      }
    } catch (error) {
      console.error('Error marking insight as actioned:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <Info className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <p>Failed to load insights</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (insights.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="font-medium">No insights available</p>
          <p className="text-sm">We'll generate insights as you use the platform</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        </div>
        <span className="text-sm text-gray-500">{insights.length} new</span>
      </div>

      <div className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(insight.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getPriorityIcon(insight.priority)}
                  <h4 className="font-medium text-gray-900">{insight.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {insight.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{insight.description}</p>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleMarkAsActioned(insight.id)}
                    className="flex items-center space-x-1 text-xs text-green-600 hover:text-green-700"
                  >
                    <CheckCircle className="h-3 w-3" />
                    <span>Actioned</span>
                  </button>
                  <button
                    onClick={() => handleMarkAsRead(insight.id)}
                    className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                    <span>Dismiss</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <a
          href="/analytics/insights"
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          View all insights →
        </a>
      </div>
    </div>
  );
} 