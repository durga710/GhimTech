'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/surface';
import { Button } from '@/components/ui/button';
import type { DocumentBox, SourceDocument } from '@/lib/demo/filing';

/**
 * The source document, beside the field being keyed.
 *
 * A preparer working from a W-2 reads a box, types it, reads the next box. Every
 * time that loop requires leaving the screen — a second window, a printout, a
 * scan in another tab — a digit gets lost. So the document sits in the
 * workspace, boxes numbered as they are on the paper, and the box feeding the
 * current field is marked.
 *
 * The frame is drawn from the keyed values with the design system's own tokens.
 * It is deliberately not a picture of a form: a rendered document stays legible
 * at any zoom, respects the reader's theme, and can be read aloud by a screen
 * reader, none of which is true of a scan. The panel says so plainly, and the
 * original is one link away.
 */

function BoxRow({ box, active }: { box: DocumentBox; active: boolean }): React.JSX.Element {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-3 border-b border-line-subtle px-3 py-1.5 last:border-b-0',
        active && 'bg-accent-tint ring-1 ring-inset ring-accent-edge',
      )}
    >
      <span className="flex min-w-0 items-baseline gap-2">
        <span className="w-7 shrink-0 font-mono text-micro tabular text-ink-subtle">{box.box}</span>
        <span className="min-w-0 text-micro leading-snug text-ink-muted">{box.label}</span>
      </span>
      <span
        className={cn(
          'shrink-0 text-xs text-ink',
          box.numeric ? 'font-mono tabular' : 'text-right',
          active && 'font-semibold',
        )}
      >
        {box.value}
        {active ? <span className="sr-only"> — the box being keyed</span> : null}
      </span>
    </div>
  );
}

function DocumentFrame({
  source,
  activeField,
}: {
  source: SourceDocument;
  activeField: string | undefined;
}): React.JSX.Element {
  const activeBox = source.boxes.find((box) => box.fieldPath === activeField);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line-subtle px-4 py-3">
        <p className="text-eyebrow font-semibold uppercase text-ink-subtle">{source.kind}</p>
        <p className="mt-1 text-sm font-semibold text-ink">{source.title}</p>
        <p className="text-micro text-ink-muted">{source.subtitle}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <Badge tone="neutral">{source.belongsTo}</Badge>
          <Badge tone={source.status === 'Keyed and matched' ? 'success' : 'warning'}>
            {source.status}
          </Badge>
          <span className="text-micro text-ink-subtle">
            {source.source} · {source.receivedLabel} · {source.pages} page
            {source.pages === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {activeBox ? (
          <p className="mb-2 rounded-sm border border-accent-edge bg-accent-tint px-2.5 py-1.5 text-micro text-accent-text">
            Keying box {activeBox.box === '' ? '—' : activeBox.box}: {activeBox.label}
          </p>
        ) : null}

        {/* The document itself: a sheet, ruled like the form it stands for. */}
        <div className="overflow-hidden rounded-md border border-line bg-surface shadow-sm">
          <div className="flex items-baseline justify-between border-b border-line bg-surface-sunken px-3 py-2">
            <span className="text-micro font-semibold uppercase tracking-[0.07em] text-ink-muted">
              {source.kind}
            </span>
            <span className="font-mono text-micro tabular text-ink-subtle">Tax year 2025</span>
          </div>
          {source.boxes.map((box) => (
            <BoxRow
              key={`${box.box}-${box.label}`}
              box={box}
              active={activeField !== undefined && box.fieldPath === activeField}
            />
          ))}
        </div>

        <p className="mt-2.5 text-micro text-ink-subtle">
          Rendered from the values keyed into this return, not from the scan. Open the file in
          Documents to compare it against the original.
        </p>
      </div>
    </div>
  );
}

