'use client';

import { CheckCircle, Circle, AlertCircle } from 'lucide-react';
import type { ProfileCompletionResult } from '@/lib/profile-completion';
import { getProfileCompletionLevel } from '@/lib/profile-completion';

interface ProfileCompletionMeterProps {
  completion: ProfileCompletionResult;
  showDetails?: boolean;
  className?: string;
}

export default function ProfileCompletionMeter({
  completion,
  showDetails = false,
  className = '',
}: ProfileCompletionMeterProps) {
  const level = getProfileCompletionLevel(completion.percentage);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-forestDeep to-sunEmber" />
            <h3 className="font-semibold text-gray-900">Profile Completion</h3>
          </div>
          <span className={`text-sm font-medium ${level.color}`}>
            {completion.percentage}%
          </span>
        </div>
        {completion.percentage < 100 && (
          <AlertCircle className="w-4 h-4 text-yellow-500" />
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-forestDeep to-sunEmber h-2 rounded-full transition-all duration-300"
            style={{ width: `${completion.percentage}%` }}
          />
        </div>
        <p className={`text-sm mt-1 ${level.color}`}>
          {level.message}
        </p>
      </div>

      {showDetails && (
        <div className="space-y-3">
          {/* Completed Items */}
          {completion.completedItems.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Completed ({completion.completedItems.length})
              </h4>
              <div className="space-y-1">
                {completion.completedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2 text-sm text-gray-600"
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span>{item.label}</span>
                    <span className="text-xs text-gray-400">
                      +{item.weight}pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Items */}
          {completion.pendingItems.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Remaining ({completion.pendingItems.length})
              </h4>
              <div className="space-y-1">
                {completion.pendingItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center space-x-2 text-sm text-gray-500"
                  >
                    <Circle className="w-4 h-4 text-gray-400" />
                    <span>{item.label}</span>
                    {item.required && (
                      <span className="text-xs text-red-500">Required</span>
                    )}
                    <span className="text-xs text-gray-400">
                      +{item.weight}pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score */}
          <div className="pt-2 border-t border-gray-100">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Profile Score</span>
              <span className="font-medium">
                {completion.score}/{completion.maxScore} points
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}