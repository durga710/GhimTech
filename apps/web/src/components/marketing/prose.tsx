import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Reading primitives for the long-form public pages.
 *
 * The measure is capped at `max-w-prose` — roughly sixty-five characters —
 * because the security page and the two legal documents are meant to be read
 * rather than skimmed, and a line that runs the full width of a desktop window
 * loses the reader on the return sweep.
 */

export function Prose({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div className={cn('flex max-w-prose flex-col gap-5 text-body text-ink-muted', className)}>
      {children}
    </div>
  );
}

/**
 * A bulleted list with a quiet marker. Items are passed as an array rather
 * than as children so that every list in the site shares one spacing rule.
 */
export function List({
  items,
  className,
}: {
  items: ReactNode[];
  className?: string;
}): React.JSX.Element {
  return (
    <ul className={cn('flex list-disc flex-col gap-2 pl-5 marker:text-line-strong', className)}>
      {items.map((item, index) => (
        <li key={index} className="pl-1">
          {item}
        </li>
      ))}
    </ul>
  );
}

export interface DetailItem {
  term: ReactNode;
  description: ReactNode;
}

/**
 * A term-and-explanation grid. A real `dl`, so the pairing is announced as a
 * pairing instead of as two unrelated paragraphs.
 */
export function DetailList({
  items,
  columns = 2,
  className,
}: {
  items: DetailItem[];
  columns?: 1 | 2 | 3;
  className?: string;
}): React.JSX.Element {
  return (
    <dl
      className={cn(
        'grid gap-x-10 gap-y-8',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {items.map((item, index) => (
        <div key={index} className="border-t border-line-subtle pt-4">
          <dt className="text-ui font-semibold text-ink">{item.term}</dt>
          <dd className="mt-2 text-sm leading-relaxed text-ink-muted">{item.description}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * An inline code-ish token — a form number, a masked identifier, a header
 * name. Monospace and tabular so `***-**-6789` lines up wherever it appears.
 */
export function Token({ children }: { children: ReactNode }): React.JSX.Element {
  return (
    <code className="tabular rounded-xs bg-surface-sunken px-1 py-0.5 font-mono text-xs text-ink">
      {children}
    </code>
  );
}
