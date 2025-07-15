'use client'

import Link from 'next/link'
import { Plus, Settings, ShoppingBag, Heart } from 'lucide-react'

export default function ProfileActions() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link 
          href="/listings/create"
          className="flex flex-col items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="h-6 w-6 text-blue-600 mb-2" />
          <span className="text-sm font-medium text-blue-600">Create Listing</span>
        </Link>
        
        <Link 
          href="/profile/my-listings"
          className="flex flex-col items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <ShoppingBag className="h-6 w-6 text-green-600 mb-2" />
          <span className="text-sm font-medium text-green-600">My Listings</span>
        </Link>
        
        <Link 
          href="/profile/my-purchases"
          className="flex flex-col items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <Heart className="h-6 w-6 text-purple-600 mb-2" />
          <span className="text-sm font-medium text-purple-600">My Purchases</span>
        </Link>
        
        <Link 
          href="/profile/settings"
          className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="h-6 w-6 text-gray-600 mb-2" />
          <span className="text-sm font-medium text-gray-600">Settings</span>
        </Link>
      </div>
    </div>
  )
} 