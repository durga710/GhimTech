# ADR 0004 — Signatures bind to canonical snapshot hashes

**Status**: accepted · **Date**: 2026-08-02

## Decision

A calculation snapshot freezes the return model plus both engine results; its canonical (key-order-independent) SHA-256 is what a client reviews and signs. The signature record stores that hash; the e-file orchestrator refuses to transmit unless the signed hash equals the current snapshot hash; any model edit invalidates outstanding signatures; duplicate-submission protection keys on (return, hash).

## Rationale

"Do not assume a signed authorization remains valid after material return changes" needs a mechanical definition of _material change_. Hashing the entire snapshot makes the definition exact and unforgeable: any change that could alter what the client authorized changes the hash. The same hash then does triple duty — signature validity, duplicate protection, and the immutable link between an authorization, a filing, and the audit trail (submissions also anchor the audit-chain head).

## Consequences

Cosmetic model edits also invalidate signatures (safe direction). Snapshots must be persisted immutably per hash, which the schema enforces with a unique constraint.
