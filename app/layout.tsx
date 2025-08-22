import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'

import { Navigation } from '@/components/navigation'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'


// Font loaders must be called and assigned to constants in the module scope
const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

export const metadata: Metadata = {
  title: 'Second Turn - Board Game Marketplace',
  description: 'Buy and sell board games in the Baltic region',
  generator: 'Second Turn Games',
  applicationName: 'Second Turn',
  referrer: 'origin-when-cross-origin',
  keywords: ['board games', 'marketplace', 'buy', 'sell', 'trading', 'Baltic', 'games'],
  authors: [{ name: 'Second Turn Games' }],
  creator: 'Second Turn Games',
  publisher: 'Second Turn Games',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://secondturn.games'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Second Turn - Board Game Marketplace',
    description: 'Buy and sell board games in the Baltic region',
    url: 'https://secondturn.games',
    siteName: 'Second Turn',
    locale: 'en_US',
    type: 'website',
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
  icons: {
    icon: [
      { url: '/favicon-16x16-light.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32-light.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon-light.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { url: '/favicon-light.ico', sizes: 'any' },
    ],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Second Turn',
  },
  verification: {
    google: 'google-site-verification-token', // You'll need to add your actual token
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <Navigation />
          <main className="min-h-screen">
            {children}
          </main>
        </AuthProvider>
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
