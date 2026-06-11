"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Loader2, Rocket, Wrench, FolderGit2, ExternalLink } from "lucide-react";
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
  "A waitlist landing page with a hero and email signup",
  "A personal portfolio site with project cards",
  "A pricing page with three tiers",
  "A simple blog with three sample posts",
];

/** Render assistant text with clickable links — the PR/preview URL IS the product. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="text-signal-300 hover:text-signal-200 underline underline-offset-2 break-all inline-flex items-center gap-0.5"
          >
            {part.replace(/^https:\/\/(www\.)?/, "").slice(0, 60)}
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

/**
 * GCODE — the app-builder studio. Pick a repo, describe the app; GCODE writes
 * the code, opens the PR, and the PR grows a live preview URL. A focused
 * builder-mode persona of the copilot chat API.
 */
export function GcodeStudio() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [repos, setRepos] = useState<string[]>([]);
  const [repo, setRepo] = useState("");
  const [repoError, setRepoError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/github/repos", { cache: "no-store" });
        const json = await res.json().catch(() => null);
        if (cancelled) return;
        if (res.ok && json?.ok) {
          const names = (json.data.repos as { repo: string }[]).map((r) => r.repo);
          setRepos(names);
          if (names.length && !repo) setRepo(names[0]);
        } else {
          setRepoError(json?.error?.message ?? "Couldn't list your repos.");
        }
      } catch {
        if (!cancelled) setRepoError("Couldn't list your repos.");
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
          mode: "builder",
          ...(repo ? { repo } : {}),
        }),
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

  const uniqueLabels = (actions?: Action[]) =>
    actions?.length ? Array.from(new Set(actions.map((a) => a.label))) : [];

  return (
    <div className="flex flex-col h-[calc(100vh-13rem)] glass-panel-strong overflow-hidden">
      {/* Build target */}
      <div className="border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-2">
        <FolderGit2 className="h-4 w-4 text-vital-300 shrink-0" />
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-600 shrink-0">Build into</span>
        <select
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          className="bg-white/[0.03] border border-white/10 rounded-lg px-2 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-vital-400/50 max-w-[16rem]"
        >
          {repos.length === 0 && <option value="">loading repos…</option>}
          {repos.map((r) => (
            <option key={r} value={r} className="bg-ink-950">
              {r}
            </option>
          ))}
        </select>
        {repoError && <span className="text-xs text-flare-200 truncate">{repoError}</span>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !busy ? (
          <div className="h-full grid place-items-center text-center">
            <div>
              <Rocket className="h-10 w-10 text-vital-300 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-white mb-2">
                Welcome to <span className="text-vital-300">GCODE</span>
              </h2>
              <p className="text-sm text-zinc-400 mb-1 max-w-md mx-auto">
                Describe the app. GCODE writes the code, opens the pull request, and hands you a live
                preview — built straight into your GitHub repo.
              </p>
              <p className="text-xs text-zinc-600 mb-4">Try one:</p>
              <div className="flex flex-wrap gap-2 justify-center max-w-xl">
                {STARTERS.map((sx) => (
                  <button
                    key={sx}
                    type="button"
                    onClick={() => send(sx)}
                    className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-zinc-300 hover:border-vital-400/40 hover:text-vital-200 transition-colors"
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
                          ? "bg-vital-400/15 text-white border border-vital-400/25 inline-block"
                          : "bg-white/[0.04] text-zinc-200 border border-white/[0.06]",
                      )}
                    >
                      {m.role === "assistant" ? <Linkified text={m.content} /> : m.content}
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
                  <Loader2 className="h-4 w-4 animate-spin" /> GCODE is building — writing files, pushing,
                  opening the PR…
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="border-t border-white/[0.06] p-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe the app you want built…"
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-vital-400/50"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="btn-signal shrink-0 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
