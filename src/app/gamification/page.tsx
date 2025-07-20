'use client';

import { useState, useEffect } from 'react';
import { Trophy, Star, TrendingUp, Target, Award, Users, Calendar } from 'lucide-react';
import AchievementCard from '@/components/gamification/AchievementCard';
import LevelProgress from '@/components/gamification/LevelProgress';
import type { 
  Achievement, 
  UserAchievement, 
  UserLevel, 
  ExperienceLog, 
  LeaderboardEntry,
  UserChallenge,
  UserMilestone,
  UserStreak 
} from '@/lib/gamification-service';

export default function GamificationPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<{
    level: UserLevel | null;
    achievements: UserAchievement[];
    streak: UserStreak | null;
    recentExperience: ExperienceLog[];
    leaderboardRankings: LeaderboardEntry[];
    activeChallenges: UserChallenge[];
    milestones: UserMilestone[];
  } | null>(null);

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/gamification');
      if (response.ok) {
        const data = await response.json();
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching gamification data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gamification data</h3>
            <p className="text-gray-600">Start using the platform to earn achievements and level up!</p>
          </div>
        </div>
      </div>
    );
  }

  const earnedAchievements = summary.achievements.filter(ua => ua.achievement);
  const unearnedAchievements = summary.achievements.filter(ua => !ua.achievement);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gamification Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your progress, achievements, and compete with other collectors
          </p>
        </div>

        {/* Level Progress */}
        {summary.level && (
          <div className="mb-8">
            <LevelProgress userLevel={summary.level} />
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Achievements</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earnedAchievements.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.streak?.current_streak || 0} days
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Challenges</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.activeChallenges.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Award className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Milestones</p>
                <p className="text-2xl font-bold text-gray-900">
                  {summary.milestones.filter(m => m.completed).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Achievements */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Achievements</h2>
                <div className="text-sm text-gray-500">
                  {earnedAchievements.length} of {earnedAchievements.length + unearnedAchievements.length} earned
                </div>
              </div>

              {earnedAchievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
                  <p className="text-gray-600">Start using the platform to earn your first achievement!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {earnedAchievements.map((userAchievement) => (
                    <AchievementCard
                      key={userAchievement.id}
                      achievement={userAchievement.achievement!}
                      earned={true}
                      earnedAt={userAchievement.earned_at}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Recent Experience */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Experience</h3>
              {summary.recentExperience.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {summary.recentExperience.slice(0, 5).map((log) => (
                    <div key={log.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {log.description || log.source}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(log.created_at)}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-green-600">
                        +{formatNumber(log.amount)} XP
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Info */}
            {summary.streak && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Streak</h3>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {summary.streak.current_streak}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Current Streak (days)</p>
                  <div className="text-sm text-gray-500">
                    Longest: {summary.streak.longest_streak} days
                  </div>
                </div>
              </div>
            )}

            {/* Active Challenges */}
            {summary.activeChallenges.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Challenges</h3>
                <div className="space-y-3">
                  {summary.activeChallenges.slice(0, 3).map((userChallenge) => (
                    <div key={userChallenge.id} className="p-3 bg-gray-50 rounded-lg">
                      <h4 className="text-sm font-medium text-gray-900">
                        {userChallenge.challenge?.name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {userChallenge.challenge?.description}
                      </p>
                      {userChallenge.completed && (
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Completed
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Milestones Section */}
        {summary.milestones.length > 0 && (
          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Milestones</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.milestones.map((userMilestone) => (
                  <div
                    key={userMilestone.id}
                    className={`p-4 border rounded-lg ${
                      userMilestone.completed
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-gray-900">
                        {userMilestone.milestone?.name}
                      </h3>
                      {userMilestone.completed && (
                        <Award className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mb-3">
                      {userMilestone.milestone?.description}
                    </p>
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Progress</span>
                        <span>
                          {userMilestone.progress} / {userMilestone.milestone?.threshold}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            userMilestone.completed ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${Math.min(
                              (userMilestone.progress / (userMilestone.milestone?.threshold || 1)) * 100,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                    {userMilestone.completed && (
                      <div className="text-xs text-green-600 font-medium">
                        +{userMilestone.milestone?.reward_points} XP
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 