# ADR 0003 — Store interface with memory and Prisma implementations

**Status**: accepted · **Date**: 2026-08-02

## Decision

API handlers and services depend on a narrow `Store` interface. `MemoryStore` serves development-without-infrastructure and the automated test suite; `PrismaStore` serves staging/production. Selection is configuration (`GHIMTECH_STORE` / presence of `DATABASE_URL`), and production refuses to run on the memory store.

## Rationale

The highest-value tests here are full-workflow tests over the real HTTP surface — lifecycle guards, permission scoping, signature invalidation, duplicate protection. Coupling those to a live Postgres would make them slow and infrastructure-bound; mocking Prisma calls would test the mocks. A real alternate implementation of a small interface keeps e2e tests honest (they exercise every production code path except SQL mapping) and gives a zero-setup developer experience.

## Consequences

The Prisma mapping layer itself needs a Postgres-backed integration job (CI database service is already wired for migration validation; extending it to a store smoke test is tracked in PROGRESS.md). The interface must stay small and business-logic-free so both implementations remain trivially comparable.
