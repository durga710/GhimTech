# API reference

Base URL: `http://localhost:4000` (dev). All protected routes require `Authorization: Bearer <token>` from an MFA-verified session. Errors return `{ "error": string }` with an appropriate status. A generated OpenAPI spec is tracked as follow-up work (docs/PROGRESS.md); this document is the current authority.

## Auth

| Method & path           | Permission | Notes                                                                                                                                                                 |
| ----------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /auth/login`      | —          | `{email, password}` → `{mfaRequired, mfaToken, mfaEnrollment?}`. First login returns the TOTP secret + otpauth URL. Uniform failures; lockout after 5 attempts (423). |
| `POST /auth/mfa/verify` | —          | `{mfaToken, code}` → `{token, user, recoveryCodes?}`. Rotates to a full session.                                                                                      |
| `POST /auth/logout`     | session    | Revokes the session.                                                                                                                                                  |
| `GET /auth/me`          | session    | Current user.                                                                                                                                                         |
| `POST /auth/password`   | session    | `{currentPassword, newPassword}`; revokes all sessions.                                                                                                               |

## Users (ADMIN)

`POST /users` (create, temp password, reset forced) · `GET /users` · `POST /users/:id/disable` (revokes sessions; cannot disable yourself).

## Clients

`POST /clients` (`clients:write`) — TIN validated, encrypted, blind-indexed; 409 on duplicate SSN. `GET /clients` (`clients:read`). `GET /clients/me` (client role). `GET /clients/:id` (staff, or the client's own; audited). `POST /clients/:id/portal-account` — creates the CLIENT login.

## Returns

| Route                                              | Permission          | Notes                                                                                                                                                                                          |
| -------------------------------------------------- | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /returns`                                    | returns:write       | `{clientId, taxYear, filingStatus, includePennsylvania}`; one return per client-year.                                                                                                          |
| `GET /returns[?clientId&status]`                   | role-scoped         | Clients see only their own.                                                                                                                                                                    |
| `GET /returns/:id`                                 | role-scoped         | Includes `allowedTransitions` for the caller's role.                                                                                                                                           |
| `PUT /returns/:id/model`                           | returns:write       | Full `TaxReturnModel`; 409 when locked; invalidates signatures.                                                                                                                                |
| `POST /returns/:id/calculate`                      | returns:calculate   | Runs both engines → `{snapshotHash, federal, pennsylvania, diagnostics}` with full traces; persists the snapshot. 422 for unsupported tax years.                                               |
| `POST /returns/:id/transition`                     | state-machine roles | `{toStatus, note?}`. Guards: snapshot before review, reviewer separation, blocking diagnostics stop the path to filing, SIGNED only via signatures, READY_TO_EFILE requires a valid signature. |
| `GET /returns/:id/history`                         | role-scoped         | Status events with actors and prior state.                                                                                                                                                     |
| `GET /returns/:id/package[?watermark&format=html]` | role-scoped         | Form documents (1040, PA-40, authorization). Clients always get CLIENT_COPY; accepted returns render final copies; `format=html` returns the printable rendering.                              |
| `POST /returns/:id/signatures`                     | returns:sign        | `{signatureText, consentAcknowledged:true, reviewedSnapshotHash}`; must match the current snapshot; captures IP/UA, issues a certificate hash, transitions to SIGNED.                          |
| `GET /returns/:id/signatures`                      | role-scoped         | Signature records incl. invalidation reasons.                                                                                                                                                  |

## E-file

`POST /returns/:id/efile` (`efile:submit`) — requires READY_TO_EFILE or RESUBMISSION_READY; walks VALIDATING → … → ACKNOWLEDGMENT_PENDING; 409 on duplicates/guards, 422 on provider validation failure, 503 for unconfigured providers. `POST /returns/:id/efile/poll` (`efile:read`) — idempotent; applies ACCEPTED or REJECTED → CORRECTION_REQUIRED and stores the acknowledgment with explained rejection codes. `GET /returns/:id/submissions`.

## Documents

`POST /documents` — `{clientId?, returnId?, filename, contentBase64, category?}`; magic-byte + size validation, malware scan (422 quarantines), OCR suggestions returned for verification. Clients upload only to their own record. `GET /documents[?clientId&returnId]` (role-scoped). `POST /documents/:id/verify` (`documents:write`). `GET /documents/:id/content` (role-scoped, audited).

## Platform

`GET /health` (public) · `GET /dashboard` (`reports:read`) · `GET /audit[?entityId&limit]` and `GET /audit/verify` (`audit:read`).
