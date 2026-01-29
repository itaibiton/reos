import type { MetadataRoute } from 'next';

const BASE_URL = 'https://reos.co';

const PROVIDER_TYPES = [
  'broker',
  'lawyer',
  'appraiser',
  'mortgage-advisor',
  'entrepreneur',
  'asset-manager',
  'financial-advisor',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority: number;
  }[] = [
    { path: '', changeFrequency: 'monthly', priority: 1.0 },
    { path: '/pricing', changeFrequency: 'monthly', priority: 0.9 },
    { path: '/services', changeFrequency: 'weekly', priority: 0.8 },
    { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.5 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.5 },
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPages.map((page) => ({
    url: `${BASE_URL}/en${page.path}`,
    lastModified: new Date(),
    changeFrequency: page.changeFrequency,
    priority: page.priority,
    alternates: {
      languages: {
        en: `${BASE_URL}/en${page.path}`,
        he: `${BASE_URL}/he${page.path}`,
      },
    },
  }));

  const providerEntries: MetadataRoute.Sitemap = PROVIDER_TYPES.map((type) => ({
    url: `${BASE_URL}/en/services/${type}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        en: `${BASE_URL}/en/services/${type}`,
        he: `${BASE_URL}/he/services/${type}`,
      },
    },
  }));

  return [...staticEntries, ...providerEntries];
}
