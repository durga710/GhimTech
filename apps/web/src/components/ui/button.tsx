import Link from 'next/link';
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Buttons.
 *
 * Four intents, three sizes, and no gradients. The primary button is a solid
 * pine field with a hairline that darkens on press — the whole affordance is
 * carried by colour and a one-pixel shift, because a professional tool should
 * feel mechanical rather than bouncy.
 *
 * Every variant keeps a visible focus ring. The disabled state dims but does
 * not remove contrast: a preparer needs to read a disabled control to
 * understand why it is disabled.
 */

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:translate-y-px disabled:pointer-events-none disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-on-accent shadow-sm hover:bg-accent-hover active:bg-accent-active border border-transparent',
  secondary:
    'bg-surface text-ink border border-line hover:border-line-strong hover:bg-canvas-alt shadow-sm',
  ghost:
    'bg-transparent text-ink-muted border border-transparent hover:bg-canvas-alt hover:text-ink',
  danger:
    'bg-reject text-on-accent border border-transparent shadow-sm hover:bg-reject-strong active:bg-reject-strong',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-ui',
};

function classes(variant: ButtonVariant, size: ButtonSize, block: boolean): string {
  return cn(base, variants[variant], sizes[size], block && 'w-full');
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  /** Renders a spinner and blocks interaction without changing the layout. */
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  block = false,
  loading = false,
  leading,
  trailing,
  className,
  children,
  disabled,
  ...rest
}: ButtonProps): React.JSX.Element {
  return (
    <button
      {...rest}
      disabled={disabled ?? loading}
      aria-busy={loading || undefined}
      className={cn(classes(variant, size, block), className)}
    >
      {/*
        The label keeps its place while loading — swapping it for a spinner
        makes the button resize and the page jump under the pointer.
      */}
      <span className={cn('contents', loading && 'invisible')}>
        {leading}
        {children}
        {trailing}
      </span>
      {loading ? (
        <span className="absolute inset-0 grid place-items-center">
          <Spinner />
        </span>
      ) : null}
    </button>
  );
}

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
}

/** A link that carries button affordance. Still a link: it navigates. */
export function ButtonLink({
  href,
  variant = 'primary',
  size = 'md',
  block = false,
  leading,
  trailing,
  className,
  children,
  ...rest
}: ButtonLinkProps): React.JSX.Element {
  const external = href.startsWith('http') || href.startsWith('mailto:');
  const content = (
    <>
      {leading}
      {children}
      {trailing}
    </>
  );

  if (external) {
    return (
      <a
        {...rest}
        href={href}
        rel="noopener noreferrer"
        className={cn(classes(variant, size, block), className)}
      >
        {content}
      </a>
    );
  }

  return (
    <Link {...rest} href={href} className={cn(classes(variant, size, block), className)}>
      {content}
    </Link>
  );
}

/** A quiet inline text link with a deliberate underline offset. */
export function TextLink({
  href,
  className,
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }): React.JSX.Element {
  const external = href.startsWith('http') || href.startsWith('mailto:');
  const styles = cn(
    'font-medium text-accent-text underline decoration-accent-edge decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent',
    className,
  );
  if (external) {
    return (
      <a {...rest} href={href} rel="noopener noreferrer" className={styles}>
        {children}
      </a>
    );
  }
  return (
    <Link {...rest} href={href} className={styles}>
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      className={cn('size-4 animate-spin', className)}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.75" opacity="0.25" />
      <path
        d="M14.25 8A6.25 6.25 0 0 0 8 1.75"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}
