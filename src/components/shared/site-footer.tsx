import Link from "next/link";
import { COMPANY, FOUNDER, FOOTER_LINKS, NAV } from "@/lib/content";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-28 overflow-hidden border-t border-white/[0.07]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-300/50 to-transparent" />
      <div className="container relative grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" aria-label="GhimTech home" className="inline-flex text-white">
            <Logo variant="lockup" size={32} />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
            {COMPANY.shortPositioning}
          </p>
          <div className="mt-5 control-chip w-fit">{COMPANY.proofLine}</div>
        </div>

        <div className="md:col-span-3">
          <div className="label-tactical mb-4">Company</div>
          <ul className="space-y-2.5">
            {NAV.slice(0, -1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="label-tactical mb-4">Products</div>
          <ul className="space-y-2.5">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="label-tactical mb-4">Contact</div>
          <a href={`mailto:${FOUNDER.email}`} className="text-sm text-zinc-400 transition-colors hover:text-signal-200">
            {FOUNDER.email}
          </a>
        </div>
      </div>

      <div className="container flex flex-col gap-3 border-t border-white/[0.06] py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} {COMPANY.name}. All rights reserved.</span>
        <span className="font-mono uppercase tracking-tactical">AI-native software for serious work</span>
      </div>
    </footer>
  );
}
