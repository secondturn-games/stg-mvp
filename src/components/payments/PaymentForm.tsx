'use client';

import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  currency: string;
  listingTitle: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export default function PaymentForm({
  clientSecret,
  amount,
  currency,
  listingTitle,
  onSuccess,
  onError,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('error');
        setErrorMessage(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('success');
        onSuccess?.(paymentIntent.id);
        
        // Redirect to success page after a short delay
        setTimeout(() => {
          router.push(`/payment/success?transaction=${paymentIntent.id}`);
        }, 2000);
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('An unexpected error occurred');
      onError?.('An unexpected error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Payment Summary */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Complete Your Purchase
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">{listingTitle}</span>
              <span className="font-medium">{formatAmount(amount, currency)}</span>
            </div>
            <div className="text-sm text-gray-500">
              Secure payment powered by Stripe
            </div>
          </div>
        </div>

        {/* Payment Status */}
        {paymentStatus === 'success' && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-800">Payment successful!</span>
            </div>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-800">{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit}>
          <PaymentElement />
          
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay ${formatAmount(amount, currency)}`
            )}
          </button>
        </form>

        {/* Security Notice */}
        <div className="mt-4 text-xs text-gray-500 text-center">
          Your payment information is encrypted and secure. We never store your card details.
        </div>
      </div>
    </div>
  );
} 