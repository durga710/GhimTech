'use client';

import { Button, ButtonLink } from '@/components/ui/button';
import { Panel } from '@/components/ui/surface';
import { Icon } from '@/components/app/icons';

/**
 * The workspace error boundary.
 *
 * It says what failed, what was not lost, and what to do next. It does not
 * print the raw exception — a preparer cannot act on a stack trace, and a
 * message written for a developer in front of a client is its own small
 * failure. The digest is shown because that is the string support will ask for.
 */
export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6">
      <Panel className="w-full max-w-xl">
        <div className="flex flex-col items-start gap-4 px-6 py-8 sm:px-8">
          <span className="grid size-10 place-items-center rounded-md border border-reject-edge bg-reject-tint text-reject">
            <Icon name="rejections" />
          </span>

          <div>
            <h1 className="text-h3 font-semibold text-ink">This screen did not load</h1>
            <p className="mt-2 text-sm text-ink-muted">
              Something failed while assembling the page. Nothing you had entered elsewhere has been
              submitted or discarded, and no return has changed state.
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              Try again. If it keeps failing, the reference below identifies this exact failure in
              the practice logs.
            </p>
          </div>

          {error.digest ? (
            <p className="rounded-md border border-line-subtle bg-surface-sunken px-3 py-2 font-mono text-xs text-ink-muted">
              Reference <span className="tabular text-ink">{error.digest}</span>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <Button onClick={reset} size="sm">
              Try again
            </Button>
            <ButtonLink href="/app" variant="secondary" size="sm">
              Back to the dashboard
            </ButtonLink>
          </div>
        </div>
      </Panel>
    </div>
  );
}
