# Supabase Auth Migration Plan

1. Add Supabase SSR client helpers for server components/actions and middleware.
2. Replace Clerk middleware with Supabase session refresh and protected-route redirects.
3. Replace `requireUser()` with Supabase Auth user validation, allowlist checks, and local user lazy-provisioning.
4. Replace Clerk sign-in/sign-up pages with native server-action forms.
5. Replace dashboard `UserButton` with an app-owned sign-out control.
6. Remove the Clerk webhook and dependencies.
7. Update env examples, docs, seed language, and schema comments.
8. Verify with lint, type-check, and production build.
