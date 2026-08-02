import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Eyebrow } from '@/components/ui/surface';

/**
 * The masthead every public page opens with.
 *
 * One h1, one measure, and no ornament. The rule beneath it is the only
 * decoration, and it exists so that the eye knows where the page proper starts
 * on a long legal document.
 *
 * This is a page header nested inside the layout's `main`, so it does not
 * become a second `banner` landmark.
 */

export interface PageHeroProps {
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** A short line of provenance — an effective date, a scope note. */
  meta?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  lead,
  meta,
  actions,
  className,
}: PageHeroProps): React.JSX.Element {
  return (
    <header className={cn('border-b border-line-subtle bg-canvas-alt', className)}>
      <div className="rail py-14 md:py-20 lg:py-24">
        <div className="flex max-w-3xl flex-col gap-5">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h1 className="text-h1 font-semibold text-ink">{title}</h1>
          {lead ? <p className="text-lead text-ink-muted">{lead}</p> : null}
          {meta ? <p className="text-sm text-ink-subtle">{meta}</p> : null}
          {actions ? <div className="mt-2 flex flex-wrap items-center gap-3">{actions}</div> : null}
        </div>
      </div>
    </header>
  );
}
