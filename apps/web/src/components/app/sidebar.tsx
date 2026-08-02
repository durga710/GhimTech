'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAV } from '@/lib/navigation';
import { cn } from '@/lib/cn';
import { IS_DEMO_DATA, DEMO_PRACTICE } from '@/lib/demo/practice';
import { Icon, navIcon } from './icons';
import { roleAllows, useSession } from './session';

/**
 * The navigation rail.
 *
 * `APP_NAV` is the source of truth: sections, order, and which roles list an
 * item all come from that file, so a new screen becomes reachable by editing
 * data rather than markup.
 *
 * Between the tablet and desktop breakpoints the rail collapses to icons. The
 * labels stay in the document and are only visually hidden, so the collapsed
 * rail is still fully readable to a screen reader — an icon-only navigation
 * that drops its text is not a compact navigation, it is a broken one.
 */
export function SidebarNav({
  collapsible = true,
  onNavigate,
}: {
  /** False inside the mobile slide-over, where there is room for labels. */
  collapsible?: boolean;
  onNavigate?: () => void;
}): React.JSX.Element {
  const pathname = usePathname();
  const { role } = useSession();

  const sections = APP_NAV.map((section) => ({
    label: section.label,
    items: section.items.filter((item) => roleAllows(role, item.roles)),
  })).filter((section) => section.items.length > 0);

  // The longest matching href wins, so /app/filing/rejections does not light up
  // /app/filing, and /app does not light up everything.
  const activeHref = sections
    .flatMap((section) => section.items)
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const hideOnRail = collapsible ? 'max-lg:sr-only' : '';
  const centreOnRail = collapsible ? 'max-lg:justify-center max-lg:px-0' : '';

  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Workspace" className="min-h-0 flex-1 overflow-y-auto px-2 py-4 lg:px-3">
        <div className="flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.label}>
              <h2
                className={cn(
                  'px-2.5 pb-1.5 text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle',
                  hideOnRail,
                )}
              >
                {section.label}
              </h2>
              <ul className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = item.href === activeHref;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? 'page' : undefined}
                        title={collapsible ? item.label : undefined}
                        className={cn(
                          'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                          centreOnRail,
                          active
                            ? 'bg-accent-tint font-medium text-accent-text'
                            : 'text-ink-muted hover:bg-canvas-alt hover:text-ink',
                        )}
                      >
                        <Icon
                          name={navIcon(item.href)}
                          className={active ? 'text-accent' : 'text-ink-subtle'}
                        />
                        <span className={cn('truncate', hideOnRail)}>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <div
        className={cn(
          'shrink-0 border-t border-line-subtle px-4 py-3',
          collapsible && 'max-lg:px-2 max-lg:py-2',
        )}
      >
        <p className={cn('text-micro font-medium text-ink', hideOnRail)}>{DEMO_PRACTICE.name}</p>
        {IS_DEMO_DATA ? (
          <p className={cn('mt-0.5 text-micro text-ink-subtle', hideOnRail)}>
            Sample data environment
          </p>
        ) : null}
        {collapsible && IS_DEMO_DATA ? (
          <p
            aria-hidden="true"
            title="Sample data environment"
            className="hidden text-center text-micro text-ink-subtle max-lg:block"
          >
            demo
          </p>
        ) : null}
      </div>
    </div>
  );
}
