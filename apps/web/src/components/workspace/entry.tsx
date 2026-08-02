'use client';

import { useEffect, useMemo, useState } from 'react';
import type { DiagnosticSeverity } from '@ghimtech-tax/tax-engine-federal';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { Input, Select } from '@/components/ui/form';
import { SeverityBadge } from '@/components/ui/surface';
import { DocumentPanel } from '@/components/workspace/document-viewer';
import { markReturnDirty } from '@/components/workspace/status';
import type { EntryField, SectionForm } from '@/components/workspace/section-fields';
import type { SourceDocument } from '@/lib/demo/filing';

/**
 * The data-entry workspace.
 *
 * Two presentations of the same section, because two jobs are done at this
 * screen. A preparer transcribing a W-2 wants a dense grid whose tab order runs
 * down the form exactly as the boxes are printed. A preparer sitting with a
 * client wants one question at a time, phrased the way they would say it out
 * loud. Neither is a lesser version of the other, so the switch is a first-class
 * control rather than a preference buried in settings.
 *
 * Validation happens when a field is left, not while it is being typed. Marking
 * "8,4" as malformed while someone is still typing "8,400.00" teaches them to
 * ignore the product's errors, which is the last thing a diagnostics-led tool
 * can afford.
 */

export interface FieldFinding {
  path: string;
  code: string;
  severity: DiagnosticSeverity;
  message: string;
}

export interface SectionEntryProps {
  form: SectionForm;
  documents: readonly SourceDocument[];
  findings: readonly FieldFinding[];
  /** The field a diagnostic sent the reader to. */
  activeField?: string | undefined;
  totalLabel?: string | undefined;
}

function domId(path: string): string {
  return `field-${path.replace(/[^a-zA-Z0-9]+/g, '-')}`;
}

const AMOUNT_SHAPE = /^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/;

function validate(field: EntryField, raw: string): string | undefined {
  const value = raw.trim();
  if (value.length === 0) {
    return field.required === true ? `${field.label} is required.` : undefined;
  }

  switch (field.kind) {
    case 'amount':
      return AMOUNT_SHAPE.test(value) ? undefined : 'Enter an amount, for example 1,234.56.';
    case 'ein': {
      const digits = value.replace(/[^0-9]/g, '');
      if (digits.length !== 9) return 'An employer identification number is nine digits.';
      if (digits.startsWith('00')) {
        return 'No employer identification number begins 00. Check box b of the W-2.';
      }
      return undefined;
    }
    case 'date':
      return /^\d{4}-\d{2}-\d{2}$/.test(value) ? undefined : 'Enter the date as YYYY-MM-DD.';
    case 'months': {
      const months = Number(value);
      return Number.isInteger(months) && months >= 0 && months <= 12
        ? undefined
        : 'Enter a whole number of months from 0 to 12.';
    }
    default:
      break;
  }

  if (field.path.endsWith('.state') && !/^[A-Za-z]{2}$/.test(value)) {
    return 'Use the two-letter state, territory or military post code.';
  }
  if (field.path.endsWith('.zip') && !/^\d{5}(-?\d{4})?$/.test(value)) {
    return 'Enter a five-digit ZIP code, or ZIP+4.';
  }
  if (field.path.endsWith('routingNumber') && !/^\d{9}$/.test(value)) {
    return 'A routing number is exactly nine digits.';
  }
  if (field.path.endsWith('identityProtectionPin') && !/^\d{6}$/.test(value)) {
    return 'An Identity Protection PIN is six digits.';
  }
  return undefined;
}

function FindingNote({ finding }: { finding: FieldFinding }): React.JSX.Element {
  return (
    <p className="mt-1 flex flex-wrap items-baseline gap-1.5 text-xs text-ink-muted">
      <SeverityBadge severity={finding.severity} />
      <span className="font-mono text-micro text-ink-subtle">{finding.code}</span>
      <span className="min-w-0">{finding.message}</span>
    </p>
  );
}

interface ControlProps {
  field: EntryField;
  value: string;
  error: string | undefined;
  describedBy: string | undefined;
  onChange: (value: string) => void;
  onBlur: () => void;
}

