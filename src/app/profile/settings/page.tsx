import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { ArrowLeft, User, Shield, Bell, Globe } from 'lucide-react';

export default async function SettingsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single();

  if (profileError) {
    return (
      <div className='text-center py-12'>
        <div className='text-6xl mb-4'>⚠️</div>
        <h3 className='text-lg font-semibold text-gray-900 mb-2'>
          Error Loading Profile
        </h3>
        <p className='text-gray-600'>Please try refreshing the page.</p>
      </div>
    );
  }

  if (!profile) {
    redirect('/profile/setup');
  }

  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <div className='space-y-6'>
        {/* Header */}
        <div className='flex items-center space-x-4'>
          <Link
            href='/profile'
            className='flex items-center text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to Profile
          </Link>
          <h1 className='text-3xl font-bold text-gray-900'>Settings</h1>
        </div>

        {/* Settings Sections */}
        <div className='space-y-6'>
          {/* Profile Settings */}
          <div className='bg-white rounded-lg shadow-md'>
            <div className='p-6 border-b'>
              <div className='flex items-center space-x-3'>
                <User className='h-5 w-5 text-blue-600' />
                <h2 className='text-xl font-semibold'>Profile Settings</h2>
              </div>
            </div>
            <div className='p-6 space-y-4'>
              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Username</h3>
                  <p className='text-sm text-gray-500'>
                    Your display name on the platform
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-gray-900'>
                    {profile.username}
                  </p>
                  <Link
                    href='/profile/edit'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Edit
                  </Link>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Email</h3>
                  <p className='text-sm text-gray-500'>Your email address</p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-gray-900'>
                    {profile.email || 'Not set'}
                  </p>
                  <Link
                    href='/profile/edit'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Edit
                  </Link>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Location</h3>
                  <p className='text-sm text-gray-500'>
                    Your city for shipping calculations
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-gray-900'>
                    {profile.location_city || 'Not set'}
                  </p>
                  <Link
                    href='/profile/edit'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Security */}
          <div className='bg-white rounded-lg shadow-md'>
            <div className='p-6 border-b'>
              <div className='flex items-center space-x-3'>
                <Shield className='h-5 w-5 text-green-600' />
                <h2 className='text-xl font-semibold'>Privacy & Security</h2>
              </div>
            </div>
            <div className='p-6 space-y-4'>
              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Account Security
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Manage your password and security settings
                  </p>
                </div>
                <div className='text-right'>
                  <Link
                    href='/profile/security'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Manage
                  </Link>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Data Privacy</h3>
                  <p className='text-sm text-gray-500'>
                    Control your data and privacy settings
                  </p>
                </div>
                <div className='text-right'>
                  <Link
                    href='/profile/privacy'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Manage
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className='bg-white rounded-lg shadow-md'>
            <div className='p-6 border-b'>
              <div className='flex items-center space-x-3'>
                <Bell className='h-5 w-5 text-yellow-600' />
                <h2 className='text-xl font-semibold'>Notifications</h2>
              </div>
            </div>
            <div className='p-6 space-y-4'>
              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>
                    Email Notifications
                  </h3>
                  <p className='text-sm text-gray-500'>
                    Receive updates about your listings and purchases
                  </p>
                </div>
                <div className='text-right'>
                  <Link
                    href='/profile/notifications'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Configure
                  </Link>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Auction Alerts</h3>
                  <p className='text-sm text-gray-500'>
                    Get notified about auction activity
                  </p>
                </div>
                <div className='text-right'>
                  <Link
                    href='/profile/notifications'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Configure
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className='bg-white rounded-lg shadow-md'>
            <div className='p-6 border-b'>
              <div className='flex items-center space-x-3'>
                <Globe className='h-5 w-5 text-purple-600' />
                <h2 className='text-xl font-semibold'>Regional Settings</h2>
              </div>
            </div>
            <div className='p-6 space-y-4'>
              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Language</h3>
                  <p className='text-sm text-gray-500'>
                    Your preferred language
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-gray-900'>
                    {profile.preferred_language || 'English'}
                  </p>
                  <Link
                    href='/profile/regional'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Change
                  </Link>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Currency</h3>
                  <p className='text-sm text-gray-500'>
                    Display currency for prices
                  </p>
                </div>
                <div className='text-right'>
                  <p className='font-medium text-gray-900'>EUR (€)</p>
                  <Link
                    href='/profile/regional'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Change
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className='bg-white rounded-lg shadow-md'>
            <div className='p-6 border-b'>
              <h2 className='text-xl font-semibold'>Account Actions</h2>
            </div>
            <div className='p-6 space-y-4'>
              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-gray-900'>Export Data</h3>
                  <p className='text-sm text-gray-500'>
                    Download your data and listings
                  </p>
                </div>
                <div className='text-right'>
                  <Link
                    href='/profile/export'
                    className='text-sm text-blue-600 hover:text-blue-800'
                  >
                    Export
                  </Link>
                </div>
              </div>

              <div className='flex items-center justify-between py-3'>
                <div>
                  <h3 className='font-medium text-red-600'>Delete Account</h3>
                  <p className='text-sm text-gray-500'>
                    Permanently delete your account and data
                  </p>
                </div>
                <div className='text-right'>
                  <Link
                    href='/profile/delete'
                    className='text-sm text-red-600 hover:text-red-800'
                  >
                    Delete
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
