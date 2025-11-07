/** @type {import('next').NextConfig} */
const nextConfig = {
  // Air-gapped environment configuration
  // All assets must be self-contained
  output: 'standalone',
  
  // Disable external image optimization
  images: {
    unoptimized: true,
  },
  
  // Disable telemetry for air-gapped env
  reactStrictMode: true,
}

module.exports = nextConfig
