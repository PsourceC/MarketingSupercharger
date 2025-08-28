/** @type {import('next').NextConfig} */
const nextConfig = {
  // Essential server-only package configuration
  experimental: {
    serverComponentsExternalPackages: ['pg', 'googleapis'],
  },
  
  // Basic webpack config for server/client separation
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
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
}

module.exports = nextConfig
