import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { AuthProvider } from '@/lib/auth-context'
import { Toaster } from 'sonner'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'Second Turn - Board Game Marketplace',
  description: 'Buy and sell board games in the Baltic region',
  generator: 'Second Turn Games',
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
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
