import { supabase } from './supabase';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'collection' | 'trading' | 'community' | 'marketplace' | 'social' | 'special';
  points: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  requirements: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  earned_at: string;
  progress: Record<string, any>;
  achievement?: Achievement;
}

export interface UserLevel {
  id: string;
  user_id: string;
  level: number;
  experience: number;
  total_experience: number;
  title: string;
  badges_earned: number;
  achievements_earned: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface ExperienceLog {
  id: string;
  user_id: string;
  source: string;
  amount: number;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Leaderboard {
  id: string;
  name: string;
  description?: string;
  type: 'weekly' | 'monthly' | 'all_time';
  category: 'collection_size' | 'collection_value' | 'trades_completed' | 'sales_made' | 'reviews_given' | 'achievements_earned' | 'experience_points';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  leaderboard_id: string;
  user_id: string;
  rank?: number;
  score: number;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    avatar_url?: string;
  };
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  requirements: Record<string, any>;
  rewards: Record<string, any>;
  start_date: string;
  end_date: string;
  max_participants?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  progress: Record<string, any>;
  completed: boolean;
  completed_at?: string;
  rewards_claimed: boolean;
  joined_at: string;
  updated_at: string;
  challenge?: Challenge;
}

export interface UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  streak_type: 'daily' | 'weekly';
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string;
  category: string;
  threshold: number;
  reward_points: number;
  reward_achievement_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserMilestone {
  id: string;
  user_id: string;
  milestone_id: string;
  progress: number;
  completed: boolean;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  milestone?: Milestone;
}

// Add experience to user
export async function addExperience(
  userId: string,
  amount: number,
  source: string,
  description?: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const { error } = await supabase
    .rpc('add_experience', {
      user_uuid: userId,
      amount,
      source,
      description,
      metadata,
    });

  if (error) {
    console.error('Error adding experience:', error);
    throw new Error('Failed to add experience');
  }
}

// Get user level
export async function getUserLevel(userId: string): Promise<UserLevel | null> {
  const { data, error } = await supabase
    .from('user_levels')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user level:', error);
    return null;
  }

  return data;
}

// Get user experience log
export async function getExperienceLog(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<ExperienceLog[]> {
  const { data, error } = await supabase
    .from('experience_log')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching experience log:', error);
    return [];
  }

  return data || [];
}

// Get all achievements
export async function getAchievements(): Promise<Achievement[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })
    .order('points', { ascending: false });

  if (error) {
    console.error('Error fetching achievements:', error);
    return [];
  }

  return data || [];
}

// Get user achievements
export async function getUserAchievements(userId: string): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from('user_achievements')
    .select(`
      *,
      achievement:achievements(*)
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user achievements:', error);
    return [];
  }

  return data || [];
}

// Check and award achievements
export async function checkAchievements(userId: string): Promise<Achievement[]> {
  const { data, error } = await supabase
    .rpc('check_achievements', { user_uuid: userId });

  if (error) {
    console.error('Error checking achievements:', error);
    return [];
  }

  // Get the actual achievement details for the awarded achievements
  if (data && data.length > 0) {
    const achievementIds = data.map((a: any) => a.achievement_id);
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .in('id', achievementIds);

    if (!achievementsError && achievements) {
      return achievements;
    }
  }

  return [];
}

// Get leaderboards
export async function getLeaderboards(type?: string): Promise<Leaderboard[]> {
  let query = supabase
    .from('leaderboards')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leaderboards:', error);
    return [];
  }

  return data || [];
}

// Get leaderboard entries
export async function getLeaderboardEntries(
  leaderboardId: string,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('leaderboard_entries')
    .select(`
      *,
      user:users(username, avatar_url)
    `)
    .eq('leaderboard_id', leaderboardId)
    .order('rank', { ascending: true })
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard entries:', error);
    return [];
  }

  return data || [];
}

// Update leaderboard
export async function updateLeaderboard(leaderboardId: string): Promise<void> {
  const { error } = await supabase
    .rpc('update_leaderboard', { leaderboard_uuid: leaderboardId });

  if (error) {
    console.error('Error updating leaderboard:', error);
    throw new Error('Failed to update leaderboard');
  }
}

// Get challenges
export async function getChallenges(type?: string): Promise<Challenge[]> {
  let query = supabase
    .from('challenges')
    .select('*')
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString())
    .order('start_date', { ascending: false });

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }

  return data || [];
}

// Get user challenges
export async function getUserChallenges(userId: string): Promise<UserChallenge[]> {
  const { data, error } = await supabase
    .from('user_challenges')
    .select(`
      *,
      challenge:challenges(*)
    `)
    .eq('user_id', userId)
    .order('joined_at', { ascending: false });

  if (error) {
    console.error('Error fetching user challenges:', error);
    return [];
  }

  return data || [];
}

// Join challenge
export async function joinChallenge(userId: string, challengeId: string): Promise<void> {
  const { error } = await supabase
    .from('user_challenges')
    .insert({
      user_id: userId,
      challenge_id: challengeId,
    });

  if (error) {
    console.error('Error joining challenge:', error);
    throw new Error('Failed to join challenge');
  }
}

// Update challenge progress
export async function updateChallengeProgress(
  userId: string,
  challengeId: string,
  progress: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('user_challenges')
    .update({ progress })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId);

  if (error) {
    console.error('Error updating challenge progress:', error);
    throw new Error('Failed to update challenge progress');
  }
}

// Complete challenge
export async function completeChallenge(
  userId: string,
  challengeId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_challenges')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('challenge_id', challengeId);

  if (error) {
    console.error('Error completing challenge:', error);
    throw new Error('Failed to complete challenge');
  }
}

// Get user streak
export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user streak:', error);
    return null;
  }

  return data;
}

// Update user streak
export async function updateUserStreak(userId: string): Promise<void> {
  const { error } = await supabase
    .rpc('update_user_streak', { user_uuid: userId });

  if (error) {
    console.error('Error updating user streak:', error);
    throw new Error('Failed to update user streak');
  }
}

// Get milestones
export async function getMilestones(category?: string): Promise<Milestone[]> {
  let query = supabase
    .from('milestones')
    .select('*')
    .eq('is_active', true)
    .order('threshold', { ascending: true });

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching milestones:', error);
    return [];
  }

  return data || [];
}

// Get user milestones
export async function getUserMilestones(userId: string): Promise<UserMilestone[]> {
  const { data, error } = await supabase
    .from('user_milestones')
    .select(`
      *,
      milestone:milestones(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user milestones:', error);
    return [];
  }

  return data || [];
}

