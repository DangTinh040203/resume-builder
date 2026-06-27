import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@resume-builder/ui'],
  serverExternalPackages: ['@react-pdf/renderer', '@rawwee/react-pdf-html'],

  experimental: {
    // Optimize package imports - tree shake heavy libraries
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@clerk/nextjs',
      'react-hook-form',
      '@hookform/resolvers',
      '@reduxjs/toolkit',
      'react-redux',
      'zod',
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression & performance
  compress: true,

  // Headers for caching.
  // Note: `/_next/static/*` is cached by Next.js automatically (immutable in
  // production); adding a custom Cache-Control there breaks dev/HMR, so we only
  // set headers for our own static assets.
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default withNextIntl(nextConfig);
