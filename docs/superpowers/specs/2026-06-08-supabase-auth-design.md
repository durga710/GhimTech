# Supabase Auth Migration Design

## Goal

Replace Clerk with Supabase Auth so Ghimtech can keep a restricted dashboard signup flow without depending on Clerk.

## Constraints

- Keep the dashboard single-operator by default.
- Do not add a Prisma migration in this pass; production database credentials are already failing and should be fixed separately.
- Preserve existing dashboard data ownership queries, which currently join through `User.id`.
- Store Supabase sessions in SSR cookies via `@supabase/ssr`.

## Decisions

- Use Supabase email/password auth for sign-in and signup.
- Allow only `AUTH_ALLOWED_EMAIL` to sign up or sign in to dashboard surfaces.
- Continue storing the external auth user id in `User.clerkId` for now. The column name is legacy; changing it can happen later with a controlled DB migration.
- Lazy-provision the local `User` and `UserPreferences` row when the authenticated Supabase user first opens the dashboard.
- Remove Clerk middleware, provider, hosted UI components, webhook route, and Clerk dependencies.

## Production Requirements

- Vercel must have valid `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Vercel must have valid `DATABASE_URL` and `DIRECT_URL`; the current production database URL is returning a missing Supabase tenant/user error.
- Rotate the previously exposed Clerk secret even though Clerk is being removed.
