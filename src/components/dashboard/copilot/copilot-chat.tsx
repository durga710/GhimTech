"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Sparkles, Wrench, Paperclip, ImageIcon, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Action {
  tool: string;
  label: string;
}
interface Attachment {
  name: string;
  kind: "image" | "pdf" | "text";
  dataUrl?: string;
  text?: string;
}
interface Msg {
  role: "user" | "assistant";
  content: string;
  actions?: Action[];
  attachments?: { name: string; kind: Attachment["kind"] }[];
}

const STARTERS = [
  "What should I focus on today?",
  "Build me a small landing page app and open a PR with the code",
  "Search the web for the latest PA Sandata EVV requirements",
  "What's happening in RayHealthEVV's repo right now?",
];

const MAX_ATTACHMENTS = 4;
const MAX_PDF_BYTES = 2_500_000;
const MAX_TEXT_CHARS = 60_000;
const IMAGE_MAX_DIM = 1600;

/** Downscale a photo on the client so it fits the request budget. */
async function imageToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, IMAGE_MAX_DIM / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.85);
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Agentic chat with the GPT-5 copilot. The server route can browse the web and
 * call tools that act on the operator's data; this renders the reply plus a
 * short "actions taken" line so it's clear what the copilot did. Photos and
 * files can be attached and are sent to the model as vision/file input.
 */
export function CopilotChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState<Attachment[]>([]);
  const [attachError, setAttachError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function addFiles(files: FileList | null) {
    if (!files?.length) return;
    setAttachError(null);
    const next: Attachment[] = [];
    for (const file of Array.from(files)) {
      if (pending.length + next.length >= MAX_ATTACHMENTS) {
        setAttachError(`Up to ${MAX_ATTACHMENTS} attachments per message.`);
        break;
      }
      try {
        if (file.type.startsWith("image/")) {
          next.push({ name: file.name, kind: "image", dataUrl: await imageToDataUrl(file) });
        } else if (file.type === "application/pdf") {
          if (file.size > MAX_PDF_BYTES) {
            setAttachError(`${file.name} is too large — PDFs up to 2.5 MB.`);
            continue;
          }
          next.push({ name: file.name, kind: "pdf", dataUrl: await fileToDataUrl(file) });
        } else {
          const text = await file.text();
          if (text.includes("\u0000")) {
            setAttachError(`${file.name} isn't a supported type — use photos, PDFs, or text files.`);
            continue;
          }
          next.push({ name: file.name, kind: "text", text: text.slice(0, MAX_TEXT_CHARS) });
        }
      } catch {
        setAttachError(`Couldn't read ${file.name}.`);
      }
    }
    if (next.length) setPending((p) => [...p, ...next]);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function send(text: string) {
    const attachments = pending;
    const content = text.trim() || (attachments.length ? "See attached." : "");
    if (!content || busy) return;
    const userMsg: Msg = {
      role: "user",
      content,
      attachments: attachments.map((a) => ({ name: a.name, kind: a.kind })),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput("");
    setPending([]);
    setAttachError(null);
    setBusy(true);
    try {
      // Only the newest message carries attachment payloads — earlier turns
      // would re-send megabytes on every request.
      const payload = history.map((m, i) => ({
        role: m.role,
        content: m.content,
        ...(i === history.length - 1 && attachments.length ? { attachments } : {}),
      }));
      const res = await fetch("/api/copilot/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
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
                Your copilot can browse the web, act on your data, and look at photos or files you attach.
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
                      {m.attachments && m.attachments.length > 0 && (
                        <span className="mt-1.5 flex flex-wrap gap-1.5">
                          {m.attachments.map((a, j) => (
                            <span
                              key={j}
                              className="inline-flex items-center gap-1 rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px] text-zinc-300"
                            >
                              {a.kind === "image" ? <ImageIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                              {a.name}
                            </span>
                          ))}
                        </span>
                      )}
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

      {(pending.length > 0 || attachError) && (
        <div className="border-t border-white/[0.06] px-3 pt-2 flex flex-wrap items-center gap-1.5">
          {pending.map((a, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-xs text-zinc-300"
            >
              {a.kind === "image" ? <ImageIcon className="h-3.5 w-3.5 text-signal-300" /> : <FileText className="h-3.5 w-3.5 text-signal-300" />}
              <span className="max-w-[12rem] truncate">{a.name}</span>
              <button
                type="button"
                aria-label={`Remove ${a.name}`}
                onClick={() => setPending((p) => p.filter((_, j) => j !== i))}
                className="text-zinc-500 hover:text-flare-200 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
          {attachError && <span className="text-xs text-flare-200">{attachError}</span>}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t border-white/[0.06] p-3 flex items-center gap-2"
      >
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/*,.md,.csv,.json,.log,.ts,.tsx,.js,.py"
          className="hidden"
          onChange={(e) => void addFiles(e.target.files)}
        />
        <button
          type="button"
          aria-label="Attach photos or files"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="shrink-0 h-10 w-10 grid place-items-center rounded-xl border border-white/10 text-zinc-400 hover:text-signal-200 hover:border-signal-400/40 transition-colors disabled:opacity-50"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message your copilot — attach photos or files…"
          className="flex-1 bg-white/[0.03] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-signal-400/50"
        />
        <button
          type="submit"
          disabled={busy || (!input.trim() && pending.length === 0)}
          className="btn-signal shrink-0 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </form>
    </div>
  );
}
