"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const STARTERS = [
  "What should I focus on today?",
  "Summarize RayHealthEVV's status",
  "What's blocking my launch?",
  "Draft my standup update",
];

/**
 * Streaming chat with the GPT-5 copilot. The server route grounds every reply
 * in the operator's live projects + tasks, so this is a real assistant that
 * knows the work — not a canned brief.
 */
export function CopilotChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const history: Msg[] = [...messages, { role: "user", content }];
    setMessages([...history, { role: "assistant", content: "" }]);
    setInput("");
    setBusy(true);

    try {
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => null);
        const msg = j?.error?.message ?? "Something went wrong.";
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: msg };
          return c;
        });
        setBusy(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const c = [...m];
          c[c.length - 1] = { role: "assistant", content: acc };
          return c;
        });
      }
    } catch {
      setMessages((m) => {
        const c = [...m];
        c[c.length - 1] = { role: "assistant", content: "Network error. Try again." };
        return c;
      });
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] glass-panel-strong overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <Sparkles className="h-8 w-8 text-signal-300 mx-auto mb-3" />
              <p className="text-sm text-zinc-400 mb-4 max-w-sm">
                Ask your copilot anything — it knows your projects, tasks, and RayHealthEVV.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-zinc-300 hover:border-signal-400/40 hover:text-signal-200 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap",
                  m.role === "user"
                    ? "bg-signal-400/15 text-white border border-signal-400/25"
                    : "bg-white/[0.04] text-zinc-200 border border-white/[0.06]",
                )}
              >
                {m.content || (busy && i === messages.length - 1 ? <Loader2 className="h-4 w-4 animate-spin text-zinc-500" /> : "")}
              </div>
            </div>
          ))
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
          placeholder="Message your copilot…"
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-signal shrink-0 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
