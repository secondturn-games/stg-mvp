import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getProfileCustomization } from '@/lib/profile-customization-service';
import { supabase } from '@/lib/supabase';
import ProfileCustomizationForm from '@/components/profile/ProfileCustomizationForm';
import type { ProfileCustomization } from '@/lib/profile-customization-service';

export default async function ProfileCustomizationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('clerk_id', userId)
    .single();

  if (!profile) {
    redirect('/profile/setup');
  }

  // Get current customization data
  const customization = await getProfileCustomization(profile.id);

  const handleSave = async (data: ProfileCustomization) => {
    'use server';
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/profile/customization`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to save profile customization');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Customize Your Profile</h1>
          <p className="text-gray-600 mt-2">
            Make your profile unique with custom avatars, bios, social links, and privacy settings.
          </p>
        </div>

        {/* Customization Form */}
        <ProfileCustomizationForm
          initialData={customization || undefined}
          onSave={handleSave}
        />
      </div>
    </div>
  );
} 