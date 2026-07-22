import Link from "next/link";
import { COMPANY, FOUNDER, FOOTER_LINKS, NAV } from "@/lib/content";
import { Logo } from "@/components/shared/logo";

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-slate-950 text-white">
      <div className="container relative grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" aria-label="GhimTech home" className="inline-flex text-white">
            <Logo variant="lockup" size={32} />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-400">
            {COMPANY.shortPositioning}
          </p>
          <div className="mt-5 control-chip w-fit">{COMPANY.proofLine}</div>
        </div>

        <div className="md:col-span-3">
          <div className="label-tactical mb-4">Company</div>
          <ul className="space-y-2.5">
            {NAV.slice(0, -1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
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
                <Link href={item.href} className="text-sm text-slate-400 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="label-tactical mb-4">Contact</div>
          <a href={`mailto:${FOUNDER.email}`} className="text-sm text-slate-400 transition-colors hover:text-white">
            {FOUNDER.email}
          </a>
        </div>
      </div>

      <div className="container flex flex-col gap-3 border-t border-slate-800 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} {COMPANY.name}. All rights reserved.</span>
        <span className="font-mono uppercase tracking-tactical">AI-native software for serious work</span>
      </div>
    </footer>
  );
}
