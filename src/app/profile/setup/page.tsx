import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getCurrentUserProfile } from '@/lib/user-service';
import EnhancedProfileSetupForm from '@/components/profile/EnhancedProfileSetupForm';

export default async function ProfileSetupPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Check if user already has a profile
  const existingProfile = await getCurrentUserProfile();

  if (existingProfile) {
    redirect('/profile');
  }

  return (
    <div className='container mx-auto p-8 max-w-4xl'>
      <div className='mb-8 text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-2'>
          Complete Your Profile
        </h1>
        <p className='text-gray-600'>
          Welcome to Second Turn! Complete your profile to start buying and selling board games in the Baltic region.
        </p>
      </div>

      <EnhancedProfileSetupForm />

      <div className='mt-8 p-4 bg-ivory rounded-lg border border-gray-200'>
        <h3 className='text-lg font-semibold mb-2 text-forestDeep'>
          Why we need this information:
        </h3>
        <ul className='list-disc list-inside space-y-1 text-sm text-gray-600'>
          <li>
            Country: For shipping calculations and local marketplace features
          </li>
          <li>Language: To provide content in your preferred language</li>
          <li>Username: For community features and seller identification</li>
          <li>
            VAT Number: Required for business sellers (optional for individuals)
          </li>
        </ul>
      </div>
    </div>
  );
}
