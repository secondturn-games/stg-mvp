import { supabase } from './supabase';

export interface TrustBadge {
  id: string;
  badge_type: 'verified_seller' | 'fast_shipper' | 'great_communicator' | 'top_rated' | 'power_seller' | 'trusted_buyer';
  awarded_at: string;
  expires_at?: string;
  is_active: boolean;
  metadata: Record<string, any>;
}

export interface UserReputation {
  reputation_score: number;
  response_rate: number;
  average_rating: number;
  total_reviews: number;
  trust_badges: TrustBadge[];
  last_active: string;
}

export interface ReviewData {
  transaction_id: string;
  reviewer_id: string;
  reviewed_id: string;
  rating: number;
  comment?: string;
  review_type: 'buyer' | 'seller';
  communication_rating?: number;
  shipping_rating?: number;
  item_condition_rating?: number;
}

// Reputation calculation constants
const REPUTATION_POINTS = {
  listing_created: 5,
  listing_sold: 10,
  purchase_made: 5,
  review_given: 2,
  review_received: 10, // Will be adjusted based on rating
  message_responded: 1,
  profile_updated: 2,
  badge_earned: 15,
} as const;

// Badge requirements
const BADGE_REQUIREMENTS = {
  verified_seller: { manual: true, description: 'Manually verified by admin' },
  fast_shipper: { 
    condition: 'response_rate >= 95 AND avg_response_time <= 14400', // 4 hours
    description: 'Ships within 24 hours consistently'
  },
  great_communicator: { 
    condition: 'response_rate >= 90 AND avg_response_time <= 14400',
    description: 'Responds quickly and consistently'
  },
  top_rated: { 
    condition: 'average_rating >= 4.5 AND total_reviews >= 5',
    description: 'Maintains high ratings from buyers'
  },
  power_seller: { 
    condition: 'total_sales >= 10 AND reputation_score >= 200',
    description: 'Consistently successful seller'
  },
  trusted_buyer: { 
    condition: 'total_purchases >= 5 AND average_rating >= 4.0',
    description: 'Reliable buyer with good feedback'
  },
} as const;

// Track user activity and award points
export async function trackUserActivity(
  userId: string,
  activityType: keyof typeof REPUTATION_POINTS,
  metadata?: Record<string, any>
): Promise<void> {
  const pointsChange = REPUTATION_POINTS[activityType];
  
  const { error } = await supabase
    .from('user_activity')
    .insert({
      user_id: userId,
      activity_type: activityType,
      points_change: pointsChange,
      metadata: metadata || {},
    });

  if (error) {
    console.error('Error tracking user activity:', error);
    throw new Error('Failed to track user activity');
  }

  // Update user's reputation score
  await updateUserReputation(userId);
}

// Track user activity with custom points
export async function trackUserActivityWithPoints(
  userId: string,
  activityType: string,
  pointsChange: number,
  metadata?: Record<string, any>
): Promise<void> {
  const { error } = await supabase
    .from('user_activity')
    .insert({
      user_id: userId,
      activity_type: activityType,
      points_change: pointsChange,
      metadata: metadata || {},
    });

  if (error) {
    console.error('Error tracking user activity:', error);
    throw new Error('Failed to track user activity');
  }

  // Update user's reputation score
  await updateUserReputation(userId);
}

// Update user's reputation score
export async function updateUserReputation(userId: string): Promise<void> {
  const { data, error } = await supabase
    .rpc('calculate_user_reputation', { user_uuid: userId });

  if (error) {
    console.error('Error calculating reputation:', error);
    return;
  }

  const reputationScore = data || 100;

  const { error: updateError } = await supabase
    .from('users')
    .update({ 
      reputation_score: reputationScore,
      last_active: new Date().toISOString(),
    })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating user reputation:', updateError);
  }
}

// Calculate and update response rate
export async function updateResponseRate(userId: string): Promise<void> {
  const { data, error } = await supabase
    .rpc('calculate_response_rate', { user_uuid: userId });

  if (error) {
    console.error('Error calculating response rate:', error);
    return;
  }

  const responseRate = data || 0;

  const { error: updateError } = await supabase
    .from('users')
    .update({ response_rate: responseRate })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating response rate:', updateError);
  }
}

// Calculate and update average rating
export async function updateAverageRating(userId: string): Promise<void> {
  const { data, error } = await supabase
    .rpc('calculate_average_rating', { user_uuid: userId });

  if (error) {
    console.error('Error calculating average rating:', error);
    return;
  }

  const averageRating = data || 0;

  const { error: updateError } = await supabase
    .from('users')
    .update({ average_rating: averageRating })
    .eq('id', userId);

  if (updateError) {
    console.error('Error updating average rating:', updateError);
  }
}

