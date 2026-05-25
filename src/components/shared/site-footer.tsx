import Link from "next/link";
import { FOUNDER, NAV } from "@/lib/content";
import { Logo } from "@/components/shared/logo";

/**
 * Site footer.
 *
 * Brand block leads with the canonical Ghimtech lockup. Durga's identity
 * sits below as personal context — the brand is the company, the founder
 * is one of the things behind it.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-white/5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-400/30 to-transparent" />

      <div className="container py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
        {/* Brand block — canonical lockup */}
        <div className="md:col-span-5 space-y-5">
          <Link
            href="/"
            aria-label="Ghimtech home"
            className="inline-flex items-center text-white hover:text-signal-300 transition-colors"
          >
            <Logo variant="lockup" size={32} />
          </Link>

          <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
            Building systems that improve care, accountability, and operational
            peace of mind.
          </p>
        </div>

        {/* Routes */}
        <div className="md:col-span-3">
          <div className="label-tactical mb-4">Navigate</div>
          <ul className="space-y-2.5">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  className="text-sm text-zinc-300 hover:text-white transition-colors"
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="md:col-span-4">
          <div className="label-tactical mb-4">Reach out</div>
          <a
            href={`mailto:${FOUNDER.email}`}
            className="block text-sm text-zinc-300 hover:text-signal-300 transition-colors"
          >
            {FOUNDER.email}
          </a>
          <div className="mt-6 flex items-center gap-2 text-xs text-zinc-500">
            <span className="status-dot status-dot-live" />
            <span className="font-mono uppercase tracking-tactical">
              Systems operational
            </span>
          </div>
        </div>
      </div>

      <div className="container py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-500 font-mono">
          © {year} Ghimtech · {FOUNDER.name}. All rights reserved.
        </div>
        <div className="text-xs text-zinc-500 font-mono tracking-tactical uppercase">
          Designed &amp; built with intention
        </div>
      </div>
    </footer>
  );
}
