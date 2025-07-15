import { clerkClient } from '@clerk/nextjs/server';
import { auth } from '@clerk/nextjs/server';

export { auth, clerkClient };

// Clerk configuration for Baltic marketplace
export const clerkConfig = {
  // Multi-language support for Baltic region
  localization: {
    locale: 'en',
    locales: ['en', 'et', 'lv', 'lt'],
    defaultLocale: 'en',
  },
  // Appearance customization
  appearance: {
    variables: {
      colorPrimary: '#D95323', // Sun Ember
      colorSecondary: '#F2C94C', // Golden Beam
      colorBackground: '#E6EAD7', // Ivory Mist
      colorText: '#29432B', // Forest Deep
    },
  },
};

// Helper function to get current user
export async function getCurrentUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user;
  } catch (error) {
    return null;
  }
}

// Helper function to check if user is verified seller
export async function isVerifiedSeller(userId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    // Check for verified seller metadata
    return user.publicMetadata?.verifiedSeller === true;
  } catch (error) {
    return false;
  }
}

// Helper function to update user metadata
export async function updateUserMetadata(
  userId: string,
  metadata: Record<string, any>
) {
  try {
    const client = await clerkClient();
    await client.users.updateUser(userId, {
      publicMetadata: metadata,
    });
    return true;
  } catch (error) {
    return false;
  }
}
