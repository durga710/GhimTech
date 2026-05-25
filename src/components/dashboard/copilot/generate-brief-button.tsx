"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";

/**
 * Triggers POST /api/copilot to generate a fresh GPT-5 daily brief, then
 * refreshes the server component to show it.
 */
export function GenerateBriefButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/copilot", { method: "POST" });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Generation failed.");
        setBusy(false);
        return;
      }
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button type="button" onClick={generate} disabled={busy} className="btn-signal text-xs disabled:opacity-50">
        {busy ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Generating…
          </>
        ) : (
          <>
            <Sparkles className="h-3.5 w-3.5" /> Generate brief
          </>
        )}
      </button>
      {error && <span className="text-[10px] text-critical-400">{error}</span>}
    </div>
  );
}
