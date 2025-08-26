/** @type {import('next').NextConfig} */
const nextConfig = {
  // Improve development server stability
  webpack: (config, { dev, isServer }) => {
    if (dev && isServer) {
      // Better file watching in development
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      }
    }
    return config
  },
}

module.exports = nextConfig
