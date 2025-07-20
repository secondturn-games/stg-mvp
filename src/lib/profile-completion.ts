import type { UserProfile } from './user-service';

export interface ProfileCompletionItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
  required: boolean;
  weight: number;
}

export interface ProfileCompletionResult {
  percentage: number;
  completedItems: ProfileCompletionItem[];
  pendingItems: ProfileCompletionItem[];
  allItems: ProfileCompletionItem[];
  score: number;
  maxScore: number;
}

export function calculateProfileCompletion(profile: Partial<UserProfile> | null): ProfileCompletionResult {
  const items: ProfileCompletionItem[] = [
    {
      id: 'username',
      label: 'Username',
      description: 'Choose a unique username',
      completed: !!(profile?.username?.trim()),
      required: true,
      weight: 20,
    },
    {
      id: 'country',
      label: 'Country',
      description: 'Select your country',
      completed: !!(profile?.country),
      required: true,
      weight: 15,
    },
    {
      id: 'language',
      label: 'Preferred Language',
      description: 'Set your preferred language',
      completed: !!(profile?.preferred_language),
      required: true,
      weight: 10,
    },
    {
      id: 'vat_number',
      label: 'VAT Number',
      description: 'Add VAT number for business selling',
      completed: !!(profile?.vat_number?.trim()),
      required: false,
      weight: 15,
    },
    {
      id: 'bank_verified',
      label: 'Bank Verification',
      description: 'Verify your bank account for secure transactions',
      completed: !!(profile?.bank_verified),
      required: false,
      weight: 25,
    },
    {
      id: 'verified_seller',
      label: 'Seller Verification',
      description: 'Complete seller verification process',
      completed: !!(profile?.verified_seller),
      required: false,
      weight: 15,
    },
  ];

  const completedItems = items.filter(item => item.completed);
  const pendingItems = items.filter(item => !item.completed);
  
  const score = completedItems.reduce((sum, item) => sum + item.weight, 0);
  const maxScore = items.reduce((sum, item) => sum + item.weight, 0);
  const percentage = Math.round((score / maxScore) * 100);

  return {
    percentage,
    completedItems,
    pendingItems,
    allItems: items,
    score,
    maxScore,
  };
}

export function getProfileCompletionLevel(percentage: number): {
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  color: string;
  message: string;
} {
  if (percentage >= 90) {
    return {
      level: 'expert',
      color: 'text-green-600',
      message: 'Your profile is complete and optimized!',
    };
  } else if (percentage >= 70) {
    return {
      level: 'advanced',
      color: 'text-blue-600',
      message: 'Great profile! Just a few more details to complete.',
    };
  } else if (percentage >= 50) {
    return {
      level: 'intermediate',
      color: 'text-yellow-600',
      message: 'Good start! Complete more details to improve trust.',
    };
  } else {
    return {
      level: 'beginner',
      color: 'text-red-600',
      message: 'Complete your profile to start selling successfully.',
    };
  }
}

export function getNextProfileAction(pendingItems: ProfileCompletionItem[]): ProfileCompletionItem | null {
  // Prioritize required items first, then by weight
  const requiredItems = pendingItems.filter(item => item.required);
  if (requiredItems.length > 0) {
    return requiredItems.sort((a, b) => b.weight - a.weight)[0];
  }
  
  return pendingItems.sort((a, b) => b.weight - a.weight)[0] || null;
}