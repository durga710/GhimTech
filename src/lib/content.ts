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
    screenshot: {
      src: "/products/rayhealth-command-center.jpg",
      alt: "RayHealthEVV admin Command Center showing live visit alerts, compliance readiness, and today's schedule",
      url: "rayhealthevv.com/admin",
    },
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
    status: "Live platform",
    tag: "Prompt-to-production developer platform",
    tagline: "From prompt to real software artifacts.",
    description:
      "An AI app-building platform that turns plain-language prompts into real files, live previews, and deployable projects — with video generation, an academy, and a community space built in.",
    href: "https://helixstudio.org",
    cta: "Open Helix Studio",
    accent: "signal",
    previewLabel: "Build pipeline",
    screenshot: {
      src: "/products/helix-editor.jpg",
      alt: "Helix Studio editor asking what you want to make, with app-building project templates",
      url: "helixstudio.org/editor",
    },
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

/**
 * Real screenshots captured from the live products (no mockups).
 * RayHealth shots come from rayhealthevv.com fixture-account sessions;
 * Helix shots from helixstudio.org.
 */
export const RAYHEALTH_GALLERY = [
  {
    src: "/products/rayhealth-command-center.jpg",
    alt: "Admin Command Center with needs-attention alerts, today's visit counts, and compliance readiness tiles",
    title: "Command Center",
    body: "One surface that tells an agency owner what needs attention right now — late visits, expiring credentials, open EVV exceptions.",
    url: "rayhealthevv.com/admin",
  },
  {
    src: "/products/rayhealth-visit-review.jpg",
    alt: "Visit review queue with verified and flagged visits alongside their federal EVV data points",
    title: "Visit Review",
    body: "Every exception surfaces with the six federal EVV elements alongside it. Approve, file, or escalate in one click.",
    url: "rayhealthevv.com/admin/review",
  },
  {
    src: "/products/rayhealth-compliance-engine.jpg",
    alt: "Compliance engine overview spanning audit defense, exceptions, Medicaid, payroll, and claims",
    title: "Compliance Engine",
    body: "Audit defense, exceptions, Medicaid submission, payroll, and claims — the whole compliance chain in one place.",
    url: "rayhealthevv.com/admin/compliance-engine",
  },
  {
    src: "/products/rayhealth-caregiver-portal.jpg",
    alt: "Caregiver portal dashboard with weekly hours, visits, recent activity, and client assignments",
    title: "Caregiver Portal",
    body: "Caregivers see their week at a glance — hours, visits, assignments — with one-tap clock-in on mobile.",
    url: "rayhealthevv.com/portal",
  },
] as const;

export const HELIX_GALLERY = [
  {
    src: "/products/helix-editor.jpg",
    alt: "Helix Studio editor start screen asking what you want to make",
    title: "Editor",
    body: "Describe the app; Helix writes the code into real files with live preview.",
    url: "helixstudio.org/editor",
  },
  {
    src: "/products/helix-video.jpg",
    alt: "HelixVideo generation workspace",
    title: "HelixVideo",
    body: "Prompt-to-video generation built into the same workspace.",
    url: "helixstudio.org/video",
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
