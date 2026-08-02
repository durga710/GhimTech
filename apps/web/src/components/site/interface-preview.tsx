import type { ReactNode } from 'react';
import { Badge, SeverityBadge, StatusDot } from '@/components/ui/surface';
import type { DiagnosticSeverity, StatusTone } from '@/components/ui/surface';
import { cn } from '@/lib/cn';

/**
 * Miniatures of the real interface, drawn in markup.
 *
 * These are not screenshots and not illustrations of a product that does not
 * exist: every diagnostic code below is a rule that ships in the federal
 * diagnostics engine, and the navigator sections are the sections a return
 * actually has. Nothing here shows a dollar figure, because a marketing page is
 * the wrong place to imply a computed result.
 *
 * Each preview is a single `role="img"` with a written description. A screen
 * reader gets the sentence; it does not get dragged through forty spans of
 * decorative chrome that lead nowhere.
 */

// ---------------------------------------------------------------------------
// Chrome
// ---------------------------------------------------------------------------

function AppFrame({
  address,
  label,
  className,
  children,
}: {
  address: string;
  /** The description a screen reader hears instead of the mock's contents. */
  label: string;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn('overflow-hidden rounded-xl border border-line bg-surface shadow-lg', className)}
    >
      <div className="flex items-center gap-3 border-b border-line-subtle bg-canvas-alt px-3 py-2.5 sm:px-4">
        <span aria-hidden="true" className="flex shrink-0 gap-1.5">
          <span className="size-2.5 rounded-full bg-line-strong opacity-60" />
          <span className="size-2.5 rounded-full bg-line-strong opacity-60" />
          <span className="size-2.5 rounded-full bg-line-strong opacity-60" />
        </span>
        <span
          aria-hidden="true"
          className="mx-auto min-w-0 max-w-full truncate rounded-full border border-line-subtle bg-surface px-3 py-1 font-mono text-micro text-ink-subtle"
        >
          {address}
        </span>
        <span aria-hidden="true" className="hidden w-11 shrink-0 sm:block" />
      </div>
      <div aria-hidden="true">{children}</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Return workspace — navigator plus diagnostics rail
// ---------------------------------------------------------------------------

interface NavigatorSection {
  label: string;
  state: string;
  tone: StatusTone;
}

const NAVIGATOR_SECTIONS: readonly NavigatorSection[] = [
  { label: 'Taxpayer and spouse', state: 'Complete', tone: 'success' },
  { label: 'Dependents', state: 'Complete', tone: 'success' },
  { label: 'Income', state: '4 sources', tone: 'accent' },
  { label: 'Adjustments', state: 'Not started', tone: 'neutral' },
  { label: 'Deductions', state: 'Complete', tone: 'success' },
  { label: 'Credits', state: '1 to review', tone: 'warning' },
  { label: 'Pennsylvania', state: 'In progress', tone: 'accent' },
  { label: 'Review and file', state: 'Blocked', tone: 'error' },
];

interface PreviewDiagnostic {
  severity: DiagnosticSeverity;
  code: string;
  form: string;
  message: string;
  rule?: string;
}

const WORKSPACE_DIAGNOSTICS: readonly PreviewDiagnostic[] = [
  {
    severity: 'reject',
    code: 'GT-ID-007',
    form: 'Form 1040',
    message: 'The Identity Protection PIN is not six digits.',
    rule: 'IND-181-01',
  },
  {
    severity: 'error',
    code: 'GT-DEP-005',
    form: 'Schedule 8812',
    message: 'A Child Tax Credit election does not match the dependent’s recorded age.',
  },
  {
    severity: 'warning',
    code: 'GT-FS-004',
    form: 'Schedule A',
    message: 'The itemized election does not match the deductions entered.',
  },
  {
    severity: 'informational',
    code: 'GT-FS-003',
    form: 'Form 1040',
    message: 'Married filing separately forfeits the education credits.',
  },
];

export function ReturnWorkspacePreview({ className }: { className?: string }): React.JSX.Element {
  return (
    <AppFrame
      address="ghimtechtax.com/app/returns/2025"
      label="The preparer workspace: a return navigator listing taxpayer, dependents, income, adjustments, deductions, credits, Pennsylvania and review, beside a diagnostics rail listing one reject, one error, one warning and one note, with a bar noting that two findings block transmission."
      className={className}
    >
      <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">Return · Tax year 2025</p>
          <p className="truncate font-mono text-micro text-ink-subtle">1040 + PA-40 · Joint</p>
        </div>
        <Badge tone="warning">In review</Badge>
      </div>

      <div className="grid sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <div className="border-b border-line-subtle bg-canvas-alt p-2 sm:border-b-0 sm:border-r">
          <p className="px-2 py-1.5 text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
            Navigator
          </p>
          <ul className="flex flex-col">
            {NAVIGATOR_SECTIONS.map((section) => (
              <li
                key={section.label}
                className={cn(
                  'flex items-center gap-2 rounded-sm px-2 py-1.5',
                  section.label === 'Pennsylvania' && 'bg-surface',
                )}
              >
                <StatusDot tone={section.tone} />
                <span className="min-w-0 flex-1 truncate text-micro text-ink">{section.label}</span>
                <span className="shrink-0 text-micro text-ink-subtle">{section.state}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-4 py-2.5">
            <p className="text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
              Diagnostics
            </p>
            <span className="font-mono text-micro tabular text-ink-subtle">4 open</span>
          </div>
          <ul className="flex flex-col">
            {WORKSPACE_DIAGNOSTICS.map((item) => (
              <li
                key={item.code}
                className="flex gap-3 border-b border-line-subtle px-4 py-3 last:border-b-0"
              >
                <SeverityBadge severity={item.severity} className="mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-micro text-ink">{item.message}</p>
                  <p className="mt-1 font-mono text-micro text-ink-subtle">
                    {item.code} · {item.form}
                    {item.rule ? ` · ${item.rule}` : ''}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center gap-2 border-t border-line-subtle bg-canvas-alt px-4 py-2.5">
            <StatusDot tone="error" />
            <span className="text-micro text-ink-muted">2 findings block transmission</span>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Diagnostics review
// ---------------------------------------------------------------------------

const REVIEW_DIAGNOSTICS: readonly PreviewDiagnostic[] = [
  {
    severity: 'reject',
    code: 'GT-ID-005',
    form: 'Form 1040',
    message: 'The spouse identification number matches the primary taxpayer’s.',
    rule: 'R0000-500-01',
  },
  {
    severity: 'error',
    code: 'GT-W2-001',
    form: 'Form W-2',
    message: 'A W-2 has no employer identification number.',
  },
  {
    severity: 'error',
    code: 'GT-EIC-004',
    form: 'Schedule EIC',
    message: 'Investment income exceeds the Earned Income Credit ceiling for the year.',
  },
  {
    severity: 'warning',
    code: 'GT-ID-009',
    form: 'Form 1040',
    message: 'A decedent return is missing the personal representative details.',
  },
  {
    severity: 'informational',
    code: 'GT-ID-010',
    form: 'Form 1040',
    message: 'The taxpayer is marked as claimed as a dependent on another return.',
  },
];

const FILTER_CHIPS: readonly { label: string; count: string; active?: boolean }[] = [
  { label: 'All', count: '5', active: true },
  { label: 'Blocking', count: '3' },
  { label: 'Federal', count: '5' },
  { label: 'Pennsylvania', count: '0' },
];

export function DiagnosticsPreview({ className }: { className?: string }): React.JSX.Element {
  return (
    <AppFrame
      address="ghimtechtax.com/app/returns/2025/diagnostics"
      label="The diagnostics screen: filter chips for all, blocking, federal and Pennsylvania findings, above a ruled list of five findings — one reject, two errors, one warning and one note — each showing its rule code, the form it sits on and the e-file business rule it anticipates."
      className={className}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-line-subtle px-4 py-3">
        {FILTER_CHIPS.map((chip) => (
          <span
            key={chip.label}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-micro',
              chip.active
                ? 'border-accent-edge bg-accent-tint text-accent-text'
                : 'border-line-subtle text-ink-muted',
            )}
          >
            {chip.label}
            <span className="font-mono tabular opacity-70">{chip.count}</span>
          </span>
        ))}
      </div>

      <ul className="flex flex-col">
        {REVIEW_DIAGNOSTICS.map((item) => (
          <li
            key={item.code}
            className="grid gap-2 border-b border-line-subtle px-4 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,5rem)_minmax(0,1fr)_minmax(0,9rem)] sm:items-start sm:gap-4"
          >
            <SeverityBadge severity={item.severity} className="justify-self-start" />
            <div className="min-w-0">
              <p className="text-sm text-ink">{item.message}</p>
              <p className="mt-1 font-mono text-micro text-ink-subtle">
                {item.code}
                {item.rule ? ` · anticipates ${item.rule}` : ''}
              </p>
            </div>
            <span className="text-micro text-ink-subtle sm:text-right">{item.form}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle bg-canvas-alt px-4 py-3">
        <span className="text-micro text-ink-muted">
          Transmission stays locked while a reject or an error is open.
        </span>
        <span className="font-mono text-micro tabular text-ink-subtle">3 blocking · 2 advisory</span>
      </div>
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Document review split
// ---------------------------------------------------------------------------

interface SourceDocument {
  name: string;
  kind: string;
  status: string;
  tone: 'success' | 'warning' | 'neutral';
  selected?: boolean;
}

const SOURCE_DOCUMENTS: readonly SourceDocument[] = [
  { name: 'Form W-2', kind: 'Employer 1', status: 'Matched', tone: 'success', selected: true },
  { name: 'Form W-2', kind: 'Employer 2', status: 'Matched', tone: 'success' },
  { name: 'Form 1099-INT', kind: 'Bank', status: 'Matched', tone: 'success' },
  { name: 'Form 1098-T', kind: 'Institution', status: 'Needs review', tone: 'warning' },
  { name: 'PA local EIT notice', kind: 'Municipality', status: 'Requested', tone: 'neutral' },
];

const EXTRACTED_FIELDS: readonly { label: string; state: string; confirmed: boolean }[] = [
  { label: 'Employer identification number', state: 'Confirmed', confirmed: true },
  { label: 'Employer name and address', state: 'Confirmed', confirmed: true },
  { label: 'Box 1 — wages, tips, other compensation', state: 'Confirmed', confirmed: true },
  { label: 'Box 2 — federal income tax withheld', state: 'Confirmed', confirmed: true },
  { label: 'Box 16 — state wages (PA)', state: 'Confirm', confirmed: false },
  { label: 'Box 20 — locality name', state: 'Confirm', confirmed: false },
];

export function DocumentReviewPreview({ className }: { className?: string }): React.JSX.Element {
  return (
    <AppFrame
      address="ghimtechtax.com/app/documents"
      label="The document review split: on the left a list of source documents — two W-2s and a 1099-INT matched, a 1098-T needing review and a Pennsylvania local earned income tax notice still requested — and on the right the selected W-2 beside its fields, four confirmed against the document and two still awaiting the preparer's confirmation."
      className={className}
    >
      <div className="grid lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <div className="border-b border-line-subtle bg-canvas-alt p-2 lg:border-b-0 lg:border-r">
          <p className="px-2 py-1.5 text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
            Source documents
          </p>
          <ul className="flex flex-col gap-0.5">
            {SOURCE_DOCUMENTS.map((doc) => (
              <li
                key={`${doc.name}-${doc.kind}`}
                className={cn(
                  'rounded-sm px-2 py-2',
                  doc.selected && 'bg-surface ring-1 ring-accent-edge',
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="min-w-0 truncate text-micro font-medium text-ink">
                    {doc.name}
                  </span>
                  <Badge
                    tone={
                      doc.tone === 'success'
                        ? 'success'
                        : doc.tone === 'warning'
                          ? 'warning'
                          : 'neutral'
                    }
                  >
                    {doc.status}
                  </Badge>
                </div>
                <p className="mt-0.5 truncate text-micro text-ink-subtle">{doc.kind}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid sm:grid-cols-2">
          {/* The page itself, abstracted to its rules — a stand-in for the
              scanned document, never a fabricated one. */}
          <div className="border-b border-line-subtle bg-surface-sunken p-4 sm:border-b-0 sm:border-r">
            <div className="mx-auto flex aspect-[17/22] w-full max-w-56 flex-col gap-3 rounded-sm border border-line bg-surface p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="h-1.5 w-16 rounded-full bg-line-strong" />
                <span className="h-1.5 w-8 rounded-full bg-line" />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {Array.from({ length: 9 }, (_, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-1 rounded-xs border border-line-subtle p-1.5"
                  >
                    <span className="h-1 w-full rounded-full bg-line-subtle" />
                    <span
                      className={cn(
                        'h-1 rounded-full',
                        index === 4 || index === 7 ? 'w-3/4 bg-accent-edge' : 'w-1/2 bg-line',
                      )}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-auto flex flex-col gap-1.5">
                <span className="h-1 w-full rounded-full bg-line-subtle" />
                <span className="h-1 w-2/3 rounded-full bg-line-subtle" />
              </div>
            </div>
            <p className="mt-3 text-center font-mono text-micro text-ink-subtle">W-2 · page 1 of 1</p>
          </div>

          <div className="flex flex-col">
            <div className="border-b border-line-subtle px-4 py-2.5">
              <p className="text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
                Fields on this document
              </p>
            </div>
            <ul className="flex flex-col">
              {EXTRACTED_FIELDS.map((field) => (
                <li
                  key={field.label}
                  className="flex items-center justify-between gap-3 border-b border-line-subtle px-4 py-2.5 last:border-b-0"
                >
                  <span className="min-w-0 text-micro text-ink">{field.label}</span>
                  {field.confirmed ? (
                    <span className="inline-flex shrink-0 items-center gap-1 text-micro text-accent-text">
                      <svg viewBox="0 0 16 16" className="size-3" fill="none">
                        <path
                          d="m3 8.5 3.25 3.25L13 4.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {field.state}
                    </span>
                  ) : (
                    <span className="inline-flex h-7 shrink-0 items-center rounded-sm border border-line bg-surface px-2 text-micro font-medium text-ink">
                      {field.state}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Filing timeline
// ---------------------------------------------------------------------------

interface FilingStep {
  label: string;
  detail: string;
  state: 'done' | 'current' | 'pending';
}

const FILING_STEPS: readonly FilingStep[] = [
  { label: 'Diagnostics cleared', detail: 'No reject or error open', state: 'done' },
  { label: 'Authorization signed', detail: 'Form 8879 · both signers', state: 'done' },
  { label: 'Transmitted', detail: 'Federal and PA-40 in one submission', state: 'done' },
  { label: 'Acknowledgement', detail: 'Awaiting the agency response', state: 'current' },
  { label: 'Closed', detail: 'Accepted, or corrected and resent', state: 'pending' },
];

export function FilingTimelinePreview({ className }: { className?: string }): React.JSX.Element {
  return (
    <AppFrame
      address="ghimtechtax.com/app/filing"
      label="The filing screen: a five-step submission timeline — diagnostics cleared, authorization signed, transmitted, acknowledgement awaited, and closed — with a note that a rejection returns the submission to the preparer with the agency's reason attached."
      className={className}
    >
      <ol className="flex flex-col sm:flex-row">
        {FILING_STEPS.map((step) => (
          <li
            key={step.label}
            className="flex-1 border-b border-line-subtle px-4 py-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
          >
            <div className="flex items-center gap-2">
              <StatusDot
                tone={
                  step.state === 'done' ? 'success' : step.state === 'current' ? 'accent' : 'neutral'
                }
              />
              <span
                className={cn(
                  'text-micro font-semibold',
                  step.state === 'pending' ? 'text-ink-subtle' : 'text-ink',
                )}
              >
                {step.label}
              </span>
            </div>
            <p className="mt-1.5 text-micro text-ink-subtle">{step.detail}</p>
          </li>
        ))}
      </ol>
      <div className="flex items-start gap-2 border-t border-line-subtle bg-canvas-alt px-4 py-3">
        <SeverityBadge severity="reject" className="mt-px shrink-0" />
        <p className="text-micro text-ink-muted">
          A rejected submission comes back with the agency’s reason attached and reopens the return
          at the field that caused it. Correct, re-run diagnostics, retransmit.
        </p>
      </div>
    </AppFrame>
  );
}

// ---------------------------------------------------------------------------
// Client portal
// ---------------------------------------------------------------------------

const PORTAL_STEPS: readonly { label: string; state: 'done' | 'current' | 'pending' }[] = [
  { label: 'Your information', state: 'done' },
  { label: 'Documents', state: 'current' },
  { label: 'Review your return', state: 'pending' },
  { label: 'Sign to authorize', state: 'pending' },
  { label: 'Filing status', state: 'pending' },
];

export function PortalPreview({ className }: { className?: string }): React.JSX.Element {
  return (
    <AppFrame
      address="ghimtechtax.com/portal"
      label="The client portal: a taxpayer's five-step progress list — information, documents, review, signature and filing status — with the documents step in progress and a highlighted request for one outstanding Form 1098-T."
      className={className}
    >
      <div className="border-b border-line-subtle px-4 py-3">
        <p className="text-sm font-semibold text-ink">Your 2025 return</p>
        <p className="mt-0.5 text-micro text-ink-subtle">Prepared by your tax professional</p>
      </div>

      <ol className="flex flex-col px-4 py-3">
        {PORTAL_STEPS.map((step, index) => (
          <li key={step.label} className="flex items-center gap-3 py-2">
            <span
              className={cn(
                'inline-flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-micro tabular',
                step.state === 'done' && 'border-accent bg-accent text-on-accent',
                step.state === 'current' && 'border-accent text-accent-text',
                step.state === 'pending' && 'border-line text-ink-subtle',
              )}
            >
              {step.state === 'done' ? (
                <svg viewBox="0 0 16 16" className="size-3" fill="none">
                  <path
                    d="m3 8.5 3.25 3.25L13 4.5"
                    stroke="currentColor"
                    strokeWidth="2.25"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <span
              className={cn(
                'flex-1 text-micro',
                step.state === 'pending' ? 'text-ink-subtle' : 'font-medium text-ink',
              )}
            >
              {step.label}
            </span>
            {step.state === 'current' ? <Badge tone="accent">In progress</Badge> : null}
          </li>
        ))}
      </ol>

      <div className="mx-4 mb-4 rounded-md border border-warning-edge bg-warning-tint px-3 py-2.5">
        <p className="text-micro font-semibold text-ink">One document still needed</p>
        <p className="mt-0.5 text-micro text-ink-muted">
          Form 1098-T from your school. Photograph it or upload the PDF — we will tell you when it
          has been read.
        </p>
      </div>
    </AppFrame>
  );
}
