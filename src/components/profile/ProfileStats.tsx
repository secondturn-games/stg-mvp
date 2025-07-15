'use client'

import { formatCurrency, getUserLocale } from '@/lib/regional-settings'

interface ProfileStatsProps {
  listingsCount: number
  purchasesCount: number
  totalSpent: number
}

export default function ProfileStats({ listingsCount, purchasesCount, totalSpent }: ProfileStatsProps) {
  const locale = getUserLocale()

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-3xl font-bold text-blue-600 mb-2">{listingsCount}</div>
        <div className="text-sm text-gray-600">Active Listings</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-3xl font-bold text-green-600 mb-2">{purchasesCount}</div>
        <div className="text-sm text-gray-600">Purchases Made</div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <div className="text-3xl font-bold text-purple-600 mb-2">
          {formatCurrency(totalSpent, locale)}
        </div>
        <div className="text-sm text-gray-600">Total Spent</div>
      </div>
    </div>
  )
} 