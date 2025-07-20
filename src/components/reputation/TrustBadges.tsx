'use client';

import { useState } from 'react';
import { getBadgeInfo } from '@/lib/reputation-service';
import type { TrustBadge } from '@/lib/reputation-service';

interface TrustBadgesProps {
  badges: TrustBadge[];
  showDetails?: boolean;
  className?: string;
}

export default function TrustBadges({ 
  badges, 
  showDetails = false,
  className = ''
}: TrustBadgesProps) {
  const [hoveredBadge, setHoveredBadge] = useState<string | null>(null);

  if (!badges || badges.length === 0) {
    return null;
  }

  const getBadgeColor = (color: string) => {
    switch (color) {
      case 'gold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'green':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'blue':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'yellow':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'purple':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'teal':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Trust Badges
        </h3>
      )}
      
      <div className="flex flex-wrap gap-2">
        {badges.map((badge) => {
          const badgeInfo = getBadgeInfo(badge.badge_type);
          const colorClasses = getBadgeColor(badgeInfo.color);
          
          return (
            <div
              key={badge.id}
              className={`relative inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClasses} transition-all duration-200 hover:scale-105 cursor-help`}
              onMouseEnter={() => setHoveredBadge(badge.id)}
              onMouseLeave={() => setHoveredBadge(null)}
            >
              <span className="mr-1">{badgeInfo.icon}</span>
              <span>{badgeInfo.name}</span>
              
              {/* Tooltip */}
              {hoveredBadge === badge.id && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                  <div className="font-medium mb-1">{badgeInfo.name}</div>
                  <div className="text-gray-300">{badgeInfo.description}</div>
                  <div className="text-gray-400 text-xs mt-1">
                    Awarded {new Date(badge.awarded_at).toLocaleDateString()}
                  </div>
                  {/* Arrow */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {showDetails && badges.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          No trust badges yet. Complete transactions to earn badges!
        </p>
      )}
    </div>
  );
} 