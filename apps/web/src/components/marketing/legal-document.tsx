import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * The frame the privacy policy and the terms of use are set in.
 *
 * A legal document is only useful if a reader can get to clause nine without
 * scrolling past eight, so the contents list is a real navigation landmark and
 * sticks to the viewport from the large breakpoint up. Below that it sits
 * inline at the top, where it costs one screen and saves ten.
 *
 * Sections are numbered from the array index rather than typed into each
 * heading — inserting a clause should not mean renumbering the document by
 * hand and getting it wrong.
 */

export interface LegalSection {
  /** Stable anchor. Changing one breaks every link anyone has ever sent. */
  id: string;
  title: string;
  body: ReactNode;
}

export function LegalDocument({
  sections,
  preamble,
  postscript,
  className,
}: {
  sections: LegalSection[];
  /** Prose that sits above clause one — scope, plain-language summary. */
  preamble?: ReactNode;
  /** The review-status note that closes the document. */
  postscript?: ReactNode;
  className?: string;
}): React.JSX.Element {
  return (
    <div className={cn('rail py-12 md:py-16', className)}>
      <div className="grid gap-12 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <nav
          aria-label="Sections of this document"
          className="lg:sticky lg:top-10 lg:max-h-[calc(100dvh-6rem)] lg:self-start lg:overflow-y-auto"
        >
          <h2 className="text-eyebrow font-semibold uppercase tracking-[0.09em] text-ink-subtle">
            On this page
          </h2>
          <ol className="mt-4 flex flex-col gap-2.5 border-l border-line-subtle pl-4">
            {sections.map((section, index) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex gap-2 text-sm text-ink-muted transition-colors hover:text-accent-text"
                >
                  <span aria-hidden="true" className="tabular w-5 shrink-0 text-ink-subtle">
                    {index + 1}.
                  </span>
                  <span>{section.title}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="min-w-0">
          {preamble ? (
            <div className="flex max-w-prose flex-col gap-5 text-body text-ink-muted">
              {preamble}
            </div>
          ) : null}

          <div className="mt-12 flex flex-col gap-12">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
                className="max-w-prose scroll-mt-24 border-t border-line-subtle pt-8"
              >
                <h2 id={`${section.id}-heading`} className="flex gap-3 text-h3 font-semibold text-ink">
                  <span aria-hidden="true" className="tabular text-ink-subtle">
                    {index + 1}.
                  </span>
                  <span>{section.title}</span>
                </h2>
                <div className="mt-4 flex flex-col gap-4 text-body text-ink-muted">
                  {section.body}
                </div>
              </section>
            ))}
          </div>

          {postscript ? <div className="mt-12 max-w-prose">{postscript}</div> : null}
        </article>
      </div>
    </div>
  );
}
