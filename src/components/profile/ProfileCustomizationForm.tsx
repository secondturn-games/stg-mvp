'use client';

import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Globe, Palette, Bell } from 'lucide-react';
import AvatarUpload from './AvatarUpload';
import SocialLinksEditor from './SocialLinksEditor';
import type { ProfileCustomization } from '@/lib/profile-customization-service';

interface ProfileCustomizationFormProps {
  initialData?: ProfileCustomization;
  onSave: (data: ProfileCustomization) => Promise<void>;
  isLoading?: boolean;
}

export default function ProfileCustomizationForm({
  initialData,
  onSave,
  isLoading = false,
}: ProfileCustomizationFormProps) {
  const [formData, setFormData] = useState<ProfileCustomization>({
    display_name: '',
    bio: '',
    avatar_url: '',
    cover_image_url: '',
    social_links: {},
    profile_visibility: 'public',
    show_email: false,
    show_location: true,
    show_activity: true,
    theme_preference: 'light',
    notification_preferences: {
      email_notifications: true,
      push_notifications: true,
      price_alerts: true,
      new_messages: true,
      review_notifications: true,
      badge_notifications: true,
    },
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleInputChange = (field: keyof ProfileCustomization, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNotificationChange = (key: string, value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [key]: value,
      },
    }));
  };

  const handleAvatarUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'avatar');

    const response = await fetch('/api/profile/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload avatar');
    }

    const data = await response.json();
    handleInputChange('avatar_url', data.imageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save profile customization:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <AvatarUpload
              currentAvatarUrl={formData.avatar_url}
              username={formData.display_name || 'User'}
              onUpload={handleAvatarUpload}
            />
          </div>

          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="display_name"
              value={formData.display_name || ''}
              onChange={(e) => handleInputChange('display_name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your display name"
            />
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6">
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            value={formData.bio || ''}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Tell us about yourself..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.bio?.length || 0}/500 characters
          </p>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <SocialLinksEditor
          socialLinks={formData.social_links}
          onChange={(links) => handleInputChange('social_links', links)}
        />
      </div>

      {/* Privacy Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Eye className="h-5 w-5 mr-2" />
          Privacy Settings
        </h2>

        <div className="space-y-4">
          {/* Profile Visibility */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Visibility
            </label>
            <select
              value={formData.profile_visibility}
              onChange={(e) => handleInputChange('profile_visibility', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="public">Public - Anyone can view my profile</option>
              <option value="friends">Friends - Only friends can view my profile</option>
              <option value="private">Private - Only I can view my profile</option>
            </select>
          </div>

          {/* Privacy Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Show Email</label>
                <p className="text-xs text-gray-500">Allow others to see your email address</p>
              </div>
              <input
                type="checkbox"
                checked={formData.show_email}
                onChange={(e) => handleInputChange('show_email', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Show Location</label>
                <p className="text-xs text-gray-500">Display your city/location on your profile</p>
              </div>
              <input
                type="checkbox"
                checked={formData.show_location}
                onChange={(e) => handleInputChange('show_location', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Show Activity</label>
                <p className="text-xs text-gray-500">Display your recent activity on your profile</p>
              </div>
              <input
                type="checkbox"
                checked={formData.show_activity}
                onChange={(e) => handleInputChange('show_activity', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Theme Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Palette className="h-5 w-5 mr-2" />
          Theme Preferences
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Theme
          </label>
          <select
            value={formData.theme_preference}
            onChange={(e) => handleInputChange('theme_preference', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
            <option value="auto">Auto (Follow System)</option>
          </select>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-6 flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notification Preferences
        </h2>

        <div className="space-y-3">
          {Object.entries(formData.notification_preferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700 capitalize">
                  {key.replace('_', ' ')}
                </label>
                <p className="text-xs text-gray-500">
                  Receive notifications for {key.replace('_', ' ')}
                </p>
              </div>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleNotificationChange(key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving || isLoading}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
        >
          {isSaving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
} 