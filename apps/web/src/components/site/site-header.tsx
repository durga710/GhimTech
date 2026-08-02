'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { GhimTechTaxLockup } from '@/components/brand/logo';
import { ButtonLink } from '@/components/ui/button';
import { ThemeToggle } from '@/components/site/theme-toggle';
import { cn } from '@/lib/cn';
import { CLIENT_PORTAL_HREF, PRIMARY_NAV, SIGN_IN_HREF } from '@/lib/navigation';

/**
 * The public masthead.
 *
 * Two navigations live here, not one: a grouped menu bar for pointer and
 * keyboard on wide screens, and a full menu panel below the fold on narrow
 * ones. They are separate markup rather than one list restyled, because a
 * dropdown that becomes an accordion always ends up serving neither well.
 *
 * Accessibility contract, kept deliberately explicit:
 *  - every disclosure states `aria-expanded` and points at what it controls;
 *  - Escape closes the open surface and returns focus to the control that
 *    opened it, so a keyboard reader is never stranded;
 *  - navigating closes everything, because a menu left open over a new page is
 *    a bug the router cannot see.
 */

const MOBILE_MENU_ID = 'site-mobile-menu';

function ChevronIcon({ open }: { open: boolean }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={cn(
        'size-3.5 shrink-0 text-ink-subtle transition-transform duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]',
        open && 'rotate-180',
      )}
    >
      <path
        d="m4 6.5 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SiteHeader(): React.JSX.Element {
  const pathname = usePathname();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const groupButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const mobileToggleRef = useRef<HTMLButtonElement | null>(null);

  const isCurrent = useCallback(
    (href: string) => pathname === href || (href !== '/' && pathname.startsWith(`${href}/`)),
    [pathname],
  );

  /* A route change must leave no menu behind. */
  useEffect(() => {
    setOpenGroup(null);
    setMobileOpen(false);
  }, [pathname]);

  /* Escape closes whichever surface is open, and hands focus back. */
  useEffect(() => {
    if (openGroup === null && !mobileOpen) return;

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== 'Escape') return;
      if (mobileOpen) {
        setMobileOpen(false);
        mobileToggleRef.current?.focus();
        return;
      }
      if (openGroup !== null) {
        const trigger = groupButtonRefs.current[openGroup];
        setOpenGroup(null);
        trigger?.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [openGroup, mobileOpen]);

  /* A click anywhere else dismisses an open dropdown. */
  useEffect(() => {
    if (openGroup === null) return;

    function onPointerDown(event: PointerEvent): void {
      const nav = desktopNavRef.current;
      if (nav && event.target instanceof Node && !nav.contains(event.target)) {
        setOpenGroup(null);
      }
    }

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [openGroup]);

  /* The page beneath the mobile panel must not scroll away under it. */
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [mobileOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-line-subtle bg-canvas/85 backdrop-blur-md">
        <div className="rail rail-wide flex h-16 items-center gap-4 md:h-18">
          <Link
            href="/"
            aria-label="GhimTech Tax — home"
            className="shrink-0 rounded-sm py-1 text-ink transition-opacity duration-150 hover:opacity-80"
          >
            <GhimTechTaxLockup markSize={28} scale={1.0625} />
          </Link>

          {/* ---------------------------------------------------------------- */}
          {/* Desktop navigation                                                */}
          {/* ---------------------------------------------------------------- */}
          <nav aria-label="Primary" className="hidden lg:block">
            <div ref={desktopNavRef} className="flex items-center gap-1">
              {PRIMARY_NAV.map((group) => {
                const open = openGroup === group.label;
                const panelId = `nav-group-${group.label.toLowerCase()}`;
                const active = group.links.some((link) => isCurrent(link.href));

                return (
                  <div
                    key={group.label}
                    className="relative"
                    onPointerEnter={() => setOpenGroup(group.label)}
                    onPointerLeave={() =>
                      setOpenGroup((current) => (current === group.label ? null : current))
                    }
                  >
                    <button
                      type="button"
                      ref={(node) => {
                        groupButtonRefs.current[group.label] = node;
                      }}
                      aria-expanded={open}
                      aria-controls={panelId}
                      /*
                       * Pointer and keyboard need different answers here. A
                       * mouse has already opened this panel by hovering, so a
                       * plain toggle would close it on the very click that was
                       * meant to commit to it. `detail === 0` identifies a
                       * keyboard activation, which has had no hover and so
                       * genuinely toggles.
                       */
                      onClick={(event) => {
                        if (event.detail === 0) {
                          setOpenGroup((current) => (current === group.label ? null : group.label));
                        } else {
                          setOpenGroup(group.label);
                        }
                      }}
                      className={cn(
                        'inline-flex h-10 items-center gap-1.5 rounded-md px-3 text-ui font-medium transition-colors duration-150',
                        active || open ? 'text-ink' : 'text-ink-muted hover:text-ink',
                        open && 'bg-canvas-alt',
                      )}
                    >
                      {group.label}
                      <ChevronIcon open={open} />
                    </button>

                    <div
                      id={panelId}
                      hidden={!open}
                      className="absolute left-0 top-full z-10 w-[24rem] pt-2"
                    >
                      <ul className="flex flex-col gap-0.5 rounded-lg border border-line-subtle bg-surface-raised p-2 shadow-lg">
                        {group.links.map((link) => (
                          <li key={link.href}>
                            <Link
                              href={link.href}
                              aria-current={isCurrent(link.href) ? 'page' : undefined}
                              className={cn(
                                'block rounded-md px-3 py-2.5 transition-colors duration-150 hover:bg-canvas-alt',
                                isCurrent(link.href) && 'bg-accent-tint',
                              )}
                            >
                              <span className="block text-ui font-medium text-ink">
                                {link.label}
                              </span>
                              {link.description ? (
                                <span className="mt-0.5 block text-sm text-ink-muted">
                                  {link.description}
                                </span>
                              ) : null}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <ThemeToggle />

            <Link
              href={CLIENT_PORTAL_HREF}
              className="hidden h-10 items-center rounded-md px-3 text-ui font-medium text-ink-muted transition-colors duration-150 hover:bg-canvas-alt hover:text-ink lg:inline-flex"
            >
              Client portal
            </Link>

            {/*
              Wrapped rather than given `hidden lg:inline-flex` directly: the
              button primitive already sets `inline-flex`, and `cn` joins class
              names without resolving conflicts on purpose, so a display utility
              passed through `className` would lose to the one baked into the
              variant. Hiding the wrapper is unambiguous.
            */}
            <span className="hidden lg:block">
              <ButtonLink href={SIGN_IN_HREF} variant="secondary">
                Sign in
              </ButtonLink>
            </span>

            {/* ------------------------------------------------------------ */}
            {/* Mobile disclosure                                             */}
            {/* ------------------------------------------------------------ */}
            <button
              type="button"
              ref={mobileToggleRef}
              aria-expanded={mobileOpen}
              aria-controls={MOBILE_MENU_ID}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex size-10 items-center justify-center rounded-md border border-line text-ink transition-colors duration-150 hover:bg-canvas-alt lg:hidden"
            >
              {mobileOpen ? (
                <svg viewBox="0 0 20 20" className="size-4.5" fill="none" aria-hidden="true">
                  <path
                    d="m5 5 10 10M15 5 5 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 20 20" className="size-4.5" fill="none" aria-hidden="true">
                  <path
                    d="M3 6h14M3 10h14M3 14h14"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Mobile panel                                                        */}
      {/*                                                                     */}
      {/* Deliberately a sibling of <header> rather than a child. The header  */}
      {/* carries `backdrop-filter`, which makes it a containing block for    */}
      {/* fixed-position descendants — a panel nested inside it would be      */}
      {/* positioned against the 64px header box and collapse to a hairline   */}
      {/* instead of covering the viewport.                                   */}
      {/* ------------------------------------------------------------------ */}
      <div
        id={MOBILE_MENU_ID}
        hidden={!mobileOpen}
        className="fixed inset-x-0 bottom-0 top-16 z-40 overflow-y-auto overscroll-contain border-t border-line-subtle bg-canvas lg:hidden"
      >
        <nav aria-label="Primary (mobile)" className="rail flex flex-col gap-8 py-8">
          {PRIMARY_NAV.map((group) => (
            <div key={group.label}>
              <p className="flex items-center gap-2.5 text-eyebrow font-semibold uppercase text-ink-subtle">
                <span aria-hidden="true" className="h-px w-6 bg-seal" />
                {group.label}
              </p>
              <ul className="mt-3 flex flex-col">
                {group.links.map((link) => (
                  <li key={link.href} className="border-b border-line-subtle last:border-b-0">
                    <Link
                      href={link.href}
                      aria-current={isCurrent(link.href) ? 'page' : undefined}
                      className="flex min-h-14 flex-col justify-center py-3"
                    >
                      <span
                        className={cn(
                          'text-ui font-medium',
                          isCurrent(link.href) ? 'text-accent-text' : 'text-ink',
                        )}
                      >
                        {link.label}
                      </span>
                      {link.description ? (
                        <span className="text-sm text-ink-muted">{link.description}</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="flex flex-col gap-3 pb-8">
            <ButtonLink href={SIGN_IN_HREF} size="lg" block>
              Sign in
            </ButtonLink>
            <ButtonLink href={CLIENT_PORTAL_HREF} variant="secondary" size="lg" block>
              Client portal
            </ButtonLink>
          </div>
        </nav>
      </div>
    </>
  );
}
