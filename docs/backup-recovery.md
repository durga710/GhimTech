# Backup and recovery

## What is backed up

1. **PostgreSQL** — daily automated snapshots + WAL/PITR where the platform supports it. Backups inherit field-level encryption for restricted data (ciphertext without keys is inert) and must additionally be platform-encrypted at rest.
2. **Object storage** (documents) — versioned bucket with cross-region replication; objects are encrypted before write.
3. **Keys** — `GHIMTECH_MASTER_KEY` and `GHIMTECH_INDEX_KEY` live in the secret manager with its own backup/versioning. **Losing the master key loses every restricted field permanently** — treat key custody as the single most critical operational duty. Keep a sealed offline copy under dual control.

## Retention

Tax records: minimum 7 years (IRS record-keeping horizon) via `RetentionRecord` policies; backups: 35 daily, 12 monthly. Deletion requests honor retention holds — the permanent-deletion workflow refuses while a retention record is active.

## Recovery procedures

**Database loss** → restore the latest snapshot (or PITR to just before the incident), boot the API against it, run `GET /audit/verify`; a broken chain indicates the restore point predates chain events — reconcile against the anchor hashes stored on filing submissions.

**Key rotation (routine)** → generate a new master key; run the re-wrap job (decrypt data keys with the old master, wrap with the new — payload ciphertext untouched); keep the old key sealed until re-wrap verifies; update the secret manager version.

**Key compromise (suspected)** → rotate immediately as above, revoke all sessions (`revokeUserSessions` for every user), force password resets, follow docs/incident-response.md.

**Restore drill** — quarterly: restore the latest backup to an isolated environment, run migrations, verify the audit chain and a sample decryption with the escrowed key. A backup that has not been restore-tested is not a backup.
