import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { IS_DEMO_DATA, SAMPLE_DATA_NOTE } from '@/lib/demo/practice';
import { Icon } from './icons';

/**
 * Page furniture: the header band, the body rail, the figure tile, and the
 * one-line honesty note that says where the numbers came from.
 *
 * The header sticks to the top of the scrolling content region rather than the
 * viewport, so it stays with its own screen and never floats over the rail.
 */

export interface Crumb {
  label: string;
  href?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  breadcrumbs,
  meta,
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  breadcrumbs?: Crumb[];
  /** Short facts shown under the title: counts, owners, dates. */
  meta?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'sticky top-0 z-20 shrink-0 border-b border-line-subtle bg-canvas px-4 pb-4 pt-4 sm:px-6 lg:px-8',
        className,
      )}
    >
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex flex-wrap items-center gap-1.5 text-micro text-ink-subtle">
            {breadcrumbs.map((crumb, index) => (
              <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
                {index > 0 ? <Icon name="chevron-right" className="size-3 text-ink-subtle" /> : null}
                {crumb.href ? (
                  <Link href={crumb.href} className="rounded-xs hover:text-ink">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-ink-muted">
                    {crumb.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          {eyebrow ? (
            <p className="text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-1 text-h3 font-semibold tracking-[-0.015em] text-ink">{title}</h1>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{description}</p>
          ) : null}
          {meta ? (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-subtle">
              {meta}
            </div>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  );
}

export function PageBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div className={cn('flex-1 px-4 py-5 sm:px-6 lg:px-8', className)}>
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-5">{children}</div>
    </div>
  );
}

/** One unobtrusive line stating that the records on screen are synthetic. */
export function DemoDataNote({ className }: { className?: string }): React.JSX.Element | null {
  if (!IS_DEMO_DATA) return null;
  return (
    <p className={cn('flex items-center gap-1.5 text-micro text-ink-subtle', className)}>
      <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-line-strong" />
      {SAMPLE_DATA_NOTE}
    </p>
  );
}

export type TileTone = 'neutral' | 'accent' | 'warning' | 'reject' | 'success';

const tileAccent: Record<TileTone, string> = {
  neutral: 'text-ink',
  accent: 'text-accent-text',
  warning: 'text-warning-strong',
  reject: 'text-reject-strong',
  success: 'text-accent-text',
};

/**
 * A single figure with its label and one line of context. Figures are tabular
 * so a row of tiles lines up on the digit rather than on the box.
 */
export function StatTile({
  label,
  value,
  detail,
  tone = 'neutral',
  href,
  className,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
  tone?: TileTone;
  href?: string;
  className?: string;
}): React.JSX.Element {
  const body = (
    <>
      <p className="text-micro font-medium uppercase tracking-[0.08em] text-ink-subtle">{label}</p>
      <p className={cn('mt-1.5 tabular text-h3 font-semibold leading-none', tileAccent[tone])}>
        {value}
      </p>
      {detail ? <p className="mt-1.5 text-xs text-ink-muted">{detail}</p> : null}
    </>
  );

  const shell = cn(
    'block rounded-lg border border-line-subtle bg-surface px-4 py-3.5',
    href && 'transition-colors hover:border-line hover:bg-surface-raised',
    className,
  );

  if (href) {
    return (
      <Link href={href} className={shell}>
        {body}
        <span className="mt-2 inline-flex items-center gap-1 text-micro font-medium text-accent-text">
          Open
          <Icon name="arrow-right" className="size-3.5" />
        </span>
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}

/** Label and value pairs for detail panels and drawers. */
export function DefinitionList({
  items,
  className,
  columns = 2,
}: {
  items: { label: string; value: ReactNode }[];
  className?: string;
  columns?: 1 | 2;
}): React.JSX.Element {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-3.5',
        columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1',
        className,
      )}
    >
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-micro font-medium uppercase tracking-[0.07em] text-ink-subtle">
            {item.label}
          </dt>
          <dd className="mt-0.5 break-words text-sm text-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
