# GhimTech — ghimtech.org

> The digital headquarters of **GhimTech**, a technology company building AI-powered software.
> Public site at **[ghimtech.org](https://ghimtech.org)** · GitHub: **[durga710/GhimTech](https://github.com/durga710/GhimTech)**

---

## What this is

A premium, multi-product company website plus a protected operator dashboard.

- **Public site** — a cinematic, company-first experience: home, products, technology, about, careers, blog, open source, and contact.
- **Products** — two flagship products, each with a deep product page:
  - **Helix Studio** — a premium AI development platform (prompt → pull request → live preview). The public face of the in-app builder.
  - **RayHealthEVV™** — an enterprise healthcare operations platform for home-care agencies.
- **Protected Command Center** (`/dashboard`) — the operator console, including the live **Helix Studio** builder (`/dashboard/gcode`).

Everything is real software — real DB, real auth, real APIs — working end-to-end.

---

## Brand & design language

Matte black carbon base, electric **signal** blue, **vital** emerald, frosted-glass panels, layered depth, and disciplined motion. See [BRAND.md](./BRAND.md).

- **Type:** Geist (display + body) + JetBrains Mono (labels + data)
- **Color:** five-token system — `ink` (carbon), `signal`, `vital`, `flare`, `critical`
- **Motion:** one easing curve (`[0.22, 1, 0.36, 1]`), spring presets, `blurIn` heroes, scroll-linked reveals — honoring `prefers-reduced-motion`
- **Single `<Logo>`** component in `src/components/shared/logo.tsx`

---

## Stack

- **Next.js 15** App Router + TypeScript + React Server Components
- **Tailwind CSS** + **Framer Motion** + **Radix UI**
- **Supabase Auth** for the protected dashboard
- **Prisma** ORM against **Supabase Postgres**
- **TanStack Query** + **Zustand** for client state
- **Provider-agnostic AI** — OpenAI / Anthropic / local (powering Helix Studio)
- **Zod** validation on every API route · deployed on **Vercel**

---

## Information architecture

| Route | Purpose |
|---|---|
| `/` | Company home — hero, focus areas, products, culture, CTA |
| `/products` | Product index |
| `/products/helix-studio` | Helix Studio flagship — mockup, feature explorer, workflow, architecture, roadmap, changelog, live GitHub status |
| `/products/rayhealth-evv` | RayHealthEVV product page |
| `/technology` | Engineering stack + practices |
| `/about` | Company story + founder origin chapters |
| `/careers` | How we work + open roles |
| `/blog`, `/blog/[slug]` | Engineering & product notes |
| `/open-source` | Live public GitHub repositories |
| `/contact` | Contact form |

Legacy `/projects` and `/experience` URLs 301-redirect to the new IA (see `next.config.ts`).

---

## Content model

The site voice is driven by typed content modules — edit these, not the components:

- `src/lib/company.ts` — company identity, hero, focus areas, culture, stats, nav, footer
- `src/lib/products.ts` — product registry + Helix Studio deep content (features, workflow, architecture, roadmap, changelog)
- `src/lib/projects.ts` — RayHealthEVV deep-dive data
- `src/lib/blog.ts` — blog posts
- `src/lib/content.ts` / `src/lib/narrative.ts` — founder bio + origin-story chapters (used on `/about`)

---

## Develop

```bash
npm install
cp .env.example .env.local      # Supabase Auth + database values
npm run db:push                 # Create tables in Supabase
npm run dev                     # http://localhost:3000
```

Quality gates:

```bash
npm run type-check              # tsc --noEmit
npm run lint                    # eslint
npm test                        # node test runner
npm run build                   # production build
```

See [DEPLOY.md](./DEPLOY.md) for the full Vercel + DNS walkthrough.

---

## SEO & performance

- Per-page metadata + Open Graph; JSON-LD (`Organization`, `WebSite`, `SoftwareApplication`, `BlogPosting`)
- Product pages are static with hourly ISR; blog posts are statically generated
- `sitemap.xml` is generated from the product registry; `robots.txt` gates `/dashboard`, `/admin`, `/api`

---

## Brand governance

The RayHealthEVV deep-dive uses precise language: **"designed to support"** EVV, privacy, and state requirements. We do **not** claim blanket federal certification. Do not strengthen these claims without legal review.
