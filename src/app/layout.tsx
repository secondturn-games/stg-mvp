import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import './globals.css';
import SkipToContent from '@/components/ui/SkipToContent';
import ToastProvider from '@/components/ui/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Second Turn - Baltic Boardgame Marketplace',
  description:
    'A trust-first, peer-to-peer marketplace for buying, selling, and trading used board games in Estonia, Latvia, and Lithuania.',
  keywords: [
    'boardgames',
    'marketplace',
    'baltic',
    'estonia',
    'latvia',
    'lithuania',
    'trading',
  ],
  authors: [{ name: 'Aigars Grēniņš' }],
  creator: 'Second Turn Games',
  publisher: 'Second Turn Games',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://secondturn.games'),
  openGraph: {
    title: 'Second Turn - Baltic Boardgame Marketplace',
    description: 'Buy, sell, and trade board games in the Baltic region',
    url: 'https://secondturn.games',
    siteName: 'Second Turn',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Second Turn - Baltic Boardgame Marketplace',
    description: 'Buy, sell, and trade board games in the Baltic region',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang='en' suppressHydrationWarning>
        <head>
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link
            rel='preconnect'
            href='https://fonts.gstatic.com'
            crossOrigin='anonymous'
          />
          <link
            href='https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500;600&display=swap'
            rel='stylesheet'
          />
        </head>
        <body className={inter.className}>
          <SkipToContent />
          <ToastProvider>
            <div className='min-h-screen bg-background' id='main-content'>
              {children}
            </div>
          </ToastProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
