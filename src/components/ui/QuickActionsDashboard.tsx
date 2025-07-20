'use client';

import { 
  Plus, 
  Search, 
  Settings, 
  BarChart3, 
  Shield,
  CreditCard,
  Eye,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import type { ProfileStrengthResult } from '@/lib/profile-strength';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  bgColor: string;
  priority: 'high' | 'medium' | 'low';
  category: 'create' | 'manage' | 'improve' | 'analyze';
}

interface QuickActionsDashboardProps {
  profileStrength?: ProfileStrengthResult;
  userStats?: {
    activeListings: number;
    totalListings: number;
    totalTransactions: number;
    totalVolume: number;
  };
  className?: string;
}

export default function QuickActionsDashboard({
  profileStrength,
  userStats,
  className = '',
}: QuickActionsDashboardProps) {
  const getQuickActions = (): QuickAction[] => {
    const baseActions: QuickAction[] = [
      // Create actions
      {
        id: 'create_listing',
        title: 'Create Listing',
        description: 'List a new game for sale',
        icon: <Plus className="w-5 h-5" />,
        href: '/listings/create',
        color: 'text-forestDeep',
        bgColor: 'bg-ivory hover:bg-goldenBeam/20',
        priority: 'high',
        category: 'create',
      },
      {
        id: 'browse_marketplace',
        title: 'Browse Games',
        description: 'Find games to buy',
        icon: <Search className="w-5 h-5" />,
        href: '/marketplace',
        color: 'text-sunEmber',
        bgColor: 'bg-sunEmber/10 hover:bg-sunEmber/20',
        priority: 'medium',
        category: 'create',
      },

      // Manage actions
      {
        id: 'my_listings',
        title: 'My Listings',
        description: 'Manage your listings',
        icon: <Eye className="w-5 h-5" />,
        href: '/listings/my-listings',
        color: 'text-forestDeep',
        bgColor: 'bg-goldenBeam/10 hover:bg-goldenBeam/20',
        priority: 'high',
        category: 'manage',
      },
      {
        id: 'profile_settings',
        title: 'Profile Settings',
        description: 'Update your profile',
        icon: <Settings className="w-5 h-5" />,
        href: '/profile/settings',
        color: 'text-forestDeep',
        bgColor: 'bg-gray-50 hover:bg-ivory',
        priority: 'medium',
        category: 'manage',
      },

      // Analyze actions
      {
        id: 'analytics',
        title: 'Analytics',
        description: 'View your performance',
        icon: <BarChart3 className="w-5 h-5" />,
        href: '/profile/analytics',
        color: 'text-goldenBeam',
        bgColor: 'bg-goldenBeam/10 hover:bg-goldenBeam/20',
        priority: 'low',
        category: 'analyze',
      },
    ];

    // Add conditional actions based on profile strength
    const conditionalActions: QuickAction[] = [];

    if (profileStrength) {
      // Add verification actions if not verified
      if (!profileStrength.achievedFactors.find(f => f.id === 'bank_verified')) {
        conditionalActions.push({
          id: 'verify_bank',
          title: 'Verify Bank Account',
          description: 'Secure payment processing',
          icon: <CreditCard className="w-5 h-5" />,
          href: '/profile/settings',
          color: 'text-sunEmber',
          bgColor: 'bg-sunEmber/10 hover:bg-sunEmber/20',
          priority: 'high',
          category: 'improve',
        });
      }

      if (!profileStrength.achievedFactors.find(f => f.id === 'seller_verified')) {
        conditionalActions.push({
          id: 'get_verified',
          title: 'Get Verified',
          description: 'Become a verified seller',
          icon: <Shield className="w-5 h-5" />,
          href: '/profile/settings',
          color: 'text-forestDeep',
          bgColor: 'bg-ivory hover:bg-goldenBeam/20',
          priority: 'high',
          category: 'improve',
        });
      }
    }

    // Add stats-based actions
    if (userStats) {
      if (userStats.activeListings === 0) {
        // Boost priority of creating listing if no active listings
        const createListingAction = baseActions.find(a => a.id === 'create_listing');
        if (createListingAction) {
          createListingAction.priority = 'high';
        }
      }

      if (userStats.totalTransactions > 0) {
        conditionalActions.push({
          id: 'transaction_history',
          title: 'Transaction History',
          description: 'View past transactions',
          icon: <TrendingUp className="w-5 h-5" />,
          href: '/profile/transactions',
          color: 'text-goldenBeam',
          bgColor: 'bg-goldenBeam/10 hover:bg-goldenBeam/20',
          priority: 'medium',
          category: 'analyze',
        });
      }
    }

    return [...baseActions, ...conditionalActions];
  };

  const actions = getQuickActions();
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  const sortedActions = actions.sort((a, b) => {
    // Sort by priority first, then by category
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.category.localeCompare(b.category);
  });

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-forestDeep">Quick Actions</h3>
        <div className="text-sm text-gray-600">
          {sortedActions.length} actions available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sortedActions.slice(0, 6).map((action) => (
          <Link
            key={action.id}
            href={action.href}
            className={`group p-4 rounded-lg border border-gray-200 transition-all duration-200 ${action.bgColor}`}
          >
            <div className="flex items-start space-x-3">
              <div className={`${action.color} group-hover:scale-110 transition-transform`}>
                {action.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-forestDeep group-hover:text-forestDeep/80">
                    {action.title}
                  </h4>
                  {action.priority === 'high' && (
                    <div className="w-2 h-2 bg-sunEmber rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-1 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Show more actions link if there are more than 6 */}
      {sortedActions.length > 6 && (
        <div className="mt-4 text-center">
          <Link
            href="/profile/actions"
            className="text-sm text-sunEmber hover:text-sunEmber/80 font-medium"
          >
            View all {sortedActions.length} actions →
          </Link>
        </div>
      )}

      {/* Priority indicators */}
      <div className="mt-4 flex items-center justify-center space-x-4 text-xs text-gray-600">
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-sunEmber rounded-full" />
          <span>High Priority</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-300 rounded-full" />
          <span>Normal Priority</span>
        </div>
      </div>
    </div>
  );
}