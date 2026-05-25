/**
 * Client-safe dashboard formatters.
 *
 * Pure date/string helpers with NO server dependency. Extracted from
 * data.ts so client components ("use client") can import them without
 * pulling in the `server-only` data layer — importing a server-only
 * module into a client bundle is a hard build error.
 */

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "yesterday";
  return `${d}d ago`;
}

export function dueLabel(iso: string | null): string {
  if (!iso) return "no date";
  const diff = new Date(iso).getTime() - Date.now();
  const d = Math.floor(diff / 86_400_000);
  if (d < 0) return `${Math.abs(d)}d overdue`;
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  return `in ${d}d`;
}
