import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://studio.bizchefs.com',
      lastModified: new Date('2026-10-30T00:00:00.000Z'),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ];
}
