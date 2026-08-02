import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/surface';

/**
 * The support matrix.
 *
 * Three states, and each one carries a word as well as a colour — a reader who
 * cannot separate the tints must still be able to tell "handled" from "not
 * handled", and on this particular table getting that wrong costs someone a
 * filing season.
 *
 * The table scrolls inside its own frame rather than pushing the page sideways
 * on a phone.
 */

export type SupportLevel = 'supported' | 'in-progress' | 'unsupported';

const LEVEL_LABELS: Record<SupportLevel, string> = {
  supported: 'Supported',
  'in-progress': 'In progress',
  unsupported: 'Not supported',
};

const LEVEL_TONES = {
  supported: 'success',
  'in-progress': 'warning',
  unsupported: 'neutral',
} as const;

export function SupportBadge({ level }: { level: SupportLevel }): React.JSX.Element {
  return <Badge tone={LEVEL_TONES[level]}>{LEVEL_LABELS[level]}</Badge>;
}

export interface StatusRow {
  /** The situation, form or schedule. */
  label: string;
  /** What that support actually amounts to. Never left empty. */
  note: string;
  level: SupportLevel;
}

export function StatusTable({
  caption,
  itemHeading = 'Situation',
  noteHeading = 'What that means here',
  rows,
  className,
}: {
  /** Announced to screen readers; visually the section heading carries it. */
  caption: string;
  itemHeading?: string;
  noteHeading?: string;
  rows: StatusRow[];
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('overflow-x-auto rounded-lg border border-line-subtle bg-surface', className)}>
      <table className="w-full min-w-[40rem] border-collapse text-left">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line bg-surface-sunken">
            <th
              scope="col"
              className="w-1/3 px-4 py-3 text-micro font-semibold uppercase tracking-[0.07em] text-ink-subtle"
            >
              {itemHeading}
            </th>
            <th
              scope="col"
              className="px-4 py-3 text-micro font-semibold uppercase tracking-[0.07em] text-ink-subtle"
            >
              {noteHeading}
            </th>
            <th
              scope="col"
              className="w-36 px-4 py-3 text-micro font-semibold uppercase tracking-[0.07em] text-ink-subtle"
            >
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line-subtle align-top last:border-b-0">
              <th scope="row" className="px-4 py-3.5 text-sm font-medium text-ink">
                {row.label}
              </th>
              <td className="px-4 py-3.5 text-sm leading-relaxed text-ink-muted">{row.note}</td>
              <td className="px-4 py-3.5">
                <SupportBadge level={row.level} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** The key that sits above the first matrix and explains the three words. */
export function StatusLegend({ className }: { className?: string }): React.JSX.Element {
  const entries: Array<{ level: SupportLevel; meaning: string }> = [
    {
      level: 'supported',
      meaning: 'Built, tested against the tax year we support, and usable today.',
    },
    {
      level: 'in-progress',
      meaning: 'Partly built or under active work. Do not plan a season around it yet.',
    },
    {
      level: 'unsupported',
      meaning: 'Not handled. If your return needs it, this is not the right software for you.',
    },
  ];

  return (
    <dl className={cn('grid gap-4 sm:grid-cols-3', className)}>
      {entries.map((entry) => (
        <div key={entry.level} className="flex flex-col gap-2">
          <dt>
            <SupportBadge level={entry.level} />
          </dt>
          <dd className="text-sm leading-relaxed text-ink-muted">{entry.meaning}</dd>
        </div>
      ))}
    </dl>
  );
}
