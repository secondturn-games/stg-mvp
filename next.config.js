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
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://clerk.com https://*.clerk.accounts.dev; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://cloudflare.com https://images.unsplash.com; connect-src 'self' https://*.supabase.co https://clerk.com https://*.clerk.accounts.dev; frame-src https://clerk.com https://*.clerk.accounts.dev;",
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
