/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for better Netlify compatibility
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  
  // Transpile server-only packages
  transpilePackages: [],
  
  // Configure webpack for better client/server separation
  webpack: (config, { isServer }) => {
    // Fix for server-only modules being bundled on client
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    
    // Handle leaflet CSS imports
    config.module.rules.push({
      test: /\.css$/,
      use: ['style-loader', 'css-loader'],
    })
    
    return config
  },
  
  // Image optimization
  images: {
    unoptimized: true, // Required for static export compatibility
  },
  
  // Environment variables configuration
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Redirect configuration
  async redirects() {
    return [
      // Add any custom redirects here if needed
    ]
  },
  
  // Headers configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ]
  },
  
  // Output configuration for Netlify
  output: 'standalone',
  
  // Optimize bundle size
  swcMinify: true,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Configure build behavior
  compress: true,
  
  // Handle trailing slashes
  trailingSlash: false,
  
  // Configure static optimization
  staticPageGenerationTimeout: 1000,
}

module.exports = nextConfig
