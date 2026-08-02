# Infrastructure

- `api.Dockerfile`, `web.Dockerfile`, `worker.Dockerfile` — multi-stage production images (Node 22 alpine, non-root users, OCI labels). Build from the repository root:

```bash
docker build -f infrastructure/api.Dockerfile -t ghimtech-tax-api .
docker build -f infrastructure/web.Dockerfile -t ghimtech-tax-web .
docker build -f infrastructure/worker.Dockerfile -t ghimtech-tax-worker .
```

- Local development infrastructure (Postgres 17, Redis 7) lives in the root `docker-compose.yml`.
- Deployment procedure, environment matrix, and rollback: `docs/deployment.md`.
- Secrets are injected by the platform's secret manager at runtime — images contain none.
