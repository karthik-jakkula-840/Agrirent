import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/admin/',
        '/owner/',
        '/api/',
        '/profile/',
        '/bookings/',
        '/favorites/'
      ],
    },
    sitemap: 'https://agriform.in/sitemap.xml',
  }
}
