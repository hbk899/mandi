/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Internationalization — Urdu is the primary locale
  i18n: {
    locales: ['ur', 'en'],
    defaultLocale: 'ur',
    localeDetection: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Transpile monorepo packages
  transpilePackages: ['@mandi/ui', '@mandi/config', '@mandi/validators'],
}

module.exports = nextConfig
