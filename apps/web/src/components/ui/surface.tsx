import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Surfaces, headings and status marks.
 *
 * The panel is the single container of the product. It has three elevations and
 * nothing else — no card-within-card, no decorative frames. Depth in this
 * interface is communicated by one hairline and, at most, one soft shadow,
 * because a preparer reading forty rows of a return should never have to work
 * out which box they are inside.
 */

// ---------------------------------------------------------------------------
// Panels
// ---------------------------------------------------------------------------

export type PanelTone = 'flat' | 'raised' | 'sunken';

export interface PanelProps {
  as?: ElementType;
  tone?: PanelTone;
  className?: string;
  children: ReactNode;
}

const panelTones: Record<PanelTone, string> = {
  flat: 'bg-surface border border-line-subtle',
  raised: 'bg-surface-raised border border-line-subtle shadow-md',
  sunken: 'bg-surface-sunken border border-line-subtle',
};

export function Panel({
  as: Tag = 'div',
  tone = 'flat',
  className,
  children,
}: PanelProps): React.JSX.Element {
  return <Tag className={cn('rounded-lg', panelTones[tone], className)}>{children}</Tag>;
}

export function PanelHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-x-6 gap-y-3 border-b border-line-subtle px-5 py-4',
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-ui font-semibold tracking-[-0.01em] text-ink">{title}</h3>
        {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function PanelBody({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return <div className={cn('px-5 py-4', className)}>{children}</div>;
}

// ---------------------------------------------------------------------------
// Editorial headings
// ---------------------------------------------------------------------------

/**
 * The small caps label above a section heading. It carries a short brass rule,
 * which is the one decorative element in the system and the only place the
 * seal colour appears outside the mark.
 */
export function Eyebrow({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <p
      className={cn(
        'flex items-center gap-2.5 text-eyebrow font-semibold uppercase text-ink-subtle',
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-6 bg-seal" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'start',
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  align?: 'start' | 'center';
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="max-w-3xl text-h2 font-semibold text-ink">{title}</h2>
      {lead ? <p className="max-w-2xl text-lead text-ink-muted">{lead}</p> : null}
    </div>
  );
}

export function Divider({ className }: { className?: string }): React.JSX.Element {
  return <hr className={cn('border-0 border-t border-line-subtle', className)} />;
}

// ---------------------------------------------------------------------------
// Badges and status
// ---------------------------------------------------------------------------

export type BadgeTone = 'neutral' | 'accent' | 'reject' | 'error' | 'warning' | 'info' | 'success';

const badgeTones: Record<BadgeTone, string> = {
  neutral: 'bg-canvas-alt text-ink-muted border-line',
  accent: 'bg-accent-tint text-accent-text border-accent-edge',
  reject: 'bg-reject-tint text-reject-strong border-reject-edge',
  error: 'bg-error-tint text-error-strong border-error-edge',
  warning: 'bg-warning-tint text-warning-strong border-warning-edge',
  info: 'bg-info-tint text-info-strong border-info-edge',
  success: 'bg-success-tint text-accent-text border-success-edge',
};

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-micro font-medium',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Diagnostic severity, rendered so the four levels are distinguishable without
 * relying on hue alone: `reject` is a solid field, `error` and `warning` are
 * tinted with a coloured edge, and `informational` is an outline. Colour-vision
 * deficiency and a bad laptop panel both survive this.
 */
export type DiagnosticSeverity = 'reject' | 'error' | 'warning' | 'informational';

const severityLabels: Record<DiagnosticSeverity, string> = {
  reject: 'Reject',
  error: 'Error',
  warning: 'Warning',
  informational: 'Note',
};

const severityStyles: Record<DiagnosticSeverity, string> = {
  reject: 'bg-reject text-on-accent border-reject',
  error: 'bg-error-tint text-error-strong border-error-edge',
  warning: 'bg-warning-tint text-warning-strong border-warning-edge',
  informational: 'bg-transparent text-info-strong border-info-edge',
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: DiagnosticSeverity;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-micro font-semibold uppercase tracking-[0.05em]',
        severityStyles[severity],
        className,
      )}
    >
      {severityLabels[severity]}
    </span>
  );
}

export type StatusTone = 'neutral' | 'accent' | 'warning' | 'error' | 'success';

const statusDotTones: Record<StatusTone, string> = {
  neutral: 'bg-line-strong',
  accent: 'bg-accent',
  warning: 'bg-warning',
  error: 'bg-reject',
  success: 'bg-success',
};

/** A small state marker. Always paired with a text label, never used alone. */
export function StatusDot({
  tone = 'neutral',
  className,
}: {
  tone?: StatusTone;
  className?: string;
}): React.JSX.Element {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block size-2 shrink-0 rounded-full', statusDotTones[tone], className)}
    />
  );
}

// ---------------------------------------------------------------------------
// Callout
// ---------------------------------------------------------------------------

export type CalloutTone = 'neutral' | 'accent' | 'warning' | 'error' | 'info';

const calloutTones: Record<CalloutTone, string> = {
  neutral: 'bg-canvas-alt border-line-subtle',
  accent: 'bg-accent-tint border-accent-edge',
  warning: 'bg-warning-tint border-warning-edge',
  error: 'bg-reject-tint border-reject-edge',
  info: 'bg-info-tint border-info-edge',
};

/** An inline note attached to a form section or a page passage. */
export function Callout({
  tone = 'neutral',
  title,
  className,
  children,
}: {
  tone?: CalloutTone;
  title?: ReactNode;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div className={cn('rounded-md border px-4 py-3', calloutTones[tone], className)}>
      {title ? <p className="text-sm font-semibold text-ink">{title}</p> : null}
      <div className={cn('text-sm text-ink-muted', title ? 'mt-1' : undefined)}>{children}</div>
    </div>
  );
}
