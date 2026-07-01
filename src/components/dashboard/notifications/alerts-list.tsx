"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Rocket, AlertTriangle, Info, Sparkles, CheckCheck } from "lucide-react";
import type { DashNotification } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

const KIND = {
  deploy: { icon: Rocket, color: "text-vital-300", bg: "bg-vital-400/10 border-vital-400/20" },
  alert: { icon: AlertTriangle, color: "text-flare-400", bg: "bg-flare-400/10 border-flare-400/20" },
  info: { icon: Info, color: "text-signal-300", bg: "bg-signal-400/10 border-signal-400/20" },
  agent: { icon: Sparkles, color: "text-signal-300", bg: "bg-signal-400/10 border-signal-400/20" },
} as const;

/**
 * Alerts list. Click a notification to mark it read (PATCH
 * /api/notifications/[id]); "Mark all read" hits POST /api/notifications.
 * Read state updates optimistically.
 */
export function AlertsList({ initialNotifications }: { initialNotifications: DashNotification[] }) {
  const [items, setItems] = useState<DashNotification[]>(initialNotifications);
  const unread = items.filter((n) => n.unread).length;

  async function markRead(n: DashNotification) {
    if (!n.unread) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, unread: false } : x)));
    try {
      await fetch(`/api/notifications/${n.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    } catch {
      /* optimistic */
    }
  }

  async function markAll() {
    setItems((prev) => prev.map((x) => ({ ...x, unread: false })));
    try {
      await fetch(`/api/notifications`, { method: "POST" });
    } catch {
      /* optimistic */
    }
  }

  if (items.length === 0) {
    return <div className="surface-subtle p-10 text-center text-sm text-zinc-400">No alerts.</div>;
  }

  return (
    <section className="surface-premium p-6">
      <header className="mb-5 flex items-center justify-between">
        <span className="label-tactical">{items.length} notifications</span>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-signal-300 hover:text-signal-200 transition-colors"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark all read ({unread})
          </button>
        )}
      </header>

      <ol className="space-y-2">
        {items.map((n, i) => {
          const k = KIND[n.kind];
          const Icon = k.icon;
          return (
            <motion.li
              key={n.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.4 }}
            onClick={() => markRead(n)}
            className={cn(
                "relative flex items-start gap-3 rounded-2xl border p-3 transition-all cursor-pointer",
                n.unread
                  ? "border-white/[0.08] bg-white/[0.018] hover:border-white/[0.16] hover:bg-white/[0.03]"
                  : "border-transparent hover:bg-white/[0.03]"
              )}
          >
              {n.unread && (
                <span aria-hidden className="absolute left-0 top-3 bottom-3 w-px rounded-full bg-signal-400" />
              )}
              <div className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg border", k.bg)}>
                <Icon className={cn("h-3.5 w-3.5", k.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className={cn("text-sm", n.unread ? "text-white font-medium" : "text-zinc-300")}>
                    {n.title}
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] text-zinc-500">{n.when}</span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">{n.body}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </section>
  );
}
