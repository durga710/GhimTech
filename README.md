# GhimTech

Software built around how your business actually works.

GhimTech is Durga Ghimeray’s software studio, focused on custom business software, CRM systems, workflow automation, and operational tools. CyanjelHomeCare LLC is the flagship customer.

## Application

The public website uses Next.js App Router, React, and TypeScript in `apps/web`. Pages render on the server; interactive workflow explorers and the enquiry form are small client components. Styling is local CSS with system fonts and no animation library.

Requirements: Node.js 22 or newer, pnpm 10.33.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open http://localhost:3000.

```sh
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

## Configuration

Copy `.env.example` to `apps/web/.env.local` for local development. Configure production values through the hosting provider.

- `NEXT_PUBLIC_SITE_URL`: the canonical public origin, defaulting to https://ghimtech.org.

Enquiry delivery uses one of two modes. The webhook wins when both are configured.

- `RESEND_API_KEY` and `ENQUIRY_INBOX`: email each enquiry through [Resend](https://resend.com) to that inbox. `ENQUIRY_FROM` is optional; the default `onboarding@resend.dev` sender only delivers to the Resend account owner's own address, so set a verified-domain sender for anything else.
- `PROJECT_WEBHOOK_URL` and `PROJECT_WEBHOOK_TOKEN`: an HTTPS endpoint under your control that durably receives enquiries, with its server-only bearer credential.

Rate limiting needs a shared Redis service.

- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`, or the `KV_REST_API_URL` and `KV_REST_API_TOKEN` pair that the Upstash integration on the Vercel Marketplace injects.
- `RATE_LIMIT_SECRET`: optional server-only secret used to hash identifiers. When unset it is derived from the Redis token.

The form fails closed with an explicit, recoverable error when delivery or rate limiting is unconfigured. It does not claim to have received an enquiry when nothing has been delivered. The page and footer show `hello@ghimtech.org` as a direct alternative.

A webhook receiver must validate the bearer token, honor the `Idempotency-Key` header for at least 24 hours, and acknowledge with 2xx only after durable receipt. Retries keep the same idempotency key for unchanged content. Do not expose these credentials through public environment variables.

On Vercel, the endpoint uses the platform-controlled forwarded IP header. Other hosts use a shared request bucket until trusted proxy handling is explicitly configured. Rate limits are 20 attempts per request-identity bucket and 5 per normalized email address per hour. The application stores hashed rate-limit identifiers with a one-hour expiry.

## Content

- `apps/web/src/lib/content.ts`: service descriptions, projects, workflow modules, and articles.
- `apps/web/src/app/work/cyanjel-homecare/page.tsx`: flagship case study.
- `apps/web/src/app/globals.css`: responsive design system.

The case study separates confirmed customer positioning from illustrative workflow explanations. Specific product capabilities, real screenshots, and measured outcomes require source material or founder confirmation before publication. The project data model supports these fields without inventing them.

For a future case study, add its project data and route, then include it in the Work index. Sitemap entries are derived from the content list.

## Deployment

The site is deployed on Vercel from this repository. The Vercel project's Root Directory must be `apps/web`, and the root `vercel.json` only declares the Next.js framework; do not add build, install, or output paths there, because Vercel resolves them relative to the root directory and doubles the path. Preview hosts must set `NEXT_PUBLIC_SITE_URL` to their own origin if the form is to be exercised there.

Set GHIMTECH_STANDALONE=1 when building a Linux self-hosted image to enable standalone output. Copy the standalone server, `public`, and `.next/static` into the runtime image as documented by Next.js.

Read [release notes](docs/release-notes.md) before publishing.

© GhimTech. Author and maintainer: Durga Ghimeray.
