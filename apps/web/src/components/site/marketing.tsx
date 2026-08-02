import type { ReactNode } from 'react';
import { ButtonLink } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/surface';
import { cn } from '@/lib/cn';

/**
 * Marketing section furniture.
 *
 * These exist so the three flagship pages share one vertical rhythm and one
 * idea of what a "band" is. Nothing here invents a colour or a radius; every
 * piece composes the tokens and the `ui/` primitives.
 *
 * The recurring device is the hairline grid: cells sitting on a one-pixel field
 * with a `gap-px`, so the dividers are the background showing through rather
 * than borders that double up at the seams. It reads like ruled paper, which is
 * the point of the whole identity.
 */

// ---------------------------------------------------------------------------
// Bands
// ---------------------------------------------------------------------------

export type SectionTone = 'canvas' | 'alt' | 'surface' | 'inverse';

const sectionTones: Record<SectionTone, string> = {
  canvas: 'bg-canvas',
  alt: 'bg-canvas-alt',
  surface: 'bg-surface',
  inverse: 'bg-surface-inverse text-ink-inverse',
};

export function Section({
  id,
  tone = 'canvas',
  bordered = true,
  wide = false,
  className,
  children,
}: {
  id?: string;
  tone?: SectionTone;
  /** Draws the hairline that separates this band from the one above it. */
  bordered?: boolean;
  wide?: boolean;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <section
      id={id}
      className={cn(
        'scroll-mt-24',
        sectionTones[tone],
        bordered && 'border-t border-line-subtle',
        className,
      )}
    >
      <div className={cn('rail py-20 md:py-28', wide && 'rail-wide')}>{children}</div>
    </section>
  );
}

/** A section heading. Reserved for band titles. */
export function BandHeading({
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
        'flex flex-col gap-5',
        align === 'center' && 'items-center text-center',
        className,
      )}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="max-w-3xl text-h2 font-semibold text-ink">{title}</h2>
      {lead ? (
        <p className={cn('max-w-2xl text-lead text-ink-muted', align === 'center' && 'mx-auto')}>
          {lead}
        </p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Hairline grid
// ---------------------------------------------------------------------------

export function HairlineGrid({
  columns = 3,
  className,
  children,
}: {
  columns?: 2 | 3 | 4;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  const columnClass =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-lg border border-line-subtle bg-line-subtle',
        columnClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

export function HairlineCell({
  index,
  title,
  level = 3,
  children,
  className,
}: {
  /** A quiet mono ordinal. Omit it where the items are unordered. */
  index?: string;
  title: ReactNode;
  /**
   * The heading level of the cell title. Cells usually sit beneath a band
   * heading and so default to `h3`; a band that has no heading of its own —
   * where the cells *are* the top-level statements — passes 2, so the document
   * never jumps from `h1` straight to `h3`.
   */
  level?: 2 | 3;
  children: ReactNode;
  className?: string;
}): React.JSX.Element {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className={cn('flex flex-col gap-2 bg-surface p-6 md:p-8', className)}>
      {index ? <span className="font-mono text-micro tabular text-ink-subtle">{index}</span> : null}
      <Heading className="text-h3 font-semibold text-ink">{title}</Heading>
      <p className="text-body text-ink-muted">{children}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lists
// ---------------------------------------------------------------------------

/** A checked list. The mark is a tick at rule weight, never a decorative dot. */
export function CheckList({
  items,
  className,
}: {
  items: readonly string[];
  className?: string;
}): React.JSX.Element {
  return (
    <ul className={cn('flex flex-col gap-3', className)}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-body text-ink-muted">
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="mt-1.5 size-3.5 shrink-0 text-accent"
          >
            <path
              d="m3 8.5 3.25 3.25L13 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export interface DefinitionItem {
  term: string;
  detail: string;
}

/** Form-and-purpose pairs, ruled like a schedule. */
export function DefinitionTable({
  items,
  className,
}: {
  items: readonly DefinitionItem[];
  className?: string;
}): React.JSX.Element {
  return (
    <dl className={cn('flex flex-col', className)}>
      {items.map((item) => (
        <div
          key={item.term}
          className="grid gap-1 border-b border-line-subtle py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,11rem)_1fr] sm:gap-6"
        >
          <dt className="text-sm font-semibold text-ink">{item.term}</dt>
          <dd className="text-sm text-ink-muted">{item.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// Stages
// ---------------------------------------------------------------------------

export interface StageItem {
  ordinal: string;
  title: string;
  summary: string;
}

/**
 * The five-stage spine, shown as a ruled row on wide screens and a ruled column
 * on narrow ones. No arrows, no animation — the ordinals carry the sequence.
 *
 * The stage titles are set as text rather than headings on purpose. The rail is
 * a summary of sections that appear in full further down the page, and repeating
 * their titles in the heading outline would give a screen-reader user the same
 * five entries twice with nothing to distinguish them.
 */
export function StageRail({
  stages,
  className,
}: {
  stages: readonly StageItem[];
  className?: string;
}): React.JSX.Element {
  return (
    <ol
      className={cn(
        'grid gap-px overflow-hidden rounded-lg border border-line-subtle bg-line-subtle md:grid-cols-5',
        className,
      )}
    >
      {stages.map((stage) => (
        <li key={stage.ordinal} className="flex flex-col gap-2 bg-surface p-6">
          <span className="font-mono text-micro tabular text-accent-text">{stage.ordinal}</span>
          <p className="text-ui font-semibold text-ink">{stage.title}</p>
          <p className="text-sm text-ink-muted">{stage.summary}</p>
        </li>
      ))}
    </ol>
  );
}

// ---------------------------------------------------------------------------
// FAQ
// ---------------------------------------------------------------------------

export interface FaqItem {
  question: string;
  answer: ReactNode;
}

/**
 * Native disclosure elements. A `<details>` is keyboard operable, findable by
 * in-page search and works before hydration, which no scripted accordion does.
 */
export function FaqList({
  items,
  className,
}: {
  items: readonly FaqItem[];
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('flex flex-col', className)}>
      {items.map((item) => (
        <details key={item.question} className="group border-b border-line-subtle">
          <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-5 text-ui font-medium text-ink [&::-webkit-details-marker]:hidden">
            {item.question}
            <span
              aria-hidden="true"
              className="relative inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-line text-ink-subtle"
            >
              <span className="absolute h-px w-2.5 bg-current" />
              <span className="absolute h-2.5 w-px bg-current transition-opacity duration-150 group-open:opacity-0" />
            </span>
          </summary>
          <div className="max-w-2xl pb-6 text-body text-ink-muted">{item.answer}</div>
        </details>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Call to action
// ---------------------------------------------------------------------------

export function CtaBand({
  title,
  lead,
  primary,
  secondary,
}: {
  title: string;
  lead: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
}): React.JSX.Element {
  return (
    <section className="border-t border-line-subtle bg-surface-inverse">
      <div className="rail py-20 md:py-24">
        <div className="flex flex-col items-start gap-8 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="font-display text-h2 font-normal text-ink-inverse">{title}</h2>
            <p className="mt-4 text-lead text-ink-inverse/75">{lead}</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <ButtonLink href={primary.href} size="lg">
              {primary.label}
            </ButtonLink>
            <ButtonLink
              href={secondary.href}
              size="lg"
              variant="ghost"
              className="border border-ink-inverse/25 text-ink-inverse hover:bg-ink-inverse/10 hover:text-ink-inverse"
            >
              {secondary.label}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
