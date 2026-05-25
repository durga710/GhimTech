"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV } from "@/lib/content";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

/**
 * Top nav.
 * Stays glassy at the top of every public page. Highlights the active route
 * with a soft underline that uses Framer's `layoutId` so it animates between
 * items as you navigate.
 */
export function TopNav() {
  const pathname = usePathname();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1100px,calc(100vw-2rem))]"
    >
      <nav className="glass-panel-strong flex items-center justify-between px-2 py-2">
        {/* Brand lockup — canonical Ghimtech mark + wordmark */}
        <Link
          href="/"
          aria-label="Ghimtech home"
          className="group flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full transition-colors hover:bg-white/[0.04]"
        >
          {/* Mark in signal blue, wordmark on the right (hidden on small screens) */}
          <Logo variant="mark" size={26} className="text-signal-400" />
          <Logo
            variant="wordmark"
            size={18}
            className="hidden sm:inline-block text-white"
          />
        </Link>

        {/* Routes */}
        <ul className="flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-1.5 rounded-full text-[13px] transition-colors",
                    active ? "text-white" : "text-zinc-400 hover:text-zinc-100"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-white/[0.06] ring-1 ring-inset ring-white/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 mr-1 px-3.5 py-1.5 rounded-full
                     text-[13px] font-medium text-white
                     bg-gradient-to-b from-signal-400 to-signal-500
                     shadow-[0_0_24px_-6px_rgba(58,164,255,0.6)]
                     transition-transform hover:-translate-y-px"
        >
          <span className="status-dot status-dot-live" />
          Dashboard
        </Link>
      </nav>
    </motion.header>
  );
}