function Control({
  field,
  value,
  error,
  describedBy,
  onChange,
  onBlur,
}: ControlProps): React.JSX.Element {
  const shared = {
    id: domId(field.path),
    'aria-describedby': describedBy,
    'aria-invalid': error ? (true as const) : undefined,
    'aria-required': field.required === true ? (true as const) : undefined,
    onBlur,
  };

  if (field.kind === 'select') {
    return (
      <Select
        {...shared}
        value={value}
        invalid={Boolean(error)}
        onChange={(event) => onChange(event.target.value)}
      >
        {(field.options ?? []).map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
    );
  }

  if (field.kind === 'checkbox') {
    return (
      <span className="flex h-10 items-center">
        <input
          {...shared}
          type="checkbox"
          checked={value === 'yes'}
          onChange={(event) => onChange(event.target.checked ? 'yes' : 'no')}
          className="size-4 rounded-xs border-line-strong accent-[var(--gt-accent)]"
        />
      </span>
    );
  }

  if (field.kind === 'readonly' || field.kind === 'masked') {
    return (
      <span
        id={shared.id}
        tabIndex={-1}
        className="flex h-10 items-center justify-end rounded-md border border-line-subtle bg-surface-sunken px-3 font-mono text-sm tabular text-ink-muted"
      >
        {field.kind === 'readonly' ? `$${value}` : value}
      </span>
    );
  }

  const numeric = field.kind === 'amount' || field.kind === 'months' || field.kind === 'ein';
  return (
    <Input
      {...shared}
      value={value}
      invalid={Boolean(error)}
      numeric={numeric}
      inputMode={field.kind === 'amount' || field.kind === 'months' ? 'decimal' : undefined}
      prefix={field.kind === 'amount' ? '$' : undefined}
      className={field.kind === 'amount' ? 'text-right' : undefined}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function FieldRow({
  field,
  value,
  error,
  findings,
  active,
  onChange,
  onBlur,
}: {
  field: EntryField;
  value: string;
  error: string | undefined;
  findings: readonly FieldFinding[];
  active: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}): React.JSX.Element {
  const id = domId(field.path);
  const hintId = field.hint ?? field.note ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div
      className={cn(
        'grid gap-1 border-t border-line-subtle px-4 py-2 sm:grid-cols-[minmax(0,1fr)_15rem] sm:items-start sm:gap-4',
        active && 'bg-accent-tint',
      )}
    >
      <div className="min-w-0">
        <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-2 text-sm text-ink">
          {field.label}
          {field.required === true ? (
            <span aria-hidden="true" className="text-reject">
              *
            </span>
          ) : null}
          {field.box ? (
            <span className="font-mono text-micro text-ink-subtle">{field.box}</span>
          ) : null}
        </label>
        {field.hint ?? field.note ? (
          <p id={hintId} className="mt-0.5 text-micro text-ink-muted">
            {field.hint ?? field.note}
          </p>
        ) : null}
        {findings.map((finding) => (
          <FindingNote key={finding.code} finding={finding} />
        ))}
      </div>

      <div className="min-w-0">
        <Control
          field={field}
          value={value}
          error={error}
          describedBy={describedBy}
          onChange={onChange}
          onBlur={onBlur}
        />
        {error ? (
          <p id={errorId} role="alert" className="mt-1 text-micro text-reject-strong">
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function initialValues(fields: readonly EntryField[]): Record<string, string> {
  return Object.fromEntries(
    fields.map((field) => [
      field.path,
      field.kind === 'checkbox' ? (field.checked === true ? 'yes' : 'no') : field.value,
    ]),
  );
}

export function SectionEntry({
  form,
  documents,
  findings,
  activeField,
  totalLabel,
}: SectionEntryProps): React.JSX.Element {
  const fields = useMemo(() => form.groups.flatMap((group) => group.fields), [form]);
  const [mode, setMode] = useState<'form' | 'interview'>('form');
  const [values, setValues] = useState<Record<string, string>>(() => initialValues(fields));
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [step, setStep] = useState(0);

  // Reset when the reader moves to another section: one section's values are not
  // another's, and React keeps component state across a route change.
  useEffect(() => {
    setValues(initialValues(fields));
    setErrors({});
    setStep(0);
  }, [fields]);

  // Following a diagnostic should land on the field, not near it.
  useEffect(() => {
    if (activeField === undefined) return;
    const index = fields.findIndex((field) => field.path === activeField);
    if (index >= 0) setStep(index);
    const element = document.getElementById(domId(activeField));
    if (!element) return;
    element.scrollIntoView({ block: 'center', behavior: 'smooth' });
    element.focus({ preventScroll: true });
  }, [activeField, fields]);

  function findingsFor(path: string): readonly FieldFinding[] {
    return findings.filter((finding) => finding.path === path);
  }

  function change(field: EntryField, next: string): void {
    setValues((current) => ({ ...current, [field.path]: next }));
    markReturnDirty();
  }

  function blur(field: EntryField): void {
    const raw = values[field.path] ?? '';
    setErrors((current) => ({ ...current, [field.path]: validate(field, raw) }));
  }

  const current = fields[step];
  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <div className="flex min-h-0 flex-col xl:flex-row">
      <div className="order-first border-b border-line-subtle px-4 py-2 xl:order-none xl:contents">
        <DocumentPanel documents={documents} activeField={activeField} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-line-subtle px-4 py-2.5">
          <div
            role="group"
            aria-label="Entry mode"
            className="flex rounded-md border border-line bg-surface p-0.5"
          >
            {(['form', 'interview'] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => setMode(option)}
                className={cn(
                  'rounded-sm px-3 py-1 text-xs font-medium transition-colors',
                  mode === option
                    ? 'bg-accent-tint text-accent-text'
                    : 'text-ink-muted hover:text-ink',
                )}
              >
                {option === 'form' ? 'Form' : 'Interview'}
              </button>
            ))}
          </div>

          <p className="text-micro text-ink-subtle">
            {mode === 'form'
              ? 'Tab moves through the fields in the order the form prints them.'
              : `Question ${Math.min(step + 1, fields.length)} of ${fields.length}.`}
          </p>

          {errorCount > 0 ? (
            <p role="status" className="text-micro text-reject-strong">
              {errorCount} field{errorCount === 1 ? '' : 's'} to correct before this section is
              complete.
            </p>
          ) : null}
        </div>

        {mode === 'form' ? (
          <form
            aria-label={`${form.title} — data entry`}
            onSubmit={(event) => event.preventDefault()}
          >
            {form.groups.map((group) => (
              <fieldset key={group.id} className="border-b border-line-subtle last:border-b-0">
                <legend className="w-full bg-surface-sunken px-4 py-2 text-xs font-semibold uppercase tracking-[0.06em] text-ink-muted">
                  {group.title}
                </legend>
                {group.description ? (
                  <p className="px-4 pb-1 pt-2 text-micro text-ink-muted">{group.description}</p>
                ) : null}
                {group.fields.map((field) => (
                  <FieldRow
                    key={field.path}
                    field={field}
                    value={values[field.path] ?? ''}
                    error={errors[field.path]}
                    findings={findingsFor(field.path)}
                    active={activeField === field.path}
                    onChange={(next) => change(field, next)}
                    onBlur={() => blur(field)}
                  />
                ))}
              </fieldset>
            ))}
            {totalLabel ? (
              <p className="border-t border-line px-4 py-3 text-right font-mono text-sm tabular text-ink">
                {totalLabel}
              </p>
            ) : null}
          </form>
        ) : (
          <div className="px-4 py-6">
            <div
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={fields.length}
              aria-valuenow={step + 1}
              aria-label="Interview progress"
              className="h-1 w-full overflow-hidden rounded-full bg-surface-sunken"
            >
              <div
                className="h-full bg-accent transition-[width] duration-200"
                style={{ width: `${((step + 1) / Math.max(fields.length, 1)) * 100}%` }}
              />
            </div>

            {current ? (
              <div className="mx-auto mt-6 max-w-xl">
                <p className="text-eyebrow font-semibold uppercase text-ink-subtle">
                  {form.title}
                  {current.box ? ` · ${current.box}` : ''}
                </p>
                <h3 className="mt-2 text-h3 font-semibold text-ink">
                  {current.question ?? current.label}
                </h3>
                {current.help ? <p className="mt-2 text-sm text-ink-muted">{current.help}</p> : null}

                <div className="mt-5 max-w-sm">
                  <FieldRow
                    field={current}
                    value={values[current.path] ?? ''}
                    error={errors[current.path]}
                    findings={findingsFor(current.path)}
                    active={activeField === current.path}
                    onChange={(next) => change(current, next)}
                    onBlur={() => blur(current)}
                  />
                </div>

                <div className="mt-6 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={step === 0}
                    onClick={() => setStep((value) => Math.max(0, value - 1))}
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    disabled={step >= fields.length - 1}
                    onClick={() => {
                      blur(current);
                      setStep((value) => Math.min(fields.length - 1, value + 1));
                    }}
                  >
                    Next question
                  </Button>
                  <span className="ml-auto font-mono text-micro tabular text-ink-subtle">
                    {step + 1} / {fields.length}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-ink-muted">This section has no questions to ask.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
