"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  BarChart3,
  Bell,
  Inbox,
  Settings,
  ArrowLeft,
  Sparkles,
  Code2,
  Rocket,
} from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

/**
 * Dashboard sidebar.
 *
 * Fixed to the left of the dashboard layout — never scrolls. Mirrors the
 * "command center" aesthetic with a vertical rail of navigation icons and
 * a tactical label for each section.
 *
 * Mobile note: this is hidden under `lg` and replaced by a top sheet (TODO
 * in a polish phase). For Phase 4 we keep the desktop-first focus since
 * the dashboard is an operator surface, not a marketing page.
 */

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/inbox", label: "Inbox", icon: Inbox },
  { href: "/dashboard/projects", label: "Projects", icon: FolderKanban },
  { href: "/dashboard/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Alerts", icon: Bell },
  { href: "/dashboard/copilot", label: "AI Copilot", icon: Sparkles },
  { href: "/dashboard/gcode", label: "GCODE", icon: Rocket },
  { href: "/dashboard/code", label: "Code", icon: Code2 },
] as const;

export function DashboardSidebar({ inboxUnread = 0 }: { inboxUnread?: number }) {
  const pathname = usePathname();

  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 bottom-0 w-60 z-40
                 glass-panel-strong rounded-none border-r border-white/[0.06]
                 flex-col"
    >
      {/* Brand — canonical Ghimtech lockup */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <Link
          href="/"
          aria-label="Ghimtech home"
          className="group flex items-center gap-2.5"
        >
          <Logo variant="mark" size={28} className="text-signal-400" />
          <div className="flex flex-col leading-none">
            <Logo variant="wordmark" size={16} className="text-white" />
            <span className="label-tactical mt-1.5">Command center</span>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5">
        <div className="label-tactical px-2 mb-3">Operations</div>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    active
                      ? "text-white"
                      : "text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03]"
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="dash-active"
                      className="absolute inset-0 rounded-lg bg-white/[0.06] ring-1 ring-inset ring-signal-400/30"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="relative h-4 w-4 shrink-0" />
                  <span className="relative">{item.label}</span>
                  {item.label === "Alerts" && (
                    <span className="relative ml-auto h-1.5 w-1.5 rounded-full bg-flare-400 animate-pulse-vital" />
                  )}
                  {item.label === "Inbox" && inboxUnread > 0 && (
                    <span className="relative ml-auto grid h-[18px] min-w-[18px] place-items-center rounded-full bg-signal-400 px-1 text-[10px] font-bold text-ink-950">
                      {inboxUnread > 99 ? "99+" : inboxUnread}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer area */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.03] transition-colors"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.03] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to site
        </Link>

        <div className="mt-3 px-3 py-2.5 rounded-lg bg-vital-400/[0.04] border border-vital-400/[0.15]">
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot-live" />
            <span className="font-mono text-[10px] text-vital-300 uppercase tracking-tactical">
              System nominal
            </span>
          </div>
          <div className="mt-1 font-mono text-[10px] text-zinc-500">
            All services operational
          </div>
        </div>
      </div>
    </aside>
  );
}
