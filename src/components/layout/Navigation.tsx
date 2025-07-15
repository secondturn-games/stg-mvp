'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className='bg-white shadow-sm border-b'>
      <div className='container mx-auto px-4'>
        <div className='flex justify-between items-center h-16'>
          {/* Logo */}
          <Link href='/' className='flex items-center space-x-2'>
            <span className='text-2xl'>🎲</span>
            <span className='text-xl font-bold text-gray-900'>Second Turn</span>
          </Link>

          {/* Navigation Links */}
          <div className='hidden md:flex items-center space-x-8'>
            <Link
              href='/marketplace'
              className={`text-sm font-medium transition-colors ${
                isActive('/marketplace')
                  ? 'text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Marketplace
            </Link>

            {isSignedIn && (
              <>
                <Link
                  href='/listings/create'
                  className={`text-sm font-medium transition-colors ${
                    isActive('/listings/create')
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Create Listing
                </Link>
                <Link
                  href='/listings/my-listings'
                  className={`text-sm font-medium transition-colors ${
                    isActive('/listings/my-listings')
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My Listings
                </Link>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className='flex items-center space-x-4'>
            {isSignedIn ? (
              <div className='flex items-center space-x-4'>
                <Link
                  href='/profile'
                  className='text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors'
                >
                  Profile
                </Link>
                <div className='flex items-center space-x-2'>
                  <div className='w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center'>
                    <span className='text-sm font-medium text-blue-600'>
                      {user?.firstName?.charAt(0) ||
                        user?.emailAddresses[0]?.emailAddress.charAt(0) ||
                        '?'}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href='/sign-in'
                className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
