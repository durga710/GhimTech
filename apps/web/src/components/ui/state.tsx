import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Button, Spinner } from '@/components/ui/button';

/**
 * The four states every screen owes its reader: loading, empty, error, done.
 *
 * They live in one file because they are one design decision. Each uses the
 * same vertical rhythm and the same restrained mark, so a reader moving between
 * an empty client list and a failed document upload recognises the shape of the
 * message before reading a word of it.
 *
 * The empty state always offers the next action. An empty screen that only says
 * "no data" tells a preparer nothing they had not already worked out.
 */

function StateFrame({
  mark,
  title,
  description,
  actions,
  className,
  role,
}: {
  mark: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  role?: 'alert' | 'status';
}): React.JSX.Element {
  return (
    <div
      role={role}
      className={cn(
        'flex flex-col items-center justify-center gap-4 rounded-lg px-6 py-14 text-center',
        className,
      )}
    >
      {mark}
      <div className="flex max-w-md flex-col gap-1.5">
        <p className="text-ui font-semibold text-ink">{title}</p>
        {description ? <p className="text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function LoadingState({
  label = 'Loading',
  className,
}: {
  label?: string;
  className?: string;
}): React.JSX.Element {
  return (
    <StateFrame
      role="status"
      className={cn('border border-dashed border-line-subtle', className)}
      mark={<Spinner className="size-6 text-accent" />}
      title={label}
      description="This should take a moment."
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <StateFrame
      className={cn('border border-dashed border-line', className)}
      mark={
        <svg viewBox="0 0 40 40" className="size-9 text-ink-subtle" fill="none" aria-hidden="true">
          <rect
            x="7.5"
            y="5.5"
            width="25"
            height="29"
            rx="3"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M13.5 14h13M13.5 20h13M13.5 26h7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.55"
          />
        </svg>
      }
      title={title}
      description={description}
      actions={action}
    />
  );
}

export function ErrorState({
  title = 'Something went wrong',
  description,
  onRetry,
  className,
}: {
  title?: ReactNode;
  description?: ReactNode;
  onRetry?: () => void;
  className?: string;
}): React.JSX.Element {
  return (
    <StateFrame
      role="alert"
      className={cn('border border-reject-edge bg-reject-tint', className)}
      mark={
        <svg viewBox="0 0 40 40" className="size-9 text-reject" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.75" />
          <path d="M20 12.5v10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          <circle cx="20" cy="27" r="1.3" fill="currentColor" />
        </svg>
      }
      title={title}
      description={description}
      actions={
        onRetry ? (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}

export function SuccessState({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <StateFrame
      role="status"
      className={cn('border border-success-edge bg-success-tint', className)}
      mark={
        <svg viewBox="0 0 40 40" className="size-9 text-success" fill="none" aria-hidden="true">
          <circle cx="20" cy="20" r="15" stroke="currentColor" strokeWidth="1.75" />
          <path
            d="m13.75 20.5 4.25 4.25 8.25-9.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      }
      title={title}
      description={description}
      actions={action}
    />
  );
}

/**
 * A placeholder block sized to the content it stands in for. Skeletons are
 * matched to real row heights so the page does not reflow when data lands —
 * a jumping table is worse than a brief blank one.
 */
export function Skeleton({ className }: { className?: string }): React.JSX.Element {
  return (
    <div aria-hidden="true" className={cn('animate-pulse rounded-sm bg-surface-sunken', className)} />
  );
}

export function SkeletonRows({
  rows = 5,
  className,
}: {
  rows?: number;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('flex flex-col gap-px', className)} aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <Skeleton
          key={index}
          className="h-11 w-full rounded-none first:rounded-t-md last:rounded-b-md"
        />
      ))}
    </div>
  );
}
