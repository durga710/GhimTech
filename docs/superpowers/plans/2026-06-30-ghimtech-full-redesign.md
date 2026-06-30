# GhimTech Full Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public site, auth screens, and private dashboard into a premium AI-native software company experience while preserving existing routes, auth, APIs, and dashboard data behavior.

**Architecture:** Keep the current Next.js App Router, Tailwind, Framer Motion, Supabase Auth, and Prisma setup. Add a stronger marketing content model and reusable marketing UI primitives, then refactor public pages, auth pages, and dashboard surfaces to use the calmer "Serious Work OS" system without changing backend logic.

**Tech Stack:** Next.js 15, React 18, TypeScript, Tailwind CSS, Framer Motion, lucide-react, Node test runner, Prisma, Supabase Auth.

---

## File Structure

- Modify: `src/lib/content.ts` — expand company, product, technology, navigation, and footer content.
- Create: `tests/marketing-content.test.ts` — verifies product roster, nav hrefs, and compliance-safe language.
- Modify: `src/app/layout.tsx` — update metadata and global public positioning.
- Modify: `src/app/sitemap.ts` — keep public routes aligned with redesigned IA.
- Modify: `src/app/globals.css` — refine tokens, surfaces, buttons, reusable section/card classes, and reduced-motion behavior.
- Create: `src/components/marketing/marketing-section.tsx` — shared section/header primitives.
- Create: `src/components/marketing/marketing-button.tsx` — shared button/link primitive.
- Create: `src/components/marketing/product-card.tsx` — product card and preview primitives.
- Create: `src/components/marketing/signal-strip.tsx` — compact homepage product/company signal strip.
- Create: `src/components/marketing/founder-panel.tsx` — founder-led company panel.
- Create: `src/components/marketing/technology-grid.tsx` — technology and infrastructure section.
- Modify: `src/components/shared/top-nav.tsx` — public nav rewrite plus accessible mobile menu.
- Modify: `src/components/shared/site-footer.tsx` — premium software-company footer.
- Modify: `src/components/landing/hero.tsx` — new Serious Work OS hero.
- Modify: `src/components/landing/values-section.tsx` — how-we-build section alignment.
- Modify: `src/components/landing/featured-project.tsx` — replace single RayHealth feature with two-product roster.
- Modify: `src/components/landing/closing-cta.tsx` — serious contact/product CTA.
- Modify: `src/app/page.tsx` — new homepage composition.
- Modify: `src/components/about/about-intro.tsx` — company-aligned founder intro.
- Modify: `src/components/experience/experience-intro.tsx` — execution/story framing alignment.
- Modify: `src/components/contact/contact-intro.tsx` — serious buyer/partner contact framing.
- Modify: `src/components/projects/projects-index-hero.tsx` — product portfolio framing.
- Modify: `src/components/projects/projects-index-featured.tsx` — portfolio card alignment.
- Modify: `src/components/projects/rayhealth-hero.tsx` — calmer RayHealth product hero.
- Modify: `src/app/sign-in/[[...sign-in]]/page.tsx` — secure operator entrance redesign.
- Modify: `src/app/sign-up/[[...sign-up]]/page.tsx` — secure enrollment redesign.
- Modify: `src/components/dashboard/dashboard-page-header.tsx` — calmer dashboard header primitive.
- Modify: `src/components/dashboard/dashboard-sidebar.tsx` — calmer dashboard nav.
- Modify: `src/components/dashboard/dashboard-topbar.tsx` — tighter topbar and search treatment.
- Modify: `src/components/dashboard/widgets/*.tsx`, `src/components/dashboard/inbox/inbox-list.tsx`, `src/components/dashboard/tasks/tasks-board.tsx`, `src/components/dashboard/notifications/alerts-list.tsx` — align panel treatments and density without changing behavior.

## Task 1: Content Model And Safety Tests

**Files:**
- Modify: `src/lib/content.ts`
- Create: `tests/marketing-content.test.ts`

- [ ] **Step 1: Write the failing content tests**

Create `tests/marketing-content.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  COMPANY,
  FOUNDER,
  HOME_SIGNALS,
  NAV,
  PRODUCTS,
  TECHNOLOGY_PILLARS,
} from "../src/lib/content";

describe("marketing content model", () => {
  it("positions GhimTech as an AI-native software company", () => {
    assert.match(COMPANY.positioning, /AI-native software/i);
    assert.match(COMPANY.tagline, /serious work/i);
  });

  it("includes RayHealthEVV and Helix Studio as product roster entries", () => {
    assert.deepEqual(
      PRODUCTS.map((product) => product.name),
      ["RayHealthEVV™", "Helix Studio"]
    );
  });

  it("keeps RayHealth compliance language conservative", () => {
    const rayhealth = PRODUCTS.find((product) => product.slug === "rayhealth-evv");
    assert.ok(rayhealth);
    assert.match(rayhealth.description, /designed to support/i);
    assert.doesNotMatch(rayhealth.description, /certified|audit-proof|guaranteed/i);
  });

  it("models Helix without fake scale or customer claims", () => {
    const helix = PRODUCTS.find((product) => product.slug === "helix-studio");
    assert.ok(helix);
    assert.match(helix.description, /plain-language prompts/i);
    assert.doesNotMatch(helix.description, /customers|revenue|enterprise deployments|99\.9/i);
  });

  it("uses only working routes or homepage anchors in the public nav", () => {
    assert.deepEqual(
      NAV.map((item) => item.href),
      ["/#products", "/#technology", "/about", "/contact", "/dashboard"]
    );
  });

  it("has enough signals and technology pillars to build the homepage", () => {
    assert.equal(HOME_SIGNALS.length >= 5, true);
    assert.equal(TECHNOLOGY_PILLARS.length >= 6, true);
    assert.equal(FOUNDER.shortBio.includes("USMC Veteran"), true);
  });
});
```

