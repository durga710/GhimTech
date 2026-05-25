/**
 * Site-wide content & metadata.
 * Single source of truth — every page/component pulls from here.
 * When Durga updates a project status or bio fact, this is the only file to edit.
 */

export const FOUNDER = {
  name: "Durga Ghimeray",
  handle: "@durgaghimeray",
  title: "Founder · Builder · USMC Veteran",
  location: "United States",
  email: "durga@rayhealthevv.com",
  bio: "USMC veteran building my first real product — RayHealthEVV, a homecare operations platform that's live and shipping. Born in Nepal, based in the US, learning every week.",
  shortBio: "USMC Veteran · Nepali entrepreneur · Founder of RayHealthEVV™",
} as const;

export const HERO = {
  headline: "Building the Future of\nHealthcare Operations",
  sub: "USMC Veteran · Founder · Builder. I'm building one real thing — a homecare operations platform that's live and shipping every week.",
  status: {
    label: "Currently building",
    value: "RayHealthEVV — Command Glass redesign",
  },
} as const;

export const FOCUS_TICKER = [
  "Shipping RayHealthEVV v2",
  "Caregiver onboarding flow",
  "Coordinator review queue",
  "AI workflow copilot",
  "Mobile app integration",
  "Compliance hardening",
  "Brand & design system",
  "Per-agency legal templates",
] as const;

export const PROJECTS = [
  {
    slug: "rayhealth-evv",
    name: "RayHealthEVV™",
    tag: "Active · Production",
    tagline: "Care. Verified. Delivered.",
    description:
      "A unified home-care operations platform spanning caregiver, coordinator, billing, payroll, scheduling, training, and compliance workflows. Designed to support EVV and state Medicaid requirements.",
    status: "shipping",
    progress: 78,
    stack: ["Next.js", "Supabase", "PostgreSQL", "Gemini AI", "iOS", "Android"],
    highlights: [
      "Owner-first command center UX",
      "Invitation-only caregiver onboarding with access codes",
      "Missed-punch correction with coordinator review",
      "AI workflow copilot (Fast / Deep modes)",
      "Per-agency dynamic legal templates",
    ],
    metrics: [
      { label: "Modules", value: "12" },
      { label: "Roles", value: "3" },
      { label: "Uptime", value: "99.9%" },
    ],
  },
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
    body: "Service taught operational discipline, accountability under pressure, and how systems can either save or fail people.",
  },
  {
    year: "Pivot",
    title: "Into Technology",
    body: "Studied the gaps in healthcare operations — particularly home care — where caregivers, agencies, and families all carry preventable friction.",
  },
  {
    year: "Build",
    title: "RayHealthEVV™",
    body: "Founded RayHealth to bring veteran-grade operational rigor to home-care agencies. Built an EVV and operations platform from caregiver to billing.",
  },
  {
    year: "Now",
    title: "Command Glass",
    body: "Whole-platform redesign anchored in an executive command-center experience. AI copilots, mobile apps, and a unified visual system.",
  },
  {
    year: "Vision",
    title: "Operational Peace of Mind",
    body: "Healthcare technology that quietly does its job — so agency owners, caregivers, and families can focus on care, not paperwork.",
  },
] as const;

export const VALUES = [
  {
    title: "Veteran-grade rigor",
    body: "Systems that hold up under stress, audit, and the worst-case Monday morning.",
  },
  {
    title: "Owner-first design",
    body: "The agency owner sees the whole picture in one calm surface. No hunting for context.",
  },
  {
    title: "Designed to support compliance",
    body: "Built around EVV, privacy, and state requirements — without claiming blanket federal approval.",
  },
  {
    title: "Quiet AI",
    body: "AI confirms before it acts. Locked when not enabled. Private billing only.",
  },
] as const;

export const SOCIAL = {
  linkedin: "https://www.linkedin.com/",
  github: "https://github.com/",
  email: "durga@rayhealthevv.com",
} as const;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
] as const;
