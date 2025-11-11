import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Exclude large dependencies from serverless functions to reduce bundle size
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@genkit-ai/**',
      'node_modules/genkit/**',
      'node_modules/genkit-cli/**',
      'node_modules/firebase/**',
      'node_modules/@firebase/**',
      'node_modules/prisma/libquery_engine*',
      'node_modules/prisma/query_engine*',
      'node_modules/@prisma/engines/**',
    ],
  },
  // Keep Prisma external to reduce function size
  serverExternalPackages: ['prisma', '@prisma/client'],
};

export default nextConfig;
