'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { StatusDot } from '@/components/ui/surface';

/**
 * Save status.
 *
 * A preparer keying a return is entitled to know, without asking, whether their
 * last keystroke survived. This sits in the workspace header, never moves,
 * announces itself politely to a screen reader, and states a time rather than a
 * mood: "Saved 10:42" answers the question, "Saved" does not.
 *
 * Fields announce an edit by dispatching {@link RETURN_DIRTY_EVENT} on the
 * window. Coupling the two through a DOM event rather than through shared React
 * state keeps every data-entry control independent of the header — a field does
 * not need to know that a status indicator exists.
 */

export const RETURN_DIRTY_EVENT = 'gt:return-dirty';

/** Called by data-entry controls when a value changes. */
export function markReturnDirty(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(RETURN_DIRTY_EVENT));
}

type SaveState = 'saved' | 'saving' | 'just-saved';

function clockTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function SaveStatus({ lastSavedLabel }: { lastSavedLabel: string }): React.JSX.Element {
  const [state, setState] = useState<SaveState>('saved');
  const [savedAt, setSavedAt] = useState(lastSavedLabel);

  useEffect(() => {
    let settle: ReturnType<typeof setTimeout> | undefined;

    function onDirty(): void {
      setState('saving');
      if (settle !== undefined) clearTimeout(settle);
      settle = setTimeout(() => {
        setSavedAt(clockTime());
        setState('just-saved');
      }, 700);
    }

    window.addEventListener(RETURN_DIRTY_EVENT, onDirty);
    return () => {
      window.removeEventListener(RETURN_DIRTY_EVENT, onDirty);
      if (settle !== undefined) clearTimeout(settle);
    };
  }, []);

  const message =
    state === 'saving'
      ? 'Saving changes'
      : state === 'just-saved'
        ? `All changes saved at ${savedAt}`
        : `All changes saved · ${savedAt}`;

  return (
    <p
      aria-live="polite"
      className={cn(
        'flex items-center gap-1.5 whitespace-nowrap text-micro',
        state === 'saving' ? 'text-ink-muted' : 'text-ink-subtle',
      )}
    >
      <StatusDot tone={state === 'saving' ? 'warning' : 'success'} />
      {message}
    </p>
  );
}
