# GhimTech Full Redesign Design

## Goal

Redesign the full GhimTech experience so `ghimtech.org` reads as a serious, premium, AI-native software company within five seconds. The work covers the public website, auth screens, and private dashboard UI while preserving existing routes, data flows, authentication, SEO foundations, and RayHealthEVV content.

The target impression is:

> GhimTech builds serious AI software for serious work.

## Current-State Findings

The codebase is a Next.js 15 App Router application with TypeScript, Tailwind, Framer Motion, lucide-react, Supabase Auth, Prisma, and a dashboard backed by server components. The current public site already has a dark command-center identity, strong brand assets, motion primitives, reusable navigation/footer components, and public pages for home, about, experience, projects, RayHealthEVV, and contact.

The homepage is currently too narrow for the requested company story. It emphasizes RayHealthEVV and Durga's founder journey, but it does not yet establish GhimTech as an AI-native software company with a multi-product portfolio. Helix Studio is absent from the content model. The design is expressive but sometimes more cinematic than premium-operational: heavy glow, oversized hero type, HUD language, and dashboard-first CTAs make the company feel like a personal workspace more than a trusted software company.

The dashboard already has useful widgets and strong atmosphere, but it should be calmer and denser for repeated use. The auth screens function correctly and align visually, but they can feel more secure, intentional, and company-grade.

## Design Name

**Serious Work OS**

This direction keeps the existing dark foundation and signal/vital accents, then matures them into a calmer, sharper product-company system. It should feel closer to Linear, Stripe, Vercel, Apple, Anthropic, and Mercury in quality while remaining distinctly GhimTech: founder-led, veteran-disciplined, healthcare-aware, and AI-native without hype.

## Brand Principles

1. **Premium but calm**
   Use dark carbon surfaces, measured contrast, crisp type, and intentional white space. Avoid visual noise, excessive glow, and decorative clutter.

2. **Futuristic but grounded**
   Use abstract operational UI, product previews, and motion as proof of craft. Avoid generic AI swirls, crypto-like effects, fake holograms, or overanimated scenes.

3. **Trusted before impressive**
   Lead with real products, disciplined engineering, human confirmation, auditability, privacy, and production deployment. Do not overclaim compliance, scale, certification, uptime, or maturity.

4. **Founder-led without becoming personal-brand-only**
   Durga's USMC and Nepali entrepreneur identity should strengthen trust, but GhimTech remains the main brand.

5. **AI-native with judgment**
   Position AI as controlled automation: human-in-the-loop, confirmation before action, real files, real workflows, audit-aware systems.

## Information Architecture

### Public Navigation

The primary public nav should become:

- Products
- Technology
- About
- Contact
- Dashboard

The nav should preserve working routes. Since standalone `/technology`, `/careers`, and `/blog` routes do not exist today, homepage anchors should be used for Technology and Products in the first implementation. Careers and resources can appear as footer/future links only if clearly marked as future-facing and not routed to broken pages.

### Homepage Structure

The new homepage should use these sections:

1. **Hero**
   Headline: "AI-native software for serious work."
   Supporting copy: GhimTech builds trusted operating systems for healthcare operations, developer workflows, and business automation.
   CTAs: "Explore products" and "Get in touch". Dashboard can remain secondary and visually quieter.
   Visual: a restrained operational product preview showing RayHealthEVV and Helix Studio side by side.

2. **Product Signal Strip**
   A compact strip of company signals: healthcare operations, developer tools, AI workflow systems, human-in-the-loop automation, audit-ready systems.

3. **Product Roster**
   Premium cards for RayHealthEVV and Helix Studio. Each card includes status, headline, short description, feature bullets, stack badges, visual preview, and CTA.

4. **How We Build**
   Operating principles: veteran-grade discipline, judgment before automation, production-first engineering, privacy and audit posture, design that stays calm under pressure.

5. **Technology & Infrastructure**
   A visually structured section explaining type-safe engineering, security, audit logs, privacy-first systems, AI confirmation flows, observability, deployment, accessibility, and performance.

6. **Founder-Led Company**
   A concise founder card: Durga Ghimeray, USMC Veteran, Nepali entrepreneur, builder of RayHealthEVV and Helix Studio. Tone should be professional, inspiring, and restrained.

7. **Final CTA**
   Invite serious conversations: agencies, partners, engineers, investors, and technical buyers. Primary CTA to contact; secondary CTA to products.

### Product Pages

The existing Projects and RayHealthEVV pages should remain functional and preserve the compliance-safe language. They should be visually aligned with the new homepage system: calmer product cards, clearer hierarchy, better section rhythm, and fewer personal-workspace signals.

Helix Studio does not currently have a dedicated route. The first pass should introduce Helix as a homepage product card and content object, not a full product page, unless implementation planning confirms a small route can be added safely without inventing unsupported functionality.

### About and Experience

Keep the founder-led story, but align it with the company brand. The pages should feel like proof of operating discipline, not a biography-heavy portfolio. Preserve existing route content and improve section rhythm, type scale, and card treatment.

### Contact

Keep the existing contact form and backend behavior. Improve the page framing so it invites agency owners, partners, engineers, and serious collaborators. Preserve validation and submission states.

### Auth Screens

Sign-in and sign-up should feel like a secure private operator entrance:

