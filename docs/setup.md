# Local development setup

## Prerequisites

- Node.js 22+
- pnpm 10+ (`corepack enable pnpm`)
- Docker (Postgres + Redis via docker-compose)

## First run

```bash
git clone <repo> && cd ghimtech-tax
pnpm install
cp .env.example .env
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # → GHIMTECH_MASTER_KEY
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"  # → GHIMTECH_INDEX_KEY
```

### Option A — zero-infrastructure (fastest)

The API runs on an in-memory store with the mock e-file provider; no database or Redis required. Development only.

```bash
GHIMTECH_STORE=memory pnpm --filter @ghimtech/api dev     # API on :4000
pnpm --filter @ghimtech/web dev                            # Web on :3000
```

Sign up path: there is no self-registration. Create the first admin by seeding (Option B) or, for a memory-store session, use the API test helpers as reference for creating a user.

### Option B — full stack

```bash
docker compose up -d                       # Postgres :5432, Redis :6379
pnpm --filter @ghimtech/database db:migrate:dev
pnpm --filter @ghimtech/database db:seed   # synthetic users + client
pnpm dev                                   # turbo: api + web (+ worker if REDIS_URL set)
```

Seeded users (all `GhimTechDev2026!`; password reset + MFA enrollment forced on first login):

| Email                      | Role     |
| -------------------------- | -------- |
| admin@dev.ghimtech.test    | ADMIN    |
| preparer@dev.ghimtech.test | PREPARER |
| reviewer@dev.ghimtech.test | REVIEWER |
| auditor@dev.ghimtech.test  | AUDITOR  |
| client@dev.ghimtech.test   | CLIENT   |

On first sign-in you'll be shown a TOTP secret — add it to any authenticator app (the code is required on every subsequent login).

## Everyday commands

```bash
pnpm lint          # eslint across packages + next lint in web
pnpm typecheck     # tsc everywhere
pnpm test          # vitest suites (engines, security, e-file, api e2e)
pnpm build         # full build including next build
pnpm format        # prettier
```

## Trying the full filing flow locally

1. Sign in as the preparer → Clients → New client (use a synthetic SSN like 123-45-6789).
2. Open the client → Start 2025 return → enter a W-2 → Save → Calculate.
3. Walk the transitions to READY_FOR_REVIEWER; sign in as the reviewer to approve.
4. Move to AWAITING_CLIENT_REVIEW → AWAITING_SIGNATURE; sign (as admin or the client portal user).
5. READY_TO_EFILE → Transmit e-file → Check acknowledgment → ACCEPTED → Archive.
6. To exercise a rejection, use a client SSN ending in 9999 and follow the correction flow.

## Troubleshooting

- **"Using ephemeral encryption keys" warning**: set both keys in `.env` — otherwise encrypted values are unreadable after an API restart.
- **Login says account locked**: five failed attempts lock for 15 minutes; use another seeded user or wait.
- **`prisma migrate` connection errors**: confirm `docker compose ps` shows postgres healthy and `DATABASE_URL` matches compose credentials.
