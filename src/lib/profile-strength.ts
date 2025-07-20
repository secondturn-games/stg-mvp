import type { UserProfile } from './user-service';

export interface ProfileStrengthFactor {
  id: string;
  name: string;
  description: string;
  weight: number;
  achieved: boolean;
  impact: 'low' | 'medium' | 'high';
  actionText?: string;
  actionUrl?: string;
}

export interface ProfileStrengthResult {
  score: number;
  maxScore: number;
  percentage: number;
  level: 'weak' | 'basic' | 'good' | 'strong' | 'excellent';
  factors: ProfileStrengthFactor[];
  achievedFactors: ProfileStrengthFactor[];
  missingFactors: ProfileStrengthFactor[];
  recommendations: string[];
  trustScore: number;
}

export function calculateProfileStrength(
  profile: Partial<UserProfile> | null,
  stats?: {
    activeListings: number;
    totalListings: number;
    totalTransactions: number;
    totalVolume: number;
  }
): ProfileStrengthResult {
  const factors: ProfileStrengthFactor[] = [
    // Basic Profile Completeness
    {
      id: 'username',
      name: 'Username Set',
      description: 'You have chosen a unique username',
      weight: 10,
      achieved: !!(profile?.username?.trim()),
      impact: 'medium',
      actionText: 'Set Username',
      actionUrl: '/profile/settings',
    },
    {
      id: 'location',
      name: 'Location Specified',
      description: 'Your country is set for shipping calculations',
      weight: 15,
      achieved: !!(profile?.country),
      impact: 'high',
      actionText: 'Set Location',
      actionUrl: '/profile/settings',
    },
    {
      id: 'language',
      name: 'Language Preference',
      description: 'Your preferred language is configured',
      weight: 5,
      achieved: !!(profile?.preferred_language),
      impact: 'low',
      actionText: 'Set Language',
      actionUrl: '/profile/settings',
    },

    // Trust & Verification
    {
      id: 'email_verified',
      name: 'Email Verified',
      description: 'Your email address is verified',
      weight: 20,
      achieved: true, // Clerk handles this
      impact: 'high',
    },
    {
      id: 'bank_verified',
      name: 'Bank Account Verified',
      description: 'Your bank account is verified for secure payments',
      weight: 25,
      achieved: !!(profile?.bank_verified),
      impact: 'high',
      actionText: 'Verify Bank Account',
      actionUrl: '/profile/settings',
    },
    {
      id: 'seller_verified',
      name: 'Seller Verification',
      description: 'You have completed the seller verification process',
      weight: 30,
      achieved: !!(profile?.verified_seller),
      impact: 'high',
      actionText: 'Get Verified',
      actionUrl: '/profile/settings',
    },

    // Business Profile
    {
      id: 'vat_number',
      name: 'VAT Number',
      description: 'VAT number added for business compliance',
      weight: 15,
      achieved: !!(profile?.vat_number?.trim()),
      impact: 'medium',
      actionText: 'Add VAT Number',
      actionUrl: '/profile/settings',
    },

    // Activity & Reputation
    {
      id: 'active_listings',
      name: 'Active Listings',
      description: 'You have active listings in the marketplace',
      weight: 20,
      achieved: (stats?.activeListings || 0) > 0,
      impact: 'medium',
      actionText: 'Create Listing',
      actionUrl: '/listings/create',
    },
    {
      id: 'transaction_history',
      name: 'Transaction History',
      description: 'You have completed transactions',
      weight: 25,
      achieved: (stats?.totalTransactions || 0) > 0,
      impact: 'high',
      actionText: 'Browse Marketplace',
      actionUrl: '/marketplace',
    },
    {
      id: 'volume_trader',
      name: 'Volume Trader',
      description: 'You have traded games worth over €100',
      weight: 15,
      achieved: (stats?.totalVolume || 0) >= 100,
      impact: 'medium',
      actionText: 'Browse Marketplace',
      actionUrl: '/marketplace',
    },
  ];

  const achievedFactors = factors.filter(f => f.achieved);
  const missingFactors = factors.filter(f => !f.achieved);

  const score = achievedFactors.reduce((sum, factor) => sum + factor.weight, 0);
  const maxScore = factors.reduce((sum, factor) => sum + factor.weight, 0);
  const percentage = Math.round((score / maxScore) * 100);

  // Determine level
  let level: ProfileStrengthResult['level'];
  if (percentage >= 90) level = 'excellent';
  else if (percentage >= 75) level = 'strong';
  else if (percentage >= 60) level = 'good';
  else if (percentage >= 40) level = 'basic';
  else level = 'weak';

  // Calculate trust score (weighted more heavily on verification)
  const trustFactors = factors.filter(f => 
    ['email_verified', 'bank_verified', 'seller_verified', 'transaction_history'].includes(f.id)
  );
  const achievedTrustFactors = trustFactors.filter(f => f.achieved);
  const trustScore = Math.round(
    (achievedTrustFactors.reduce((sum, f) => sum + f.weight, 0) / 
     trustFactors.reduce((sum, f) => sum + f.weight, 0)) * 100
  );

  // Generate recommendations
  const recommendations = generateRecommendations(missingFactors, level);

  return {
    score,
    maxScore,
    percentage,
    level,
    factors,
    achievedFactors,
    missingFactors,
    recommendations,
    trustScore,
  };
}

function generateRecommendations(
  missingFactors: ProfileStrengthFactor[],
  level: ProfileStrengthResult['level']
): string[] {
  const recommendations: string[] = [];

  // Prioritize high-impact missing factors
  const highImpactMissing = missingFactors.filter(f => f.impact === 'high');
  const mediumImpactMissing = missingFactors.filter(f => f.impact === 'medium');

  if (level === 'weak' || level === 'basic') {
    recommendations.push('Focus on completing profile verification to build trust with buyers');
    if (highImpactMissing.length > 0) {
      recommendations.push(`Priority: ${highImpactMissing[0].name} - ${highImpactMissing[0].description}`);
    }
  }

  if (level === 'good' || level === 'strong') {
    recommendations.push('Your profile is looking good! Consider these final touches:');
    if (mediumImpactMissing.length > 0) {
      recommendations.push(`Consider: ${mediumImpactMissing[0].name} - ${mediumImpactMissing[0].description}`);
    }
  }

  if (level === 'excellent') {
    recommendations.push('Excellent profile! You\'re ready to sell with confidence.');
  }

  // Activity-based recommendations
  const hasListings = missingFactors.find(f => f.id === 'active_listings');
  const hasTransactions = missingFactors.find(f => f.id === 'transaction_history');

  if (hasListings) {
    recommendations.push('Create your first listing to start selling games');
  }

  if (hasTransactions) {
    recommendations.push('Complete your first transaction to build reputation');
  }

  return recommendations.slice(0, 3); // Limit to 3 recommendations
}

export function getProfileStrengthColor(level: ProfileStrengthResult['level']): string {
  switch (level) {
    case 'excellent':
      return 'text-forestDeep';
    case 'strong':
      return 'text-forestDeep';
    case 'good':
      return 'text-sunEmber';
    case 'basic':
      return 'text-sunEmber';
    case 'weak':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}

export function getProfileStrengthBgColor(level: ProfileStrengthResult['level']): string {
  switch (level) {
    case 'excellent':
      return 'bg-ivory border-forestDeep';
    case 'strong':
      return 'bg-ivory border-forestDeep';
    case 'good':
      return 'bg-goldenBeam/20 border-goldenBeam';
    case 'basic':
      return 'bg-sunEmber/20 border-sunEmber';
    case 'weak':
      return 'bg-gray-50 border-gray-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
}