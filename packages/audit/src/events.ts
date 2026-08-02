/**
 * Audit event taxonomy. Every sensitive action in the platform emits exactly
 * one of these events. Events are append-only and hash-chained (see chain.ts)
 * so tampering is detectable. Payloads must never contain unmasked SSNs, bank
 * numbers, or document contents — only references and masked values.
 */

export const AUDIT_ACTIONS = [
  // Authentication
  "auth.login.success",
  "auth.login.failure",
  "auth.login.locked",
  "auth.mfa.enrolled",
  "auth.mfa.verified",
  "auth.mfa.failed",
  "auth.logout",
  "auth.session.revoked",
  "auth.password.changed",
  "auth.password.reset_forced",

  // Users
  "user.created",
  "user.role_changed",
  "user.disabled",
  "user.enabled",

  // Clients
  "client.created",
  "client.updated",
  "client.viewed",
  "client.assigned",

  // Returns
  "return.created",
  "return.updated",
  "return.calculated",
  "return.status_changed",
  "return.viewed",
  "return.locked",
  "return.unlocked",

  // Documents
  "document.uploaded",
  "document.viewed",
  "document.downloaded",
  "document.verified",
  "document.deleted",
  "document.scan_flagged",

  // Signatures
  "signature.requested",
  "signature.captured",
  "signature.invalidated",

  // E-file
  "efile.validated",
  "efile.queued",
  "efile.transmitted",
  "efile.acknowledged",
  "efile.rejected",
  "efile.resubmitted",
  "efile.provider_configured",

  // Security
  "security.permission_denied",
  "security.rate_limited",
  "security.suspicious_activity",
  "security.export",
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface AuditEventInput {
  action: AuditAction;
  /** User id, or "SYSTEM" for worker-driven events. */
  actorId: string;
  actorRole: string;
  /** Entity type + id the action applies to, e.g. return / client / document. */
  entityType?: string;
  entityId?: string;
  /** Small JSON payload with masked, non-sensitive details. */
  details?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
  userAgent?: string;
  occurredAt: string; // ISO timestamp
}
