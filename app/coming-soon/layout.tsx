import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Second Turn - Coming Soon | Used Board Games Marketplace in the Baltics',
  description: 'A community marketplace for used board games in the Baltics is coming soon. Sign up to be notified when we launch and give your games a second life.',
  keywords: 'board games, used board games, marketplace, Baltics, Latvia, Estonia, Lithuania, gaming community',
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
    title: 'Second Turn - Coming Soon',
    description: 'A community marketplace for used board games in the Baltics is coming soon.',
    url: 'https://secondturn.games',
    siteName: 'Second Turn',
    images: [
      {
        url: '/logo-light.png',
        width: 1200,
        height: 630,
        alt: 'Second Turn Games Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Second Turn - Coming Soon',
    description: 'A community marketplace for used board games in the Baltics is coming soon.',
    images: ['/logo-light.png'],
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
}

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 