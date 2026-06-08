/**
 * Audit log writer.
 *
 * Every write API records what happened. Even though there's only one
 * operator (Durga), this matters because:
 *
 *   - If the operator account is ever compromised, you can forensically
 *     reconstruct what an attacker did from this table.
 *   - It's the foundation for the "Activity" surface in the dashboard
 *     (what did I do this week?).
 *   - Compliance posture: even a single-operator system benefits from
 *     having an immutable record of every action.
 *
 * Design notes:
 *   - This is BEST-EFFORT. If the audit write fails (DB down, etc.) we
 *     log to stderr but never block the original operation. The audit
 *     log is observability, not a transaction guard.
 *   - IP + UA captured from the request when available.
 *   - Diff is freeform JSON; route handlers decide how much detail to
 *     persist. For a project update, diff might be { before: {...}, after: {...} }
 *     For a task delete, just { id }.
 */

import "server-only";
import { prisma } from "@/lib/prisma";

export interface AuditEntry {
  action: string; // "project.create", "task.update", "note.delete"
  target?: string; // id of affected entity
  actorId?: string | null;
  diff?: unknown;
  req?: Request;
}

export async function audit(entry: AuditEntry): Promise<void> {
  const { action, target, actorId, diff, req } = entry;

  // Pull IP + UA from headers if request available
  let ip: string | undefined;
  let userAgent: string | undefined;

  if (req) {
    const forwarded = req.headers.get("x-forwarded-for") ?? "";
    ip = forwarded.split(",")[0]?.trim() || undefined;
    userAgent = req.headers.get("user-agent") ?? undefined;
  }

  try {
    await prisma.auditLog.create({
      data: {
        actorId: actorId ?? null,
        action,
        target: target ?? null,
        // Prisma's Json column expects InputJsonValue — undefined isn't valid,
        // so we coerce to Prisma's JsonNull when no diff is provided.
        diff: (diff ?? undefined) as never,
        ip,
        userAgent,
      },
    });
  } catch (err) {
    // Best-effort: log and move on. Never block the main operation.
    console.error("[audit] failed to write audit log", { action, target, err });
  }
}
