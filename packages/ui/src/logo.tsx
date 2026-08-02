/**
 * The GhimTech "GT" monogram: interlocked angular G and T, navy strokes with
 * an azure accent — an SVG recreation of the company mark for crisp rendering
 * at any size. Drop the original raster logo into apps/web/public/ for
 * marketing surfaces; product chrome uses this vector.
 */

export function GTMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true" role="img">
      {/* G: angular octagonal sweep */}
      <path
        d="M38 10H20L10 20v24l10 10h14l8-8V32H28v8h6v6h-8l-6-6V22l6-6h12l4 4 6-6-6-6z"
        fill="currentColor"
      />
      {/* T: crossbar and stem */}
      <path d="M34 16h20v8H48v22l-8 8V24h-8l2-8z" fill="currentColor" opacity="0.88" />
      {/* Azure accents */}
      <path d="M28 46h8l-6 6h-8l6-6z" fill="#2E6BD6" />
      <path d="M48 40v6l-6 6h-6l12-12z" fill="#2E6BD6" />
    </svg>
  );
}

export function Wordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className="text-brand-700 dark:text-brand-100">
        <GTMark size={28} />
      </span>
      {!compact && (
        <span className="leading-none">
          <span className="block text-[15px] font-semibold tracking-tight text-brand-800 dark:text-white">
            GhimTech&nbsp;Tax
          </span>
          <span className="block text-[10px] font-medium uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
            Built by GhimTech
          </span>
        </span>
      )}
    </span>
  );
}
