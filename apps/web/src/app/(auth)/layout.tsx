import Link from 'next/link';
import type { ReactNode } from 'react';
import { GhimTechTaxLockup } from '@/components/brand/logo';

/**
 * The sign-in frame.
 *
 * A form column and a quiet ink rail. The rail describes what the product does
 * and what happens next — it is orientation for somebody who has been handed a
 * login, not a place to sell anything. Nobody reads a pitch on the way into
 * their own workspace.
 *
 * The form column comes first in the document so a keyboard reaches the fields
 * without traversing the rail.
 */
export default function AuthLayout({ children }: { children: ReactNode }): React.JSX.Element {
  const steps = [
    { step: 'Intake', text: 'Client details and the questions that shape the return.' },
    { step: 'Preparation', text: 'Source documents classified and entered.' },
    { step: 'Review', text: 'Diagnostics resolved, then a second set of eyes.' },
    { step: 'Signature', text: 'The taxpayer authorises the return for filing.' },
    { step: 'Filing', text: 'Transmission, and the acknowledgement that follows.' },
  ];

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[minmax(0,1fr)_26rem] xl:grid-cols-[minmax(0,1fr)_32rem]">
      <div className="flex min-h-dvh flex-col lg:min-h-0">
        <header className="px-5 pt-6 sm:px-8">
          <Link href="/" className="inline-flex rounded-sm" aria-label="GhimTech Tax, home">
            <GhimTechTaxLockup markSize={30} />
          </Link>
        </header>

        <main id="main" className="flex flex-1 items-center px-5 py-10 sm:px-8">
          <div className="mx-auto w-full max-w-[26rem]">{children}</div>
        </main>

        <footer className="px-5 pb-6 sm:px-8">
          <nav
            aria-label="Legal"
            className="flex flex-wrap gap-x-4 gap-y-1 text-micro text-ink-subtle"
          >
            <Link href="/privacy" className="rounded-xs hover:text-ink">
              Privacy policy
            </Link>
            <Link href="/terms" className="rounded-xs hover:text-ink">
              Terms of use
            </Link>
            <Link href="/accessibility" className="rounded-xs hover:text-ink">
              Accessibility statement
            </Link>
            <Link href="/contact" className="rounded-xs hover:text-ink">
              Contact
            </Link>
          </nav>
        </footer>
      </div>

      <aside className="hidden bg-surface-inverse px-10 py-12 text-ink-inverse lg:flex lg:flex-col lg:justify-center">
        <div className="max-w-sm">
          <p className="text-eyebrow font-semibold uppercase tracking-[0.09em] opacity-60">
            The workspace
          </p>
          <h2 className="mt-3 text-h3 font-semibold">
            Federal and Pennsylvania returns, from intake to transmission.
          </h2>
          <p className="mt-4 text-sm leading-relaxed opacity-75">
            GhimTech Tax is the preparation software your practice works in. Client records,
            uploaded source documents, the return itself, the diagnostics that run against it, the
            signature, and the submission all live in one place.
          </p>

          <ol className="mt-8 flex flex-col gap-4">
            {steps.map((item, index) => (
              <li key={item.step} className="flex gap-3.5">
                <span
                  aria-hidden="true"
                  className="tabular mt-0.5 grid size-6 shrink-0 place-items-center rounded-full border border-current text-micro font-semibold opacity-60"
                >
                  {index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{item.step}</span>
                  <span className="mt-0.5 block text-xs opacity-70">{item.text}</span>
                </span>
              </li>
            ))}
          </ol>

          <p className="mt-10 border-t border-current pt-5 text-xs opacity-60">
            Access is per person, not per practice. Every sign-in, document and change of state is
            written to an audit history an administrator can read.
          </p>
        </div>
      </aside>
    </div>
  );
}
