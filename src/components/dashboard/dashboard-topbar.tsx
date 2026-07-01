"use client";

import { motion } from "framer-motion";
import { Bell, Command, LogOut, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { signOutAction } from "@/app/auth/actions";

/**
 * Dashboard top bar.
 *
 * Sits at the top of the main content column (NOT spanning full width — the
 * sidebar takes the left rail). Contains:
 *   - Search field with ⌘K hint
 *   - Notifications bell with unread indicator
 *   - App-owned sign-out control
 *
 * The command palette itself is a Phase 7 polish item — this just shows
 * the trigger so the muscle memory is built early.
 */
export function DashboardTopbar() {
  const [now, setNow] = useState<string>("");

  // Live clock — operator surfaces should always show current time
  useEffect(() => {
    const update = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setNow(`${hh}:${mm}:${ss}`);
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="sticky top-0 z-30 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-2xl"
    >
      <div className="relative flex items-center gap-3 px-6 py-3">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
        />
        {/* Search */}
        <button
          type="button"
          className="group flex flex-1 max-w-md items-center gap-2.5 rounded-full border border-white/[0.06]
                     bg-white/[0.04] px-4 py-2.5 text-left transition-all hover:border-white/[0.14] hover:bg-white/[0.06]"
        >
          <Search className="h-4 w-4 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
          <span className="text-sm text-zinc-500">Search projects, tasks…</span>
          <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-zinc-600">
            <Command className="h-3 w-3" />
            <span>K</span>
          </span>
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Live clock */}
        <div className="hidden items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.03] px-3 py-1.5 md:flex">
          <span className="status-dot status-dot-live" />
          <span className="font-mono text-xs text-zinc-300 tabular-nums">{now}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative grid h-10 w-10 place-items-center rounded-full border border-white/[0.06]
                     bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/[0.14] hover:text-white hover:bg-white/[0.06]"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-flare-400 animate-pulse-vital" />
        </button>

        {/* Sign out */}
        <form action={signOutAction}>
          <button
            type="submit"
            aria-label="Sign out"
            title="Sign out"
            className="grid h-10 w-10 place-items-center rounded-full border border-white/[0.06]
                       bg-white/[0.03] text-zinc-400 transition-colors hover:border-white/[0.14] hover:text-white hover:bg-white/[0.06]"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </motion.header>
  );
}
