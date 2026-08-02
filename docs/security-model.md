# Security model

GhimTech Tax handles the most sensitive class of personal financial data. The platform is designed as a high-risk financial system from the first commit.

## Data classification

| Class            | Examples                                                                                      | Handling                                                                                                                                                                                                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Restricted**   | SSN/ITIN, bank routing + account numbers, TOTP secrets, signature payloads, document contents | Envelope-encrypted at rest (AES-256-GCM, per-record data keys wrapped by the master key). Decrypted only at the point of use (e-file transmission boundary, document download). Never logged, never in list views, never in analytics. Displayed only as masked values (`***-**-1234`, `******4321`). |
| **Confidential** | Return models, calculation results, diagnostics, client contact data                          | Encrypted in transit and at rest (database/storage encryption). Access requires an authenticated, MFA-verified session with the right permission; client users scoped to their own records.                                                                                                           |
| **Internal**     | Audit events, status history, aggregate metrics                                               | Role-gated (ADMIN/AUDITOR for audit). Payloads carry masked values only.                                                                                                                                                                                                                              |

See docs/data-classification.md for the full policy, retention, and destruction rules.

## Cryptography

- **Field encryption**: `v1` envelope format — random 256-bit data key per value, AES-256-GCM for both data and key wrap. Master key from `GHIMTECH_MASTER_KEY` (KMS/secret-manager backed outside development). Rotation re-wraps data keys without re-encrypting payloads.
- **Blind indexes**: HMAC-SHA256 with a dedicated index key enables equality lookup (duplicate SSN detection) without decrypting or storing plaintext.
- **Passwords**: scrypt (N=2^15, r=8) with per-user salts and timing-safe comparison; 12+ character policy for staff.
- **Sessions**: opaque 256-bit tokens stored only as SHA-256 digests; 30-minute TTL; token rotation at MFA verification; revocation on logout, password change, and user disable.
- **MFA**: TOTP (RFC 6238) mandatory for every account; enrollment forced at first login; one-time recovery codes stored hashed.

## Authentication and authorization

Login is two-stage: password → TOTP. Failures are uniform (no account-existence oracle), per-account lockout triggers after 5 failures (15 minutes), and global rate limiting caps request volume. Every protected route declares a permission from the shared role→permission map (enforced server-side; the UI uses the same map only for rendering). Client users are further scoped to their own client record in every handler that touches client data. Permission denials are security-audited.

## Application security

- Input validation with zod at every boundary; identifiers validated structurally (SSN/ITIN ranges, ABA routing checksum).
- SQL injection prevented by Prisma parameterization; no raw SQL.
- XSS: React escaping in the app; the form renderer HTML-escapes all user-controlled fields (tested).
- Upload hardening: extension allowlist verified against magic bytes (spoofed extensions rejected), 25 MB cap, malware-scan boundary with a quarantine path (EICAR-exercised in dev; ClamAV or hosted scanning in production).
- SSRF: the API makes no user-controlled outbound requests; provider adapters use fixed configured endpoints.
- Secure headers via helmet; CORS pinned to the web origin; the web app ships a strict CSP, `X-Frame-Options: DENY`, and `nosniff`.
- CSRF: no cookie-based authentication exists; bearer tokens are attached explicitly per request.
- Logs redact authorization headers and sensitive fields; a scrubber strips SSN- and account-shaped strings from error text as defense in depth.

## Audit and immutability

Every sensitive action appends a hash-chained audit event (`hash = sha256(prevHash ‖ canonical(event))`). Chain verification detects any insertion, mutation, or deletion and is exposed at `/audit/verify` (surfaced on the audit page). Filing submissions record the chain head at transmission time as an anchor. Audit events are append-only at the schema level — nothing updates or deletes them.

## Filing safeguards

- Blocking diagnostics stop unsupported or inconsistent returns before the client-review stage and again at the orchestrator.
- Signatures bind to the exact snapshot hash the client reviewed; any model change invalidates them and forces re-review + re-signature.
- Duplicate-submission protection keys on (return, snapshot hash); only a rejected submission can be corrected and resubmitted.
- SYSTEM-only transitions (validation → transmission → acknowledgment) cannot be forced by any human role.

## Operational security

Secrets live in the environment/secret manager only — never in the repository (CI runs gitleaks on every push). Dependencies and containers are scanned in CI. Backups are encrypted (docs/backup-recovery.md); incident handling is documented in docs/incident-response.md. Production taxpayer data never enters preview or development environments; development uses synthetic fixtures exclusively.
