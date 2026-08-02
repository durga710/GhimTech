import Link from 'next/link';
import type {
  Diagnostic,
  DiagnosticReport,
  DiagnosticSeverity,
} from '@ghimtech-tax/tax-engine-federal';
import { cn } from '@/lib/cn';
import { Badge, SeverityBadge } from '@/components/ui/surface';
import { EmptyState } from '@/components/ui/state';
import {
  SEVERITY_EXPLANATIONS,
  SEVERITY_HEADINGS,
  SEVERITY_ORDER,
  goToFieldHref,
} from '@/lib/demo/return';

/**
 * The diagnostics panel.
 *
 * Every row on this panel came out of the engine. Nothing here is written by
 * hand, which is the only way the panel can be trusted: a preparer who finds one
 * invented finding stops believing the other forty.
 *
 * A finding is shown with everything needed to act on it in one place — what is
 * wrong, on which form, which IRS business rule it anticipates, what to do about
 * it, and a link that opens the offending field. Making someone hunt for the
 * field a message refers to is the commonest failure of this screen elsewhere.
 */

function severityCount(report: DiagnosticReport, severity: DiagnosticSeverity): number {
  return report.counts[severity];
}

/**
 * The counts, as a live region. Rendered in the workspace header and again at
 * the top of the panel: the number of things standing between this return and
 * the gateway is never more than a glance away.
 */
export function DiagnosticsCount({
  report,
  className,
}: {
  report: DiagnosticReport;
  className?: string;
}): React.JSX.Element {
  const total = report.diagnostics.length;
  return (
    <p
      aria-live="polite"
      className={cn('flex flex-wrap items-center gap-x-2 gap-y-1 text-micro', className)}
    >
      <span className="sr-only">
        {total} diagnostic{total === 1 ? '' : 's'}, {report.blockingCount} blocking transmission.
      </span>
      {SEVERITY_ORDER.map((severity) => {
        const count = severityCount(report, severity);
        if (count === 0) return null;
        return (
          <span key={severity} className="flex items-center gap-1" aria-hidden="true">
            <SeverityBadge severity={severity} />
            <span className="font-mono tabular text-ink-muted">{count}</span>
          </span>
        );
      })}
      {total === 0 ? (
        <span aria-hidden="true" className="text-ink-muted">
          No diagnostics
        </span>
      ) : null}
    </p>
  );
}

function DiagnosticRow({
  diagnostic,
  returnId,
  active,
}: {
  diagnostic: Diagnostic;
  returnId: string;
  active: boolean;
}): React.JSX.Element {
  const href = goToFieldHref(returnId, diagnostic.field);
  return (
    <li
      className={cn(
        'border-t border-line-subtle px-4 py-3 first:border-t-0',
        active && 'bg-accent-tint',
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <SeverityBadge severity={diagnostic.severity} />
        <span className="font-mono text-micro tabular text-ink-subtle">{diagnostic.code}</span>
        {diagnostic.form ? (
          <span className="text-micro text-ink-subtle">· {diagnostic.form}</span>
        ) : null}
        {diagnostic.irsBusinessRule ? (
          <Badge tone="neutral" className="font-mono">
            IRS {diagnostic.irsBusinessRule}
          </Badge>
        ) : null}
      </div>

      <p className="mt-1.5 text-sm text-ink">{diagnostic.message}</p>

      {diagnostic.resolution ? (
        <p className="mt-1 text-xs text-ink-muted">{diagnostic.resolution}</p>
      ) : null}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5">
        {href ? (
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-xs text-xs font-medium text-accent-text underline decoration-accent-edge underline-offset-[3px] hover:decoration-accent"
          >
            Go to field
            <svg viewBox="0 0 12 12" aria-hidden="true" className="size-3">
              <path
                d="M2.5 6h7m-3-3 3 3-3 3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sr-only">— {diagnostic.field}</span>
          </Link>
        ) : null}
        {diagnostic.field ? (
          <code className="font-mono text-micro text-ink-subtle">{diagnostic.field}</code>
        ) : (
          <span className="text-micro text-ink-subtle">Applies to the whole return</span>
        )}
        {diagnostic.reference ? (
          <span className="text-micro text-ink-subtle">{diagnostic.reference}</span>
        ) : null}
      </div>
    </li>
  );
}

export interface DiagnosticsPanelProps {
  report: DiagnosticReport;
  returnId: string;
  /** Defaults to the whole report; pass a subset for a filtered view. */
  diagnostics?: readonly Diagnostic[];
  /** The field the reader arrived from, marked in place. */
  activeField?: string | undefined;
  /** Heading level for the severity group headings. */
  headingLevel?: 'h2' | 'h3';
  /** Shown in place of the panel when there is nothing to report. */
  emptyDescription?: string;
  className?: string;
}

export function DiagnosticsPanel({
  report,
  returnId,
  diagnostics,
  activeField,
  headingLevel = 'h3',
  emptyDescription,
  className,
}: DiagnosticsPanelProps): React.JSX.Element {
  const rows = diagnostics ?? report.diagnostics;
  const Heading = headingLevel;

  if (rows.length === 0) {
    return (
      <div className={className}>
        <EmptyState
          title="Nothing to report"
          description={
            emptyDescription ??
            (report.eFileEligible
              ? `All ${report.rulesEvaluated} federal rules ran and none found anything. This return is eligible for electronic filing.`
              : 'No diagnostics match the current filter. Clear the filter to see the whole report.')
          }
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      {SEVERITY_ORDER.map((severity) => {
        const group = rows.filter((diagnostic) => diagnostic.severity === severity);
        if (group.length === 0) return null;
        return (
          <section key={severity} aria-labelledby={`severity-${severity}`}>
            <Heading
              id={`severity-${severity}`}
              className="flex flex-wrap items-center gap-2 text-ui font-semibold text-ink"
            >
              <SeverityBadge severity={severity} />
              {SEVERITY_HEADINGS[severity]}
              <span className="font-mono text-sm font-normal tabular text-ink-subtle">
                {group.length}
              </span>
            </Heading>
            <p className="mt-1 text-xs text-ink-muted">{SEVERITY_EXPLANATIONS[severity]}</p>
            <ul className="mt-2.5 overflow-hidden rounded-lg border border-line-subtle bg-surface">
              {group.map((diagnostic) => (
                <DiagnosticRow
                  key={`${diagnostic.code}-${diagnostic.field ?? 'return'}-${diagnostic.message}`}
                  diagnostic={diagnostic}
                  returnId={returnId}
                  active={activeField !== undefined && diagnostic.field === activeField}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
