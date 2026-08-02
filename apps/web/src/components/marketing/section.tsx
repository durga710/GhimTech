import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Eyebrow } from '@/components/ui/surface';

/**
 * A titled band of a public page.
 *
 * The section names itself through `aria-labelledby`, which makes it a real
 * region landmark rather than an anonymous div — on a page as long as the
 * security or the tax-situations page, that is the difference between a screen
 * reader user being able to jump around and having to read from the top.
 *
 * `scroll-mt` keeps an anchored heading clear of a sticky masthead.
 */

export interface MarketingSectionProps {
  id: string;
  eyebrow?: ReactNode;
  title: ReactNode;
  lead?: ReactNode;
  /** `alt` tints the band so alternating sections read as separate passages. */
  tone?: 'canvas' | 'alt';
  bordered?: boolean;
  className?: string;
  children?: ReactNode;
}

export function MarketingSection({
  id,
  eyebrow,
  title,
  lead,
  tone = 'canvas',
  bordered = true,
  className,
  children,
}: MarketingSectionProps): React.JSX.Element {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={cn(
        'scroll-mt-24',
        tone === 'alt' && 'bg-canvas-alt',
        bordered && 'border-t border-line-subtle',
        className,
      )}
    >
      <div className="rail py-14 md:py-20">
        <div className="flex max-w-3xl flex-col gap-4">
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <h2 id={headingId} className="text-h2 font-semibold text-ink">
            {title}
          </h2>
          {lead ? <p className="text-lead text-ink-muted">{lead}</p> : null}
        </div>
        {children ? <div className="mt-10">{children}</div> : null}
      </div>
    </section>
  );
}

/** A third-level heading inside a section. Never skips a level. */
export function SubHeading({
  id,
  className,
  children,
}: {
  id?: string;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <h3 id={id} className={cn('scroll-mt-24 text-h3 font-semibold text-ink', className)}>
      {children}
    </h3>
  );
}