- [ ] **Step 2: Run the content tests and verify they fail**

Run:

```bash
npm run test -- tests/marketing-content.test.ts
```

Expected: FAIL with TypeScript import errors for `COMPANY`, `HOME_SIGNALS`, `PRODUCTS`, or `TECHNOLOGY_PILLARS` because the new content model does not exist yet.

- [ ] **Step 3: Replace `src/lib/content.ts` with the expanded model**

Replace the file content with:

```ts
/**
 * Site-wide content & metadata.
 * Single source of truth for GhimTech public positioning, products, founder
 * story, navigation, and homepage sections.
 */

export const COMPANY = {
  name: "GhimTech",
  legalName: "GhimTech",
  tagline: "AI-native software for serious work.",
  positioning:
    "GhimTech is an AI-native software company building trusted operating systems for healthcare operations, developer workflows, and business automation.",
  shortPositioning:
    "Trusted software systems for healthcare operations, developer tools, and AI-native automation.",
  proofLine: "Built with judgment, not hype.",
} as const;

export const FOUNDER = {
  name: "Durga Ghimeray",
  handle: "@durgaghimeray",
  title: "Founder · Builder · USMC Veteran",
  location: "United States",
  email: "durga@rayhealthevv.com",
  bio:
    "USMC veteran and Nepali entrepreneur building GhimTech, an AI-native software company focused on healthcare operations, developer tools, automation, and accountability software.",
  shortBio: "USMC Veteran · Nepali entrepreneur · Founder of GhimTech",
} as const;

export const HERO = {
  eyebrow: "GhimTech · AI-native systems company",
  headline: "AI-native software for serious work.",
  sub:
    "GhimTech builds trusted operating systems for healthcare operations, developer workflows, and business automation. Human judgment stays in the loop; automation confirms before it acts.",
  primaryCta: { label: "Explore products", href: "/#products" },
  secondaryCta: { label: "Get in touch", href: "/contact" },
  status: {
    label: "Building now",
    value: "RayHealthEVV + Helix Studio",
  },
} as const;

export const HOME_SIGNALS = [
  "Healthcare operations",
  "Developer tools",
  "AI workflow systems",
  "Human-in-the-loop automation",
  "Audit-ready product design",
  "Founder-led execution",
] as const;

export const PRODUCTS = [
  {
    slug: "rayhealth-evv",
    name: "RayHealthEVV™",
    status: "Active product",
    tag: "Healthcare operations platform",
    tagline: "Care. Verified. Delivered.",
    description:
      "A home-care operations platform designed to support EVV verification, caregiver onboarding, scheduling, billing, payroll, compliance workflows, and owner-first command surfaces.",
    href: "/projects/rayhealth-evv",
    cta: "Explore RayHealthEVV",
    accent: "vital",
    previewLabel: "Agency command surface",
    features: [
      "EVV verification",
      "Caregiver onboarding",
      "Scheduling and visit review",
      "Billing and payroll workflows",
      "Compliance-aware owner dashboard",
      "AI workflow copilot",
    ],
    stack: ["Next.js", "Supabase", "PostgreSQL", "Prisma", "AI copilot", "Mobile"],
    metrics: [
      { label: "Workflow modules", value: "12" },
      { label: "Primary roles", value: "3" },
      { label: "Mode", value: "Owner-first" },
    ],
  },
  {
    slug: "helix-studio",
    name: "Helix Studio",
    status: "In design",
    tag: "Prompt-to-production developer platform",
    tagline: "From prompt to real software artifacts.",
    description:
      "An AI app-building platform direction for turning plain-language prompts into real files, GitHub pull requests, and live previews with bring-your-own-model flexibility.",
    href: "/#contact",
    cta: "Ask about Helix",
    accent: "signal",
    previewLabel: "Build pipeline",
    features: [
      "Prompt-to-production workflow",
      "Real files and diffs",
      "GitHub pull requests",
      "Live preview loops",
      "Bring-your-own-model direction",
      "Developer and learning workflows",
    ],
    stack: ["TypeScript", "GitHub", "Live preview", "Model routing", "Design systems"],
    metrics: [
      { label: "Output", value: "Files" },
      { label: "Review", value: "PRs" },
      { label: "Loop", value: "Preview" },
    ],
  },
] as const;

export const TECHNOLOGY_PILLARS = [
  {
    title: "Type-safe engineering",
    body:
      "Strong TypeScript boundaries, schema validation, and predictable component contracts keep product work maintainable.",
  },
  {
    title: "Security and privacy posture",
    body:
      "Authentication, server-side checks, protected routes, and careful claims language guide how systems are built and described.",
  },
  {
    title: "Audit-aware workflows",
    body:
      "Operational software should explain who changed what, when, and why without forcing teams to reconstruct history.",
  },
  {
    title: "Human-confirmed AI",
    body:
      "AI surfaces should propose, summarize, and accelerate. Sensitive work still waits for explicit human judgment.",
  },
  {
    title: "Production deployment discipline",
    body:
      "The work is shaped around real routes, real data flows, observable behavior, and deployable software.",
  },
  {
    title: "Accessible product craft",
    body:
      "Readable hierarchy, keyboard access, contrast, responsive layouts, and reduced motion support are part of the product.",
  },
] as const;

export const VALUES = [
  {
    title: "Veteran-grade discipline",
    body:
      "Systems should hold up under stress, audit, and the worst-case Monday morning.",
  },
  {
    title: "Judgment before automation",
    body:
      "AI can accelerate work, but serious systems confirm before they act.",
  },
  {
    title: "Operational clarity",
    body:
      "The people responsible for outcomes need calm surfaces that show what matters now.",
  },
  {
    title: "Trustworthy product language",
    body:
      "No fake enterprise theater, no compliance overclaims, and no inflated metrics.",
  },
] as const;

export const FOCUS_TICKER = [
  "RayHealthEVV command surfaces",
  "Helix Studio product direction",
  "Healthcare operations software",
  "Human-confirmed AI workflows",
  "Developer tools for real artifacts",
  "Privacy-first systems",
  "Audit-aware product design",
  "Founder-led execution",
] as const;

export const TIMELINE = [
  {
    year: "Origin",
    title: "Nepal",
    body: "Born and raised with discipline, family, and service as foundational values.",
  },
  {
    year: "USMC",
    title: "United States Marine Corps",
    body:
      "Service taught operational discipline, accountability under pressure, and how systems can either save or fail people.",
  },
  {
    year: "Pivot",
    title: "Into Technology",
    body:
      "Studied the gaps in healthcare operations, developer workflows, and business automation where better systems can remove preventable friction.",
  },
  {
    year: "Build",
    title: "RayHealthEVV™",
    body:
      "Founded RayHealthEVV to bring operational rigor to home-care agencies across scheduling, EVV, onboarding, billing, payroll, and compliance workflows.",
  },
  {
    year: "Expand",
    title: "GhimTech",
    body:
      "GhimTech is the company layer for building serious AI-native software across healthcare operations, developer tools, and accountability systems.",
  },
  {
    year: "Vision",
    title: "Serious Work OS",
    body:
      "Software that quietly does its job, confirms before it acts, and helps operators trust the system under pressure.",
  },
] as const;

export const SOCIAL = {
  linkedin: "https://www.linkedin.com/",
  github: "https://github.com/",
  email: FOUNDER.email,
} as const;

export const NAV = [
  { href: "/#products", label: "Products" },
  { href: "/#technology", label: "Technology" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/dashboard", label: "Dashboard" },
] as const;

export const FOOTER_LINKS = [
  { href: "/projects/rayhealth-evv", label: "RayHealthEVV" },
  { href: "/#products", label: "Helix Studio" },
  { href: "/#technology", label: "Technology" },
  { href: "/contact", label: "Contact" },
] as const;
```

