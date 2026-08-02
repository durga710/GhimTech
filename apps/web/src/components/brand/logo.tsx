import type { CSSProperties } from 'react';

/**
 * The GhimTech Tax identity.
 *
 * MARK — a filed return, verified. A ledger tile carries two rules standing for
 * the lines of a form, and a brass check crosses the lower one. The check is
 * the only place brass appears at small sizes, which is what makes the mark
 * legible at 16 pixels: one warm stroke against one cool field.
 *
 * WORDMARK — "GhimTech" is set in the interface grotesk and "Tax" in the
 * editorial serif, italic. The pairing states the relationship in the name
 * itself: an engineering company, and the practice it built. It also means the
 * lockup carries both typefaces of the system, so the rest of the product has
 * something to answer to.
 *
 * Both are drawn in `currentColor` where they can be, so a single component
 * works on paper, on ink, and inside a monochrome PDF header.
 */

export interface MarkProps {
  /** Edge length in pixels. The mark is square. */
  size?: number;
  className?: string;
  /** Drops the brass accent for single-colour contexts (fax, PDF, stamps). */
  monochrome?: boolean;
  title?: string;
}

export function GhimTechTaxMark({
  size = 32,
  className,
  monochrome = false,
  title,
}: MarkProps): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      role={title ? 'img' : 'presentation'}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {title ? <title>{title}</title> : null}
      <rect
        width="32"
        height="32"
        rx="7"
        fill={monochrome ? 'currentColor' : 'var(--gt-pine-700)'}
      />
      {/* The two form rules. The upper is long, the lower deliberately short —
          a return narrows toward its signature line. */}
      <rect x="8" y="11" width="16" height="2.25" rx="1.125" fill="var(--gt-n-0)" opacity="0.92" />
      <rect x="8" y="17" width="9" height="2.25" rx="1.125" fill="var(--gt-n-0)" opacity="0.55" />
      {/* The verification check, crossing the signature line. */}
      <path
        d="M14.75 21.4 L18.35 25 L25.1 15.9"
        stroke={monochrome ? 'var(--gt-n-0)' : 'var(--gt-brass-400)'}
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface WordmarkProps {
  className?: string;
  /** Font size of the wordmark in rem. Everything else scales from it. */
  scale?: number;
  /** Renders entirely in `currentColor` instead of tinting "Tax". */
  monochrome?: boolean;
}

export function GhimTechTaxWordmark({
  className,
  scale = 1.0625,
  monochrome = false,
}: WordmarkProps): React.JSX.Element {
  const style: CSSProperties = { fontSize: `${scale}rem` };
  return (
    <span
      className={`inline-flex items-baseline gap-[0.28em] leading-none ${className ?? ''}`}
      style={style}
    >
      <span className="font-sans font-semibold tracking-[-0.028em]">GhimTech</span>
      <span
        className={`font-display italic tracking-[-0.015em] ${monochrome ? '' : 'text-accent-text'}`}
      >
        Tax
      </span>
    </span>
  );
}

export interface LockupProps {
  className?: string;
  /** Adds the "Built by GhimTech" descriptor beneath the wordmark. */
  withDescriptor?: boolean;
  markSize?: number;
  scale?: number;
  monochrome?: boolean;
}

/**
 * Mark and wordmark together. This is the only arrangement approved for the
 * masthead — components should not compose their own.
 */
export function GhimTechTaxLockup({
  className,
  withDescriptor = false,
  markSize = 30,
  scale = 1.0625,
  monochrome = false,
}: LockupProps): React.JSX.Element {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      <GhimTechTaxMark size={markSize} monochrome={monochrome} />
      <span className="inline-flex flex-col gap-[0.15em]">
        <GhimTechTaxWordmark scale={scale} monochrome={monochrome} />
        {withDescriptor ? (
          <span className="text-micro font-medium uppercase tracking-[0.11em] text-ink-subtle">
            Built by GhimTech
          </span>
        ) : null}
      </span>
    </span>
  );
}
