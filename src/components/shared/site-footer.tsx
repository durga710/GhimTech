import Link from "next/link";
import { Github, Linkedin, Mail } from "lucide-react";
import { COMPANY, FOOTER_NAV, SOCIAL } from "@/lib/company";
import { Logo } from "@/components/shared/logo";

/**
 * Site footer.
 *
 * Leads with the canonical GhimTech lockup + mission, then a grouped site map
 * (Products / Company / Resources). Speaks as the company; the founder story
 * lives on /about.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-32 border-t border-white/5">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-400/30 to-transparent" />

      <div className="container py-16 grid grid-cols-2 md:grid-cols-12 gap-10 md:gap-12">
        {/* Brand block — canonical lockup */}
        <div className="col-span-2 md:col-span-4 space-y-5">
          <Link
            href="/"
            aria-label="GhimTech home"
            className="inline-flex items-center text-white hover:text-signal-300 transition-colors"
          >
            <Logo variant="lockup" size={30} />
          </Link>

          <p className="text-sm text-zinc-400 max-w-xs leading-relaxed">
            {COMPANY.positioning}
          </p>

          <div className="flex items-center gap-3 pt-1">
            <a
              href={SOCIAL.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GhimTech on GitHub"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
            >
              <Github size={16} />
            </a>
            <a
              href={SOCIAL.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="GhimTech on LinkedIn"
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
            >
              <Linkedin size={16} />
            </a>
            <a
              href={`mailto:${COMPANY.email}`}
              aria-label={`Email ${COMPANY.email}`}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-zinc-300 hover:text-white hover:border-white/25 transition-colors"
            >
              <Mail size={16} />
            </a>
          </div>
        </div>

        {/* Grouped site map */}
        {FOOTER_NAV.map((group) => (
          <div key={group.heading} className="md:col-span-2">
            <div className="label-tactical mb-4">{group.heading}</div>
            <ul className="space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-zinc-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Status */}
        <div className="md:col-span-2">
          <div className="label-tactical mb-4">Status</div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="status-dot status-dot-live" />
            <span className="font-mono uppercase tracking-tactical">All systems go</span>
          </div>
          <a
            href={`mailto:${COMPANY.email}`}
            className="mt-4 block text-sm text-zinc-400 hover:text-signal-300 transition-colors"
          >
            {COMPANY.email}
          </a>
        </div>
      </div>

      <div className="container py-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-zinc-500 font-mono">
          © {year} {COMPANY.name}. All rights reserved.
        </div>
        <div className="text-xs text-zinc-500 font-mono tracking-tactical uppercase">
          Engineered with intention
        </div>
      </div>
    </footer>
  );
}
