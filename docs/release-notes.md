# Software studio rebrand

## Scope

The former product was a complete private application: Next.js UI, Fastify API, BullMQ worker, database schema, document processing, authentication, calculation engines, and filing integrations. These were tightly connected to the retired product. The replacement retains Next.js and the web directory while removing the old runtime packages, routes, fixtures, documents, and deployment manifests from the current source tree.

No database, live service, remote branch, or Git history was altered during local implementation. Existing deployments are not automatically retired by a code change. Coordinate their shutdown and any required private record retention separately before production cutover.

## Identity

Primary headline: Software built around how your business actually works.

Brand statement: We build the systems behind the business.

Warm paper, dark green ink, restrained rust, thin rules, left-aligned editorial typography, and explanatory workflow diagrams. Client interactions use native buttons with pressed states, visible focus, and reduced-motion support. No fabricated dashboards, client logos, testimonials, or statistics.

## Customer evidence

The founder confirms CyanjelHomeCare LLC is fully powered by GhimTech. The brief describes the operating environment but provides individual capabilities as examples. The public case study therefore describes the relationship and operating context, without presenting the proposed examples as a shipped feature inventory.

Product screenshots, verified feature status, technical architecture, and measured outcomes remain to be supplied. Do not publish invented substitutes.

## Delivery gate

Configure enquiry delivery (Resend API key and inbox, or a webhook receiver with its bearer credential) and Redis rate limiting. Verify a real enquiry reaches the intended destination and that retrying it does not duplicate the record. The endpoint returns an error until required services are configured, and the site shows a direct email address as the fallback channel.

Review the privacy notice against the actual receiver, retention practices, and any hosting analytics added at deployment.

## Security design

The form validates on both client and server, limits body size, checks origin and content type, rejects honeypot and implausibly fast submissions, and uses atomic shared rate limiting. Submitted websites are validated as HTTP(S) strings and are never fetched. User content is passed as JSON; the application never renders it as HTML. Delivery requests use a server-only configured URL, reject redirects, and time out. Failed requests do not expose upstream details or log enquiry bodies.

CSP restricts origins, embedding, plugins, form submissions, and network connections. Inline script allowance remains for static Next.js hydration; a nonce policy would require a deliberate rendering tradeoff. No authentication or customer operational data is exposed by this public site.

## Verification

Run lint, typecheck, unit/integration tests, production build, browser route and interaction checks, responsive checks, accessibility checks, and Lighthouse before release. Report measured results, not target scores.
