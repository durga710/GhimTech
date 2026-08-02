# Changelog

## 0.1.0 — 2026-08-02

Initial platform build.

- Monorepo foundation (pnpm, Turborepo, strict TypeScript, CI + security workflows)
- Normalized tax domain with 23-state filing lifecycle and RBAC permission map
- Deterministic federal (Form 1040) and Pennsylvania (PA-40) engines for tax year 2025 with versioned rules, calculation traces, and blocking diagnostics
- Field-level envelope encryption, TOTP MFA, hash-chained audit logging
- Provider-neutral e-file architecture with mock/sandbox providers and contract tests
- Forms engine with snapshot hashing and watermarked printable documents
- Document pipeline: hardened uploads, malware-scan boundary, OCR with mandatory human verification
- Complete Prisma schema with initial migration and synthetic seed
- Fastify API (auth, clients, returns, signatures, e-file, documents, audit, dashboard) with end-to-end workflow tests
- BullMQ worker for acknowledgment polling
- Next.js web application with the GhimTech Tax design system
- Full documentation set: architecture, security and threat models, tax-rule sources, runbooks, ADRs
