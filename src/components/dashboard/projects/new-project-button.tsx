"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Modal, fieldInputClass } from "@/components/dashboard/ui/modal";
import { cn } from "@/lib/utils";

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const STATUSES = ["EXPLORING", "ACTIVE", "SHIPPING", "MAINTAINING", "PAUSED"];

export function NewProjectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [status, setStatus] = useState("ACTIVE");
  const [tagline, setTagline] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const effSlug = slugEdited ? slug : slugify(name);

  function reset() {
    setName("");
    setSlug("");
    setSlugEdited(false);
    setStatus("ACTIVE");
    setTagline("");
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: effSlug, status, tagline: tagline || undefined }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.ok) {
        setError(json?.error?.message ?? "Couldn't create project.");
        setBusy(false);
        return;
      }
      setOpen(false);
      reset();
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    }
    setBusy(false);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-signal text-xs shrink-0">
        <Plus className="h-3.5 w-3.5" /> New project
      </button>

      <Modal open={open} onClose={() => !busy && setOpen(false)} title="New project">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="label-tactical block mb-1.5">Name</label>
            <input
              className={fieldInputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="RayHealthEVV"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="label-tactical block mb-1.5">Slug</label>
            <input
              className={cn(fieldInputClass, "font-mono")}
              value={effSlug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              placeholder="rayhealth-evv"
            />
          </div>
          <div>
            <label className="label-tactical block mb-1.5">Status</label>
            <select className={fieldInputClass} value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-ink-900 capitalize">
                  {s.toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label-tactical block mb-1.5">
              Tagline <span className="text-zinc-600">(optional)</span>
            </label>
            <input
              className={fieldInputClass}
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Care. Verified. Delivered."
            />
          </div>

          {error && <p className="text-xs text-critical-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={busy}
              className="px-3 py-2 rounded-full text-xs text-zinc-400 border border-white/10 hover:text-white hover:border-white/20 transition-colors"
            >
              Cancel
            </button>
            <button type="submit" disabled={busy || !name} className="btn-signal text-xs disabled:opacity-50">
              {busy ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Creating…
                </>
              ) : (
                "Create project"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
