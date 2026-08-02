# Environment variables

| Variable                       | Required     | Default                 | Purpose                                                                                                           |
| ------------------------------ | ------------ | ----------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `GHIMTECH_ENV`                 | no           | `development`           | `development` / `test` / `staging` / `production`. Staging+production enforce keys and Prisma store.              |
| `PORT`, `HOST`                 | no           | `4000`, `0.0.0.0`       | API bind address.                                                                                                 |
| `GHIMTECH_MASTER_KEY`          | prod/staging | dev: ephemeral          | 32-byte hex master key for envelope encryption. Source from the secret manager. Rotation: see backup-recovery.md. |
| `GHIMTECH_INDEX_KEY`           | prod/staging | dev: ephemeral          | 32-byte hex HMAC key for blind indexes (duplicate SSN detection). Distinct from the master key.                   |
| `DATABASE_URL`                 | prod/staging | —                       | PostgreSQL connection string. Presence selects the Prisma store.                                                  |
| `GHIMTECH_STORE`               | no           | auto                    | `memory` forces the in-memory store (development/tests only).                                                     |
| `GHIMTECH_EFILE_PROVIDER`      | no           | `mock`                  | `mock` / `sandbox` / `column-tax` / `april` / `generic`. Unimplemented adapters refuse to run.                    |
| `GHIMTECH_SESSION_TTL_MINUTES` | no           | `30`                    | Session lifetime after MFA.                                                                                       |
| `GHIMTECH_CORS_ORIGIN`         | no           | `http://localhost:3000` | Comma-separated allowed web origins.                                                                              |
| `NEXT_PUBLIC_API_URL`          | web          | `http://localhost:4000` | API base URL baked into the web app.                                                                              |
| `REDIS_URL`                    | worker       | —                       | Redis for BullMQ queues; the worker exits without it.                                                             |
| `GHIMTECH_API_URL`             | worker       | `http://localhost:4000` | API endpoint the worker calls.                                                                                    |
| `GHIMTECH_WORKER_TOKEN`        | worker       | —                       | Bearer token of a dedicated service account used for acknowledgment polling.                                      |

Rules: secrets never enter the repository (CI secret-scans every push); production values live in the deployment platform's secret manager; preview/staging environments must never receive production taxpayer data or production keys.
