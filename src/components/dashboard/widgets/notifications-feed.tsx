"use client";

import { motion } from "framer-motion";
import {
  Bell,
  AlertTriangle,
  Info,
  Sparkles,
  Rocket,
} from "lucide-react";
import type { DashNotification } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

interface NotificationsFeedProps {
  notifications: DashNotification[];
}

const KIND_CONFIG = {
  deploy: {
    icon: Rocket,
    color: "text-vital-300",
    bg: "bg-vital-400/10 border-vital-400/20",
  },
  alert: {
    icon: AlertTriangle,
    color: "text-flare-400",
    bg: "bg-flare-400/10 border-flare-400/20",
  },
  info: {
    icon: Info,
    color: "text-signal-300",
    bg: "bg-signal-400/10 border-signal-400/20",
  },
  agent: {
    icon: Sparkles,
    color: "text-signal-300",
    bg: "bg-signal-400/10 border-signal-400/20",
  },
} as const;

/**
 * Notifications feed.
 *
 * Recent system alerts, grouped by kind with distinct icons:
 *   - deploy: rocket (build/release events)
 *   - alert: triangle (things needing review)
 *   - info: i (heads-ups)
 *   - agent: sparkles (AI-generated)
 *
 * Unread items get a left accent bar. Reading them in the UI would mark
 * them read (Phase 5 will hit a real PATCH endpoint).
 */
export function NotificationsFeed({ notifications }: NotificationsFeedProps) {
  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <section className="glass-panel p-6 relative">
      <header className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-signal-300" />
          <h2 className="label-tactical">Recent alerts</h2>
        </div>
        {unreadCount > 0 && (
          <span className="font-mono text-[10px] text-flare-400 uppercase tracking-tactical">
            {unreadCount} unread
          </span>
        )}
      </header>

      <ol className="space-y-2">
        {notifications.map((n, i) => {
          const k = KIND_CONFIG[n.kind];
          const Icon = k.icon;

          return (
            <motion.li
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: i * 0.05,
                duration: 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className={cn(
                "relative flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer",
                n.unread
                  ? "border-white/[0.08] hover:border-white/[0.16] bg-white/[0.015]"
                  : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.02]"
              )}
            >
              {/* Unread accent */}
              {n.unread && (
                <span
                  aria-hidden
                  className="absolute left-0 top-3 bottom-3 w-px rounded-full bg-signal-400"
                />
              )}

              {/* Icon chip */}
              <div
                className={cn(
                  "shrink-0 h-8 w-8 rounded-lg grid place-items-center border",
                  k.bg
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", k.color)} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3
                    className={cn(
                      "text-sm truncate",
                      n.unread ? "text-white font-medium" : "text-zinc-300"
                    )}
                  >
                    {n.title}
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">
                    {n.when}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 truncate">{n.body}</p>
              </div>

              {n.unread && (
                <span className="absolute top-3 right-3 h-1.5 w-1.5 rounded-full bg-signal-400 shadow-glow-signal" />
              )}
            </motion.li>
          );
        })}
      </ol>

      <footer className="mt-4 pt-4 border-t border-white/[0.06]">
        <button
          type="button"
          className="w-full text-center text-xs font-mono text-signal-300 hover:text-signal-200 transition-colors py-1"
        >
          View all alerts →
        </button>
      </footer>
    </section>
  );
}
