"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Archive, Reply, Inbox as InboxIcon, Clock } from "lucide-react";
import type { DashContactMessage, ContactPurpose } from "@/lib/dashboard/data";
import { cn } from "@/lib/utils";

const PURPOSE_META: Record<ContactPurpose, { label: string; cls: string }> = {
  agency: { label: "Agency", cls: "bg-signal-400/10 text-signal-200 border-signal-400/30" },
  partner: { label: "Partnership", cls: "bg-vital-400/10 text-vital-200 border-vital-400/30" },
  press: { label: "Press", cls: "bg-flare-400/10 text-flare-400 border-flare-400/30" },
  hello: { label: "Hello", cls: "bg-white/[0.06] text-zinc-300 border-white/15" },
  other: { label: "Other", cls: "bg-white/[0.06] text-zinc-300 border-white/15" },
};

interface InboxListProps {
  initialMessages: DashContactMessage[];
}

/**
 * Inbox list. Click a row to expand the full message (auto-marks read via
 * PATCH). Reply opens the operator's mail client; Archive removes it from
 * the active inbox. Read/archive state updates optimistically.
 */
export function InboxList({ initialMessages }: InboxListProps) {
  const [messages, setMessages] = useState<DashContactMessage[]>(initialMessages);
  const [openId, setOpenId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function patch(id: string, body: { read?: boolean; archived?: boolean }) {
    try {
      await fetch(`/api/admin/contact/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch {
      /* optimistic: read/archive UI already updated; ignore transient errors */
    }
  }

  function toggleOpen(m: DashContactMessage) {
    const next = openId === m.id ? null : m.id;
    setOpenId(next);
    if (next && !m.read) {
      setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, read: true } : x)));
      void patch(m.id, { read: true });
    }
  }

  async function archive(m: DashContactMessage) {
    setBusyId(m.id);
    setMessages((prev) => prev.filter((x) => x.id !== m.id));
    if (openId === m.id) setOpenId(null);
    await patch(m.id, { archived: true });
    setBusyId(null);
  }

  if (messages.length === 0) {
    return (
      <div className="glass-panel p-12 text-center">
        <InboxIcon className="h-8 w-8 text-zinc-600 mx-auto mb-3" />
        <p className="text-sm text-zinc-400">No messages yet.</p>
        <p className="text-xs text-zinc-600 mt-1">
          Submissions from your contact form will land here.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-2">
      {messages.map((m, i) => {
        const open = openId === m.id;
        const meta = PURPOSE_META[m.purpose];

        return (
          <motion.li
            key={m.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "glass-panel relative overflow-hidden transition-colors",
              !m.read && "ring-1 ring-inset ring-signal-400/25"
            )}
          >
            {!m.read && (
              <span aria-hidden className="absolute left-0 top-0 bottom-0 w-[2px] bg-signal-400" />
            )}

            <button
              type="button"
              onClick={() => toggleOpen(m)}
              className="w-full text-left p-4 flex items-start gap-3"
            >
              <div className="shrink-0 h-9 w-9 rounded-lg grid place-items-center bg-white/[0.04] border border-white/10">
                <Mail className={cn("h-4 w-4", m.read ? "text-zinc-500" : "text-signal-300")} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("text-sm truncate", m.read ? "text-zinc-300" : "text-white font-medium")}>
                    {m.name}
                  </span>
                  <span className={cn("shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium border", meta.cls)}>
                    {meta.label}
                  </span>
                  <span className="ml-auto shrink-0 font-mono text-[10px] text-zinc-500 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {m.when}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-zinc-500 truncate">{m.email}</div>
                {!open && <p className="mt-1 text-xs text-zinc-400 truncate">{m.message}</p>}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  className="px-4 pb-4"
                >
                  <div className="ml-12 rounded-lg bg-black/20 border border-white/[0.06] p-4">
                    <p className="text-sm text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {m.message}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <a
                        href={`mailto:${m.email}?subject=${encodeURIComponent("Re: your message to Ghimtech")}`}
                        className="btn-signal text-xs"
                      >
                        <Reply className="h-3.5 w-3.5" /> Reply
                      </a>
                      <button
                        type="button"
                        onClick={() => archive(m)}
                        disabled={busyId === m.id}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs text-zinc-400 border border-white/10 hover:text-white hover:border-white/20 transition-colors disabled:opacity-50"
                      >
                        <Archive className="h-3.5 w-3.5" /> Archive
                      </button>
                      <span className="ml-auto font-mono text-[10px] text-zinc-600">
                        {new Date(m.receivedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.li>
        );
      })}
    </ol>
  );
}