function DocumentPicker({
  documents,
  selectedId,
  onSelect,
}: {
  documents: readonly SourceDocument[];
  selectedId: string;
  onSelect: (id: string) => void;
}): React.JSX.Element | null {
  if (documents.length < 2) return null;
  return (
    <div
      role="tablist"
      aria-label="Source documents"
      className="flex gap-1 overflow-x-auto border-b border-line-subtle px-3 py-2"
    >
      {documents.map((source) => {
        const selected = source.id === selectedId;
        return (
          <button
            key={source.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(source.id)}
            className={cn(
              'whitespace-nowrap rounded-full border px-2.5 py-1 text-micro transition-colors',
              selected
                ? 'border-accent-edge bg-accent-tint font-semibold text-accent-text'
                : 'border-line-subtle text-ink-muted hover:border-line hover:text-ink',
            )}
          >
            {source.kind} · {source.belongsTo}
          </button>
        );
      })}
    </div>
  );
}

export interface DocumentPanelProps {
  documents: readonly SourceDocument[];
  /** The field currently being keyed; its box is marked in the frame. */
  activeField?: string | undefined;
}

export function DocumentPanel({ documents, activeField }: DocumentPanelProps): React.JSX.Element {
  const fallback = documents[0];
  const fromField = documents.find((source) =>
    source.boxes.some((box) => box.fieldPath === activeField),
  );
  const [selectedId, setSelectedId] = useState<string>(fromField?.id ?? fallback?.id ?? '');
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const dialogTitleId = useId();
  const openerId = useId();

  // A diagnostic that sends the preparer to a field also changes which document
  // is worth looking at. Following it is the whole point of the panel.
  useEffect(() => {
    if (fromField) setSelectedId(fromField.id);
  }, [fromField]);

  const close = useCallback(() => {
    setOpen(false);
    document.getElementById(openerId)?.focus();
  }, [openerId]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function onKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== 'Tab') return;
      const panel = dialogRef.current;
      if (!panel) return;
      const focusable = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    dialogRef.current?.querySelector<HTMLElement>('button')?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, close]);

  const selected = documents.find((source) => source.id === selectedId) ?? fallback;

  if (!selected) {
    return (
      <aside
        aria-label="Source document"
        className="hidden w-80 shrink-0 border-l border-line-subtle xl:block"
      >
        <p className="px-4 py-6 text-sm text-ink-muted">
          No source document has been attached to this section yet.
        </p>
      </aside>
    );
  }

  return (
    <>
      {/* Extra-wide: the document sits beside the fields, permanently. */}
      <aside
        aria-label="Source document"
        className="hidden w-80 shrink-0 border-l border-line-subtle bg-canvas-alt xl:flex xl:flex-col"
      >
        <div className="sticky top-0 flex max-h-[calc(100dvh-3rem)] flex-col">
          <DocumentPicker documents={documents} selectedId={selected.id} onSelect={setSelectedId} />
          <DocumentFrame source={selected} activeField={activeField} />
        </div>
      </aside>

      {/* Narrower: a control that opens the same panel over the workspace. */}
      <div className="xl:hidden">
        <Button
          id={openerId}
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={open}
          leading={
            <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5">
              <rect
                x="3"
                y="1.75"
                width="10"
                height="12.5"
                rx="1.75"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              />
              <path
                d="M5.75 5.5h4.5M5.75 8h4.5M5.75 10.5h2.5"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
          }
        >
          Source document
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex justify-end xl:hidden">
          <button
            type="button"
            aria-label="Close the source document"
            onClick={close}
            className="absolute inset-0 bg-surface-inverse/40"
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="relative flex h-full w-full max-w-sm flex-col border-l border-line bg-canvas shadow-lg"
          >
            <div className="flex items-center justify-between gap-3 border-b border-line-subtle px-4 py-3">
              <h2 id={dialogTitleId} className="text-ui font-semibold text-ink">
                Source document
              </h2>
              <Button type="button" variant="ghost" size="sm" onClick={close}>
                Close
              </Button>
            </div>
            <DocumentPicker
              documents={documents}
              selectedId={selected.id}
              onSelect={setSelectedId}
            />
            <DocumentFrame source={selected} activeField={activeField} />
          </div>
        </div>
      ) : null}
    </>
  );
}
