/**
 * Company-level identity & content — the single source of truth for who
 * GhimTech is as a company. Pages and components pull from here so the
 * voice never drifts.
 *
 * GhimTech is a technology company building AI-powered software. The founder
 * story (Durga Ghimeray) lives in `@/lib/content` and surfaces inside /about
 * as the origin story — not as the company's homepage thesis.
 */

export const COMPANY = {
  name: "GhimTech",
  legalName: "GhimTech",
  domain: "ghimtech.org",
  email: "hello@ghimtech.org",
  founded: "2024",
  location: "United States",
  tagline: "Intelligent software, built to be trusted",
  /** One-sentence mission used for metadata + hero sub. */
  mission:
    "GhimTech builds AI-native software that is intelligent, beautifully engineered, and genuinely useful — from healthcare operations to developer tools.",
  /** Slightly longer positioning statement for About / OG. */
  positioning:
    "We design and ship AI-native products that make serious work calmer. Engineering excellence, restraint, and trust over hype.",
} as const;

/** Primary hero — company-first, confident, concrete. */
export const COMPANY_HERO = {
  eyebrow: "GhimTech · AI-native software company",
  headline: "Intelligent software,\nbuilt to be trusted.",
  sub: "We design and ship AI-native products that make serious work calmer — across healthcare operations, developer tools, and business automation. Engineered with judgment, not hype.",
  primary: { label: "Explore our products", href: "/products" },
  secondary: { label: "Meet Helix Studio", href: "/products/helix-studio" },
} as const;

/** The marquee of what we're building right now — ticker on the home page. */
export const COMPANY_TICKER = [
  "Helix Studio — AI app builder",
  "RayHealthEVV — healthcare operations",
  "Bring-your-own-model AI",
  "Ship from prompt to production",
  "Audit-grade operational software",
  "Developer tooling, done right",
  "Privacy & compliance by design",
  "Open-source contributions",
] as const;

export interface FocusArea {
  id: string;
  title: string;
  body: string;
  /** lucide-react icon name */
  icon: string;
  accent: "signal" | "vital";
}

/** The domains GhimTech builds in. */
export const FOCUS_AREAS: readonly FocusArea[] = [
  {
    id: "ai-apps",
    title: "AI-powered applications",
    body: "Products with judgment built in — software that proposes, confirms, and acts, instead of leaving the work to you.",
    icon: "Sparkles",
    accent: "signal",
  },
  {
    id: "healthcare",
    title: "Healthcare technology",
    body: "Operational software for the businesses that deliver care. Built around real workflows, privacy, and compliance.",
    icon: "Stethoscope",
    accent: "vital",
  },
  {
    id: "devtools",
    title: "Developer tools",
    body: "Tools that compress the distance between an idea and a running app — from prompt to pull request to production.",
    icon: "Terminal",
    accent: "signal",
  },
  {
    id: "automation",
    title: "Business automation",
    body: "Quiet systems that remove the repetitive, error-prone parts of operations so people can do the work that matters.",
    icon: "Workflow",
    accent: "vital",
  },
  {
    id: "productivity",
    title: "Productivity systems",
    body: "Calm command surfaces that put the whole picture in one place — no tab-hunting, no lost context.",
    icon: "LayoutDashboard",
    accent: "signal",
  },
  {
    id: "operational",
    title: "Intelligent operational software",
    body: "Audit-grade platforms that hold up under stress, scrutiny, and the worst-case Monday morning.",
    icon: "ShieldCheck",
    accent: "vital",
  },
] as const;

export interface CulturePrinciple {
  title: string;
  body: string;
}

/** Engineering culture — how we build, not just what. */
export const CULTURE: readonly CulturePrinciple[] = [
  {
    title: "Engineering over theater",
    body: "We ship real software — typed end-to-end, validated at every boundary, audited on every write. The demo is the product.",
  },
  {
    title: "AI that confirms, never assumes",
    body: "Automation proposes; people decide. Our AI surfaces are explicit, reversible, and locked down by default.",
  },
  {
    title: "Restraint is a feature",
    body: "A small, disciplined palette. Motion that guides instead of distracts. We remove until only the essential remains.",
  },
  {
    title: "Trust compounds",
    body: "Reliability on the worst day matters more than flash on the best. We build the boring fundamentals exceptionally well.",
  },
] as const;

export interface CompanyStat {
  value: string;
  label: string;
}

/** Credibility strip — qualitative, accurate, no inflated vanity metrics. */
export const COMPANY_STATS: readonly CompanyStat[] = [
  { value: "2", label: "Products shipping" },
  { value: "100%", label: "Veteran-founded" },
  { value: "AI-native", label: "Built from day one" },
  { value: "99.9%", label: "Platform uptime" },
] as const;

/** Primary top-nav routes. */
export const NAV = [
  { href: "/products", label: "Products" },
  { href: "/technology", label: "Technology" },
  { href: "/about", label: "About" },
  { href: "/careers", label: "Careers" },
  { href: "/blog", label: "Blog" },
] as const;

/** Footer site map — grouped. */
export const FOOTER_NAV = [
  {
    heading: "Products",
    links: [
      { href: "/products/helix-studio", label: "Helix Studio" },
      { href: "/products/rayhealth-evv", label: "RayHealthEVV" },
      { href: "/products", label: "All products" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/careers", label: "Careers" },
      { href: "/blog", label: "Blog" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { href: "/technology", label: "Technology" },
      { href: "/open-source", label: "Open source" },
      { href: "/dashboard", label: "Console" },
    ],
  },
] as const;

export const SOCIAL = {
  github: "https://github.com/durga710",
  linkedin: "https://www.linkedin.com/",
  email: "hello@ghimtech.org",
} as const;
