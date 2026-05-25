"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

interface Action {
  tool: string;
  label: string;
}
interface Msg {
  role: "user" | "assistant";
  content: string;
  actions?: Action[];
}

const STARTERS = [
  "What should I focus on today?",
  "Create a high-priority task to finish the pen-test review",
  "Search the web for the latest PA Sandata EVV requirements",
  "Read RayHealthEVV's repo and tell me what's left to ship",
];

/**
 * Agentic chat with the GPT-5 copilot. The server route can browse the web and
 * call tools that act on the operator's data; this renders the reply plus a
 * short "actions taken" line so it's clear what the copilot did.
 */
export function CopilotChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages(history);
    setInput("");
    setBusy(true);
    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setMessages((m) => [...m, { role: "assistant", content: json?.error?.message ?? "Something went wrong." }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: json.data.text, actions: json.data.actions }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Try again." }]);
    }
    setBusy(false);
  }

  function uniqueLabels(actions?: Action[]): string[] {
    if (!actions?.length) return [];
    return Array.from(new Set(actions.map((a) => a.label)));
  }

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] glass-panel-strong overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !busy ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <Sparkles className="h-8 w-8 text-signal-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 mb-1 max-w-md">
                Your copilot can browse the web and act on your data — create tasks, update status, read your repos.
              </p>
              <p className="text-xs text-zinc-600 mb-4">Try one:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                {STARTERS.map((sx) => (
                  <button
                    key={sx}
                    type="button"
                    onClick={() => send(sx)}
                    className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-zinc-300 hover:border-signal-400/40 hover:text-signal-200 transition-colors"
                  >
                    {sx}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => {
              const labels = uniqueLabels(m.actions);
              return (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div className={cn("max-w-[85%]", m.role === "user" ? "" : "w-full")}>
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                        m.role === "user"
                          ? "bg-signal-400/15 text-white border border-signal-400/25 inline-block"
                          : "bg-white/[0.04] text-zinc-200 border border-white/[0.06]",
                      )}
                    >
                      {m.content}
                    </div>
                    {labels.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 pl-1">
                        <Wrench className="h-3 w-3 text-zinc-600" />
                        {labels.map((l, j) => (
                          <span key={j} className="font-mono text-[10px] text-zinc-500">
                            {l}
                            {j < labels.length - 1 ? " ·" : ""}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {busy && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 bg-white/[0.04] border border-white/[0.06] text-sm text-zinc-400 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" /> working — browsing &amp; using tools…
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-white/[0.06] p-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your copilot — ask it to do things…"
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-signal shrink-0 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
