# Database design

Schema: `packages/database/prisma/schema.prisma` (PostgreSQL, Prisma). Initial migration: `prisma/migrations/0001_init/migration.sql`.

## Entity overview

```
Organization ─┬─ User ─┬─ Session ── Device
              │        ├─ Review / Signature / Note / Task / AuditEvent
              │        └─ (CLIENT role) ↔ Client.userId
              └─ Client ─┬─ IdentityRecord (encrypted TIN + blind index)
                         ├─ SpouseRecord / DependentRecord (encrypted TINs)
                         ├─ Address / BankAccount (encrypted numbers)
                         ├─ Document ─┬─ OcrResultRecord
                         │            ├─ DocumentVerificationRecord
                         │            └─ DocumentAccessLog
                         ├─ Communication / ConsentRecord / Note / Task
                         └─ TaxReturn ─┬─ IncomeRecord
                                       ├─ ReturnStatusEvent (append-only lifecycle)
                                       ├─ CalculationSnapshotRecord (frozen model+results, unique per hash)
                                       ├─ DiagnosticRecord
                                       ├─ Review / Signature
                                       └─ FilingSubmission ── FilingAcknowledgment
TaxYearConfigRecord · ProviderConfiguration · RetentionRecord · SecurityEvent · AuditEvent (hash-chained)
```

## Conventions

- Monetary amounts are integer cents inside JSON payloads; form lines are whole dollars derived at render.
- Restricted fields are stored only as `*Encrypted` ciphertext plus `*Last4` and, where lookup is needed, an HMAC `*Index` (unique for duplicate detection).
- `TaxReturn.model` holds the normalized `TaxReturnModel` as JSON — the calculation input of record; `CalculationSnapshotRecord.payload` freezes model + both engine results keyed by canonical SHA-256.
- Uniqueness that encodes business rules: one return per (client, taxYear); one snapshot per (return, hash); one submission per (return, hash, jurisdiction); one acknowledgment per submission; provider submission ids unique.
- Append-only tables: `AuditEvent` (monotonic `sequence`, `hash`, `previousHash`), `ReturnStatusEvent`, `DocumentAccessLog`. No update/delete paths exist in the application for these.
- Indexes cover the hot paths: returns by status, clients by preparer and name, documents by client/category and sha256, audit by actor/action/entity and time.

## Migrations

`pnpm --filter @ghimtech/database db:migrate:dev` locally; `db:migrate` (deploy) in environments. CI applies migrations to a clean Postgres and fails on schema drift (`prisma migrate diff --exit-code`). Applied migrations are never edited — fixes are new migrations.
