'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import PaymentForm from '@/components/payments/PaymentForm';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface PaymentData {
  clientSecret: string;
  amount: number;
  currency: string;
  listingTitle: string;
  transactionId: string;
  fees: {
    grossAmount: number;
    feeAmount: number;
    netAmount: number;
  };
}

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.listingId as string;

  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const createPaymentIntent = async () => {
      try {
        // Get listing details first
        const listingResponse = await fetch(`/api/listings/${listingId}`);
        if (!listingResponse.ok) {
          throw new Error('Listing not found');
        }

        const listing = await listingResponse.json();
        const amount = listing.listing.price || 0;

        // Create payment intent
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            listingId,
            amount,
            currency: 'eur',
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create payment');
        }

        const data = await response.json();
        setPaymentData({
          clientSecret: data.clientSecret,
          amount: data.fees.grossAmount,
          currency: 'eur',
          listingTitle: listing.listing.games?.title?.en || 'Game',
          transactionId: data.transactionId,
          fees: data.fees,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      createPaymentIntent();
    }
  }, [listingId]);

  const handlePaymentSuccess = (transactionId: string) => {
    // Payment success handling
    console.log('Payment successful:', transactionId);
  };

  const handlePaymentError = (error: string) => {
    // Payment error handling
    console.error('Payment failed:', error);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Setting up your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Setup Failed
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href={`/listings/${listingId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listing
          </Link>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Not Available
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to set up payment for this listing.
          </p>
          <Link
            href={`/listings/${listingId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listing
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href={`/listings/${listingId}`}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Listing
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Secure Payment</h1>
        </div>

        {/* Payment Details */}
        <div className="max-w-lg mx-auto mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Payment Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Item:</span>
                <span className="font-medium">{paymentData.listingTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal:</span>
                <span>€{paymentData.fees.netAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (5%):</span>
                <span>€{paymentData.fees.feeAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>€{paymentData.fees.grossAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Form */}
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: paymentData.clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <PaymentForm
            clientSecret={paymentData.clientSecret}
            amount={paymentData.amount}
            currency={paymentData.currency}
            listingTitle={paymentData.listingTitle}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
          />
        </Elements>
      </div>
    </div>
  );
} 