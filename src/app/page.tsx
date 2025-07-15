import React from 'react';
import Navigation from '@/components/layout/Navigation';
import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <Navigation />
      <main className='min-h-screen bg-ivory'>
        <div className='container-mobile md:container-tablet lg:container-desktop py-8'>
          <div className='text-center space-y-6'>
            <h1 className='text-4xl md:text-6xl font-bold text-forestDeep'>
              Second Turn
            </h1>
            <p className='text-xl md:text-2xl text-forestDeep/80'>
              Baltic Boardgame Marketplace
            </p>
            <p className='text-lg text-forestDeep/70 max-w-2xl mx-auto'>
              A trust-first, peer-to-peer marketplace for buying, selling, and
              trading used board games in Estonia, Latvia, and Lithuania.
            </p>

            <div className='flex flex-col sm:flex-row gap-4 justify-center mt-8'>
              <Link href='/listings/create' className='btn-primary'>
                Start Selling
              </Link>
              <Link href='/marketplace' className='btn-secondary'>
                Browse Games
              </Link>
            </div>

            <div className='mt-12 grid grid-cols-1 md:grid-cols-3 gap-6'>
              <div className='card p-6'>
                <h3 className='text-xl font-semibold text-forestDeep mb-2'>
                  Trust First
                </h3>
                <p className='text-forestDeep/70'>
                  Verified sellers and escrow protection for safe transactions.
                </p>
              </div>

              <div className='card p-6'>
                <h3 className='text-xl font-semibold text-forestDeep mb-2'>
                  Baltic Focused
                </h3>
                <p className='text-forestDeep/70'>
                  Local shipping, payment methods, and language support.
                </p>
              </div>

              <div className='card p-6'>
                <h3 className='text-xl font-semibold text-forestDeep mb-2'>
                  Mobile First
                </h3>
                <p className='text-forestDeep/70'>
                  Optimized for mobile devices with PWA capabilities.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
