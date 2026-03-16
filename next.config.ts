
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
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
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'agv-api.mercubuana.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'osccdn.medcom.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'asset-2.tribunnews.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.nsd.co.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'b856188.smushcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'riberasolutions.com.au',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.unpad.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'unpam.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'bsi.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'binus.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.trisakti.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.its.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'telkomuniversity.ac.id',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mercubuana.ac.id',
        port: '',
        pathname: '/**',
      }
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          }
        ],
      },
    ];
  },
};

export default nextConfig;
