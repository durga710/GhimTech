# GhimTech Tax

**GhimTech Tax — Built by GhimTech.** A private professional tax-preparation and e-file platform for federal (Form 1040) and Pennsylvania (PA-40) individual returns, developed and operated by GhimTech.

The initial deployment serves GhimTech's own preparation practice — the owner, family, friends, and a small set of approved clients — on a codebase engineered to production standards so future commercial expansion needs no rewrite.

## What it does

- **Client management and guided intake** with encrypted identity capture (SSNs and bank numbers are envelope-encrypted; only last-4 is ever displayed)
- **Document vault**: hardened uploads (magic-byte validation, malware scanning), OCR suggestions that always require human verification
- **Deterministic tax engines** for tax year 2025 — federal Form 1040 (standard/itemized deductions, CTC/ODC/ACTC, EITC, AOTC/LLC, dependent care credit, SE tax, QBI simplified, Social Security taxability, preferential capital-gain rates) and PA-40 (income classes, flat 3.07%, Schedule SP tax forgiveness) — with every value traceable to versioned rules and covered by regression tests. **No AI ever computes tax.**
- **Diagnostics** that block unsupported or inconsistent returns from filing
- **A 23-state filing lifecycle** with role-checked transitions, reviewer separation, and mandatory human review
- **Electronic signature** bound to the exact calculation snapshot; any material change invalidates signatures
- **Provider-neutral e-filing** through an authorized transmitter adapter (mock and sandbox providers today; Column Tax / april / other adapters slot in without touching business logic)
- **Hash-chained audit logging** of every sensitive action

## Repository layout

```
apps/
  web/        Next.js application (GhimTech Tax UI)
  api/        Fastify REST API
  worker/     BullMQ background worker (ack polling, OCR, comms)
packages/
  tax-domain/               Normalized return model, lifecycle, permissions, money
  tax-year-config/          Versioned per-year rule values (2025)
  tax-engine-federal/       Deterministic Form 1040 engine
  tax-engine-pennsylvania/  Deterministic PA-40 engine
  forms-engine/             Form mapping, snapshots, printable documents
  document-processing/      Upload hardening, OCR boundary, verification workflow
  efile-core/               Provider contracts, orchestration, rejection dictionary
  efile-providers/          Mock, sandbox, and placeholder transmitter adapters
  database/                 Prisma schema, migrations, seed
  security/                 Envelope encryption, masking, passwords, TOTP, tokens
  audit/                    Hash-chained audit events
  validation/               Zod schemas and identifier validators
  ui/                       GhimTech Tax design-system components
  testing/                  Synthetic taxpayer fixtures (never real data)
infrastructure/             Dockerfiles
docs/                       Architecture, security, tax rules, runbooks, ADRs
```

## Quick start

Requirements: Node 22+, pnpm 10+, Docker (for Postgres/Redis).

```bash
pnpm install
cp .env.example .env          # generate the two keys as instructed inside

# Fastest path — no database needed (in-memory store, mock e-file provider):
GHIMTECH_STORE=memory pnpm --filter @ghimtech/api dev
pnpm --filter @ghimtech/web dev   # in a second terminal → http://localhost:3000

# Full stack with Postgres:
docker compose up -d
pnpm --filter @ghimtech/database db:migrate:dev
pnpm --filter @ghimtech/database db:seed   # synthetic dev users + client
pnpm dev
```

Seeded development sign-ins (`GhimTechDev2026!`, password reset + MFA enrollment forced): `admin@dev.ghimtech.test`, `preparer@dev.ghimtech.test`, `reviewer@dev.ghimtech.test`, `client@dev.ghimtech.test`.

## Verification

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

The test suite covers the tax engines against hand-computed 2025 scenarios, the full filing lifecycle end-to-end over the real API (including rejection → correction → resubmission), permission and MFA flows, encryption, upload security, and provider contract tests.

## Documentation

Start with [docs/architecture.md](docs/architecture.md). Security: [docs/security-model.md](docs/security-model.md) and [docs/threat-model.md](docs/threat-model.md). Tax rules and sources: [docs/tax-rules/](docs/tax-rules/). E-file integration: [docs/efile-providers.md](docs/efile-providers.md). Live status: [docs/PROGRESS.md](docs/PROGRESS.md).

## Important limits (enforced by blocking diagnostics)

Unsupported situations cannot be e-filed — they surface as ERROR diagnostics and stop the pipeline. Highlights: part-year/nonresident PA returns (modeled, not filable), Schedule C losses or complex businesses, marketplace insurance reconciliation (Form 8962), Form 8995-A QBI, multi-state wages, MFS with Social Security. See [docs/tax-rules/](docs/tax-rules/) for the full list.

---

© GhimTech. Author and maintainer: Durga Ghimeray. Private software — not licensed for redistribution.
