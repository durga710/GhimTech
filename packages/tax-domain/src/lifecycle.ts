/**
 * Filing lifecycle state machine.
 *
 * Every return moves through these states. Transitions are permission-checked,
 * validated, and logged; illegal transitions are rejected at the domain layer
 * so no API surface can bypass them.
 */
import type { Role } from "./enums.js";

export const RETURN_STATUSES = [
  "DRAFT",
  "INCOMPLETE",
  "READY_FOR_PREPARER_REVIEW",
  "PREPARER_REVIEWED",
  "READY_FOR_REVIEWER",
  "REVIEW_CHANGES_REQUESTED",
  "APPROVED",
  "AWAITING_CLIENT_REVIEW",
  "AWAITING_SIGNATURE",
  "SIGNED",
  "READY_TO_EFILE",
  "VALIDATING",
  "VALIDATION_FAILED",
  "QUEUED_FOR_TRANSMISSION",
  "TRANSMITTING",
  "TRANSMITTED",
  "ACKNOWLEDGMENT_PENDING",
  "ACCEPTED",
  "REJECTED",
  "CORRECTION_REQUIRED",
  "RESUBMISSION_READY",
  "RESUBMITTED",
  "ARCHIVED",
] as const;

export type ReturnStatus = (typeof RETURN_STATUSES)[number];

interface TransitionRule {
  to: ReturnStatus;
  /** Roles allowed to trigger the transition. SYSTEM transitions are performed by workers. */
  roles: (Role | "SYSTEM")[];
}

/**
 * The complete transition map. A transition not listed here is illegal.
 * Reviewer separation: the reviewer who approves cannot be the preparer —
 * enforced at the service layer, since it needs user identity, not just role.
 */
const TRANSITIONS: Record<ReturnStatus, TransitionRule[]> = {
  DRAFT: [
    { to: "INCOMPLETE", roles: ["PREPARER", "ADMIN", "CLIENT"] },
    { to: "READY_FOR_PREPARER_REVIEW", roles: ["PREPARER", "ADMIN"] },
  ],
  INCOMPLETE: [{ to: "READY_FOR_PREPARER_REVIEW", roles: ["PREPARER", "ADMIN"] }],
  READY_FOR_PREPARER_REVIEW: [
    { to: "PREPARER_REVIEWED", roles: ["PREPARER", "ADMIN"] },
    { to: "INCOMPLETE", roles: ["PREPARER", "ADMIN"] },
  ],
  PREPARER_REVIEWED: [
    { to: "READY_FOR_REVIEWER", roles: ["PREPARER", "ADMIN"] },
    { to: "INCOMPLETE", roles: ["PREPARER", "ADMIN"] },
  ],
  READY_FOR_REVIEWER: [
    { to: "APPROVED", roles: ["REVIEWER", "ADMIN"] },
    { to: "REVIEW_CHANGES_REQUESTED", roles: ["REVIEWER", "ADMIN"] },
  ],
  REVIEW_CHANGES_REQUESTED: [
    { to: "READY_FOR_PREPARER_REVIEW", roles: ["PREPARER", "ADMIN"] },
    { to: "INCOMPLETE", roles: ["PREPARER", "ADMIN"] },
  ],
  APPROVED: [
    { to: "AWAITING_CLIENT_REVIEW", roles: ["PREPARER", "ADMIN"] },
    { to: "REVIEW_CHANGES_REQUESTED", roles: ["REVIEWER", "ADMIN"] },
  ],
  AWAITING_CLIENT_REVIEW: [
    { to: "AWAITING_SIGNATURE", roles: ["CLIENT", "PREPARER", "ADMIN"] },
    { to: "REVIEW_CHANGES_REQUESTED", roles: ["CLIENT", "PREPARER", "ADMIN"] },
  ],
  AWAITING_SIGNATURE: [
    { to: "SIGNED", roles: ["CLIENT", "ADMIN"] },
    { to: "REVIEW_CHANGES_REQUESTED", roles: ["CLIENT", "PREPARER", "ADMIN"] },
  ],
  SIGNED: [
    { to: "READY_TO_EFILE", roles: ["PREPARER", "ADMIN"] },
    // Material change after signature → back through review, signature invalidated.
    { to: "REVIEW_CHANGES_REQUESTED", roles: ["PREPARER", "ADMIN"] },
  ],
  READY_TO_EFILE: [
    { to: "VALIDATING", roles: ["PREPARER", "ADMIN", "SYSTEM"] },
    { to: "REVIEW_CHANGES_REQUESTED", roles: ["PREPARER", "ADMIN"] },
  ],
  VALIDATING: [
    { to: "QUEUED_FOR_TRANSMISSION", roles: ["SYSTEM"] },
    { to: "VALIDATION_FAILED", roles: ["SYSTEM"] },
  ],
  VALIDATION_FAILED: [
    { to: "READY_TO_EFILE", roles: ["PREPARER", "ADMIN"] },
    { to: "REVIEW_CHANGES_REQUESTED", roles: ["PREPARER", "ADMIN"] },
  ],
  QUEUED_FOR_TRANSMISSION: [{ to: "TRANSMITTING", roles: ["SYSTEM"] }],
  TRANSMITTING: [
    { to: "TRANSMITTED", roles: ["SYSTEM"] },
    { to: "VALIDATION_FAILED", roles: ["SYSTEM"] },
  ],
  TRANSMITTED: [{ to: "ACKNOWLEDGMENT_PENDING", roles: ["SYSTEM"] }],
  ACKNOWLEDGMENT_PENDING: [
    { to: "ACCEPTED", roles: ["SYSTEM"] },
    { to: "REJECTED", roles: ["SYSTEM"] },
  ],
  ACCEPTED: [{ to: "ARCHIVED", roles: ["PREPARER", "ADMIN", "SYSTEM"] }],
  REJECTED: [{ to: "CORRECTION_REQUIRED", roles: ["PREPARER", "ADMIN", "SYSTEM"] }],
  CORRECTION_REQUIRED: [
    // Corrections re-enter the review pipeline; material changes require re-signature.
    { to: "READY_FOR_PREPARER_REVIEW", roles: ["PREPARER", "ADMIN"] },
    { to: "RESUBMISSION_READY", roles: ["PREPARER", "ADMIN"] },
  ],
  RESUBMISSION_READY: [{ to: "RESUBMITTED", roles: ["PREPARER", "ADMIN", "SYSTEM"] }],
  RESUBMITTED: [{ to: "ACKNOWLEDGMENT_PENDING", roles: ["SYSTEM"] }],
  ARCHIVED: [],
};

