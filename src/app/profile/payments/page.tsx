'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Banknote, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  ExternalLink,
  Loader2
} from 'lucide-react';

interface PaymentStatus {
  hasStripeAccount: boolean;
  paymentVerified: boolean;
  payoutEnabled: boolean;
}

export default function PaymentSettingsPage() {
  const router = useRouter();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPaymentStatus();
  }, []);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch('/api/payments/connect');
      if (response.ok) {
        const data = await response.json();
        setPaymentStatus(data);
      }
    } catch (error) {
      setError('Failed to load payment status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    setIsConnecting(true);
    setError('');

    try {
      const response = await fetch('/api/payments/connect', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to Stripe onboarding
        window.location.href = data.onboardingUrl;
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to connect Stripe account');
      }
    } catch (error) {
      setError('Failed to connect Stripe account');
    } finally {
      setIsConnecting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading payment settings...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Payment Settings
            </h1>
            <p className="text-gray-600">
              Set up your payment account to receive payouts from sales
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-800">{error}</span>
              </div>
            </div>
          )}

          {/* Payment Status Cards */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Stripe Account Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Stripe Account
                </h3>
              </div>
              <div className="flex items-center mb-2">
                {paymentStatus?.hasStripeAccount ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className="font-medium">
                  {paymentStatus?.hasStripeAccount ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {paymentStatus?.hasStripeAccount
                  ? 'Your Stripe account is connected and ready to receive payments.'
                  : 'Connect your Stripe account to start receiving payouts.'}
              </p>
            </div>

            {/* Payment Verification */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Shield className="h-6 w-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Payment Verification
                </h3>
              </div>
              <div className="flex items-center mb-2">
                {paymentStatus?.paymentVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className="font-medium">
                  {paymentStatus?.paymentVerified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {paymentStatus?.paymentVerified
                  ? 'Your account is verified and can accept payments.'
                  : 'Complete verification to accept payments from buyers.'}
              </p>
            </div>

            {/* Payout Status */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center mb-4">
                <Banknote className="h-6 w-6 text-purple-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Payout Status
                </h3>
              </div>
              <div className="flex items-center mb-2">
                {paymentStatus?.payoutEnabled ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />
                )}
                <span className="font-medium">
                  {paymentStatus?.payoutEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {paymentStatus?.payoutEnabled
                  ? 'Payouts are enabled and you can receive funds.'
                  : 'Set up payout methods to receive your earnings.'}
              </p>
            </div>
          </div>

          {/* Connect Stripe Section */}
          {!paymentStatus?.hasStripeAccount && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="text-center">
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Connect Your Stripe Account
                </h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Set up your Stripe account to start receiving payments from buyers. 
                  This process is secure and only takes a few minutes.
                </p>
                <button
                  onClick={handleConnectStripe}
                  disabled={isConnecting}
                  className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center mx-auto"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-5 w-5 mr-2" />
                      Connect Stripe Account
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Account Management */}
          {paymentStatus?.hasStripeAccount && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Manage Your Account
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Stripe Dashboard</h3>
                    <p className="text-sm text-gray-600">
                      Manage your account, view transactions, and update settings
                    </p>
                  </div>
                  <a
                    href="https://dashboard.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800"
                  >
                    Open Dashboard
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">Reconnect Account</h3>
                    <p className="text-sm text-gray-600">
                      Update your account information or complete verification
                    </p>
                  </div>
                  <button
                    onClick={handleConnectStripe}
                    disabled={isConnecting}
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    {isConnecting ? 'Connecting...' : 'Reconnect'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Information Section */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mb-3">
                  1
                </div>
                <h3 className="font-medium text-blue-900 mb-2">Connect Account</h3>
                <p className="text-blue-700 text-sm">
                  Link your Stripe account to start accepting payments securely.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mb-3">
                  2
                </div>
                <h3 className="font-medium text-blue-900 mb-2">Complete Verification</h3>
                <p className="text-blue-700 text-sm">
                  Verify your identity and business information with Stripe.
                </p>
              </div>
              <div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mb-3">
                  3
                </div>
                <h3 className="font-medium text-blue-900 mb-2">Receive Payouts</h3>
                <p className="text-blue-700 text-sm">
                  Get paid automatically when buyers complete their purchases.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 