# Threat model

Scope: the GhimTech Tax platform (web, API, worker, database, object storage, e-file provider boundary) operated for a small private client base. Methodology: STRIDE per trust boundary.

## Assets

1. Taxpayer PII (SSNs, DOBs, addresses) and financial data (income, bank accounts)
2. Signed returns and filing authorizations
3. Filing capability itself (ability to transmit returns in someone's name)
4. Audit integrity
5. Platform credentials and encryption keys

## Trust boundaries

- Browser ↔ API (internet)
- API ↔ database / object storage
- API/worker ↔ e-file provider (third party)
- Operator laptops ↔ production (deploy/secret access)

## Key threats and mitigations

| Threat                            | Vector                      | Mitigations                                                                                                                                                          |
| --------------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Credential stuffing / brute force | Login endpoint              | Uniform failures, per-account lockout, rate limiting, mandatory TOTP, audit of failures                                                                              |
| Session theft                     | XSS, token leakage          | React/renderer escaping + CSP; tokens in sessionStorage with 30-min TTL and rotation; hashed at rest; no cookies                                                     |
| Privilege escalation              | Missing server-side checks  | Permission map enforced per-route; client scoping in handlers; reviewer separation; SYSTEM-only transitions; permission tests in CI                                  |
| IDOR on client data               | Guessable IDs               | UUIDs plus explicit ownership checks on every client-scoped route (tested)                                                                                           |
| Malicious uploads                 | Document vault              | Magic-byte validation, allowlist, size cap, malware scan + quarantine, encrypted storage, no public URLs                                                             |
| Database exfiltration             | SQLi, backup theft, insider | Prisma parameterization; restricted-class fields useless without the master key (held outside the DB); encrypted backups; audit trail                                |
| Tampering with filed returns      | Post-signature edits        | Snapshot-hash binding, lock states, signature invalidation, append-only hash-chained audit                                                                           |
| Duplicate/forged filing           | Replay, race                | (return, snapshot) uniqueness, orchestrator guards, provider-side idempotent receipt handling                                                                        |
| Rogue/compromised provider        | Third-party boundary        | Minimal data sent (normalized model, TIN only at transmission), provider isolation behind contract, acknowledgments verified and recorded, ability to swap providers |
| Log-based leakage                 | Errors, telemetry           | Redaction config, sensitive-string scrubber, masked audit payloads                                                                                                   |
| Key compromise                    | Secret manager breach       | Keys separated (master vs index), rotation procedure (re-wrap), sessions revocable in bulk, incident runbook                                                         |
| Supply chain                      | Malicious dependency        | Lockfile-pinned installs, CI dependency audit, container scanning, minimal dependency surface in domain packages                                                     |

## Accepted risks (current stage)

- Single-region deployment; availability targets are modest for a private practice.
- Development in-memory store holds data unencrypted in process memory — development only, synthetic data only.
- The mock scanner (EICAR) is not real AV; production must wire ClamAV or a hosted scanner before accepting external uploads.
- OpenAPI spec generation is manual (docs/api.md) pending schema-annotated route generation.

Review cadence: revisit this document at every provider integration, before any commercial expansion, and after any security incident.
