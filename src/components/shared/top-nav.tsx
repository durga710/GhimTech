"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/company";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

/**
 * Top nav.
 *
 * Glassy, fixed at the top of every public page. Active route gets a soft
 * pill that animates between items via Framer's `layoutId`. On small screens
 * the routes collapse into a full-width glass sheet behind a menu button.
 */
export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[min(1100px,calc(100vw-2rem))]"
    >
      <nav className="glass-panel-strong flex items-center justify-between px-2 py-2">
        {/* Brand lockup — canonical GhimTech mark + wordmark */}
        <Link
          href="/"
          aria-label="GhimTech home"
          className="group flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-full transition-colors hover:bg-white/[0.04]"
        >
          <Logo variant="mark" size={26} className="text-signal-400" />
          <Logo variant="wordmark" size={18} className="hidden sm:inline-block text-white" />
        </Link>

        {/* Routes — desktop */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = isActive(item.href);
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

        <div className="flex items-center gap-1.5">
          {/* CTA */}
          <Link
            href="/contact"
            className="hidden sm:inline-flex items-center gap-1.5 mr-1 px-3.5 py-1.5 rounded-full
                       text-[13px] font-medium text-white
                       bg-gradient-to-b from-signal-400 to-signal-500
                       shadow-[0_0_24px_-6px_rgba(58,164,255,0.6)]
                       transition-transform hover:-translate-y-px"
          >
            Get in touch
          </Link>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-full
                       text-zinc-300 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden mt-2 glass-panel-strong p-2"
          >
            <ul className="flex flex-col">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "block px-4 py-3 rounded-xl text-sm transition-colors",
                        active ? "text-white bg-white/[0.06]" : "text-zinc-300 hover:bg-white/[0.04]"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
              <li className="pt-1">
                <Link
                  href="/contact"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-3 rounded-xl text-sm font-medium text-white text-center
                             bg-gradient-to-b from-signal-400 to-signal-500"
                >
                  Get in touch
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
