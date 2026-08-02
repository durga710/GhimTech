import type { Metadata } from 'next';
import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/surface';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { PRIMARY_NAV } from '@/lib/navigation';

/**
 * The 404.
 *
 * It sits at the application root rather than inside the marketing group, so it
 * composes the public chrome itself. A dead end should still offer the whole
 * map: the links below are the same ones the header carries.
 */

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'The page you asked for does not exist. The main sections of the site are listed.',
  robots: { index: false, follow: true },
  openGraph: {
    type: 'website',
    title: 'Page not found — GhimTech Tax',
    description: 'The page you asked for does not exist.',
  },
};

export default function NotFound(): React.JSX.Element {
  return (
    <div className="flex min-h-dvh flex-col">
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />

      <main id="main" className="flex-1">
        <div className="rail py-20 md:py-28">
          <Eyebrow>Error 404</Eyebrow>
          <h1 className="mt-6 max-w-2xl font-display text-h1 font-normal text-ink">
            That page is not here.
          </h1>
          <p className="mt-5 max-w-xl text-lead text-ink-muted">
            The address may have changed, or it may never have existed. Nothing has gone wrong with
            your return — if you were signed in, your work is where you left it.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/" size="lg">
              Back to the home page
            </ButtonLink>
            <ButtonLink href="/contact" size="lg" variant="secondary">
              Tell us what you were looking for
            </ButtonLink>
          </div>

          <nav
            aria-label="Site sections"
            className="mt-16 grid gap-10 border-t border-line-subtle pt-10 sm:grid-cols-3"
          >
            {PRIMARY_NAV.map((group) => (
              <div key={group.label}>
                <h2 className="text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
                  {group.label}
                </h2>
                <ul className="mt-4 flex flex-col gap-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-10 items-center text-ui text-ink-muted transition-colors duration-150 hover:text-ink"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
