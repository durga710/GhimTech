'use client';

import { useCallback, useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

/**
 * Light and dark, chosen explicitly.
 *
 * The root layout already applies the stored preference before first paint, so
 * this control has one job: record the choice and reflect it. It renders the
 * light-theme icon on the server and corrects itself once mounted, which is the
 * only arrangement that avoids both a hydration mismatch and a theme flash.
 */

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'gt-theme';

function readStored(): Theme | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeToggle({ className }: { className?: string }): React.JSX.Element {
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readStored() ?? systemTheme());
    setMounted(true);
  }, []);

  const toggle = useCallback(() => {
    setTheme((current) => {
      const next: Theme = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* A blocked storage API must not break the control itself. */
      }
      return next;
    });
  }, []);

  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-md border border-line text-ink-muted transition-colors duration-150 hover:bg-canvas-alt hover:text-ink',
        className,
      )}
    >
      {mounted && theme === 'dark' ? (
        <svg viewBox="0 0 20 20" className="size-4.5" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="3.75" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M10 1.75v2M10 16.25v2M18.25 10h-2M3.75 10h-2M15.83 4.17l-1.41 1.41M5.58 14.42l-1.41 1.41M15.83 15.83l-1.41-1.41M5.58 5.58 4.17 4.17"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" className="size-4.5" fill="none" aria-hidden="true">
          <path
            d="M17 12.4A7.4 7.4 0 0 1 7.6 3a7.5 7.5 0 1 0 9.4 9.4Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
