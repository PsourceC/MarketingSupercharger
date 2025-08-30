/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential server-only package configuration
  experimental: {
    serverComponentsExternalPackages: ['pg', 'googleapis'],
    // Improve hot reloading stability
    serverActions: true,
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

    // Development optimizations for better hot reloading
    if (dev) {
      config.devtool = 'eval-cheap-module-source-map'
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }

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

module.exports = nextConfig
