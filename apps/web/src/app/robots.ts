import type { MetadataRoute } from 'next';

/**
 * Crawl policy.
 *
 * The marketing site is public and should be indexed. Everything behind a
 * sign-in is excluded — not as a security control, which it is not, but because
 * a crawler has no business queueing requests against an authenticated surface.
 */

const SITE_URL = process.env['NEXT_PUBLIC_SITE_URL'] ?? 'https://tax.ghimtech.org';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app/', '/portal/', '/sign-in'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
