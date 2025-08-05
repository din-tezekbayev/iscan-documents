/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
  // Railway deployment optimization
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: []
  }
}

module.exports = nextConfig