/** Statuses in which the return data is locked against edits. */
export const LOCKED_STATUSES: ReadonlySet<ReturnStatus> = new Set([
  "SIGNED",
  "READY_TO_EFILE",
  "VALIDATING",
  "QUEUED_FOR_TRANSMISSION",
  "TRANSMITTING",
  "TRANSMITTED",
  "ACKNOWLEDGMENT_PENDING",
  "ACCEPTED",
  "RESUBMITTED",
  "ARCHIVED",
]);

/** Statuses that count as "in filing" for dashboard grouping. */
export const FILING_STATUSES_GROUP: ReadonlySet<ReturnStatus> = new Set([
  "READY_TO_EFILE",
  "VALIDATING",
  "QUEUED_FOR_TRANSMISSION",
  "TRANSMITTING",
  "TRANSMITTED",
  "ACKNOWLEDGMENT_PENDING",
  "RESUBMITTED",
]);

export class IllegalTransitionError extends Error {
  constructor(
    public readonly from: ReturnStatus,
    public readonly to: ReturnStatus,
  ) {
    super(`Illegal return transition: ${from} -> ${to}`);
    this.name = "IllegalTransitionError";
  }
}

export class TransitionPermissionError extends Error {
  constructor(
    public readonly from: ReturnStatus,
    public readonly to: ReturnStatus,
    public readonly role: Role | "SYSTEM",
  ) {
    super(`Role ${role} may not transition return from ${from} to ${to}`);
    this.name = "TransitionPermissionError";
  }
}

export function allowedTransitions(from: ReturnStatus, role: Role | "SYSTEM"): ReturnStatus[] {
  return (TRANSITIONS[from] ?? [])
    .filter((rule) => rule.roles.includes(role) || role === "ADMIN")
    .map((rule) => rule.to);
}

export function isTransitionAllowed(
  from: ReturnStatus,
  to: ReturnStatus,
  role: Role | "SYSTEM",
): boolean {
  const rule = (TRANSITIONS[from] ?? []).find((r) => r.to === to);
  if (!rule) return false;
  return rule.roles.includes(role);
}

/**
 * Validates a transition and throws with a precise error when it is illegal or
 * the role lacks permission. Callers persist the transition and audit event.
 */
export function assertTransition(
  from: ReturnStatus,
  to: ReturnStatus,
  role: Role | "SYSTEM",
): void {
  const rule = (TRANSITIONS[from] ?? []).find((r) => r.to === to);
  if (!rule) throw new IllegalTransitionError(from, to);
  if (!rule.roles.includes(role)) throw new TransitionPermissionError(from, to, role);
}

export function isLocked(status: ReturnStatus): boolean {
  return LOCKED_STATUSES.has(status);
}
