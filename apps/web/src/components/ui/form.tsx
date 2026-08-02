import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';
import { useId } from 'react';
import { cn } from '@/lib/cn';

/**
 * Form controls.
 *
 * Data entry is the product. A preparer will type a thousand fields in a week,
 * so these controls are built around three commitments:
 *
 *  1. Every control is wired to its label, hint and error through real ids, so
 *     a screen reader announces the guidance rather than only the value.
 *  2. Errors sit beneath the field and are described, never merely reddened.
 *  3. Amounts and identifiers use tabular figures, so a mistyped digit shows up
 *     as a broken column instead of hiding inside a proportional font.
 */

const controlBase =
  'w-full rounded-md border bg-surface px-3 text-ink placeholder:text-ink-subtle transition-[border-color,box-shadow] duration-150 disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-subtle';
const controlIdle = 'border-line hover:border-line-strong';
const controlInvalid = 'border-reject-edge hover:border-reject';

export interface FieldProps {
  label: ReactNode;
  /** Guidance shown before the taxpayer makes a mistake, not after. */
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** Marks the field optional in the label rather than marking every other one. */
  optional?: boolean;
  className?: string;
  children: (props: {
    id: string;
    'aria-describedby': string | undefined;
    'aria-invalid': boolean | undefined;
    'aria-required': boolean | undefined;
  }) => ReactNode;
}

/**
 * Wraps a control with its label, hint and error, and hands back the aria
 * wiring. Using a render prop rather than cloning children keeps the
 * relationship explicit at every call site.
 */
export function Field({
  label,
  hint,
  error,
  required = false,
  optional = false,
  className,
  children,
}: FieldProps): React.JSX.Element {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="flex items-baseline gap-2 text-sm font-medium text-ink">
        {label}
        {required ? (
          <span className="text-reject" aria-hidden="true">
            *
          </span>
        ) : null}
        {optional ? <span className="text-micro font-normal text-ink-subtle">Optional</span> : null}
      </label>

      {hint ? (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}

      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
        'aria-required': required || undefined,
      })}

      {error ? (
        <p id={errorId} role="alert" className="flex items-start gap-1.5 text-xs text-reject-strong">
          <svg viewBox="0 0 16 16" className="mt-0.5 size-3.5 shrink-0" aria-hidden="true">
            <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="8" cy="11.25" r="0.85" fill="currentColor" />
          </svg>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  /** Monospace, tabular rendering for SSNs, EINs, routing numbers, amounts. */
  numeric?: boolean;
  /** A fixed prefix such as a currency sign, rendered inside the control. */
  prefix?: string;
}

export function Input({
  invalid = false,
  numeric = false,
  prefix,
  className,
  ...rest
}: InputProps): React.JSX.Element {
  const control = (
    <input
      {...rest}
      className={cn(
        controlBase,
        invalid ? controlInvalid : controlIdle,
        'h-10 text-sm',
        numeric && 'font-mono tabular tracking-[0.01em]',
        prefix && 'pl-7',
        className,
      )}
    />
  );

  if (!prefix) return control;
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-ink-subtle"
      >
        {prefix}
      </span>
      {control}
    </div>
  );
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export function Select({
  invalid = false,
  className,
  children,
  ...rest
}: SelectProps): React.JSX.Element {
  return (
    <div className="relative">
      <select
        {...rest}
        className={cn(
          controlBase,
          invalid ? controlInvalid : controlIdle,
          'h-10 appearance-none pr-9 text-sm',
          className,
        )}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 16 16"
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-ink-subtle"
      >
        <path
          d="m4 6.5 4 4 4-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export function Textarea({
  invalid = false,
  className,
  ...rest
}: TextareaProps): React.JSX.Element {
  return (
    <textarea
      {...rest}
      className={cn(
        controlBase,
        invalid ? controlInvalid : controlIdle,
        'min-h-24 py-2.5 text-sm leading-relaxed',
        className,
      )}
    />
  );
}

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
  hint?: ReactNode;
}

export function Checkbox({ label, hint, className, ...rest }: CheckboxProps): React.JSX.Element {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={cn('flex gap-2.5', className)}>
      <input
        {...rest}
        id={id}
        type="checkbox"
        aria-describedby={hintId}
        className="mt-0.5 size-4 shrink-0 rounded-xs border-line-strong accent-[var(--gt-accent)]"
      />
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm text-ink">
          {label}
        </label>
        {hint ? (
          <p id={hintId} className="mt-0.5 text-xs text-ink-muted">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Groups related fields under a legend, with the spacing the forms rely on. */
export function FieldSet({
  legend,
  description,
  className,
  children,
}: {
  legend: ReactNode;
  description?: ReactNode;
  className?: string;
  children: ReactNode;
}): React.JSX.Element {
  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="text-ui font-semibold text-ink">{legend}</legend>
      {description ? <p className="mt-1 text-sm text-ink-muted">{description}</p> : null}
      <div className="mt-4 grid gap-4">{children}</div>
    </fieldset>
  );
}
