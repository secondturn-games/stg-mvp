'use client';

import { useState } from 'react';
import type { UserProfile } from '@/lib/user-service';

interface ProfileFormProps {
  profile: UserProfile;
}

export default function ProfileForm({ profile }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: profile.username,
    country: profile.country,
    preferred_language: profile.preferred_language,
    vat_number: profile.vat_number || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
      } else {
        const error = await response.json();
        setMessage({
          type: 'error',
          text: error.message || 'Failed to update profile',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'An error occurred while updating your profile',
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

  return (
    <form onSubmit={handleSubmit} className='space-y-6'>
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

      <div className='grid gap-6 md:grid-cols-2'>
        <div>
          <label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Email
          </label>
          <input
            type='email'
            id='email'
            value={profile.email}
            disabled
            className='w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500'
          />
          <p className='text-xs text-gray-500 mt-1'>Email cannot be changed</p>
        </div>

        <div>
          <label
            htmlFor='username'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Username *
          </label>
          <input
            type='text'
            id='username'
            name='username'
            value={formData.username}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label
            htmlFor='country'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Country *
          </label>
          <select
            id='country'
            name='country'
            value={formData.country}
            onChange={handleChange}
            required
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='EE'>Estonia</option>
            <option value='LV'>Latvia</option>
            <option value='LT'>Lithuania</option>
          </select>
        </div>

        <div>
          <label
            htmlFor='preferred_language'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            Preferred Language
          </label>
          <select
            id='preferred_language'
            name='preferred_language'
            value={formData.preferred_language}
            onChange={handleChange}
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          >
            <option value='en'>English</option>
            <option value='et'>Eesti</option>
            <option value='lv'>Latviešu</option>
            <option value='lt'>Lietuvių</option>
          </select>
        </div>

        <div className='md:col-span-2'>
          <label
            htmlFor='vat_number'
            className='block text-sm font-medium text-gray-700 mb-2'
          >
            VAT Number (Optional)
          </label>
          <input
            type='text'
            id='vat_number'
            name='vat_number'
            value={formData.vat_number}
            onChange={handleChange}
            placeholder='EE123456789'
            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
          <p className='text-xs text-gray-500 mt-1'>
            Required for business sellers
          </p>
        </div>
      </div>

      <div className='flex justify-end'>
        <button
          type='submit'
          disabled={isLoading}
          className='bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
