/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cloudflare.com', 'images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  i18n: {
    locales: ['en', 'et', 'lv', 'lt'],
    defaultLocale: 'en',
    localeDetection: false,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 