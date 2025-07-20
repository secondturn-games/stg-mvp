'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function PaymentPage() {
  const params = useParams();
  const listingId = params.listingId as string;
  const router = useRouter();
  
  const [listing, setListing] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await fetch(`/api/listings/${listingId}`);
        if (response.ok) {
          const data = await response.json();
          setListing(data.listing);
        }
      } catch (error) {
        console.error('Error fetching listing:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId]);

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
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href={`/listings/${listingId}`}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Listing
            </Link>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Payment System Disabled
              </h1>
              <p className="text-gray-600">
                The payment system is currently disabled. Please check back later.
              </p>
            </div>
          </div>

          {/* Disabled Message */}
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Payment Temporarily Unavailable
            </h2>
            <p className="text-gray-600 mb-6">
              We're currently working on improving our payment system. 
              Please check back later to complete your purchase.
            </p>
            
            <div className="space-y-4">
              <Link
                href={`/listings/${listingId}`}
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Return to Listing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 