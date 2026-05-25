/**
 * Canonical Logo component.
 *
 * ONE place in the codebase that knows what the brand looks like.
 * Every other component imports this — no inline SVGs allowed.
 *
 * Variants:
 *   - "mark"     → just the geometric G
 *   - "lockup"   → mark + wordmark side by side  [default]
 *   - "wordmark" → just the wordmark
 *
 * Colors via `currentColor`, so you control the color from the parent.
 *
 * Why a single component?
 *   - Brand drift is the #1 way personal-site projects look amateur.
 *     If three different SVGs of the "same" logo exist, they will diverge.
 *   - Refactor in one place when the brand evolves.
 */

import { cn } from "@/lib/utils";

type LogoVariant = "mark" | "lockup" | "wordmark";

interface LogoProps {
  variant?: LogoVariant;
  className?: string;
  /** Pixel size of the mark. Wordmark scales proportionally in lockup. */
  size?: number;
  /** Override aria-label. Defaults to "Ghimtech". */
  label?: string;
}

export function Logo({
  variant = "lockup",
  className,
  size = 32,
  label = "Ghimtech",
}: LogoProps) {
  if (variant === "mark") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        role="img"
        aria-label={label}
        className={cn("inline-block shrink-0", className)}
      >
        <g
          stroke="currentColor"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        >
          <path d="M 50 18 A 22 22 0 1 0 50 46" />
          <path d="M 36 32 L 50 32" />
        </g>
      </svg>
    );
  }

  if (variant === "wordmark") {
    // Wordmark height ≈ size, width auto-scales from viewBox aspect.
    const height = size;
    const width = (200 / 48) * height;
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 200 48"
        fill="none"
        role="img"
        aria-label={label}
        className={cn("inline-block shrink-0", className)}
      >
        <text
          x="0"
          y="34"
          fill="currentColor"
          fontFamily="ui-sans-serif, system-ui, -apple-system, 'Geist', sans-serif"
          fontSize="32"
          fontWeight="500"
          letterSpacing="-0.02em"
        >
          ghimtech
        </text>
      </svg>
    );
  }

  // lockup (default)
  const height = size;
  const width = (280 / 64) * height;
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 280 64"
      fill="none"
      role="img"
      aria-label={label}
      className={cn("inline-block shrink-0", className)}
    >
      <g
        stroke="currentColor"
        strokeWidth={7}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <path d="M 50 18 A 22 22 0 1 0 50 46" />
        <path d="M 36 32 L 50 32" />
      </g>
      <text
        x="92"
        y="44"
        fill="currentColor"
        fontFamily="ui-sans-serif, system-ui, -apple-system, 'Geist', sans-serif"
        fontSize="32"
        fontWeight="500"
        letterSpacing="-0.02em"
      >
        ghimtech
      </text>
    </svg>
  );
}
