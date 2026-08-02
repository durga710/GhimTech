import { cn } from '@/lib/cn';

/**
 * The calculation summary.
 *
 * This rail is the reason a preparer can key confidently: every figure that
 * matters sits in one place, in one column, and never moves. The layout is a
 * fixed label column and a fixed figure column, so when adjusted gross income
 * changes by a dollar the digit changes and nothing else does. Amounts that jump
 * a few pixels between renders are how transposition errors survive review.
 *
 * Figures arrive pre-formatted from the engine's `formatMoney`, because the
 * decision about how money is written belongs in one place and it is not here.
 */

export interface CalculationLine {
  label: string;
  /** The Form 1040 line, where the figure has one. */
  line?: string;
  value: string;
  /** Renders heavier, with a rule above: a subtotal or the final answer. */
  emphasis?: boolean;
  tone?: 'default' | 'refund' | 'owed';
}

function Figure({ line }: { line: CalculationLine }): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 py-1.5',
        line.emphasis && 'mt-1 border-t border-line pt-2.5',
      )}
    >
      <span className="flex min-w-0 items-baseline gap-2">
        {line.line ? (
          <span
            aria-hidden="true"
            className="w-8 shrink-0 text-micro tabular text-ink-subtle"
            title={`Line ${line.line}`}
          >
            {line.line}
          </span>
        ) : (
          <span aria-hidden="true" className="w-8 shrink-0" />
        )}
        <span
          className={cn(
            'truncate text-xs',
            line.emphasis ? 'font-semibold text-ink' : 'text-ink-muted',
          )}
        >
          {line.label}
        </span>
      </span>
      <span
        className={cn(
          'shrink-0 font-mono text-xs tabular tracking-[-0.01em]',
          line.emphasis && 'font-semibold',
          line.tone === 'refund' && 'text-accent-text',
          line.tone === 'owed' && 'text-error-strong',
          (line.tone === undefined || line.tone === 'default') && 'text-ink',
        )}
      >
        {line.value}
      </span>
    </div>
  );
}

export interface CalculationOutcome {
  label: string;
  value: string;
  tone: 'refund' | 'owed';
}

export interface CalculationRailProps {
  federal: readonly CalculationLine[];
  pennsylvania: readonly CalculationLine[];
  /** The bottom line, named as well as figured. */
  outcome: CalculationOutcome;
  asOfLabel: string;
}

/** The persistent right-hand rail, from the extra-wide breakpoint upward. */
export function CalculationRail({
  federal,
  pennsylvania,
  outcome,
  asOfLabel,
}: CalculationRailProps): React.JSX.Element {
  return (
    <aside
      aria-label="Calculation summary"
      className="hidden w-72 shrink-0 border-l border-line-subtle bg-canvas-alt xl:block"
    >
      <div className="sticky top-0 max-h-[calc(100dvh-3rem)] overflow-y-auto px-4 py-4">
        <p className="text-eyebrow font-semibold uppercase text-ink-subtle">Calculation</p>

        <section aria-label="Federal figures" className="mt-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
            Federal · Form 1040
          </h2>
          <div className="mt-1.5">
            {federal.map((line) => (
              <Figure key={line.label} line={line} />
            ))}
          </div>
        </section>

        <section aria-label="Pennsylvania figures" className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
            Pennsylvania · PA-40
          </h2>
          <div className="mt-1.5">
            {pennsylvania.map((line) => (
              <Figure key={line.label} line={line} />
            ))}
          </div>
        </section>

        <div
          className={cn(
            'mt-5 rounded-md border px-3.5 py-3',
            outcome.tone === 'refund'
              ? 'border-success-edge bg-success-tint'
              : 'border-error-edge bg-error-tint',
          )}
        >
          <p className="text-micro font-semibold uppercase tracking-[0.07em] text-ink-muted">
            {outcome.label}
          </p>
          <p
            className={cn(
              'mt-0.5 font-mono text-lead font-semibold tabular',
              outcome.tone === 'refund' ? 'text-accent-text' : 'text-error-strong',
            )}
          >
            {outcome.value}
          </p>
        </div>

        <p className="mt-3 text-micro text-ink-subtle">
          Computed as at {asOfLabel}. Figures move as data is entered. Nothing is filed until the
          return is authorized and transmitted.
        </p>
      </div>
    </aside>
  );
}

/**
 * The same figures folded onto one line, for screens too narrow to carry the
 * rail. A disclosure rather than a truncation: the whole set is one keypress
 * away instead of gone.
 */
export function CalculationStrip({
  federal,
  outcome,
}: Pick<CalculationRailProps, 'federal' | 'outcome'>): React.JSX.Element {
  return (
    <details className="group border-b border-line-subtle bg-canvas-alt xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-2.5 text-xs text-ink-muted [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-2">
          <svg
            viewBox="0 0 12 12"
            aria-hidden="true"
            className="size-3 shrink-0 text-ink-subtle transition-transform group-open:rotate-90"
          >
            <path
              d="m4.5 2.5 3.5 3.5-3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Calculation summary
        </span>
        <span className="flex items-center gap-2">
          <span className="text-micro uppercase tracking-[0.06em] text-ink-subtle">
            {outcome.label}
          </span>
          <span
            className={cn(
              'font-mono text-sm font-semibold tabular',
              outcome.tone === 'refund' ? 'text-accent-text' : 'text-error-strong',
            )}
          >
            {outcome.value}
          </span>
        </span>
      </summary>
      <div className="border-t border-line-subtle px-4 py-3">
        {federal.map((line) => (
          <Figure key={line.label} line={line} />
        ))}
      </div>
    </details>
  );
}
