'use client';

import { TrendingUp, Star, Trophy, Crown } from 'lucide-react';
import type { UserLevel } from '@/lib/gamification-service';
import { getLevelTitle, getExperienceForNextLevel } from '@/lib/gamification-service';

interface LevelProgressProps {
  userLevel: UserLevel;
  className?: string;
}

export default function LevelProgress({ userLevel, className = '' }: LevelProgressProps) {
  const experienceForNextLevel = getExperienceForNextLevel(userLevel.level);
  const progressPercentage = Math.min(
    (userLevel.experience / experienceForNextLevel) * 100,
    100
  );

  const getLevelIcon = (level: number) => {
    if (level >= 50) return <Crown className="h-6 w-6 text-orange-500" />;
    if (level >= 25) return <Trophy className="h-6 w-6 text-purple-500" />;
    if (level >= 10) return <Star className="h-6 w-6 text-blue-500" />;
    return <TrendingUp className="h-6 w-6 text-green-500" />;
  };

  const getLevelColor = (level: number) => {
    if (level >= 50) return 'text-orange-600';
    if (level >= 25) return 'text-purple-600';
    if (level >= 10) return 'text-blue-600';
    return 'text-green-600';
  };

  const getProgressColor = (level: number) => {
    if (level >= 50) return 'bg-orange-500';
    if (level >= 25) return 'bg-purple-500';
    if (level >= 10) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {getLevelIcon(userLevel.level)}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Level {userLevel.level}
            </h3>
            <p className={`text-sm font-medium ${getLevelColor(userLevel.level)}`}>
              {getLevelTitle(userLevel.level)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {formatNumber(userLevel.total_experience)}
          </div>
          <div className="text-sm text-gray-500">Total XP</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>Progress to Level {userLevel.level + 1}</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(userLevel.level)}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 mt-1">
          <span>{formatNumber(userLevel.experience)} / {formatNumber(experienceForNextLevel)} XP</span>
          <span>{formatNumber(experienceForNextLevel - userLevel.experience)} XP needed</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
        <div className="text-center">
          <div className="text-xl font-bold text-blue-600">
            {userLevel.achievements_earned}
          </div>
          <div className="text-xs text-gray-500">Achievements</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-green-600">
            {userLevel.badges_earned}
          </div>
          <div className="text-xs text-gray-500">Badges</div>
        </div>
      </div>
    </div>
  );
} 