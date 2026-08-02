# Deployment guide

## Environments

| Environment | Purpose                   | Data policy                                                            |
| ----------- | ------------------------- | ---------------------------------------------------------------------- |
| Development | Local machines            | Synthetic data only; in-memory store allowed                           |
| Preview     | Per-PR web builds         | **No taxpayer data, no production keys** — mock provider, memory store |
| Staging     | Pre-production validation | Synthetic data; sandbox e-file provider; production-shaped infra       |
| Production  | Live filing               | Real data; real (authorized) provider; secrets from the secret manager |

## Topology

Three processes + two stores: `web` (Next.js standalone), `api` (Fastify), `worker` (BullMQ), PostgreSQL, Redis. Images build from `infrastructure/*.Dockerfile` (multi-stage, non-root users, OCI labels). Postgres and object storage must have at-rest encryption enabled at the platform level in addition to the app's field-level encryption.

## Release procedure

1. CI green on the commit (lint, typecheck, tests, build, migration validation, dependency/secret/container scans — deploys are blocked otherwise).
2. Build and push images tagged with the git SHA.
3. Apply migrations: `pnpm --filter @ghimtech/database db:migrate` (`prisma migrate deploy`) against the target database **before** rolling app processes.
4. Roll api → worker → web.
5. Smoke: `GET /health`, sign-in with MFA, dashboard render, `GET /audit/verify` returns `valid: true`.

## Configuration

All secrets via the platform secret manager (see docs/environment.md). Staging/production refuse to boot without `GHIMTECH_MASTER_KEY`, `GHIMTECH_INDEX_KEY`, and `DATABASE_URL`. Set `GHIMTECH_EFILE_PROVIDER=sandbox` in staging; the real provider name only in production once its adapter is implemented and contract-tested.

## Web hosting note (ghimtech.org)

The current Vercel project points at the pre-monorepo app. To serve GhimTech Tax: set the project root to `apps/web`, framework Next.js, install command `pnpm install --frozen-lockfile`, build `pnpm turbo run build --filter=@ghimtech/web`, and configure `NEXT_PUBLIC_API_URL` to the deployed API. The API and worker are long-running Node processes — host them on a container platform (Fly.io, Railway, Render, ECS), not as serverless functions, so BullMQ and session behavior remain correct.

## Rollback

Images are immutable per SHA — roll back by redeploying the previous tag. Migrations are additive by convention; a migration that must be reverted gets a forward "down" migration (never edit applied migration files). Database restore procedure: docs/backup-recovery.md.
