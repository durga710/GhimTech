"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Send,
  Loader2,
  Rocket,
  Wrench,
  FolderGit2,
  ExternalLink,
  GitPullRequest,
  RefreshCw,
  MonitorPlay,
  Globe,
  UserRound,
  CreditCard,
  Newspaper,
  AlertTriangle,
} from "lucide-react";
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
interface Build {
  repo: string;
  branch: string;
  prUrl: string | null;
}

const STARTERS = [
  { icon: Globe, title: "Waitlist landing page", prompt: "A waitlist landing page with a bold hero and email signup form" },
  { icon: UserRound, title: "Portfolio site", prompt: "A personal portfolio site with an about section and project cards" },
  { icon: CreditCard, title: "Pricing page", prompt: "A pricing page with three tiers and a featured plan" },
  { icon: Newspaper, title: "Mini blog", prompt: "A simple blog with three sample posts and a clean reading layout" },
] as const;

const PREVIEW_POLL_MS = 6000;
const PREVIEW_POLL_MAX = 40; // ~4 minutes

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
 * GCODE — the app-builder studio, Replit-style: chat on the left, the
 * RUNNING APP on the right. When a build lands, the preview pane polls the
 * branch's Vercel deployment and embeds it the moment it's live.
 */
export function GcodeStudio() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [repos, setRepos] = useState<string[]>([]);
  const [repo, setRepo] = useState("");
  const [selfRepo, setSelfRepo] = useState<string | null>(null);
  const [repoError, setRepoError] = useState<string | null>(null);

  const [build, setBuild] = useState<Build | null>(null);
  const [preview, setPreview] = useState<{ state: string; url: string | null }>({ state: "none", url: null });
  const [previewNonce, setPreviewNonce] = useState(0); // bump to reload iframe / restart polling
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
          const self: string | null = json.data.selfRepo ?? null;
          const names = (json.data.repos as { repo: string }[])
            .map((r) => r.repo)
            .sort((a, b) => Number(a === self) - Number(b === self));
          setSelfRepo(self);
          setRepos(names);
          setRepo((current) => current || names.find((n) => n !== self) || names[0] || "");
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
  }, []);

  // Poll the branch's deployment until the preview URL is live.
  useEffect(() => {
    if (!build) return;
    let polls = 0;
    let stopped = false;

    async function poll() {
      polls += 1;
      try {
        const res = await fetch(
          `/api/github/preview?repo=${encodeURIComponent(build!.repo)}&branch=${encodeURIComponent(build!.branch)}`,
          { cache: "no-store" },
        );
        const json = await res.json().catch(() => null);
        if (stopped) return;
        if (res.ok && json?.ok) {
          setPreview(json.data);
          if (json.data.state === "success" && json.data.url) return; // done
          if (json.data.state === "failure" || json.data.state === "error") return; // done (failed)
        }
      } catch {
        // keep polling
      }
      if (!stopped && polls < PREVIEW_POLL_MAX) setTimeout(poll, PREVIEW_POLL_MS);
    }

    setPreview({ state: "pending", url: null });
    void poll();
    return () => {
      stopped = true;
    };
  }, [build, previewNonce]);

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
        if (json.data.build) {
          setBuild(json.data.build);
          setPreviewNonce((n) => n + 1);
        }
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error. Try again." }]);
    }
    setBusy(false);
  }

  const uniqueLabels = useCallback(
    (actions?: Action[]) => (actions?.length ? Array.from(new Set(actions.map((a) => a.label))) : []),
    [],
  );

  const chatPane = (
    <div className="flex flex-col glass-panel-strong overflow-hidden h-full min-h-0">
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
              {r === selfRepo ? `${r} (this dashboard)` : r}
            </option>
          ))}
        </select>
        {repo && repo === selfRepo && (
          <span className="inline-flex items-center gap-1 text-[11px] text-flare-200">
            <AlertTriangle className="h-3 w-3" /> this repo IS the dashboard
          </span>
        )}
        {repoError && <span className="text-xs text-flare-200 truncate">{repoError}</span>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && !busy ? (
          <div className="h-full grid place-items-center text-center">
            <div className="max-w-2xl w-full px-2">
              <div
                className="mx-auto mb-5 h-16 w-16 rounded-2xl grid place-items-center border border-vital-400/30
                           bg-gradient-to-br from-vital-400/30 via-signal-400/15 to-transparent
                           shadow-[0_0_40px_rgba(52,211,153,0.25)]"
              >
                <Rocket className="h-8 w-8 text-vital-200" />
              </div>
              <h2 className="text-3xl font-semibold tracking-tight mb-2 bg-gradient-to-r from-white via-vital-200 to-signal-300 bg-clip-text text-transparent">
                Welcome to GCODE
              </h2>
              <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto leading-relaxed">
                Describe the app you want. GCODE writes every file, opens the pull request, and runs it
                live in the preview pane — straight into your GitHub repo.
              </p>
              <div className="grid sm:grid-cols-2 gap-2.5 text-left">
                {STARTERS.map((sx) => (
                  <button
                    key={sx.title}
                    type="button"
                    onClick={() => send(sx.prompt)}
                    className="group flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3
                               hover:border-vital-400/40 hover:bg-vital-400/[0.06] transition-colors"
                  >
                    <span className="mt-0.5 h-8 w-8 shrink-0 rounded-lg grid place-items-center border border-white/10 bg-white/[0.04] group-hover:border-vital-400/30">
                      <sx.icon className="h-4 w-4 text-vital-300" />
                    </span>
                    <span>
                      <span className="block text-sm text-zinc-100 font-medium">{sx.title}</span>
                      <span className="block text-xs text-zinc-500 mt-0.5 leading-snug">{sx.prompt}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-5 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
                describe → built → PR → running live
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((m, i) => {
              const labels = uniqueLabels(m.actions);
              return (
                <div key={i} className={cn("flex gap-2.5", m.role === "user" ? "justify-end" : "justify-start")}>
                  {m.role === "assistant" && (
                    <span className="mt-1 h-7 w-7 shrink-0 rounded-lg grid place-items-center border border-vital-400/25 bg-gradient-to-br from-vital-400/25 to-transparent">
                      <Rocket className="h-3.5 w-3.5 text-vital-200" />
                    </span>
                  )}
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
              <div className="flex justify-start gap-2.5">
                <span className="mt-1 h-7 w-7 shrink-0 rounded-lg grid place-items-center border border-vital-400/25 bg-gradient-to-br from-vital-400/25 to-transparent">
                  <Rocket className="h-3.5 w-3.5 text-vital-200 animate-pulse" />
                </span>
                <div className="rounded-2xl px-4 py-2.5 border border-vital-400/20 bg-gradient-to-r from-vital-400/[0.07] to-transparent text-sm text-zinc-300 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-vital-300" />
                  <span>
                    GCODE is building
                    <span className="text-zinc-500"> — writing files → pushing → opening the PR…</span>
                  </span>
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
          placeholder={build ? "Iterate — changes land on the same PR…" : "Describe the app you want built…"}
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-vital-400/50"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-signal shrink-0 disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );

  if (!build) {
    return <div className="h-[calc(100vh-13rem)]">{chatPane}</div>;
  }

  const previewReady = preview.state === "success" && preview.url;
  const previewFailed = preview.state === "failure" || preview.state === "error";

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 h-auto xl:h-[calc(100vh-13rem)]">
      <div className="h-[60vh] xl:h-full min-h-0">{chatPane}</div>

      {/* Live preview pane */}
      <div className="glass-panel-strong overflow-hidden flex flex-col h-[70vh] xl:h-full min-h-0">
        <div className="border-b border-white/[0.06] px-4 py-2.5 flex items-center gap-2 min-w-0">
          <MonitorPlay className="h-4 w-4 text-vital-300 shrink-0" />
          <span className="font-mono text-[11px] text-zinc-300 truncate">
            {build.repo} <span className="text-zinc-600">/</span> {build.branch}
          </span>
          <div className="ml-auto flex items-center gap-2 shrink-0">
            {build.prUrl && (
              <a
                href={build.prUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-signal-300 hover:text-signal-200 transition-colors"
              >
                <GitPullRequest className="h-3.5 w-3.5" /> PR
              </a>
            )}
            <button
              type="button"
              aria-label="Reload preview"
              onClick={() => setPreviewNonce((n) => n + 1)}
              className="text-zinc-500 hover:text-vital-300 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </button>
            {previewReady && (
              <a
                href={preview.url!}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-vital-300 hover:text-vital-200 transition-colors"
              >
                open <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0 bg-white">
          {previewReady ? (
            <iframe
              key={`${preview.url}-${previewNonce}`}
              title="GCODE live preview"
              src={preview.url!}
              className="w-full h-full"
            />
          ) : (
            <div className="h-full grid place-items-center bg-ink-950">
              <div className="text-center px-6">
                {previewFailed ? (
                  <p className="text-sm text-flare-200">
                    The preview deployment failed — check the PR&apos;s checks for the build log.
                  </p>
                ) : (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin text-vital-300 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">Waiting for the live preview…</p>
                    <p className="text-xs text-zinc-600 mt-1">
                      Vercel is deploying the branch — usually under 2 minutes. If this repo isn&apos;t
                      connected to Vercel yet, open the PR instead.
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
