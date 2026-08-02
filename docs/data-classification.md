# Data classification policy

Four classes govern every field and file in the platform.

## Restricted

SSNs/ITINs, bank routing and account numbers, TOTP secrets, recovery codes, signature payloads, uploaded document contents.
**Rules**: envelope-encrypted at rest with per-record data keys; plaintext exists only transiently at the point of use (transmission boundary, verified download); never in logs, list views, exports, analytics, error trackers, or emails; display is masked-last-4 only; equality lookup only via HMAC blind index. Access to decrypt paths is role-gated and audited.

## Confidential

Return models and calculations, diagnostics, client identity metadata (names, DOBs, addresses, contact info), acknowledgments and rejection details.
**Rules**: TLS in transit, encrypted storage at rest; MFA-verified sessions with explicit permissions; CLIENT role scoped to own records; included in audit payloads only in masked/summary form.

## Internal

Audit events, status histories, aggregate reports, configuration (non-secret).
**Rules**: staff/auditor access per role map; audit data is append-only and hash-chained.

## Public

Marketing content and the sign-in page shell. Nothing else. The application sets `robots: noindex`.

## Handling requirements

- **Communications**: templates must never contain full TINs, bank numbers, or complete return data; use masked values and portal links.
- **AI assistance** (docs/ai-policy.md): restricted data never reaches public AI APIs; AI never computes tax or files returns.
- **Retention**: tax records ≥ 7 years (`RetentionRecord`); permanent deletion is a two-step workflow that refuses while retention holds exist and logs the destruction.
- **Development**: synthetic data only, everywhere outside production. Preview environments receive no production data or keys, ever.
- **Exports**: any bulk export is an audited `security.export` event and must be approved by the administrator.
