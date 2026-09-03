import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'AgriRent - Smart Agricultural Equipment Rental',
    short_name: 'AgriRent',
    description: 'Rent agricultural equipment from verified owners near you.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F9FBF7',
    theme_color: '#16A34A',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
