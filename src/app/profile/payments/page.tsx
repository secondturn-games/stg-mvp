'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CreditCard, DollarSign, Settings } from 'lucide-react';

export default function PaymentsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Settings</h1>
            <p className="text-gray-600">Manage your payment methods and account</p>
          </div>

          {/* Disabled Message */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertTriangle className="h-16 w-16 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Payment System Temporarily Disabled
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We&apos;re currently working on improving our payment system to provide you with 
              a better experience. Payment features will be available soon.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <CreditCard className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-900">Payment Methods</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <DollarSign className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-900">Payout Settings</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
              
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <Settings className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-900">Account Settings</h3>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 