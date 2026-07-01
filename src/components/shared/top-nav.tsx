"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV } from "@/lib/content";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-3 z-50 px-3"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/[0.08] bg-ink-950/78 px-3 py-2.5 shadow-panel backdrop-blur-2xl">
        <Link
          href="/"
          aria-label="GhimTech home"
          className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-white transition-colors hover:bg-white/[0.04]"
          onClick={() => setOpen(false)}
        >
          <Logo variant="mark" size={28} className="text-signal-300" />
          <Logo variant="wordmark" size={18} className="hidden text-white sm:block" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.slice(0, -1).map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm transition-colors",
                    active ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/dashboard" className="btn-ghost px-4 py-2">
            Dashboard
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-200 md:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-white/[0.08] bg-ink-950/95 p-2 shadow-panel backdrop-blur-2xl md:hidden"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06]"
                onClick={() => setOpen(false)}
              >
                {item.label}
                <span className="h-1.5 w-1.5 rounded-full bg-signal-300" />
              </Link>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
