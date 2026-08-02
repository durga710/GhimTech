import { Badge, type BadgeTone } from '@/components/ui/surface';
import { cn } from '@/lib/cn';
import {
  AUTHORIZATION_STATE_LABEL,
  DOCUMENT_STATUS_LABEL,
  RETURN_STAGE_LABEL,
  RETURN_STAGE_TONE,
  SUBMISSION_STATUS_LABEL,
  type AuthorizationState,
  type DemoDiagnosticCounts,
  type DocumentStatus,
  type ReturnStage,
  type StageTone,
  type SubmissionStatus,
} from '@/lib/demo/practice';

/**
 * The status vocabulary, rendered once.
 *
 * Every screen that shows a return stage shows the same word in the same
 * colour. Two screens disagreeing about what "in review" looks like is how a
 * product starts to feel unreliable.
 */

const stageToBadge: Record<StageTone, BadgeTone> = {
  neutral: 'neutral',
  accent: 'accent',
  warning: 'warning',
  error: 'reject',
  success: 'success',
};

export function StageBadge({ stage }: { stage: ReturnStage }): React.JSX.Element {
  return <Badge tone={stageToBadge[RETURN_STAGE_TONE[stage]]}>{RETURN_STAGE_LABEL[stage]}</Badge>;
}

const documentTone: Record<DocumentStatus, BadgeTone> = {
  uploaded: 'neutral',
  classifying: 'info',
  needs_review: 'warning',
  accepted: 'success',
  rejected: 'reject',
};

export function DocumentStatusBadge({ status }: { status: DocumentStatus }): React.JSX.Element {
  return <Badge tone={documentTone[status]}>{DOCUMENT_STATUS_LABEL[status]}</Badge>;
}

const submissionTone: Record<SubmissionStatus, BadgeTone> = {
  queued: 'neutral',
  transmitted: 'info',
  accepted: 'success',
  rejected: 'reject',
};

export function SubmissionStatusBadge({ status }: { status: SubmissionStatus }): React.JSX.Element {
  return <Badge tone={submissionTone[status]}>{SUBMISSION_STATUS_LABEL[status]}</Badge>;
}

const authorizationTone: Record<AuthorizationState, BadgeTone> = {
  not_sent: 'neutral',
  sent: 'warning',
  viewed: 'warning',
  signed: 'success',
  declined: 'reject',
};

export function AuthorizationBadge({ state }: { state: AuthorizationState }): React.JSX.Element {
  return <Badge tone={authorizationTone[state]}>{AUTHORIZATION_STATE_LABEL[state]}</Badge>;
}

/**
 * Open diagnostics as a compact count strip. Zero counts are omitted rather
 * than shown as a grey nought — a clean return should look clean.
 */
export function DiagnosticsSummary({
  counts,
  className,
}: {
  counts: DemoDiagnosticCounts;
  className?: string;
}): React.JSX.Element {
  const entries = [
    {
      key: 'reject',
      count: counts.reject,
      label: 'reject',
      className: 'bg-reject text-on-accent border-reject',
    },
    {
      key: 'error',
      count: counts.error,
      label: 'error',
      className: 'bg-error-tint text-error-strong border-error-edge',
    },
    {
      key: 'warning',
      count: counts.warning,
      label: 'warning',
      className: 'bg-warning-tint text-warning-strong border-warning-edge',
    },
    {
      key: 'informational',
      count: counts.informational,
      label: 'note',
      className: 'border-info-edge text-info-strong',
    },
  ].filter((entry) => entry.count > 0);

  if (entries.length === 0) {
    return <span className={cn('text-xs text-ink-subtle', className)}>No open diagnostics</span>;
  }

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
      {entries.map((entry) => (
        <span
          key={entry.key}
          className={cn(
            'inline-flex items-center gap-1 rounded-sm border px-1.5 py-0.5 text-micro font-semibold',
            entry.className,
          )}
        >
          <span className="tabular">{entry.count}</span>
          <span className="font-medium">{entry.label}</span>
        </span>
      ))}
    </span>
  );
}

/** True when a return cannot be transmitted as it stands. */
export function isBlocking(counts: DemoDiagnosticCounts): boolean {
  return counts.reject > 0 || counts.error > 0;
}
