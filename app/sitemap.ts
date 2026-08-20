import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://agriform.in',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://agriform.in/equipment',
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.8,
    },
    // Adding login/signup even though they are auth, they are public facing pages
    {
      url: 'https://agriform.in/login',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: 'https://agriform.in/signup',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
}
