'use client';

import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './icons';

/**
 * A modal side panel.
 *
 * Three obligations, none of them optional: focus moves into the panel when it
 * opens, Tab cannot leave it while it is open, and focus returns to whatever
 * opened it when it closes. Escape closes. A preparer who tabs out of a drawer
 * into a table they cannot see has lost their place entirely.
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: ReactNode;
  description?: ReactNode;
  side?: 'left' | 'right';
  /** Width classes for the panel. */
  widthClassName?: string;
  footer?: ReactNode;
  children: ReactNode;
}

export function Drawer({
  open,
  onClose,
  title,
  eyebrow,
  description,
  side = 'right',
  widthClassName = 'max-w-lg',
  footer,
  children,
}: DrawerProps): React.JSX.Element | null {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    restoreRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panel)?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
      restoreRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const panel = panelRef.current;
      if (!panel) return;

      const nodes = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE));
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      if (!first || !last) {
        event.preventDefault();
        panel.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-surface-inverse opacity-40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'relative flex h-full w-full flex-col bg-surface shadow-lg outline-none',
          widthClassName,
          side === 'right' ? 'ml-auto border-l border-line' : 'mr-auto border-r border-line',
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line-subtle px-5 py-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="text-eyebrow font-semibold uppercase text-ink-subtle">{eyebrow}</p>
            ) : null}
            <h2 id={titleId} className="mt-1 text-ui font-semibold text-ink">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close panel"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-canvas-alt hover:text-ink"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {footer ? (
          <div className="shrink-0 border-t border-line-subtle bg-surface-sunken px-5 py-3">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
