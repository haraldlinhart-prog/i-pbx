import { MetadataRoute } from 'next'

const BASE_URL = 'https://i-pbx.eu'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE_URL}`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 1.0 },
    { url: `${BASE_URL}/order`, lastModified: new Date(), changeFrequency: 'monthly' as const, priority: 0.7 },
  ]
}
