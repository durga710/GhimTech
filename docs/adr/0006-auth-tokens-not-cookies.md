# ADR 0006 — Bearer sessions in sessionStorage; no auth cookies

**Status**: accepted · **Date**: 2026-08-02

## Decision

Sessions are opaque bearer tokens (hashed at rest, 30-minute TTL, rotated at MFA verification) held in `sessionStorage` and attached explicitly per request. No authentication cookies exist.

## Rationale

Cookie auth would demand CSRF tokens, SameSite tuning, and cross-origin cookie plumbing between the web and API hosts. With explicit bearer tokens, CSRF is structurally impossible (no ambient credentials), CORS stays a simple allowlist, and revocation is exact (server-side hash lookup). The XSS-theft risk that cookies' `HttpOnly` would mitigate is addressed where XSS must be stopped anyway — strict CSP, React escaping, renderer escaping — and bounded by short TTL, rotation, and full audit of session use.

## Consequences

Sessions don't survive tab closure (acceptable for a professional tool; arguably a feature). If long-lived "remember me" is ever wanted, add a rotating refresh-token endpoint rather than moving to cookies.
