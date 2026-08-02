'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import type { SectionCompletion } from '@/lib/demo/return';

/**
 * The return's own navigation.
 *
 * A preparer moves between the parts of a return far more often than between
 * parts of the application, so this rail — not the product's global navigation —
 * is the one that has to be instantly readable. Each entry states two things at
 * once: how far the section has been worked, and whether the engine has anything
 * to say about it. Those are different questions, and a section can be finished
 * and wrong.
 *
 * Below the laptop breakpoint the same list becomes a horizontal switcher. It is
 * the same markup and the same links: a narrow screen loses the column, not the
 * navigation.
 */

export interface RailItem {
  id: string;
  label: string;
  summary: string;
  href: string;
  completion: SectionCompletion;
  blocking: number;
  warnings: number;
  informational: number;
}

const completionLabels: Record<SectionCompletion, string> = {
  complete: 'Complete',
  'in-progress': 'In progress',
  'not-started': 'Not started',
};

function CompletionMark({ completion }: { completion: SectionCompletion }): React.JSX.Element {
  if (completion === 'complete') {
    return (
      <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 shrink-0 text-success">
        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="m4.4 7.2 1.9 1.9 3.4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (completion === 'in-progress') {
    return (
      <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 shrink-0 text-accent">
        <circle cx="7" cy="7" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 1a6 6 0 0 1 0 12z" fill="currentColor" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 14 14" aria-hidden="true" className="size-3.5 shrink-0 text-ink-subtle">
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2.4"
      />
    </svg>
  );
}

/** The count marks. Blocking findings are stated in words for a screen reader. */
function RailCounts({
  blocking,
  warnings,
  informational,
}: {
  blocking: number;
  warnings: number;
  informational: number;
}): React.JSX.Element | null {
  if (blocking === 0 && warnings === 0 && informational === 0) return null;
  return (
    <span className="flex shrink-0 items-center gap-1">
      {blocking > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-reject px-1.5 py-0.5 text-micro font-semibold tabular text-on-accent">
          <span aria-hidden="true">{blocking}</span>
          <span className="sr-only">
            {blocking} finding{blocking === 1 ? '' : 's'} blocking transmission
          </span>
        </span>
      ) : null}
      {warnings > 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-warning-edge bg-warning-tint px-1.5 py-0.5 text-micro font-semibold tabular text-warning-strong">
          <span aria-hidden="true">{warnings}</span>
          <span className="sr-only">
            {warnings} warning{warnings === 1 ? '' : 's'}
          </span>
        </span>
      ) : null}
      {informational > 0 && blocking === 0 && warnings === 0 ? (
        <span className="inline-flex min-w-5 items-center justify-center rounded-full border border-info-edge px-1.5 py-0.5 text-micro font-semibold tabular text-info-strong">
          <span aria-hidden="true">{informational}</span>
          <span className="sr-only">{informational} for your attention</span>
        </span>
      ) : null}
    </span>
  );
}

function isActive(pathname: string, href: string): boolean {
  const target = href.split('?')[0] ?? href;
  return pathname === target || pathname.startsWith(`${target}/`);
}

export function ReturnRail({ items }: { items: readonly RailItem[] }): React.JSX.Element {
  const pathname = usePathname();

  return (
    <>
      {/* Laptop and wider: the column. */}
      <nav
        aria-label="Return sections"
        className="hidden w-60 shrink-0 border-r border-line-subtle bg-canvas-alt lg:block"
      >
        <div className="sticky top-0 max-h-[calc(100dvh-3rem)] overflow-y-auto px-2.5 py-4">
          <p className="px-2.5 pb-2 text-eyebrow font-semibold uppercase text-ink-subtle">
            This return
          </p>
          <ol className="flex flex-col gap-px">
            {items.map((item, index) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    title={item.summary}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors',
                      active
                        ? 'bg-surface font-semibold text-ink shadow-sm'
                        : 'text-ink-muted hover:bg-surface hover:text-ink',
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="w-4 shrink-0 text-right text-micro tabular text-ink-subtle"
                    >
                      {index + 1}
                    </span>
                    <CompletionMark completion={item.completion} />
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className="sr-only">— {completionLabels[item.completion]}</span>
                    <RailCounts
                      blocking={item.blocking}
                      warnings={item.warnings}
                      informational={item.informational}
                    />
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      </nav>

      {/* Below the laptop breakpoint: the same list, laid on its side. */}
      <nav
        aria-label="Return sections"
        className="border-b border-line-subtle bg-canvas-alt lg:hidden"
      >
        <ol className="flex snap-x gap-1.5 overflow-x-auto px-3 py-2.5">
          {items.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.id} className="snap-start">
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-2 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs transition-colors',
                    active
                      ? 'border-accent-edge bg-accent-tint font-semibold text-accent-text'
                      : 'border-line-subtle bg-surface text-ink-muted hover:border-line',
                  )}
                >
                  <CompletionMark completion={item.completion} />
                  {item.label}
                  <span className="sr-only">— {completionLabels[item.completion]}</span>
                  <RailCounts
                    blocking={item.blocking}
                    warnings={item.warnings}
                    informational={item.informational}
                  />
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