- tighter form layout
- stronger security framing
- visible focus states
- clear error and success states
- brand lockup and restrained background
- no confusing "workspace" language that implies the public company page is only a personal dashboard

### Dashboard

The private dashboard should become a calmer operating console:

- reduce excessive glow and decorative effects
- improve widget hierarchy and scanability
- keep dark mode and command-center identity
- create more consistent headers, panels, cards, lists, and empty states
- preserve all data fetching and existing server/client boundaries
- keep dashboard routes private and unchanged

The dashboard redesign should not change auth, database queries, mutations, or dashboard feature behavior.

## Visual System

### Color

Keep a dark carbon foundation, signal blue, vital green, amber, and critical red. Reduce the total perceived blue glow so the site does not read as a one-note blue/slate theme. Use green and neutral white/gray for balance. Use red and amber only for meaningful states.

### Typography

The current Fraunces display face gives personality, but the redesign should use it more selectively. Headline sizing should be confident but not oversized to the point of looking poster-like. Body text should use clear, high-contrast sans typography with comfortable measure.

No viewport-width-only font scaling should be introduced. Type should use stable responsive clamps already in the system and should be checked on mobile.

### Surfaces

Use glass only where it adds depth or communicates layered product UI. Most sections should be unframed layouts or full-width bands. Cards should be used for real repeated items and product previews. Avoid cards inside cards.

### Buttons

Primary CTAs should be clear and premium. Secondary CTAs should feel deliberate, not disabled. Buttons should have strong hover/focus states, icon support where useful, and stable sizing across breakpoints.

### Icons

Use lucide-react icons for actions and conceptual labels. Avoid hand-drawn inline SVGs for new UI unless the existing brand mark requires it.

### Motion

Motion should be purposeful:

- hero reveal
- section entrance
- product card hover lift
- subtle product preview movement
- marquee or ticker only where it communicates product scope
- nav/mobile menu transition

Motion should respect `prefers-reduced-motion`, avoid random bouncing, and not require additional animation libraries.

## Component Plan

Create or refine reusable components around the existing structure:

- `MarketingContainer`
- `MarketingSectionHeader`
- `MarketingButton`
- `MarketingBadge`
- `ProductCard`
- `ProductPreviewCard`
- `TechStackPill`
- `FeatureCard`
- `SignalStrip`
- `FounderPanel`
- `MobileNav`
- dashboard panel/header primitives if current dashboard duplication justifies it

The implementation should avoid a large component framework rewrite. Existing components should be reused when their responsibility is clear, and replaced only when the old shape fights the new design.

## Content Model

Update `src/lib/content.ts` into a stronger source of truth:

- founder profile
- company positioning
- homepage hero
- product roster with RayHealthEVV and Helix Studio
- operating principles
- technology pillars
- navigation
- footer links

RayHealthEVV content must keep compliance-safe language: "designed to support" EVV, privacy, and state requirements. Do not claim federal certification, HIPAA certification, audit-proof status, or live integrations unless already supported in the code/content.

Helix Studio copy should be framed as product direction based on the user's provided description: prompt-to-production, real files, GitHub pull requests, live previews, bring-your-own-model, developer workflow, and possible classroom/learning use. Do not claim customer adoption, uptime, revenue, enterprise deployments, or production scale.

## SEO and Metadata

Update root metadata to position GhimTech as:

- AI-native software company
- RayHealthEVV
- Helix Studio
- healthcare operations software
- developer tools
- business automation
- founder-led software company

Preserve existing Open Graph image wiring. Page-specific metadata should remain route-specific and avoid fake claims.

## Accessibility

The redesign must maintain:

- semantic sections, headings, nav, buttons, forms, lists
- correct heading hierarchy
- keyboard-accessible mobile menu
- visible focus states
- sufficient color contrast
- descriptive link and button labels
- mobile tap targets of at least 44px where practical
- no text overflow at common mobile widths
- reduced-motion support

## Performance

The implementation should:

- avoid new heavy dependencies
- keep most marketing content server-rendered where possible
- limit client components to motion/menu interactions
- avoid excessive blur and large layered backgrounds
- avoid layout shift by using stable dimensions
- preserve Next font optimization
- run lint, type-check, and build verification

## Implementation Boundaries

This redesign must not:

- change authentication behavior
- change database schema
- change API behavior
- remove public routes
- remove working dashboard functionality
- add fake backend/product features
- create broken nav links
- overstate compliance or production maturity
- rewrite unrelated business logic

## Verification Plan

After implementation, verify:

- `npm run lint`
- `npm run type-check`
- `npm run build`
- public routes load: `/`, `/about`, `/projects`, `/projects/rayhealth-evv`, `/experience`, `/contact`
- auth routes load: `/sign-in`, `/sign-up`
- dashboard still redirects when unauthenticated
- responsive checks at mobile, tablet, laptop, and desktop widths
- mobile menu keyboard and pointer behavior
- no obvious text overflow or overlap
- no console errors on key pages
- reduced-motion media query still disables or reduces motion

## Rollout Strategy

Implementation should land in focused passes:

1. Content model and design primitives.
2. Navigation, footer, mobile menu, metadata.
3. Homepage redesign.
4. Public secondary page alignment.
5. Auth screen alignment.
6. Dashboard visual refinement.
7. Verification and polish.

Each pass should preserve existing behavior and keep changes reviewable.
