/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  // Essential server-only package configuration
  experimental: {
    serverComponentsExternalPackages: ['pg', 'googleapis'],
    // Note: serverActions is now enabled by default in Next.js 14+
    typedRoutes: false,
  },

  // Basic webpack config for server/client separation
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }

    // Don't override devtool in development to avoid performance issues
    // Next.js will use the optimal devtool setting

    return config
  },

  // Image optimization for Netlify
  images: {
    unoptimized: true,
  },

  // Build optimization
  swcMinify: true,
  poweredByHeader: false,
  compress: true,
  trailingSlash: false,

  // Development server configuration for better stability
  onDemandEntries: {
    // period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

  // Server configuration
  async rewrites() {
    return []
  },

  // Output configuration for deployment
  output: 'standalone',

  // Configure allowed dev origins for better CORS handling
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: [
      'localhost:3000',
      '127.0.0.1:3000',
      'da6999115c974d4388527cf50744332c-ac274784-e668-43de-930e-0ef765.fly.dev',
    ],
  }),

  // Headers to improve fetch stability
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ]
  },
}

module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: 'astrawatt-solar',
  project: 'solar-dashboard',
  widenClientFileUpload: true,
  // Only enable webpack plugins when auth token is present to avoid build failures
  disableServerWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
  disableClientWebpackPlugin: !process.env.SENTRY_AUTH_TOKEN,
})
