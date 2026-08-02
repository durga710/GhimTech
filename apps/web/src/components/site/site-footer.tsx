import Link from 'next/link';
import { GhimTechTaxLockup } from '@/components/brand/logo';
import { FOOTER_NAV } from '@/lib/navigation';

/**
 * The public footer.
 *
 * It carries the whole site map rather than a curated subset. A visitor who
 * scrolls to the bottom is looking for something specific, and the honest
 * answer to that is a complete index — not four links and a newsletter box.
 */

const YEAR = new Date().getFullYear();

export function SiteFooter(): React.JSX.Element {
  return (
    <footer className="border-t border-line-subtle bg-canvas-alt">
      <div className="rail rail-wide py-16 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:gap-16">
          <div>
            <Link href="/" className="inline-block rounded-sm text-ink">
              <GhimTechTaxLockup markSize={30} withDescriptor />
            </Link>
            <p className="mt-5 max-w-xs text-sm text-ink-muted">
              Federal and Pennsylvania tax preparation software for a working practice, with a
              portal that keeps the taxpayer in the loop from intake to acknowledgement.
            </p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-4">
            {FOOTER_NAV.map((group) => (
              <div key={group.label}>
                <h2 className="text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
                  {group.label}
                </h2>
                <ul className="mt-4 flex flex-col gap-1">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="inline-flex min-h-10 items-center text-sm text-ink-muted transition-colors duration-150 hover:text-ink"
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

        <div className="mt-14 flex flex-col gap-6 border-t border-line-subtle pt-8 md:flex-row md:items-start md:justify-between">
          <p className="max-w-2xl text-xs text-ink-subtle">
            GhimTech Tax is preparation software licensed to tax professionals and their clients. It
            does not provide tax, legal or accounting advice, and it does not act as your return
            preparer. Filing deadlines, credits and thresholds change every season; confirm the
            treatment of any position against the current instructions before you file.
          </p>
          <p className="shrink-0 text-xs text-ink-subtle">
            © {YEAR} GhimTech. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
