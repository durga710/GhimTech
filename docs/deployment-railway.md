# Deploying to Railway

The API (and optionally the worker) run on Railway; the web app stays on Vercel. Database migrations run automatically before each API start, and the first administrator is created by the bootstrap variables on an empty database.

## One-time setup (~10 minutes in the dashboard)

### 1. Create the project and database

1. https://railway.com/new → **Deploy from GitHub repo** → select `durga710/GhimTech` (branch `main`).
2. When the first service appears, rename it **api**.
3. In the project canvas: **+ New → Database → PostgreSQL**.

### 2. Configure the api service

Open the **api** service → **Settings**:

- **Config-as-code / Config file path**: `infrastructure/railway.api.json`
  (this sets the Dockerfile, the `/health` healthcheck, and a start command that applies Prisma migrations before booting).

Then **Variables** → add:

| Variable                            | Value                                                    |
| ----------------------------------- | -------------------------------------------------------- |
| `GHIMTECH_ENV`                      | `production`                                             |
| `DATABASE_URL`                      | `${{Postgres.DATABASE_URL}}`                             |
| `GHIMTECH_MASTER_KEY`               | output of `openssl rand -hex 32`                         |
| `GHIMTECH_INDEX_KEY`                | output of `openssl rand -hex 32` (a **different** value) |
| `GHIMTECH_CORS_ORIGIN`              | `https://ghimtech.org,https://www.ghimtech.org`          |
| `GHIMTECH_EFILE_PROVIDER`           | `mock` (until a real transmitter adapter exists)         |
| `GHIMTECH_BOOTSTRAP_ADMIN_EMAIL`    | your email                                               |
| `GHIMTECH_BOOTSTRAP_ADMIN_PASSWORD` | a 12+ character temporary password                       |

Store both keys in a password manager immediately — losing the master key makes encrypted fields (SSNs, bank data) permanently unreadable. See docs/backup-recovery.md.

### 3. Expose the API

**Settings → Networking → Generate Domain** (gives `something.up.railway.app`), or add the custom domain `api.ghimtech.org` and create the CNAME Railway shows you.

Deploy finishes when the healthcheck passes; verify by opening `https://<api-domain>/health` — expect `{"ok":true,...}`.

### 4. Point the web app at the API

In **Vercel** → the ghimtech.org project → **Settings → Environment Variables**:

- `NEXT_PUBLIC_API_URL` = `https://<api-domain>` (Production)

Then **Deployments → Redeploy** the latest production deployment (the value is baked in at build time).

### 5. First sign-in

1. Go to https://ghimtech.org → sign in with the bootstrap email/password.
2. You'll be walked through TOTP enrollment (scan the secret into an authenticator app) and shown one-time recovery codes — save them.
3. Change the forced password, then **delete both `GHIMTECH_BOOTSTRAP_*` variables** in Railway.
4. Create preparer/reviewer accounts from **Administration**.

## Worker (optional — needed only for background acknowledgment polling)

The UI's "Check acknowledgment" button covers the mock/sandbox providers. When a real provider adapter lands:

1. **+ New → Database → Redis** in the project.
2. **+ New → GitHub repo** (same repo), rename **worker**, config file path `infrastructure/railway.worker.json`.
3. Variables: `REDIS_URL=${{Redis.REDIS_URL}}`, `GHIMTECH_API_URL` = the api service's **private** URL, `GHIMTECH_WORKER_TOKEN` = a session token for a dedicated service account.

## Notes

- Every push to `main` redeploys the api service; migrations apply automatically on boot (`prisma migrate deploy` is idempotent).
- Postgres backups: enable Railway's backup schedule on the Postgres service; restore procedure in docs/backup-recovery.md.
- The seed script is for development only and refuses to run in production — the bootstrap variables are the production path to a first account.
