# GhimTech Tax — build progress

Live status document. Updated with every significant change.

## Completed

- **Foundation**: pnpm/Turborepo monorepo, strict TypeScript, ESLint 9, Prettier, Vitest, docker-compose (Postgres/Redis), CI (lint/typecheck/test/build/migration validation) and security workflows (dependency audit, gitleaks, Trivy).
- **Domain**: normalized `TaxReturnModel`; integer-cent money with IRS rounding; 23-state filing lifecycle with role-checked transitions; role→permission map; diagnostics and calculation-trace types.
- **Rules (2025, v2025.1)**: full federal + PA value sets with documented sources and invariant tests.
- **Federal engine**: wages/interest/dividends/retirement/Social Security/unemployment/self-employment income; SE tax; standard (incl. additional + dependent limitation) and itemized deductions; QBI (Form 8995 simplified); Tax Table emulation + QDCGT worksheet; CTC/ODC/ACTC, EITC (table-midpoint emulation), AOTC/LLC, dependent care credit; additional Medicare, NIIT, early-distribution tax; payments, refund/balance due; full traces; structural diagnostics. 24 tests against hand-computed scenarios.
- **PA engine**: four income classes with class-loss rules, 3.07% liability, Schedule SP forgiveness, withholding/estimates, residency + multi-state + retirement-plan diagnostics, PSD capture. 14 tests.
- **Security**: AES-256-GCM envelope encryption + blind indexes, scrypt passwords, RFC 6238 TOTP (test-vector verified), hashed session tokens, recovery codes, masking + log scrubbing. Hash-chained audit package with verification.
- **E-file**: provider-neutral contracts, orchestrator (diagnostics/signature/duplicate guards), rejection-code dictionary, mock + sandbox providers, Column Tax / april / generic placeholders that refuse to fake integration, contract-test matrix.
- **Forms**: snapshot hashing (canonical SHA-256), Form 1040 / PA-40 / authorization document mapping, watermarked print rendering with escaping and masking.
- **Documents**: magic-byte upload validation, malware-scan boundary (EICAR path), classification, deterministic mock OCR, human-verification workflow (no OCR value enters a return unverified).
- **Database**: complete Prisma schema (35+ models incl. encrypted identity/bank fields, snapshots, submissions, acknowledgments, audit, retention, security events), generated initial migration, synthetic seed.
- **API**: Fastify with helmet/CORS/rate-limit; MFA login with forced enrollment + lockout; users/clients (encrypted TIN, duplicate blind-index check, portal accounts); returns (model editing with lock + signature invalidation, calculation snapshots, guarded transitions with reviewer separation); signatures (snapshot-bound, certificate hash); e-file submit/poll/resubmit; hardened document upload/verify/download; dashboard, audit read + chain verification. 25 e2e/permission/auth tests over the real HTTP surface.
- **Worker**: BullMQ ack-polling with backoff + communications queue, service-token pattern.
- **Web app**: GhimTech Tax design system (GT monogram, navy/azure tokens, dark-mode-ready components); sign-in with MFA enrollment/recovery codes; app shell with role-scoped nav; dashboard; clients list/create/detail; return workspace (intake, calculate, diagnostics, trace viewer, transitions, signing, e-file, submissions with explained rejections, printable forms); document vault; audit viewer with chain status; admin (users, provider status). Production build passes.
- **Docs**: architecture, security model, threat model, data classification, AI policy, tax-rule sources (federal + PA), e-file provider guide, database design, API reference, setup, environment, testing, deployment, backup/recovery, incident response, 6 ADRs, changelog.

## Current

- Final verification pass (workspace-wide lint/typecheck/test/build) and initial commit/PR.

## Remaining / next

1. Postgres-backed `PrismaStore` integration smoke test in CI (service container already provisioned).
2. Playwright E2E + axe accessibility + visual regression for the web app.
3. Generated OpenAPI spec from route schemas (docs/api.md is the current authority).
4. Object-storage backend (S3-compatible) for documents with pre-signed uploads; ClamAV wiring.
5. Real communications transport (email) for the notification templates.
6. Intake interview UI expansion: dependents editor, 1099/SSA/retirement forms, itemized deductions, education/dependent-care inputs (model + engines + API already support all of it — this is UI surface).
7. IRS-facsimile PDF rendering (ADR 0005).
8. PA part-year/nonresident support; federal Schedule D.

## Blockers

None for the mock-provider platform.

## External credentials required (when ready)

- Authorized e-file provider agreement + API credentials (Column Tax / april / other) — see docs/efile-providers.md checklist.
- Production secret manager entries: `GHIMTECH_MASTER_KEY`, `GHIMTECH_INDEX_KEY`, `DATABASE_URL`, `REDIS_URL`, `GHIMTECH_WORKER_TOKEN`.
- Object-storage bucket + credentials; malware-scanning service; SMTP/email provider.

## Security concerns being tracked

- Memory store is development-only (enforced: production refuses it).
- EICAR scanner is a boundary placeholder — real AV required before accepting uploads from outside the trusted circle.
- Provider placeholders must never be "temporarily" stubbed to succeed; they throw by design.
