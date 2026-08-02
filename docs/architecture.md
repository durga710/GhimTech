# Architecture

GhimTech Tax is a pnpm/Turborepo monorepo with three applications over a set of domain packages. The dependency rule is strict: **domain packages never depend on applications, and provider- or form-specific code never leaks into the domain.**

## The one model that matters

`TaxReturnModel` (packages/tax-domain) is the single normalized representation of a return. Everything reads and writes it:

```
intake / OCR verification ─▶ TaxReturnModel ─▶ federal engine ──▶ FederalCalculationResult ┐
                                   │        └▶ PA engine ───────▶ PaCalculationResult      ├─▶ CalculationSnapshot
                                   │                                                       ┘        │ sha256
                                   ├────────▶ forms-engine ─▶ printable form documents              │
                                   └────────▶ efile adapters ─▶ provider payloads                   │
                                                        signature ◀── snapshot hash ────────────────┘
```

The snapshot hash is load-bearing: clients sign it, the duplicate-submission guard keys on it, and any model change invalidates signatures that reference an older hash.

## Calculation engines

Both engines (`tax-engine-federal`, `tax-engine-pennsylvania`) are pure functions: `model → result`. No I/O, no clocks, no randomness, no AI. Rule values live in `tax-year-config`, versioned per tax year (`2025.1`); engines refuse unsupported years — there are no fallbacks that could silently produce estimates. Every line emits a `TraceEntry` recording the tax year, rule version, formula, inputs, and source module.

Whole-dollar rounding follows IRS conventions (≥ 50¢ rounds up) and all arithmetic is integer cents. The federal engine emulates the printed Tax Table (midpoint-of-range generation rule) below $100,000 and the EITC table's $50-bracket midpoints, so results match the published tables, not just the rate schedules.

## Filing lifecycle

A 23-state machine (`tax-domain/lifecycle.ts`) defines every legal transition and which roles may make it. The `ReturnService` adds guards the state machine alone cannot express: calculation must exist before review, the reviewer who approves cannot be the preparer who submitted for review, blocking diagnostics stop the path to filing, `SIGNED` is reachable only through the signature endpoint, and `READY_TO_EFILE` requires a valid signature over the current snapshot. Transitions are persisted as events (preserving prior state) and audited.

## E-file boundary

`efile-core` defines the `EFileProvider` interface and an orchestrator enforcing platform non-negotiables (no blocking diagnostics, signature/snapshot match, duplicate protection). `efile-providers` contains adapters: a deterministic mock (scripted rejections by fixture SSN), a latency-simulating sandbox, and placeholder adapters for Column Tax, april, and generic authorized transmitters that throw `ProviderNotConfiguredError` rather than pretending to work. Contract tests define the acceptance bar for any real adapter. Swapping providers touches nothing outside the adapter package.

## API and storage

The Fastify API enforces RBAC per-route via the shared permission map, with client users additionally scoped to their own records. Handlers depend on a small `Store` interface with two implementations: `MemoryStore` (development and the automated test suite — the full workflow tests run against real production code paths with zero infrastructure) and `PrismaStore` (PostgreSQL). Field-level envelope encryption (AES-256-GCM, wrapped data keys) protects SSNs, bank details, TOTP secrets, signature payloads, and document content; HMAC blind indexes support duplicate detection without decryption.

## Web application

Next.js App Router with the GhimTech design system (`packages/ui`) built around the GT monogram: deep navy `#16325F` with azure `#2E6BD6` accents. Bearer tokens live in sessionStorage (no auth cookies → no CSRF surface); the API's CORS is pinned to the web origin. Print styles render form documents; drafts are watermarked.

## Background work

The worker (BullMQ/Redis) polls acknowledgments through the API's idempotent poll endpoint using a service-account token — worker writes go through the same permission checks and audit chain as human traffic.

## Decisions

See docs/adr/ for the record of significant choices and their trade-offs.
