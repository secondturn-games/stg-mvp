'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, MapPin, Globe, Building2, Shield, CreditCard } from 'lucide-react';
import ProfileCompletionMeter from '@/components/ui/ProfileCompletionMeter';
import ProgressiveDisclosure from '@/components/ui/ProgressiveDisclosure';
import { calculateProfileCompletion, getNextProfileAction } from '@/lib/profile-completion';

interface FormData {
  username: string;
  country: 'EE' | 'LV' | 'LT';
  preferred_language: 'en' | 'et' | 'lv' | 'lt';
  vat_number: string;
}

export default function EnhancedProfileSetupForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    username: '',
    country: 'EE',
    preferred_language: 'en',
    vat_number: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const completion = calculateProfileCompletion(formData);
  const nextAction = getNextProfileAction(completion.pendingItems);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile created successfully!' });
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || 'Failed to create profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while creating your profile',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const canSubmit = formData.username.trim() && formData.country && formData.preferred_language;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Profile Completion Meter */}
      <ProfileCompletionMeter 
        completion={completion} 
        showDetails={true}
        className="mb-6"
      />

      {/* Next Action Hint */}
      {nextAction && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">!</span>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-blue-900">Next Step</h4>
              <p className="text-sm text-blue-700 mt-1">
                {nextAction.description}
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <User className="w-5 h-5 text-forestDeep" />
            <h3 className="font-semibold text-gray-900">Basic Information</h3>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forestDeep focus:border-forestDeep"
                placeholder="Choose a unique username"
              />
            </div>

            <div>
              <label
                htmlFor="preferred_language"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Globe className="w-4 h-4 inline mr-1" />
                Preferred Language *
              </label>
              <select
                id="preferred_language"
                name="preferred_language"
                value={formData.preferred_language}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forestDeep focus:border-forestDeep"
              >
                <option value="en">English</option>
                <option value="et">Eesti</option>
                <option value="lv">Latviešu</option>
                <option value="lt">Lietuvių</option>
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="w-5 h-5 text-forestDeep" />
            <h3 className="font-semibold text-gray-900">Location</h3>
          </div>
          
          <div>
            <label
              htmlFor="country"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Country *
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forestDeep focus:border-forestDeep"
            >
              <option value="EE">🇪🇪 Estonia</option>
              <option value="LV">🇱🇻 Latvia</option>
              <option value="LT">🇱🇹 Lithuania</option>
            </select>
          </div>
        </div>

        {/* Advanced Settings - Progressive Disclosure */}
        <ProgressiveDisclosure
          title="Business Settings"
          description="Optional settings for business sellers"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="vat_number"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                <Building2 className="w-4 h-4 inline mr-1" />
                VAT Number (Optional)
              </label>
              <input
                type="text"
                id="vat_number"
                name="vat_number"
                value={formData.vat_number}
                onChange={handleChange}
                placeholder="EE123456789"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forestDeep focus:border-forestDeep"
              />
              <p className="text-sm text-gray-500 mt-1">
                Required for business selling and VAT compliance
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">
                <Shield className="w-4 h-4 inline mr-1" />
                Additional Verification Options
              </h4>
              <p className="text-sm text-blue-700 mb-3">
                Complete these after profile creation to increase buyer trust:
              </p>
              <ul className="space-y-1 text-sm text-blue-700">
                <li className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Bank account verification</span>
                </li>
                <li className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Seller verification process</span>
                </li>
              </ul>
            </div>
          </div>
        </ProgressiveDisclosure>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !canSubmit}
            className="bg-forestDeep text-white px-6 py-3 rounded-lg hover:bg-forestDeep/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isLoading ? 'Creating Profile...' : 'Create Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}