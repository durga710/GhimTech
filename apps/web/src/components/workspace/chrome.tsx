import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Badge, type BadgeTone } from '@/components/ui/surface';
import type { ReturnStage, SubmissionEvent, SubmissionStatus } from '@/lib/demo/filing';

/**
 * The furniture the workspace screens share: section frames, fact lists, stage
 * marks and the submission timeline.
 *
 * These are deliberately thin. A section here is a heading and a rule, not a
 * card — the return workflow is a continuous document, and wrapping each part of
 * it in a floating panel would turn a form into a dashboard, which is exactly
 * what this product is trying not to be.
 */

export function WorkspaceSection({
  id,
  title,
  lead,
  actions,
  className,
  children,
}: {
  id: string;
  title: ReactNode;
  lead?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <section aria-labelledby={`${id}-heading`} className={cn('min-w-0', className)}>
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 id={`${id}-heading`} className="text-h3 font-semibold text-ink">
            {title}
          </h2>
          {lead ? <p className="mt-1 max-w-2xl text-sm text-ink-muted">{lead}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export interface Fact {
  label: string;
  value: ReactNode;
  /** Figures are set in tabular monospace. */
  numeric?: boolean;
}

/** A description list. The workspace's default way of stating known values. */
export function FactList({
  facts,
  columns = 2,
  className,
}: {
  facts: readonly Fact[];
  columns?: 1 | 2 | 3;
  className?: string;
}): React.JSX.Element {
  return (
    <dl
      className={cn(
        'grid gap-x-6 gap-y-3',
        columns === 1 && 'grid-cols-1',
        columns === 2 && 'sm:grid-cols-2',
        columns === 3 && 'sm:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {facts.map((fact) => (
        <div key={fact.label} className="min-w-0 border-t border-line-subtle pt-2">
          <dt className="text-micro uppercase tracking-[0.06em] text-ink-subtle">{fact.label}</dt>
          <dd
            className={cn(
              'mt-0.5 text-sm text-ink',
              fact.numeric && 'font-mono tabular tracking-[-0.01em]',
            )}
          >
            {fact.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

const stageTones: Record<ReturnStage, BadgeTone> = {
  Intake: 'neutral',
  'In preparation': 'neutral',
  Diagnostics: 'warning',
  'In review': 'info',
  'Awaiting signature': 'info',
  'Ready to transmit': 'accent',
  Transmitted: 'accent',
  Accepted: 'success',
  Rejected: 'reject',
};

export function StageBadge({ stage }: { stage: ReturnStage }): React.JSX.Element {
  return <Badge tone={stageTones[stage]}>{stage}</Badge>;
}

const submissionTones: Record<SubmissionStatus, BadgeTone> = {
  Built: 'neutral',
  Transmitted: 'accent',
  Acknowledged: 'info',
  Accepted: 'success',
  Rejected: 'reject',
};

export function SubmissionBadge({ status }: { status: SubmissionStatus }): React.JSX.Element {
  return <Badge tone={submissionTones[status]}>{status}</Badge>;
}

/**
 * A submission's history.
 *
 * Timestamps are printed in full ISO 8601 with their offset rather than as
 * "yesterday". A filing record is evidence, and the reader of an acknowledgement
 * needs the instant, not the impression.
 */
export function SubmissionTimeline({
  events,
  className,
}: {
  events: readonly SubmissionEvent[];
  className?: string;
}): React.JSX.Element {
  return (
    <ol className={cn('flex flex-col', className)}>
      {events.map((event, index) => {
        const last = index === events.length - 1;
        return (
          <li key={`${event.status}-${event.at}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cn(
                  'mt-1 size-2.5 shrink-0 rounded-full',
                  event.status === 'Rejected'
                    ? 'bg-reject'
                    : event.status === 'Accepted'
                      ? 'bg-success'
                      : 'bg-accent',
                )}
              />
              {!last ? <span aria-hidden="true" className="w-px flex-1 bg-line" /> : null}
            </div>
            <div className={cn('min-w-0 pb-4', last && 'pb-0')}>
              <p className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium text-ink">
                {event.status}
                <time dateTime={event.at} className="font-mono text-micro tabular text-ink-subtle">
                  {event.at}
                </time>
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">{event.detail}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/**
 * The honest label. Everything in this build runs on invented data, and saying
 * so where it is visible costs nothing and stops a screenshot being mistaken for
 * a real client file.
 */
export function SampleDataNote({ className }: { className?: string }): React.JSX.Element {
  return (
    <p className={cn('text-micro text-ink-subtle', className)}>
      <span className="font-semibold uppercase tracking-[0.06em]">Sample data</span> — this return,
      its documents and its filing history are invented for demonstration. Identification numbers
      are synthetic and are masked everywhere.
    </p>
  );
}
