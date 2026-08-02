'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { ErrorState, SkeletonRows } from '@/components/ui/state';
import { Icon } from './icons';

/**
 * The workspace table.
 *
 * Dense on purpose — a preparer scanning a hundred clients is reading a ledger,
 * not browsing cards. Three rules hold it together:
 *
 *  1. Amounts and identifiers are tabular and right-aligned, so a column reads
 *     as a column rather than as ragged text.
 *  2. Rows are never made clickable as a whole. The first cell carries a real
 *     link, which keeps the row reachable by keyboard and openable in a new tab.
 *  3. The table scrolls inside its own box. At 375 pixels the page must not
 *     scroll sideways, and a wide table is not a reason to break that.
 */

export type SortDirection = 'asc' | 'desc';

export interface Column<T> {
  key: string;
  header: string;
  /** Right-aligned, tabular figures. Use for amounts, counts and identifiers. */
  numeric?: boolean;
  sortable?: boolean;
  /** Drops the column below this breakpoint rather than squeezing it. */
  hideBelow?: 'sm' | 'md' | 'lg' | 'xl';
  render: (row: T) => ReactNode;
}

const hideClasses: Record<'sm' | 'md' | 'lg' | 'xl', string> = {
  sm: 'max-sm:hidden',
  md: 'max-md:hidden',
  lg: 'max-lg:hidden',
  xl: 'max-xl:hidden',
};

export interface ActionItem {
  label: string;
  href?: string;
  onSelect?: () => void;
  tone?: 'default' | 'danger';
}

export interface DataTableProps<T> {
  /** Announced to screen readers in place of a visible caption. */
  caption: string;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  actions?: (row: T) => ActionItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: ReactNode;
  footer?: ReactNode;
  /** Minimum table width before the container starts scrolling. */
  minWidthClassName?: string;
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  sortKey,
  sortDirection = 'asc',
  onSort,
  actions,
  loading = false,
  error = null,
  onRetry,
  empty,
  footer,
  minWidthClassName = 'min-w-[52rem]',
}: DataTableProps<T>): React.JSX.Element {
  return (
    <div className="overflow-hidden rounded-lg border border-line-subtle bg-surface">
      {loading ? (
        <div className="p-4">
          <p className="sr-only" role="status">
            Loading {caption}
          </p>
          <SkeletonRows rows={6} />
        </div>
      ) : error ? (
        <ErrorState
          className="border-0 bg-transparent"
          title="This list could not be loaded"
          description={error}
          {...(onRetry ? { onRetry } : {})}
        />
      ) : rows.length === 0 ? (
        <div className="p-4">{empty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className={cn('w-full border-collapse text-sm', minWidthClassName)}>
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr className="border-b border-line-subtle bg-surface-sunken">
                {columns.map((column) => {
                  const active = sortKey === column.key;
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      aria-sort={
                        active
                          ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : column.sortable
                            ? 'none'
                            : undefined
                      }
                      className={cn(
                        'px-3 py-2 text-micro font-semibold uppercase tracking-[0.06em] text-ink-subtle',
                        column.numeric ? 'text-right' : 'text-left',
                        column.hideBelow && hideClasses[column.hideBelow],
                      )}
                    >
                      {column.sortable && onSort ? (
                        <button
                          type="button"
                          onClick={() => onSort(column.key)}
                          className={cn(
                            'inline-flex items-center gap-1 rounded-xs uppercase transition-colors hover:text-ink',
                            column.numeric && 'flex-row-reverse',
                            active && 'text-ink',
                          )}
                        >
                          {column.header}
                          <Icon
                            name="sort"
                            className={cn('size-3.5', active ? 'text-accent' : 'text-ink-subtle')}
                          />
                        </button>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
                {actions ? (
                  <th scope="col" className="w-12 px-3 py-2">
                    <span className="sr-only">Row actions</span>
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={rowKey(row)}
                  className="border-b border-line-subtle last:border-b-0 hover:bg-canvas-alt"
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cn(
                        'px-3 py-2.5 align-middle',
                        column.numeric ? 'tabular text-right' : 'text-left',
                        column.hideBelow && hideClasses[column.hideBelow],
                      )}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                  {actions ? (
                    <td className="px-3 py-2.5 text-right">
                      <ActionMenu items={actions(row)} />
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {footer && !loading && !error ? (
        <div className="border-t border-line-subtle bg-surface-sunken px-3 py-2.5">{footer}</div>
      ) : null}
    </div>
  );
}

/** The primary cell content: a real link, so the row is keyboard-reachable. */
export function RowLink({
  href,
  primary,
  secondary,
}: {
  href: string;
  primary: ReactNode;
  secondary?: ReactNode;
}): React.JSX.Element {
  return (
    <Link href={href} className="block min-w-0 rounded-xs">
      <span className="block truncate font-medium text-ink hover:text-accent-text">{primary}</span>
      {secondary ? (
        <span className="mt-0.5 block truncate text-micro text-ink-subtle">{secondary}</span>
      ) : null}
    </Link>
  );
}

/**
 * Row actions. Escape closes and returns focus to the trigger, the arrow keys
 * move between items, and Tab dismisses — the behaviour a menu is expected to
 * have, rather than a div that happens to appear on click.
 */
export function ActionMenu({
  items,
  label = 'Row actions',
}: {
  items: ActionItem[];
  label?: string;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus();

    function onPointerDown(event: MouseEvent): void {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (event.key === 'Tab') {
      setOpen(false);
      return;
    }
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;

    const nodes = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    if (nodes.length === 0) return;
    event.preventDefault();
    const index = nodes.findIndex((node) => node === document.activeElement);
    const step = event.key === 'ArrowDown' ? 1 : -1;
    nodes[(index + step + nodes.length) % nodes.length]?.focus();
  }

  return (
    <div className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-7 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-sunken hover:text-ink"
      >
        <Icon name="more" className="size-4" />
      </button>

      {open ? (
        <div
          ref={menuRef}
          role="menu"
          aria-label={label}
          onKeyDown={onKeyDown}
          className="absolute right-0 top-[calc(100%+0.25rem)] z-30 w-52 rounded-lg border border-line-subtle bg-surface-raised p-1 text-left shadow-lg"
        >
          {items.map((item) =>
            item.href ? (
              <Link
                key={item.label}
                role="menuitem"
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'block rounded-md px-2.5 py-1.5 text-sm transition-colors hover:bg-canvas-alt focus:bg-canvas-alt',
                  item.tone === 'danger' ? 'text-reject-strong' : 'text-ink-muted hover:text-ink',
                )}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onSelect?.();
                  buttonRef.current?.focus();
                }}
                className={cn(
                  'block w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-canvas-alt focus:bg-canvas-alt',
                  item.tone === 'danger' ? 'text-reject-strong' : 'text-ink-muted hover:text-ink',
                )}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  );
}

export function TablePager({
  page,
  pageSize,
  total,
  onPageChange,
  noun = 'records',
}: {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  noun?: string;
}): React.JSX.Element {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-micro text-ink-muted" aria-live="polite">
        Showing <span className="tabular font-medium text-ink">{from}</span>–
        <span className="tabular font-medium text-ink">{to}</span> of{' '}
        <span className="tabular font-medium text-ink">{total}</span> {noun}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-micro text-ink-subtle">
          Page <span className="tabular">{page}</span> of <span className="tabular">{pages}</span>
        </span>
        <Button
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
