'use client';

import { useId } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Select } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Icon } from './icons';

/**
 * The strip above a table.
 *
 * Every control is labelled — visibly where there is room, and to assistive
 * technology always. A filter row of unlabelled dropdowns is the single most
 * common way a dense product becomes unusable by keyboard.
 */
export function FilterBar({
  children,
  trailing,
  className,
}: {
  children: ReactNode;
  trailing?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex flex-wrap items-end gap-x-3 gap-y-3 rounded-lg border border-line-subtle bg-surface px-3 py-3',
        className,
      )}
    >
      {children}
      {trailing ? <div className="ml-auto flex items-center gap-2">{trailing}</div> : null}
    </div>
  );
}

export function SearchInput({
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}): React.JSX.Element {
  const id = useId();
  return (
    <div className={cn('flex min-w-0 flex-1 basis-56 flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-micro font-medium uppercase tracking-[0.07em] text-ink-subtle"
      >
        {label}
      </label>
      <div className="relative">
        <Icon
          name="search"
          className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-subtle"
        />
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-full rounded-md border border-line bg-surface pl-8 pr-3 text-sm text-ink placeholder:text-ink-subtle transition-colors hover:border-line-strong"
        />
      </div>
    </div>
  );
}

export interface FilterOption {
  value: string;
  label: string;
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  className?: string;
}): React.JSX.Element {
  const id = useId();
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-micro font-medium uppercase tracking-[0.07em] text-ink-subtle"
      >
        {label}
      </label>
      <Select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full min-w-[9.5rem] text-sm"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

/** Shown only when something is actually filtered, so it is never dead weight. */
export function ResetFilters({
  active,
  onReset,
}: {
  active: boolean;
  onReset: () => void;
}): React.JSX.Element | null {
  if (!active) return null;
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onReset}
      leading={<Icon name="close" className="size-3.5" />}
    >
      Clear filters
    </Button>
  );
}
