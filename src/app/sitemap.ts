import { MetadataRoute } from 'next';
import { getProducts } from '@/lib/store';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vikabouquets.com';

  // Get all products to create dynamic URLs
  const products = getProducts();
  const productUrls = products.map((product) => ({
    url: `${baseUrl}/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Main pages
  const routes = [
    '',
    '/products',
    '/customize',
    '/about',
    '/contact',
    '/products?category=bouquets',
    '/products?category=hampers',
    '/products?category=vvtrends',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...routes, ...productUrls];
}
