# ADR 0001 — Monorepo, TypeScript, and core stack

**Status**: accepted · **Date**: 2026-08-02

## Decision

pnpm workspaces + Turborepo; TypeScript strict everywhere; Next.js App Router for the web app; **Fastify** (not NestJS) for the API; Prisma + PostgreSQL; BullMQ + Redis for background work; Vitest for tests; zod for validation.

## Rationale

The domain demands many independently testable packages (engines, e-file contracts, security primitives) with strict boundaries — a monorepo with workspace protocol enforces that at install time. Fastify was chosen over NestJS deliberately: the API's complexity lives in the domain services (lifecycle guards, orchestration), not in framework wiring; Fastify gives schema-friendly routing, first-class `inject()` testing, and a much smaller dependency surface for a security-sensitive system. Dependency injection is achieved with plain constructor parameters (`Store`, `AuditService`), which also made the memory/Prisma store swap trivial.

## Consequences

No decorator-based module system; route registration is explicit functions receiving a context. If the team grows and craves more structure, NestJS-style modularization can be layered per route file without changing the domain packages.