// Update milestone progress
export async function updateMilestoneProgress(
  userId: string,
  milestoneId: string,
  progress: number
): Promise<void> {
  const { error } = await supabase
    .from('user_milestones')
    .upsert({
      user_id: userId,
      milestone_id: milestoneId,
      progress,
    });

  if (error) {
    console.error('Error updating milestone progress:', error);
    throw new Error('Failed to update milestone progress');
  }
}

// Complete milestone
export async function completeMilestone(
  userId: string,
  milestoneId: string
): Promise<void> {
  const { error } = await supabase
    .from('user_milestones')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('milestone_id', milestoneId);

  if (error) {
    console.error('Error completing milestone:', error);
    throw new Error('Failed to complete milestone');
  }
}

// Get user gamification summary
export async function getUserGamificationSummary(userId: string): Promise<{
  level: UserLevel | null;
  achievements: UserAchievement[];
  streak: UserStreak | null;
  recentExperience: ExperienceLog[];
  leaderboardRankings: LeaderboardEntry[];
  activeChallenges: UserChallenge[];
  milestones: UserMilestone[];
}> {
  const [
    level,
    achievements,
    streak,
    recentExperience,
    leaderboardRankings,
    activeChallenges,
    milestones,
  ] = await Promise.all([
    getUserLevel(userId),
    getUserAchievements(userId),
    getUserStreak(userId),
    getExperienceLog(userId, 10),
    getLeaderboardEntries('', 5), // This would need to be specific leaderboard IDs
    getUserChallenges(userId),
    getUserMilestones(userId),
  ]);

  return {
    level,
    achievements,
    streak,
    recentExperience,
    leaderboardRankings,
    activeChallenges,
    milestones,
  };
}

// Award experience for common actions
export async function awardExperienceForAction(
  userId: string,
  action: string,
  metadata: Record<string, any> = {}
): Promise<void> {
  const experienceRewards: Record<string, { amount: number; description: string }> = {
    'add_game': { amount: 50, description: 'Added game to collection' },
    'complete_sale': { amount: 100, description: 'Completed a sale' },
    'write_review': { amount: 25, description: 'Wrote a review' },
    'earn_achievement': { amount: 0, description: 'Earned achievement' }, // Points come from achievement
    'daily_login': { amount: 10, description: 'Daily login' },
    'complete_challenge': { amount: 200, description: 'Completed challenge' },
    'reach_milestone': { amount: 150, description: 'Reached milestone' },
    'trade_completed': { amount: 75, description: 'Completed trade' },
    'collection_value_increase': { amount: 25, description: 'Collection value increased' },
  };

  const reward = experienceRewards[action];
  if (reward) {
    await addExperience(userId, reward.amount, action, reward.description, metadata);
  }
}

// Get level title based on level
export function getLevelTitle(level: number): string {
  const titles = [
    'Novice Collector',
    'Apprentice Collector',
    'Growing Collector',
    'Dedicated Collector',
    'Serious Collector',
    'Expert Collector',
    'Master Collector',
    'Legendary Collector',
    'Ultimate Collector',
    'Board Game Sage',
  ];

  const titleIndex = Math.min(Math.floor((level - 1) / 10), titles.length - 1);
  return titles[titleIndex];
}

// Calculate experience needed for next level
export function getExperienceForNextLevel(currentLevel: number): number {
  return currentLevel * 1000;
}

// Get rarity color
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'text-orange-500';
    case 'epic':
      return 'text-purple-500';
    case 'rare':
      return 'text-blue-500';
    case 'common':
    default:
      return 'text-gray-500';
  }
}

// Get rarity background color
export function getRarityBgColor(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return 'bg-orange-100 text-orange-800';
    case 'epic':
      return 'bg-purple-100 text-purple-800';
    case 'rare':
      return 'bg-blue-100 text-blue-800';
    case 'common':
    default:
      return 'bg-gray-100 text-gray-800';
  }
} 