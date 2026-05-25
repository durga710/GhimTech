"use client";

import { UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Search, Bell, Command } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Dashboard top bar.
 *
 * Sits at the top of the main content column (NOT spanning full width — the
 * sidebar takes the left rail). Contains:
 *   - Search field with ⌘K hint
 *   - Notifications bell with unread indicator
 *   - Clerk UserButton (handles all session UI)
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
      className="sticky top-0 z-30 backdrop-blur-xl bg-ink-950/60 border-b border-white/[0.06]"
    >
      <div className="flex items-center gap-3 px-6 py-3">
        {/* Search */}
        <button
          type="button"
          className="group flex items-center gap-2.5 flex-1 max-w-md px-3 py-2 rounded-lg
                     bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]
                     text-left transition-colors"
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
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.02] border border-white/[0.04]">
          <span className="status-dot status-dot-live" />
          <span className="font-mono text-xs text-zinc-300 tabular-nums">{now}</span>
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative grid place-items-center h-9 w-9 rounded-lg
                     bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12]
                     text-zinc-400 hover:text-white transition-colors"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-flare-400 animate-pulse-vital" />
        </button>

        {/* User */}
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-9 w-9 ring-1 ring-white/10",
              userButtonPopoverCard:
                "bg-ink-900/95 backdrop-blur-xl border border-white/[0.08]",
              userButtonPopoverActionButton: "text-zinc-300 hover:text-white",
              userButtonPopoverActionButtonText: "text-current",
            },
            variables: {
              colorPrimary: "#3aa4ff",
              colorBackground: "rgba(7,8,12,0.95)",
              colorText: "#f4f6fa",
              colorTextSecondary: "#a1a1aa",
              fontFamily: "Geist, system-ui, sans-serif",
            },
          }}
          afterSignOutUrl="/"
        />
      </div>
    </motion.header>
  );
}
