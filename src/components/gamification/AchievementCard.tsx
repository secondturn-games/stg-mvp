'use client';

import { Trophy, Star, Zap, Crown } from 'lucide-react';
import type { Achievement } from '@/lib/gamification-service';

interface AchievementCardProps {
  achievement: Achievement;
  earned?: boolean;
  earnedAt?: string;
  className?: string;
}

export default function AchievementCard({ 
  achievement, 
  earned = false, 
  earnedAt, 
  className = '' 
}: AchievementCardProps) {
  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Crown className="h-4 w-4 text-orange-500" />;
      case 'epic':
        return <Zap className="h-4 w-4 text-purple-500" />;
      case 'rare':
        return <Star className="h-4 w-4 text-blue-500" />;
      case 'common':
      default:
        return <Trophy className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRarityBgColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-orange-50 border-orange-200';
      case 'epic':
        return 'bg-purple-50 border-purple-200';
      case 'rare':
        return 'bg-blue-50 border-blue-200';
      case 'common':
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'text-orange-700';
      case 'epic':
        return 'text-purple-700';
      case 'rare':
        return 'text-blue-700';
      case 'common':
      default:
        return 'text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className={`p-4 border rounded-lg transition-all duration-200 ${
      earned 
        ? getRarityBgColor(achievement.rarity) 
        : 'bg-white border-gray-200 opacity-60'
    } ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Achievement Icon */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
          earned ? 'bg-white' : 'bg-gray-100'
        }`}>
          {achievement.icon}
        </div>

        {/* Achievement Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className={`text-sm font-medium truncate ${
              earned ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {achievement.name}
            </h3>
            {getRarityIcon(achievement.rarity)}
          </div>

          <p className={`text-xs mb-2 ${
            earned ? 'text-gray-600' : 'text-gray-400'
          }`}>
            {achievement.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                earned ? getRarityTextColor(achievement.rarity) : 'text-gray-400'
              }`}>
                {achievement.points} XP
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                earned ? getRarityTextColor(achievement.rarity) : 'text-gray-400'
              }`}>
                {achievement.rarity}
              </span>
            </div>

            {earned && earnedAt && (
              <span className="text-xs text-gray-500">
                Earned {formatDate(earnedAt)}
              </span>
            )}
          </div>
        </div>

        {/* Earned Badge */}
        {earned && (
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <Trophy className="h-3 w-3 text-white" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 