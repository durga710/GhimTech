import { describe, expect, it } from "vitest";
import { appendToChain, canonicalize, verifyChain, type ChainedAuditEvent } from "./chain.js";
import type { AuditEventInput } from "./events.js";

function event(action: AuditEventInput["action"], at: string): AuditEventInput {
  return {
    action,
    actorId: "user-1",
    actorRole: "PREPARER",
    entityType: "return",
    entityId: "ret-1",
    occurredAt: at,
  };
}

describe("audit hash chain", () => {
  it("canonicalizes deterministically regardless of key order", () => {
    expect(canonicalize({ b: 1, a: { d: 2, c: 3 } })).toBe(
      canonicalize({ a: { c: 3, d: 2 }, b: 1 }),
    );
  });

  it("builds and verifies a chain", () => {
    const chain: ChainedAuditEvent[] = [];
    chain.push(appendToChain(event("return.created", "2026-02-01T10:00:00Z"), undefined));
    chain.push(appendToChain(event("return.calculated", "2026-02-01T10:05:00Z"), chain[0]));
    chain.push(appendToChain(event("return.status_changed", "2026-02-01T10:06:00Z"), chain[1]));
    expect(verifyChain(chain).valid).toBe(true);
  });

  it("detects mutation of any event", () => {
    const chain: ChainedAuditEvent[] = [];
    chain.push(appendToChain(event("return.created", "2026-02-01T10:00:00Z"), undefined));
    chain.push(appendToChain(event("return.calculated", "2026-02-01T10:05:00Z"), chain[0]));
    const tampered = [...chain];
    tampered[0] = { ...tampered[0]!, actorId: "attacker" };
    const result = verifyChain(tampered);
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(0);
  });

  it("detects deletion from the middle", () => {
    const chain: ChainedAuditEvent[] = [];
    chain.push(appendToChain(event("return.created", "t1"), undefined));
    chain.push(appendToChain(event("return.calculated", "t2"), chain[0]));
    chain.push(appendToChain(event("return.status_changed", "t3"), chain[1]));
    const withDeletion = [chain[0]!, chain[2]!];
    expect(verifyChain(withDeletion).valid).toBe(false);
  });
});
