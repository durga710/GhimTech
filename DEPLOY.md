# Ghimtech / Durga OS — Deployment guide

End-to-end setup for the founder operating system. Production target: **ghimtech.org**.

---

## 1. Local prerequisites

- Node.js 20+
- A Supabase account ([supabase.com](https://supabase.com)) — free tier is fine
- A Clerk account ([clerk.com](https://clerk.com)) — free tier is fine
- A Vercel account for production deploy

---

## 2. Database setup (Supabase)

1. Create a new Supabase project. Region: pick close to Vercel's primary region.
2. From the Supabase dashboard → **Settings → Database**, copy:
   - The **pooled** connection string → goes into `DATABASE_URL` (port 6543)
   - The **direct** connection string → goes into `DIRECT_URL` (port 5432)
3. Add the password Supabase generated to both URLs in place of `[PASSWORD]`.

**Local dev only:** in `.env.local`, point both at the same Supabase project.

---

## 3. Auth setup (Clerk)

1. Create a new Clerk application. Choose **Email + Password** + any social you want.
2. From **API Keys**, copy:
   - Publishable key → `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - Secret key → `CLERK_SECRET_KEY`
3. From **Webhooks** → **Add Endpoint**:
   - URL: `https://ghimtech.org/api/webhooks/clerk` (production)
     - For local dev, use [ngrok](https://ngrok.com) or [Cloudflare Tunnel] to expose `http://localhost:3000` and use that URL temporarily.
   - Events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** → `CLERK_WEBHOOK_SECRET`

### Restricting sign-ups

This is a personal command center, not a public service. After your account
exists, lock the door behind you:

1. Clerk dashboard → **User & Authentication → Restrictions**
2. Enable **Restrict sign-ups**
3. Optionally add your email to **Allowed sign-up emails**

This prevents anyone else from creating an account.

---

## 4. Install + initialize

```bash
npm install
cp .env.example .env.local
# Fill in the values
npm run db:push       # Pushes schema → Supabase, creates all tables
```

Verify the tables exist:

```bash
npm run db:studio     # Opens Prisma Studio in a browser
```

---

## 5. Seed your data (one-time)

The seed needs your real Clerk user ID. The flow:

1. Run `npm run dev` and sign up at `http://localhost:3000/sign-up`
2. Go to Clerk dashboard → **Users** → find yourself → copy the User ID (starts with `user_`)
3. Add it to `.env.local`:
   ```
   SEED_CLERK_ID=user_2abc...
   ```
4. Run:
   ```bash
   npm run db:seed
   ```

This populates 6 projects, 7 active tasks, 30 days of analytics, 5 notifications, the daily AI brief, and 3 goals.

The seed is idempotent — re-running wipes and recreates owned data, but never touches another user.

---

## 6. Verify end-to-end

```bash
npm run dev
```

Visit `http://localhost:3000`:

- Public pages (landing, about, experience, projects, contact) load anonymously
- Click **Dashboard** → should redirect to `/sign-in`
- Sign in → dashboard shows your seeded data
- Toggle Peace of Mind Mode → preference persists (refresh to confirm)
- Submit the contact form → message lands in `ContactMessage` table (verify in Prisma Studio)

---

## 7. Production deploy (Vercel)

1. Push to GitHub.
2. Import in Vercel → connect the GitHub repo.
3. In Vercel project settings → **Environment Variables**, add EVERYTHING from `.env.local` except `SEED_*` vars.
   - Use **Production** scope for the real `DATABASE_URL` / `DIRECT_URL` / Clerk keys.
   - **Important:** mark `CLERK_SECRET_KEY`, `CLERK_WEBHOOK_SECRET`, and `DATABASE_URL` / `DIRECT_URL` as **Sensitive**.
4. Deploy. Vercel runs `prisma generate && next build` automatically (see package.json).
5. Update the Clerk webhook URL from your ngrok URL to `https://ghimtech.org/api/webhooks/clerk`.
6. Configure custom domain: Vercel → **Domains** → add `ghimtech.org` and `www.ghimtech.org`. Vercel will give you DNS records to add at your registrar.

---

## 8. Security checklist before going live

- [ ] Clerk **Restrict sign-ups** enabled (only you can sign up)
- [ ] Webhook secret is set in production env vars
- [ ] All Clerk keys + DB URLs marked sensitive in Vercel
- [ ] Supabase **Row-Level Security**: not currently required because we go through Prisma with explicit `userId` filters; ALL writes/reads use `requireUser()`. But if you ever expose tables directly to a Supabase client (mobile app, etc.), enable RLS first.
- [ ] Verified the `/api/contact` rate limiter works (try 6 submissions in a row — 6th should 429)
- [ ] Test sign-out flow — confirms session ends and `/dashboard` bounces to `/sign-in`
- [ ] Audit log table has entries (check Prisma Studio after a few writes)

---

## 9. Operational commands

```bash
npm run dev              # Local dev server
npm run build            # Production build (runs prisma generate)
npm run db:push          # Push schema changes without migrations
npm run db:migrate       # Create a migration (for production)
npm run db:studio        # GUI for the database
npm run db:reset         # Nuclear: wipe DB, re-push schema, re-seed
npm run db:seed          # (Re-)seed the DB with project data
npm run type-check       # TypeScript verification without building
npm run lint             # ESLint
```

---

## 10. What's where

```
src/
  app/
    api/
      contact/           — public contact form receiver
      notifications/     — list, mark-all-read, individual ops
      notes/             — CRUD
      preferences/       — get / patch user prefs
      projects/          — CRUD + GET/PATCH/DELETE by id
      tasks/             — CRUD + auto-analytics on completion
      webhooks/clerk/    — Clerk user sync (svix-verified)
    dashboard/           — protected command center
    sign-in/, sign-up/   — Clerk-hosted auth pages
    (public pages)
  components/            — UI components
  lib/
    auth.ts              — requireUser, requireUserId, getOptionalUser
    audit.ts             — audit log writer
    rate-limit.ts        — in-memory rate limiter
    api-response.ts      — standardized API envelopes
    validation.ts        — Zod schemas
    prisma.ts            — Prisma client singleton
    dashboard/data.ts    — server-side query orchestrator
  middleware.ts          — Clerk route protection
prisma/
  schema.prisma          — data model
  seed.ts                — initial data
```

---

## 11. Adding a new entity

1. Add the model to `prisma/schema.prisma`
2. `npm run db:push` (dev) or `npm run db:migrate` (prod-safe migration)
3. Add Zod schemas in `src/lib/validation.ts`
4. Create API routes following the pattern in `src/app/api/projects/`:
   - Auth gate via `requireUser()`
   - Validate body via Zod schema
   - Ownership check (look up by id, verify `entity.userId === user.id`)
   - Audit log every write via `audit({...})`
   - Use `ok()` / `apiErrors.*` helpers for responses
5. If the dashboard surfaces it, add a query in `src/lib/dashboard/data.ts`
