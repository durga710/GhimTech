import type { MetadataRoute } from 'next';
import { PRIMARY_NAV_FLAT } from '@/lib/navigation';

/**
 * The public sitemap.
 *
 * It is generated from the same navigation declaration the header and footer
 * read, so a marketing page cannot exist in the menu and be missing from the
 * sitemap. Authenticated routes are deliberately absent — they are excluded in
 * `robots.ts` and there is nothing there for a crawler.
 */

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://tax.ghimtech.org';

const LEGAL_ROUTES: readonly string[] = ['/privacy', '/terms'];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const navigationRoutes = PRIMARY_NAV_FLAT.map((link) => link.href);
  const routes = ['/', ...navigationRoutes, ...LEGAL_ROUTES];

  return routes.map((route) => ({
    url: `${SITE_URL}${route === '/' ? '' : route}`,
    lastModified,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : route === '/product' || route === '/how-it-works' ? 0.8 : 0.6,
  }));
}
