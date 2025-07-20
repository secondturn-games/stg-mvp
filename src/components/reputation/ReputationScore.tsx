'use client';

import { Star, TrendingUp, TrendingDown } from 'lucide-react';

interface ReputationScoreProps {
  score: number;
  showDetails?: boolean;
  className?: string;
}

export default function ReputationScore({ 
  score, 
  showDetails = false,
  className = ''
}: ReputationScoreProps) {
  const getScoreColor = (score: number) => {
    if (score >= 200) return 'text-purple-600 bg-purple-50 border-purple-200';
    if (score >= 150) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 100) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreLevel = (score: number) => {
    if (score >= 200) return { level: 'Elite', icon: <TrendingUp className="h-4 w-4" /> };
    if (score >= 150) return { level: 'Excellent', icon: <TrendingUp className="h-4 w-4" /> };
    if (score >= 100) return { level: 'Good', icon: <Star className="h-4 w-4" /> };
    if (score >= 50) return { level: 'Fair', icon: <Star className="h-4 w-4" /> };
    return { level: 'Poor', icon: <TrendingDown className="h-4 w-4" /> };
  };

  const { level, icon } = getScoreLevel(score);
  const colorClasses = getScoreColor(score);

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Reputation Score
        </h3>
      )}
      
      <div className={`inline-flex items-center px-3 py-2 rounded-lg border ${colorClasses} transition-colors`}>
        <div className="flex items-center space-x-2">
          {icon}
          <div>
            <div className="font-bold text-lg">{score}</div>
            {showDetails && (
              <div className="text-xs opacity-75">{level}</div>
            )}
          </div>
        </div>
      </div>
      
      {showDetails && (
        <div className="text-xs text-gray-500">
          <p>• 200+ points: Elite reputation</p>
          <p>• 150+ points: Excellent reputation</p>
          <p>• 100+ points: Good reputation</p>
          <p>• 50+ points: Fair reputation</p>
          <p>• Below 50: Poor reputation</p>
        </div>
      )}
    </div>
  );
} 