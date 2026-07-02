# Ghimtech — Durga's Founder Workspace

> Invite-gated workspace platform for **Durga Ghimeray** (USMC Veteran · Founder · Builder) and team.
> Public site at **[ghimtech.org](https://ghimtech.org)** · GitHub: **[durga710/GhimTech](https://github.com/durga710/GhimTech)**

---

## First push (one-time setup)

You're starting from an empty repo. To push this codebase:

```bash
# From the unzipped project folder:
bash scripts/first-push.sh
```

That script initializes git, sets the remote to `durga710/GhimTech`, makes the initial commit, and pushes to `main`. **It will NOT push `.env.local`** — secrets stay on your machine.

After pushing, the rest of the setup is:

```bash
npm install
cp .env.example .env.local           # Then fill in Supabase Auth + database values
npm run db:push                       # Create tables in Supabase
npm run dev                           # Start dev server

# Sign up once at /sign-up, copy your Supabase Auth user id
SEED_AUTH_USER_ID=uuid npm run db:seed   # Populates the dashboard
```

See [DEPLOY.md](./DEPLOY.md) for the full deployment walkthrough including Vercel + ghimtech.org DNS.

---

## What this is

An **invite-gated** founder workspace:

- **Public marketing pages** — landing, about, experience, RayHealthEVV deep-dive, contact
- **Protected Command Center** — workspace accounts with projects, tasks, analytics, AI brief, peace-of-mind mode

The owner email can sign up directly. Teammates can create accounts only with an invite code configured by you. Real DB, real auth, real APIs, working end-to-end.

---

## Brand identity

**One mark, one voice, zero drift.** See [BRAND.md](./BRAND.md) for the full system.

- Mark + lockup + wordmark in `/public/brand/`
- Single `<Logo>` component at `src/components/shared/logo.tsx` — used everywhere
- Five-color system: `carbon`, `signal`, `vital`, `flare`, `critical`
- Two typefaces: Geist (display + body) + JetBrains Mono (labels + data)

---

## Stack

- **Next.js 15** App Router + TypeScript + Tailwind
- **Framer Motion** for animation
- **Supabase Auth** for restricted dashboard authentication
- **Prisma** ORM against **Supabase Postgres**
- **Zod** for input validation across every API route
- Deployed on **Vercel**

---

## Build phases

- **Phase 1 ✓** — Design system, layout shell, landing page
- **Phase 2 ✓** — About + Experience pages with animated timeline
- **Phase 3 ✓** — Projects deep-dive (RayHealthEVV) + Contact
- **Phase 4 ✓** — Supabase Auth + Dashboard widgets (UI)
- **Phase 5 ✓** — **Real DB, real APIs, real security wired end-to-end**
- **Phase 6 ✓** — **Brand system: mark, lockup, OG image, favicon, manifest**
- **Phase 7** — Admin views (audit log, contact inbox), AI brief generator
- **Phase 8** — Command palette, keyboard shortcuts, polish

---

## Security model

**Auth flow**

1. Supabase middleware (`src/middleware.ts`) refreshes SSR auth cookies and gates `/dashboard`, `/admin`, and `/api/private`
2. Signup allows the owner email or a valid `AUTH_TEAM_INVITE_CODES` value
3. Inside protected handlers, `requireUser()` validates the Supabase user with `getUser()` and resolves it to a local User row
4. Every Prisma query filters by `userId` — no cross-user data leakage possible
5. Every write hits the audit log via `audit({...})`

**Rate limiting**

- Public `/api/contact`: 5 submissions per IP per hour
- Authenticated writes: 30–200 ops/hour per user depending on endpoint
- In-memory limiter; upgrade path to Upstash Redis documented in `src/lib/rate-limit.ts`

**Ownership enforcement**

- Single-resource endpoints (e.g. `/api/projects/[id]`) always look up the row, then check `row.userId === user.id`
- If not yours: returns **404** (not 403) so we never leak resource existence
- New entities created with `userId` from auth context, never from request body

**Sensitive data**

- Database URLs and server-only secrets marked sensitive in Vercel env
- Audit log captures IP + user-agent on every write
- DB cascades wipe child rows on User deletion (right-to-be-forgotten ready)

---

## API surface

All authenticated endpoints. JSON envelopes: `{ ok: true, data: {...} }` or `{ ok: false, error: {...} }`.

| Endpoint | Methods | Purpose |
|---|---|---|
| `/api/projects` | GET, POST | List + create projects |
| `/api/projects/[id]` | GET, PATCH, DELETE | Single project ops (soft + hard delete) |
| `/api/tasks` | GET, POST | List + create tasks (with status/priority/project filters) |
| `/api/tasks/[id]` | GET, PATCH, DELETE | Single task ops (auto-emits analytics on completion) |
| `/api/notes` | GET, POST | List + create notes |
| `/api/notes/[id]` | GET, PATCH, DELETE | Single note ops |
| `/api/notifications` | GET, POST | List + mark-all-read |
| `/api/notifications/[id]` | PATCH, DELETE | Read/unread, dismiss |
| `/api/preferences` | GET, PATCH | User preferences (Peace of Mind, density, etc.) |
| `/api/contact` | POST | **Public.** Rate-limited contact form |

---

## File layout

```
public/
  brand/                 — canonical mark, lockup, wordmark, favicon, OG, app icon
  manifest.webmanifest   — PWA manifest

src/
  app/
    api/                 — REST endpoints (see API surface table)
    dashboard/           — Protected Command Center
    sign-in/, sign-up/   — Supabase Auth forms
    (public)/            — Landing, about, experience, projects, contact
  components/
    dashboard/           — Sidebar, topbar, 7 widgets
    landing/             — Hero, values, featured project, CTA
    projects/            — RayHealth deep-dive components
    shared/
      logo.tsx           — CANONICAL Logo component (single source of truth)
      top-nav.tsx, site-footer.tsx, count-up.tsx, section-header.tsx
  lib/
    auth.ts              — requireUser / requireUserId / getOptionalUser
    audit.ts             — Audit log writer
    rate-limit.ts        — In-memory rate limiter
    api-response.ts      — Standard response envelope + helpers
    validation.ts        — Zod schemas (shared)
    prisma.ts            — Prisma client singleton
    dashboard/data.ts    — Server-side query orchestrator
  middleware.ts          — Supabase Auth route gating

prisma/
  schema.prisma          — Data model (14 models, single-operator)
  seed.ts                — Seed script

scripts/
  first-push.sh          — Initialize git + push to github.com/durga710/GhimTech
```

---

## Brand governance

The RayHealth deep-dive uses precise language: **"designed to support"** EVV, privacy, and state requirements. We do NOT claim blanket federal certification. Compliance section includes an explicit footnote disclaimer. Do not change to stronger claims without legal review.