- [ ] **Step 4: Run the content tests and verify they pass**

Run:

```bash
npm run test -- tests/marketing-content.test.ts
```

Expected: PASS for all marketing content model tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/content.ts tests/marketing-content.test.ts
git commit -m "feat: add ghimtech marketing content model"
```

## Task 2: Global Metadata, Tokens, And Marketing Primitives

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Create: `src/components/marketing/marketing-section.tsx`
- Create: `src/components/marketing/marketing-button.tsx`
- Create: `src/components/marketing/product-card.tsx`
- Create: `src/components/marketing/signal-strip.tsx`
- Create: `src/components/marketing/founder-panel.tsx`
- Create: `src/components/marketing/technology-grid.tsx`
- Test: `tests/marketing-content.test.ts`

- [ ] **Step 1: Write a failing metadata assertion**

Append this test to `tests/marketing-content.test.ts`:

```ts
import { metadata } from "../src/app/layout";

describe("root metadata", () => {
  it("uses the new company positioning in SEO metadata", () => {
    assert.match(String(metadata.description), /AI-native software company/i);
    assert.equal(metadata.metadataBase?.toString(), "https://ghimtech.org/");
  });
});
```

- [ ] **Step 2: Run the metadata test and verify it fails**

Run:

```bash
npm run test -- tests/marketing-content.test.ts
```

Expected: FAIL because `metadata.description` still uses the older founder/RayHealth-only bio.

- [ ] **Step 3: Update `src/app/layout.tsx` metadata only**

Change imports:

```ts
import { COMPANY, FOUNDER } from "@/lib/content";
```

Change metadata default title, description, keywords, Open Graph, and Twitter fields:

```ts
export const metadata: Metadata = {
  metadataBase: new URL("https://ghimtech.org"),
  title: {
    default: `${COMPANY.name} — ${COMPANY.tagline}`,
    template: `%s · ${COMPANY.name}`,
  },
  description: COMPANY.positioning,
  keywords: [
    "GhimTech",
    "AI-native software company",
    "RayHealthEVV",
    "Helix Studio",
    "healthcare operations software",
    "developer tools",
    "business automation",
    "founder-led software company",
    "Durga Ghimeray",
    "USMC veteran founder",
  ],
  authors: [{ name: FOUNDER.name }],
  creator: FOUNDER.name,
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/brand/icon-512.svg", sizes: "512x512", type: "image/svg+xml" }],
    shortcut: "/brand/favicon.svg",
  },
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ghimtech.org",
    title: `${COMPANY.name} — ${COMPANY.tagline}`,
    description: COMPANY.positioning,
    siteName: COMPANY.name,
    images: [
      {
        url: "/brand/og-image.svg",
        width: 1200,
        height: 630,
        alt: "GhimTech — AI-native software for serious work",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${COMPANY.name} — ${COMPANY.tagline}`,
    description: COMPANY.positioning,
    images: ["/brand/og-image.svg"],
  },
  robots: { index: true, follow: true },
};
```

- [ ] **Step 4: Add refined global classes to `src/app/globals.css`**

Append inside `@layer components` after `.btn-ghost`:

```css
  .surface-premium {
    @apply relative overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.035] shadow-panel backdrop-blur-xl;
  }

  .surface-subtle {
    @apply relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025];
  }

  .section-band {
    @apply relative py-24 lg:py-32;
  }

  .section-kicker {
    @apply font-mono text-[11px] uppercase tracking-tactical text-signal-200;
  }

  .text-balance {
    text-wrap: balance;
  }

  .btn-vital {
    @apply relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-5 py-2.5
           text-sm font-medium text-ink-950 transition-all duration-300
           bg-gradient-to-b from-vital-200 to-vital-400
           shadow-glow-vital hover:-translate-y-px active:translate-y-0;
  }
```

- [ ] **Step 5: Create `src/components/marketing/marketing-section.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function MarketingSection({
  id,
  children,
  className,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("section-band", className)}>
      <div className="container">{children}</div>
    </section>
  );
}

export function MarketingSectionHeader({
  eyebrow,
  title,
  body,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  body?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={staggerContainer}
      className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}
    >
      <motion.div variants={fadeUp} className="section-kicker">
        {eyebrow}
      </motion.div>
      <motion.h2
        variants={fadeUp}
        className="mt-5 text-balance font-display text-[clamp(2.4rem,5vw,4.6rem)] leading-[0.98] tracking-tightest text-white"
      >
        {title}
      </motion.h2>
      {body ? (
        <motion.p variants={fadeUp} className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400 lg:text-lg">
          {body}
        </motion.p>
      ) : null}
    </motion.div>
  );
}
```

- [ ] **Step 6: Create `src/components/marketing/marketing-button.tsx`**

```tsx
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "vital";

const variantClass: Record<Variant, string> = {
  primary: "btn-signal",
  secondary: "btn-ghost",
  vital: "btn-vital",
};

export function MarketingButton({
  href,
  children,
  variant = "primary",
  showArrow = true,
  className,
  ...props
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  showArrow?: boolean;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href">) {
  return (
    <Link href={href} className={cn(variantClass[variant], "group", className)} {...props}>
      {children}
      {showArrow ? <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" /> : null}
    </Link>
  );
}
```

- [ ] **Step 7: Create `src/components/marketing/product-card.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import type { PRODUCTS } from "@/lib/content";
import { cn } from "@/lib/utils";

type Product = (typeof PRODUCTS)[number];

export function ProductCard({ product, featured = false }: { product: Product; featured?: boolean }) {
  const isVital = product.accent === "vital";

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className={cn(
        "surface-premium group grid gap-7 p-6 lg:p-7",
        featured && "lg:grid-cols-[1.05fr_0.95fr]",
        isVital ? "hover:border-vital-300/25" : "hover:border-signal-300/25"
      )}
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("control-chip", isVital && "text-vital-200")}>{product.status}</span>
          <span className="label-tactical">{product.tag}</span>
        </div>
        <h3 className="mt-5 text-balance font-display text-3xl leading-none tracking-tight text-white lg:text-4xl">
          {product.name}
        </h3>
        <p className="mt-2 text-base font-medium text-zinc-200">{product.tagline}</p>
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-zinc-400">{product.description}</p>

        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
          {product.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm text-zinc-300">
              <CheckCircle2 className={cn("mt-0.5 h-4 w-4 shrink-0", isVital ? "text-vital-300" : "text-signal-300")} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap gap-2">
          {product.stack.map((item) => (
            <span key={item} className="rounded-full border border-white/[0.08] bg-white/[0.035] px-3 py-1 text-xs text-zinc-300">
              {item}
            </span>
          ))}
        </div>

        <Link
          href={product.href}
          className={cn("mt-7 inline-flex items-center gap-2 text-sm font-medium transition-colors", isVital ? "text-vital-300 hover:text-vital-200" : "text-signal-300 hover:text-signal-200")}
        >
          {product.cta}
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <ProductPreview product={product} />
    </motion.article>
  );
}

export function ProductPreview({ product }: { product: Product }) {
  const isVital = product.accent === "vital";

  return (
    <div className="surface-subtle min-h-[280px] p-4">
      <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
        <span className="label-tactical">{product.previewLabel}</span>
        <span className={cn("h-2 w-2 rounded-full", isVital ? "bg-vital-300" : "bg-signal-300")} />
      </div>
      <div className="mt-4 grid gap-3">
        {product.metrics.map((metric, index) => (
          <div key={metric.label} className="rounded-xl border border-white/[0.06] bg-ink-950/45 p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-zinc-500">{metric.label}</span>
              <span className="font-mono text-sm text-white">{metric.value}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${82 - index * 13}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.1 + index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={cn("h-full rounded-full", isVital ? "bg-vital-300" : "bg-signal-300")}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Create `src/components/marketing/signal-strip.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import { HOME_SIGNALS } from "@/lib/content";

export function SignalStrip() {
  return (
    <div className="container">
      <div className="surface-subtle overflow-hidden px-4 py-3">
        <div className="mask-fade-edges flex overflow-hidden">
          <motion.div
            className="flex min-w-max gap-8 whitespace-nowrap"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          >
            {[...HOME_SIGNALS, ...HOME_SIGNALS].map((signal, index) => (
              <span key={`${signal}-${index}`} className="flex items-center gap-3 text-sm text-zinc-300">
                <span className="h-1.5 w-1.5 rounded-full bg-signal-300" />
                {signal}
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Create `src/components/marketing/founder-panel.tsx`**

```tsx
import { ShieldCheck } from "lucide-react";
import { FOUNDER } from "@/lib/content";

export function FounderPanel() {
  return (
    <div className="surface-premium grid gap-6 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-8">
      <div className="rounded-2xl border border-white/[0.08] bg-ink-950/50 p-5">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-signal-300 to-vital-300 text-xl font-semibold text-ink-950">
          DG
        </div>
        <div className="mt-5 text-xl font-medium text-white">{FOUNDER.name}</div>
        <p className="mt-2 text-sm text-zinc-400">{FOUNDER.title}</p>
      </div>
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-vital-300/20 bg-vital-300/10 px-3 py-1 text-xs font-medium text-vital-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Founder-led discipline
        </div>
        <h3 className="mt-5 max-w-2xl font-display text-3xl leading-tight text-white">
          Built by an operator who cares about trust, accountability, and real product outcomes.
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
          Durga Ghimeray is a USMC Veteran and Nepali entrepreneur building GhimTech across healthcare operations, developer tools, AI systems, and accountability software. The company stays small, exacting, and focused on software that has to be trusted.
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Create `src/components/marketing/technology-grid.tsx`**

```tsx
import { Lock, Radar, ServerCog, Sparkles, TestTube2, Workflow } from "lucide-react";
import { TECHNOLOGY_PILLARS } from "@/lib/content";
import { MarketingSection, MarketingSectionHeader } from "@/components/marketing/marketing-section";

const ICONS = [TestTube2, Lock, Radar, Sparkles, ServerCog, Workflow];

export function TechnologyGrid() {
  return (
    <MarketingSection id="technology">
      <MarketingSectionHeader
        eyebrow="Technology"
        title={<>Systems designed to be trusted.</>}
        body="The product standard is simple: type-safe, privacy-aware, observable, accessible, and explicit about when AI needs human judgment."
      />
      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {TECHNOLOGY_PILLARS.map((pillar, index) => {
          const Icon = ICONS[index] ?? ServerCog;
          return (
            <article key={pillar.title} className="surface-subtle p-6">
              <div className="grid h-10 w-10 place-items-center rounded-xl border border-signal-300/20 bg-signal-300/10 text-signal-200">
                <Icon className="h-4 w-4" />
              </div>
              <h3 className="mt-5 text-lg font-medium text-white">{pillar.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-zinc-400">{pillar.body}</p>
            </article>
          );
        })}
      </div>
    </MarketingSection>
  );
}
```

- [ ] **Step 11: Run tests and type-check**

Run:

```bash
npm run test -- tests/marketing-content.test.ts
npm run type-check
```

Expected: both commands pass.

- [ ] **Step 12: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css src/components/marketing tests/marketing-content.test.ts
git commit -m "feat: add marketing design primitives"
```

## Task 3: Public Navigation, Footer, And Mobile Menu

**Files:**
- Modify: `src/components/shared/top-nav.tsx`
- Modify: `src/components/shared/site-footer.tsx`
- Test: `tests/marketing-content.test.ts`

- [ ] **Step 1: Add nav test coverage**

Append to `tests/marketing-content.test.ts`:

```ts
describe("footer links", () => {
  it("does not require public routes that do not exist yet", async () => {
    const { FOOTER_LINKS } = await import("../src/lib/content");
    assert.equal(FOOTER_LINKS.every((link) => link.href.startsWith("/") || link.href.startsWith("mailto:")), true);
    assert.equal(FOOTER_LINKS.some((link) => link.href === "/technology"), false);
    assert.equal(FOOTER_LINKS.some((link) => link.href === "/blog"), false);
    assert.equal(FOOTER_LINKS.some((link) => link.href === "/careers"), false);
  });
});
```

- [ ] **Step 2: Run test and verify it passes**

Run:

```bash
npm run test -- tests/marketing-content.test.ts
```

Expected: PASS. This locks nav/footer routing before the UI rewrite.

- [ ] **Step 3: Replace public nav with sticky desktop nav and accessible mobile menu**

In `src/components/shared/top-nav.tsx`, keep it as a client component and replace its body with this implementation:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { NAV } from "@/lib/content";
import { Logo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

export function TopNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-3 z-50 px-3"
    >
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-2xl border border-white/[0.08] bg-ink-950/78 px-3 py-2.5 shadow-panel backdrop-blur-2xl">
        <Link
          href="/"
          aria-label="GhimTech home"
          className="flex min-h-11 items-center gap-3 rounded-xl px-2 text-white transition-colors hover:bg-white/[0.04]"
          onClick={() => setOpen(false)}
        >
          <Logo variant="mark" size={28} className="text-signal-300" />
          <Logo variant="wordmark" size={18} className="hidden text-white sm:block" />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {NAV.slice(0, -1).map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "rounded-full px-3.5 py-2 text-sm transition-colors",
                    active ? "bg-white/[0.07] text-white" : "text-zinc-400 hover:bg-white/[0.04] hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/dashboard" className="btn-ghost px-4 py-2">
            Dashboard
          </Link>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-200 md:hidden"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mx-auto mt-2 w-full max-w-6xl rounded-2xl border border-white/[0.08] bg-ink-950/95 p-2 shadow-panel backdrop-blur-2xl md:hidden"
          >
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center justify-between rounded-xl px-3 text-sm text-zinc-200 transition-colors hover:bg-white/[0.06]"
                onClick={() => setOpen(false)}
              >
                {item.label}
                <span className="h-1.5 w-1.5 rounded-full bg-signal-300" />
              </Link>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
```

- [ ] **Step 4: Replace footer with company/product footer**

In `src/components/shared/site-footer.tsx`, update imports:

```ts
import Link from "next/link";
import { COMPANY, FOUNDER, FOOTER_LINKS, NAV } from "@/lib/content";
import { Logo } from "@/components/shared/logo";
```

Use this component body:

```tsx
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-28 overflow-hidden border-t border-white/[0.07]">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal-300/50 to-transparent" />
      <div className="container relative grid gap-10 py-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Link href="/" aria-label="GhimTech home" className="inline-flex text-white">
            <Logo variant="lockup" size={32} />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-zinc-400">
            {COMPANY.shortPositioning}
          </p>
          <div className="mt-5 control-chip w-fit">{COMPANY.proofLine}</div>
        </div>

        <div className="md:col-span-3">
          <div className="label-tactical mb-4">Company</div>
          <ul className="space-y-2.5">
            {NAV.slice(0, -1).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="label-tactical mb-4">Products</div>
          <ul className="space-y-2.5">
            {FOOTER_LINKS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-sm text-zinc-400 transition-colors hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-2">
          <div className="label-tactical mb-4">Contact</div>
          <a href={`mailto:${FOUNDER.email}`} className="text-sm text-zinc-400 transition-colors hover:text-signal-200">
            {FOUNDER.email}
          </a>
        </div>
      </div>

      <div className="container flex flex-col gap-3 border-t border-white/[0.06] py-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <span>© {year} {COMPANY.name}. All rights reserved.</span>
        <span className="font-mono uppercase tracking-tactical">AI-native software for serious work</span>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Verify**

Run:

```bash
npm run test -- tests/marketing-content.test.ts
npm run type-check
```

Expected: both pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/shared/top-nav.tsx src/components/shared/site-footer.tsx tests/marketing-content.test.ts
git commit -m "feat: redesign public navigation and footer"
```

## Task 4: Homepage Redesign

**Files:**
- Modify: `src/components/landing/hero.tsx`
- Modify: `src/components/landing/values-section.tsx`
- Modify: `src/components/landing/featured-project.tsx`
- Modify: `src/components/landing/closing-cta.tsx`
- Modify: `src/app/page.tsx`
- Use: `src/components/marketing/*`

- [ ] **Step 1: Write a failing homepage composition check**

Create `tests/homepage-composition.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

const page = readFileSync("src/app/page.tsx", "utf8");

describe("homepage composition", () => {
  it("includes the Serious Work OS homepage sections", () => {
    assert.match(page, /SignalStrip/);
    assert.match(page, /TechnologyGrid/);
    assert.match(page, /FounderPanel/);
  });
});
```

- [ ] **Step 2: Run the homepage check and verify it fails**

Run:

```bash
npm run test -- tests/homepage-composition.test.ts
```

Expected: FAIL because the current homepage does not import the new sections.

- [ ] **Step 3: Replace `src/components/landing/hero.tsx`**

Implement the new hero using `HERO`, `PRODUCTS`, `MarketingButton`, and `ProductPreview`. Preserve `"use client"`, Framer Motion reveal, and reduced-motion support from global CSS. The hero must render one `h1`, the two CTA links, and side-by-side product preview tabs.

Use these top-level imports:

```tsx
"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { HERO, PRODUCTS } from "@/lib/content";
import { MarketingButton } from "@/components/marketing/marketing-button";
import { ProductPreview } from "@/components/marketing/product-card";
import { blurIn, fadeUp, staggerContainer } from "@/lib/motion";
```

The hero must use this section shell:

```tsx
export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-32 lg:pb-28 lg:pt-44">
      <div className="container relative grid gap-12 lg:grid-cols-12 lg:items-center">
        <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="lg:col-span-6">
          <motion.div variants={fadeUp} className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-xs text-zinc-300">
            <ShieldCheck className="h-3.5 w-3.5 text-vital-300" />
            {HERO.eyebrow}
          </motion.div>
          <motion.h1 variants={blurIn} className="text-balance font-display text-[clamp(3.4rem,7vw,7.2rem)] leading-[0.9] tracking-tightest text-white">
            {HERO.headline}
          </motion.h1>
          <motion.p variants={fadeUp} className="mt-7 max-w-2xl text-lg leading-relaxed text-zinc-300 lg:text-xl">
            {HERO.sub}
          </motion.p>
          <motion.div variants={fadeUp} className="mt-9 flex flex-wrap gap-3">
            <MarketingButton href={HERO.primaryCta.href}>{HERO.primaryCta.label}</MarketingButton>
            <MarketingButton href={HERO.secondaryCta.href} variant="secondary">{HERO.secondaryCta.label}</MarketingButton>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} className="lg:col-span-6">
          <div className="surface-premium p-4 lg:p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="label-tactical">{HERO.status.label}</span>
              <span className="text-xs text-zinc-400">{HERO.status.value}</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {PRODUCTS.map((product) => (
                <div key={product.slug} className="min-w-0">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-white">{product.name}</span>
                    <ArrowRight className="h-4 w-4 text-zinc-500" />
                  </div>
                  <ProductPreview product={product} />
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Replace `src/components/landing/featured-project.tsx` with product roster**

Render `PRODUCTS.map` with `ProductCard`, `MarketingSection`, and `MarketingSectionHeader`. The section id must be `products`.

- [ ] **Step 5: Update `src/components/landing/values-section.tsx`**

Keep the current icon-grid idea, but change copy to company-level "How we build" and use `VALUES`. Use `MarketingSection` and `MarketingSectionHeader`.

- [ ] **Step 6: Update `src/components/landing/closing-cta.tsx`**

Make contact the primary CTA and products secondary:

```tsx
<MarketingButton href="/contact" variant="vital">Start a serious conversation</MarketingButton>
<MarketingButton href="/#products" variant="secondary">Review products</MarketingButton>
```

- [ ] **Step 7: Update `src/app/page.tsx` composition**

Imports must include:

```ts
import { SignalStrip } from "@/components/marketing/signal-strip";
import { TechnologyGrid } from "@/components/marketing/technology-grid";
import { FounderPanel } from "@/components/marketing/founder-panel";
import { MarketingSection, MarketingSectionHeader } from "@/components/marketing/marketing-section";
```

Render order:

```tsx
<TopNav />
<div className="relative">
  <AmbientBackdrop />
  <Hero />
</div>
<SignalStrip />
<FeaturedProject />
<ValuesSection />
<TechnologyGrid />
<MarketingSection>
  <MarketingSectionHeader
    eyebrow="Founder-led"
    title={<>Small team. High standards. Real products.</>}
    body="GhimTech is shaped by Durga Ghimeray's operator background: USMC discipline, Nepali entrepreneurial grit, and a bias toward software that earns trust under pressure."
  />
  <div className="mt-10">
    <FounderPanel />
  </div>
</MarketingSection>
<ClosingCta />
<SiteFooter />
```

- [ ] **Step 8: Run tests, type-check, and lint**

```bash
npm run test -- tests/homepage-composition.test.ts
npm run type-check
npm run lint
```

Expected: all pass.

- [ ] **Step 9: Commit**

```bash
git add src/app/page.tsx src/components/landing src/components/marketing tests/homepage-composition.test.ts
git commit -m "feat: redesign ghimtech homepage"
```

## Task 5: Public Secondary Pages Alignment

**Files:**
- Modify: `src/components/about/about-intro.tsx`
- Modify: `src/components/contact/contact-intro.tsx`
- Modify: `src/components/experience/experience-intro.tsx`
- Modify: `src/components/projects/projects-index-hero.tsx`
- Modify: `src/components/projects/projects-index-featured.tsx`
- Modify: `src/components/projects/rayhealth-hero.tsx`
- Modify: `src/app/projects/page.tsx`
- Modify: `src/app/projects/rayhealth-evv/page.tsx`

- [ ] **Step 1: Write secondary page wording check**

Create `tests/public-pages-copy.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("public page copy", () => {
  it("keeps contact framed for serious software conversations", () => {
    const contactIntro = readFileSync("src/components/contact/contact-intro.tsx", "utf8");
    assert.match(contactIntro, /agency owners|partners|engineers|technical buyers/i);
  });

  it("keeps RayHealth compliance wording conservative", () => {
    const rayhealthPage = readFileSync("src/app/projects/rayhealth-evv/page.tsx", "utf8");
    assert.match(rayhealthPage, /Designed to support EVV/i);
    assert.doesNotMatch(rayhealthPage, /certified|audit-proof|guaranteed/i);
  });
});
```

- [ ] **Step 2: Run the check and verify it fails**

```bash
npm run test -- tests/public-pages-copy.test.ts
```

Expected: FAIL because contact intro does not yet name the serious buyer/partner audience.

- [ ] **Step 3: Align intro components**

Update page intro components to use calmer headlines:

- `AboutIntro`: headline "Founder-led software, built with discipline."
- `ExperienceIntro`: headline "A record of service, systems, and execution."
- `ContactIntro`: headline "Bring a serious problem." Body must include "agency owners, partners, engineers, and technical buyers".

Keep existing exported component names so routes do not change.

- [ ] **Step 4: Align projects index**

Update Projects page metadata to describe both RayHealthEVV and Helix Studio. Update `ProjectsIndexHero` and `ProjectsIndexFeatured` so the page reads as a product portfolio, using `PRODUCTS` where possible.

- [ ] **Step 5: Align RayHealth hero**

Update `RayHealthHero` to reduce heavy HUD language and emphasize a credible healthcare operations product. Preserve "Designed to support EVV" language and existing route metadata.

- [ ] **Step 6: Verify**

```bash
npm run test -- tests/public-pages-copy.test.ts
npm run type-check
npm run lint
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/components/about/about-intro.tsx src/components/contact/contact-intro.tsx src/components/experience/experience-intro.tsx src/components/projects src/app/projects tests/public-pages-copy.test.ts
git commit -m "feat: align public pages with ghimtech redesign"
```

## Task 6: Auth Screen Redesign

**Files:**
- Modify: `src/app/sign-in/[[...sign-in]]/page.tsx`
- Modify: `src/app/sign-up/[[...sign-up]]/page.tsx`
- Test: existing `tests/auth-policy.test.ts`, `tests/auth-route-policy.test.ts`

- [ ] **Step 1: Run existing auth policy tests**

```bash
npm run test -- tests/auth-policy.test.ts tests/auth-route-policy.test.ts
```

Expected: PASS before visual changes.

- [ ] **Step 2: Redesign sign-in page**

Keep all existing server action, `safeRedirectPath`, search param, error handling, hidden `next`, field names, autocomplete values, and links. Change only layout/copy/classes:

- page headline: "Secure operator entrance"
- subcopy: "Sign in with an approved GhimTech workspace account."
- add a right-side or top trust panel with "Private dashboard", "Supabase-backed auth", and "Founder workspace".
- keep submit text "Sign in".

- [ ] **Step 3: Redesign sign-up page**

Keep action, hidden `next`, field names, validation attributes, invite code field, and links. Change only layout/copy/classes:

- page headline: "Request workspace access"
- subcopy: "Create an approved GhimTech workspace account with the team invite code."
- keep submit text "Create account".

- [ ] **Step 4: Verify auth behavior**

```bash
npm run test -- tests/auth-policy.test.ts tests/auth-route-policy.test.ts
npm run type-check
npm run lint
```

Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/sign-in/[[...sign-in]]/page.tsx src/app/sign-up/[[...sign-up]]/page.tsx
git commit -m "feat: redesign auth entry screens"
```

## Task 7: Dashboard Visual Refinement

**Files:**
- Modify: `src/components/dashboard/dashboard-page-header.tsx`
- Modify: `src/components/dashboard/dashboard-sidebar.tsx`
- Modify: `src/components/dashboard/dashboard-topbar.tsx`
- Modify: `src/components/dashboard/widgets/welcome-card.tsx`
- Modify: `src/components/dashboard/widgets/ops-metrics-strip.tsx`
- Modify: `src/components/dashboard/widgets/projects-widget.tsx`
- Modify: `src/components/dashboard/widgets/tasks-widget.tsx`
- Modify: `src/components/dashboard/widgets/ship-activity-chart.tsx`
- Modify: `src/components/dashboard/widgets/notifications-feed.tsx`
- Modify: `src/components/dashboard/widgets/peace-of-mind-mode.tsx`
- Modify: `src/components/dashboard/inbox/inbox-list.tsx`
- Modify: `src/components/dashboard/tasks/tasks-board.tsx`
- Modify: `src/components/dashboard/notifications/alerts-list.tsx`
- Modify: `src/app/dashboard/layout.tsx`

- [ ] **Step 1: Write a dashboard copy/surface check**

Create `tests/dashboard-surface.test.ts`:

```ts
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("dashboard surface", () => {
  it("uses the calmer operating console language", () => {
    const header = readFileSync("src/components/dashboard/dashboard-page-header.tsx", "utf8");
    assert.match(header, /operating-console|surface-subtle|surface-premium/);
  });

  it("keeps dashboard layout private and does not add public nav", () => {
    const layout = readFileSync("src/app/dashboard/layout.tsx", "utf8");
    assert.doesNotMatch(layout, /TopNav/);
    assert.match(layout, /DashboardSidebar/);
  });
});
```

- [ ] **Step 2: Run the check and verify it fails**

```bash
npm run test -- tests/dashboard-surface.test.ts
```

Expected: FAIL because current dashboard header does not use the calmer shared surface language.

- [ ] **Step 3: Refine dashboard layout and header**

Update `DashboardPageHeader` classes:

- root class: `surface-premium operating-console relative p-5 lg:p-6`
- title scale: `text-[clamp(1.9rem,3.4vw,3.4rem)]`
- description: max width `max-w-3xl`
- remove decorative corner/HUD language from this primitive

Add `operating-console` class to `globals.css`:

```css
  .operating-console {
    background-image:
      linear-gradient(180deg, rgba(255,255,255,0.035), transparent 48%),
      radial-gradient(circle at top right, rgba(86,168,255,0.055), transparent 46%);
  }
```

- [ ] **Step 4: Refine sidebar and topbar**

Keep nav hrefs and labels unless the new design requires copy-only changes. Reduce glow and rounded pill overload. Ensure the search button and sign-out button keep accessible labels.

- [ ] **Step 5: Refine widgets**

For each listed widget/list component:

- replace nested `glass-panel-strong` where it creates card-in-card visual weight with `surface-subtle`
- tighten spacing for scanability
- preserve props, callbacks, fetch calls, forms, and route links
- keep empty/loading/error states visible

- [ ] **Step 6: Verify**

```bash
npm run test -- tests/dashboard-surface.test.ts
npm run type-check
npm run lint
```

Expected: all pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/globals.css src/app/dashboard/layout.tsx src/components/dashboard tests/dashboard-surface.test.ts
git commit -m "feat: refine dashboard operating console"
```

## Task 8: Final Build And Responsive Verification

**Files:**
- Modify only if verification finds issues.

- [ ] **Step 1: Run full automated checks**

```bash
npm run test
npm run type-check
npm run lint
npm run build
```

Expected: all pass. If `npm run build` fails because required database generation env vars are missing, record the exact error and run `npm run type-check` plus `npm run lint` as the gating checks.

- [ ] **Step 2: Start dev server**

```bash
npm run dev
```

Expected: Next dev server starts, usually at `http://localhost:3000`. If port 3000 is occupied, use the port printed by Next.

- [ ] **Step 3: Browser smoke routes**

Open these routes:

```txt
/
/about
/projects
/projects/rayhealth-evv
/experience
/contact
/sign-in
/sign-up
/dashboard
```

Expected:

- public routes render without console errors
- `/dashboard` redirects to sign-in if unauthenticated
- nav links work
- contact form is still present
- sign-in/sign-up field names and actions remain intact

- [ ] **Step 4: Responsive screenshots**

Check these viewport widths:

```txt
390x844
768x1024
1280x800
1440x1000
```

Expected:

- no text overflow
- no overlapping hero/product preview elements
- mobile nav opens, closes, and has 44px-height targets
- product cards stack cleanly
- auth forms fit mobile
- dashboard remains usable on tablet/desktop

- [ ] **Step 5: Reduced motion check**

Enable reduced motion in the browser or devtools, reload `/`, and verify:

- marquee/ambient animations stop or become effectively instant
- content remains visible
- no layout shift depends on motion completion

- [ ] **Step 6: Fix verification issues**

For each issue, make the smallest CSS or component change in the affected file and rerun:

```bash
npm run type-check
npm run lint
```

If the issue affects content exports or route guarantees, rerun:

```bash
npm run test
```

- [ ] **Step 7: Final commit**

```bash
git add src tests
git commit -m "chore: polish ghimtech redesign verification"
```

If Step 6 made no changes, skip this commit.

## Self-Review Notes

- Spec coverage: Tasks cover content model, metadata/SEO, public nav/footer, homepage, secondary public pages, auth screens, dashboard visual refinement, accessibility/mobile/performance verification.
- Scope: No database schema, auth behavior, API route, or backend data-flow changes are planned.
- Test strategy: Node tests lock content safety, route safety, homepage composition, auth policy, and dashboard/private layout assumptions. Visual quality is verified through build, lint, type-check, and browser responsive checks.
