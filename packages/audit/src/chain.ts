/**
 * Hash chaining for audit immutability. Each event's hash covers its content
 * plus the previous event's hash; verifying the chain detects any insertion,
 * deletion, or mutation. Filing events additionally anchor the chain hash in
 * the filing submission record.
 */
import { createHash } from "node:crypto";
import type { AuditEventInput } from "./events.js";

export const GENESIS_HASH = "0".repeat(64);

/** Canonical JSON: sorted keys, no whitespace — stable across processes. */
export function canonicalize(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonicalize).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, v]) => v !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonicalize(v)}`);
  return `{${entries.join(",")}}`;
}

export function computeEventHash(event: AuditEventInput, previousHash: string): string {
  return createHash("sha256").update(previousHash).update(canonicalize(event)).digest("hex");
}

export interface ChainedAuditEvent extends AuditEventInput {
  hash: string;
  previousHash: string;
}

export function appendToChain(
  event: AuditEventInput,
  previous: ChainedAuditEvent | undefined,
): ChainedAuditEvent {
  const previousHash = previous?.hash ?? GENESIS_HASH;
  return { ...event, previousHash, hash: computeEventHash(event, previousHash) };
}

export interface ChainVerification {
  valid: boolean;
  /** Index of the first invalid event when the chain is broken. */
  brokenAt?: number;
}

export function verifyChain(events: ChainedAuditEvent[]): ChainVerification {
  let previousHash = GENESIS_HASH;
  for (let i = 0; i < events.length; i++) {
    const event = events[i]!;
    const { hash, previousHash: recordedPrevious, ...content } = event;
    if (recordedPrevious !== previousHash) return { valid: false, brokenAt: i };
    if (computeEventHash(content, previousHash) !== hash) return { valid: false, brokenAt: i };
    previousHash = hash;
  }
  return { valid: true };
}