// Get user's reputation data
export async function getUserReputation(userId: string): Promise<UserReputation | null> {
  // Get user data
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('reputation_score, response_rate, average_rating, total_reviews, last_active')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    return null;
  }

  // Get trust badges
  const { data: badges, error: badgesError } = await supabase
    .from('trust_badges')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('awarded_at', { ascending: false });

  if (badgesError) {
    console.error('Error fetching trust badges:', badgesError);
  }

  return {
    reputation_score: user.reputation_score,
    response_rate: user.response_rate,
    average_rating: user.average_rating,
    total_reviews: user.total_reviews,
    trust_badges: badges || [],
    last_active: user.last_active,
  };
}

// Create a review
export async function createReview(reviewData: ReviewData): Promise<void> {
  const { error } = await supabase
    .from('reviews')
    .insert(reviewData);

  if (error) {
    console.error('Error creating review:', error);
    throw new Error('Failed to create review');
  }

  // Track activity for reviewer
  await trackUserActivity(reviewData.reviewer_id, 'review_given');
  
  // Track activity for reviewed user with rating-based points
  const ratingPoints = reviewData.rating >= 4 ? 10 : reviewData.rating >= 3 ? 0 : -10;
  await trackUserActivityWithPoints(reviewData.reviewed_id, 'review_received', ratingPoints);
  
  // Update average rating for reviewed user
  await updateAverageRating(reviewData.reviewed_id);
  
  // Check for badge eligibility
  await checkBadgeEligibility(reviewData.reviewed_id);
}

// Check if user is eligible for badges
export async function checkBadgeEligibility(userId: string): Promise<void> {
  // Get user's current stats
  const reputation = await getUserReputation(userId);
  if (!reputation) return;

  // Get additional stats for badge requirements
  const { data: stats } = await supabase
    .from('transactions')
    .select('*')
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

  const totalSales = stats?.filter(t => t.seller_id === userId && t.payment_status === 'completed').length || 0;
  const totalPurchases = stats?.filter(t => t.buyer_id === userId && t.payment_status === 'completed').length || 0;

  // Check each badge requirement
  const badgesToAward: Array<keyof typeof BADGE_REQUIREMENTS> = [];

  // Top Rated Badge
  if (reputation.average_rating >= 4.5 && reputation.total_reviews >= 5) {
    badgesToAward.push('top_rated');
  }

  // Power Seller Badge
  if (totalSales >= 10 && reputation.reputation_score >= 200) {
    badgesToAward.push('power_seller');
  }

  // Trusted Buyer Badge
  if (totalPurchases >= 5 && reputation.average_rating >= 4.0) {
    badgesToAward.push('trusted_buyer');
  }

  // Fast Shipper Badge (requires response rate calculation)
  if (reputation.response_rate >= 95) {
    badgesToAward.push('fast_shipper');
  }

  // Great Communicator Badge
  if (reputation.response_rate >= 90) {
    badgesToAward.push('great_communicator');
  }

  // Award badges
  for (const badgeType of badgesToAward) {
    await awardBadge(userId, badgeType);
  }
}

// Award a badge to a user
export async function awardBadge(
  userId: string, 
  badgeType: keyof typeof BADGE_REQUIREMENTS
): Promise<void> {
  // Check if user already has this badge
  const { data: existingBadge } = await supabase
    .from('trust_badges')
    .select('id')
    .eq('user_id', userId)
    .eq('badge_type', badgeType)
    .eq('is_active', true)
    .single();

  if (existingBadge) {
    return; // Badge already awarded
  }

  // Award the badge
  const { error } = await supabase
    .from('trust_badges')
    .insert({
      user_id: userId,
      badge_type: badgeType,
      metadata: {
        requirement: BADGE_REQUIREMENTS[badgeType].description,
      },
    });

  if (error) {
    console.error('Error awarding badge:', error);
    return;
  }

  // Track badge earning activity
  await trackUserActivity(userId, 'badge_earned', { badge_type: badgeType });
}

// Get badge information
export function getBadgeInfo(badgeType: keyof typeof BADGE_REQUIREMENTS) {
  const badgeConfig = {
    verified_seller: {
      name: 'Verified Seller',
      description: 'Manually verified by admin',
      icon: '🏆',
      color: 'gold',
    },
    fast_shipper: {
      name: 'Fast Shipper',
      description: 'Ships within 24 hours consistently',
      icon: '🚀',
      color: 'green',
    },
    great_communicator: {
      name: 'Great Communicator',
      description: 'Responds quickly and consistently',
      icon: '💬',
      color: 'blue',
    },
    top_rated: {
      name: 'Top Rated',
      description: 'Maintains high ratings from buyers',
      icon: '⭐',
      color: 'yellow',
    },
    power_seller: {
      name: 'Power Seller',
      description: 'Consistently successful seller',
      icon: '💪',
      color: 'purple',
    },
    trusted_buyer: {
      name: 'Trusted Buyer',
      description: 'Reliable buyer with good feedback',
      icon: '🤝',
      color: 'teal',
    },
  };

  return badgeConfig[badgeType];
} 