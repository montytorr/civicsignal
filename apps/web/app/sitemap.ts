import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://civicsignal.org'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL, lastModified: new Date() },
    { url: `${BASE_URL}/polls`, lastModified: new Date() },
    { url: `${BASE_URL}/methodology`, lastModified: new Date() },
    { url: `${BASE_URL}/roadmap`, lastModified: new Date() },
    { url: `${BASE_URL}/archive`, lastModified: new Date() },
    { url: `${BASE_URL}/leaderboard`, lastModified: new Date() },
    { url: `${BASE_URL}/verify`, lastModified: new Date() },
  ]
}
