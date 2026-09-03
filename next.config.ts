import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const cspValue = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.unsplash.com https://zgykctyindlmnfyqrood.supabase.co",
  "font-src 'self' data:",
  `connect-src 'self' https://zgykctyindlmnfyqrood.supabase.co wss://zgykctyindlmnfyqrood.supabase.co ${!isProd ? 'ws://localhost:* http://localhost:* ws://127.0.0.1:* http://127.0.0.1:*' : ''}`,
  "frame-ancestors 'none'",
  ...(isProd ? ['upgrade-insecure-requests'] : [])
].filter(Boolean).join('; ') + ';';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'zgykctyindlmnfyqrood.supabase.co',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspValue,
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
        ],
      },
    ];
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
