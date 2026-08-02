'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from './icons';

type Theme = 'light' | 'dark';

/**
 * Reads the theme the pre-paint script in the root layout already applied, and
 * writes the reader's choice back to the same key. Nothing here runs before
 * first paint, so there is no flash to manage — only a switch to keep in sync.
 */
export function ThemeToggle({ className }: { className?: string }): React.JSX.Element {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const attribute = document.documentElement.getAttribute('data-theme');
    if (attribute === 'light' || attribute === 'dark') {
      setTheme(attribute);
      return;
    }
    setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }, []);

  function apply(next: Theme): void {
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try {
      window.localStorage.setItem('gt-theme', next);
    } catch {
      // The choice will simply not survive a reload.
    }
  }

  const next: Theme = theme === 'dark' ? 'light' : 'dark';
  const label = theme === null ? 'Switch theme' : `Switch to the ${next} theme`;

  return (
    <button
      type="button"
      onClick={() => apply(next)}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-md border border-transparent text-ink-muted transition-colors hover:bg-canvas-alt hover:text-ink',
        className,
      )}
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  );
}
