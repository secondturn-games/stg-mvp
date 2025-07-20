'use client';

import { Shield, CheckCircle, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import type { ProfileStrengthResult } from '@/lib/profile-strength';
import { getProfileStrengthColor, getProfileStrengthBgColor } from '@/lib/profile-strength';

interface ProfileStrengthIndicatorProps {
  strength: ProfileStrengthResult;
  showDetails?: boolean;
  className?: string;
}

export default function ProfileStrengthIndicator({
  strength,
  showDetails = false,
  className = '',
}: ProfileStrengthIndicatorProps) {
  const strengthColor = getProfileStrengthColor(strength.level);
  const strengthBgColor = getProfileStrengthBgColor(strength.level);

  const levelText = {
    weak: 'Weak Profile',
    basic: 'Basic Profile',
    good: 'Good Profile',
    strong: 'Strong Profile',
    excellent: 'Excellent Profile',
  };

  const getProgressColor = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'bg-gradient-to-r from-forestDeep to-goldenBeam';
      case 'strong':
        return 'bg-gradient-to-r from-forestDeep to-sunEmber';
      case 'good':
        return 'bg-gradient-to-r from-sunEmber to-goldenBeam';
      case 'basic':
        return 'bg-gradient-to-r from-sunEmber/70 to-goldenBeam/70';
      case 'weak':
        return 'bg-gradient-to-r from-gray-400 to-sunEmber/50';
      default:
        return 'bg-gradient-to-r from-forestDeep to-sunEmber';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-forestDeep" />
            <h3 className="font-semibold text-forestDeep">Profile Strength</h3>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium border ${strengthBgColor} ${strengthColor}`}>
            {levelText[strength.level]}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-forestDeep">{strength.percentage}%</div>
          <div className="text-sm text-gray-600">
            {strength.score}/{strength.maxScore} points
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-ivory rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(strength.level)}`}
            style={{ width: `${strength.percentage}%` }}
          />
        </div>
      </div>

      {/* Trust Score */}
      <div className="flex items-center justify-between mb-4 p-3 bg-ivory rounded-lg">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-forestDeep" />
          <span className="text-sm font-medium text-forestDeep">Trust Score</span>
        </div>
        <div className="text-sm font-semibold text-sunEmber">
          {strength.trustScore}%
        </div>
      </div>

      {/* Recommendations */}
      {strength.recommendations.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-forestDeep mb-2">Recommendations</h4>
          <div className="space-y-2">
            {strength.recommendations.map((recommendation, index) => (
              <div key={`recommendation-${index}`} className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-sunEmber mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showDetails && (
        <div className="space-y-4">
          {/* Achieved Factors */}
          {strength.achievedFactors.length > 0 && (
            <div>
              <h4 className="font-medium text-forestDeep mb-3">
                Completed ({strength.achievedFactors.length})
              </h4>
              <div className="grid gap-2">
                {strength.achievedFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center space-x-3 p-2 bg-ivory rounded-lg"
                  >
                    <CheckCircle className="w-4 h-4 text-forestDeep" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-forestDeep">
                          {factor.name}
                        </span>
                        <span className="text-xs text-sunEmber">
                          +{factor.weight}pts
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{factor.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Missing Factors */}
          {strength.missingFactors.length > 0 && (
            <div>
              <h4 className="font-medium text-forestDeep mb-3">
                Opportunities ({strength.missingFactors.length})
              </h4>
              <div className="grid gap-2">
                {strength.missingFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-sunEmber" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-forestDeep">
                          {factor.name}
                        </span>
                        <span className="text-xs text-sunEmber">
                          +{factor.weight}pts
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">{factor.description}</p>
                    </div>
                    {factor.actionUrl && factor.actionText && (
                      <Link
                        href={factor.actionUrl}
                        className="flex items-center space-x-1 text-xs text-sunEmber hover:text-sunEmber/80"
                      >
                        <span>{factor.actionText}</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}