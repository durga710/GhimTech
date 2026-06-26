/**
 * Project data for the RayHealth deep-dive page.
 *
 * Single source of truth for: product identity, module inventory, marquee
 * features, roadmap, deployment activity, sprint telemetry, and compliance
 * posture. Six dedicated components on /projects/rayhealth-evv consume these.
 */

/* ============================================================
   Identity
   ============================================================ */
export const RAYHEALTH = {
  slug: "rayhealth-evv",
  name: "RayHealthEVV™",
  tagline: "Care. Verified. Delivered.",
  status: "Production · Active",
  /** The product's own standalone website. */
  url: "https://rayhealthevv.com",
  urlLabel: "rayhealthevv.com",
  oneLiner:
    "A unified operating system for home-care agencies — caregiver, coordinator, billing, payroll, scheduling, training, and compliance in one calm surface.",
  thesis: [
    "Home-care software was built for billing, not for care. Agency owners can't see their own businesses, caregivers drown in paper, and compliance lives as a fear instead of a tool.",
    "RayHealth is the rebuild. Veteran-grade operational rigor, owner-first design, designed to support EVV and state Medicaid requirements without claiming blanket federal approval.",
  ],
  bigStats: [
    { value: 12, label: "Production modules", suffix: "" },
    { value: 3, label: "Operator roles", suffix: "" },
    { value: 99.9, label: "Uptime", suffix: "%", decimals: 1 },
    { value: 100, label: "Veteran-built", suffix: "%" },
  ],
} as const;

/* ============================================================
   12 production modules
   ============================================================ */
export const MODULES = [
  { code: "M01", name: "Caregiver onboarding", state: "active", note: "Invitation + access code" },
  { code: "M02", name: "EVV visit verification", state: "active", note: "GPS · Voice · Biometric" },
  { code: "M03", name: "Missed-punch corrections", state: "active", note: "Coordinator review queue" },
  { code: "M04", name: "Scheduling", state: "active", note: "Conflict-aware" },
  { code: "M05", name: "Billing & claims", state: "active", note: "State Medicaid ready" },
  { code: "M06", name: "Payroll", state: "active", note: "Hours-to-pay flow" },
  { code: "M07", name: "Training & compliance", state: "active", note: "Per-agency templates" },
  { code: "M08", name: "Coordinator command center", state: "active", note: "Owner-first" },
  { code: "M09", name: "AI workflow copilot", state: "beta", note: "Fast / Deep · paid add-on" },
  { code: "M10", name: "Caregiver mobile (iOS/Android)", state: "beta", note: "Google AI integration" },
  { code: "M11", name: "Legal templates engine", state: "active", note: "Dynamic per-agency" },
  { code: "M12", name: "Brand & learning hub", state: "active", note: "Command Glass design system" },
] as const;

/* ============================================================
   6 marquee features
   ============================================================ */
export const FEATURES = [
  {
    id: "command-glass",
    title: "Command Glass",
    eyebrow: "Owner-first UX",
    body:
      "The whole platform redesign — an executive command center where agency owners see schedules, visits, alerts, billing health, and compliance status on one calm surface. No tab-hunting, no context loss.",
    bullets: ["Unified glass surface", "Live operational telemetry", "Role-aware layouts"],
    accent: "signal",
  },
  {
    id: "invitation-onboarding",
    title: "Invitation-only caregiver onboarding",
    eyebrow: "Security as a first move",
    body:
      "Caregivers can't sign themselves up. Admins send an emailed invitation paired with an access code; resend, revoke, and copy-link controls live in the admin. A private acceptance flow seals the loop.",
    bullets: ["Email invite + access code", "Admin resend / revoke", "Private acceptance route"],
    accent: "vital",
  },
  {
    id: "missed-punch",
    title: "Missed-punch correction",
    eyebrow: "Coordinator review queue",
    body:
      "Caregivers correct missed punches from the visit card itself. Curated duties expand to the full list as needed. Even incomplete signatures can submit — coordinators review and approve in a single queue.",
    bullets: ["Visit-linked corrections", "Coordinator queue", "Incomplete-signature submit"],
    accent: "signal",
  },
  {
    id: "ai-copilot",
    title: "AI workflow copilot",
    eyebrow: "Gemini · Fast / Deep",
    body:
      "A paid agency-level add-on. Per-role copilots for caregiver, coordinator, and owner — all confirm before they act. Private billing only; visible-but-locked surfaces when the add-on is off.",
    bullets: ["Three roles, day one", "Confirm-every-action", "Private billing only"],
    accent: "vital",
  },
  {
    id: "mobile",
    title: "iOS + Android caregiver apps",
    eyebrow: "Google AI build partnership",
    body:
      "Native apps for caregivers, sharing the integration and system prompts with the web platform. Welcome and invite emails carry the access code as the final security gate before activation.",
    bullets: ["Native iOS · Android", "Shared system prompts", "Access-code activation"],
    accent: "signal",
  },
  {
    id: "legal",
    title: "Per-agency legal templates",
    eyebrow: "Compliance as a tool",
    body:
      "Dynamic legal template customization per agency through authenticated endpoints, with admin download flows. Designed to support EVV, privacy, and state requirements — not a blanket compliance claim.",
    bullets: ["Per-agency customization", "Authenticated endpoints", "Admin download flows"],
    accent: "vital",
  },
] as const;

/* ============================================================
   Quarterly roadmap
   ============================================================ */
export const ROADMAP = [
  {
    quarter: "Q2 2026",
    label: "Now",
    title: "Command Glass platform-wide",
    status: "in-progress",
    items: [
      "Full visual system rollout",
      "Owner command center surfaces",
      "AI copilot Fast / Deep modes",
      "Mobile invite + access code activation",
    ],
  },
  {
    quarter: "Q3 2026",
    label: "Next",
    title: "Scale and observability",
    status: "planned",
    items: [
      "Per-agency analytics dashboards",
      "Deployment audit log for owners",
      "Compliance posture reports",
      "Multi-agency operator views",
    ],
  },
  {
    quarter: "Q4 2026",
    label: "Horizon",
    title: "Platform extensibility",
    status: "planned",
    items: [
      "Public API for partner integrations",
      "Webhook surface for billing systems",
      "Third-party module marketplace (curated)",
    ],
  },
  {
    quarter: "Q1 2027",
    label: "Vision",
    title: "Category posture",
    status: "exploring",
    items: [
      "Healthcare OS positioning",
      "Cross-state compliance kit",
      "Caregiver-portable identity",
    ],
  },
] as const;

/* ============================================================
   Recent deployments — sample data
   ============================================================ */
export const DEPLOYMENTS = [
  { id: "dep_01", sha: "9f3e2c1", msg: "Command Glass: refine owner dashboard density", env: "production", status: "success", duration: "2m 14s", when: "12m ago" },
  { id: "dep_02", sha: "4a8c901", msg: "AI copilot: confirm-every-action for coordinator role", env: "production", status: "success", duration: "1m 58s", when: "1h ago" },
  { id: "dep_03", sha: "c2f4810", msg: "Missed-punch: incomplete signature submit path", env: "production", status: "success", duration: "3m 02s", when: "4h ago" },
  { id: "dep_04", sha: "7b1a4d3", msg: "Legal templates: per-agency override schema", env: "production", status: "success", duration: "2m 41s", when: "yesterday" },
  { id: "dep_05", sha: "e9c4287", msg: "Mobile: access-code activation handoff", env: "staging", status: "success", duration: "1m 47s", when: "yesterday" },
  { id: "dep_06", sha: "1d8b3a5", msg: "Invite flow: admin revoke + resend controls", env: "production", status: "success", duration: "2m 23s", when: "2d ago" },
] as const;

/* ============================================================
   Sprint telemetry — for the operations chart
   ============================================================ */
export const SPRINT_METRICS = [
  { week: "W18", shipped: 4, opened: 6 },
  { week: "W19", shipped: 7, opened: 5 },
  { week: "W20", shipped: 6, opened: 7 },
  { week: "W21", shipped: 9, opened: 6 },
  { week: "W22", shipped: 8, opened: 8 },
  { week: "W23", shipped: 11, opened: 7 },
  { week: "W24", shipped: 10, opened: 6 },
  { week: "W25", shipped: 12, opened: 9 },
] as const;

/* ============================================================
   Compliance posture
   ============================================================
   IMPORTANT brand governance — per Durga's preferences:
   RayHealth is "designed to support" EVV / privacy / compliance.
   We do NOT claim blanket certification or federal approval.
   ============================================================ */
export const COMPLIANCE_POSTURE = [
  { label: "EVV",     title: "Electronic Visit Verification", note: "Designed to support state EVV requirements (21st Century Cures Act framework). Per-state config." },
  { label: "Privacy", title: "HIPAA-aligned practices",        note: "Engineered around HIPAA's administrative, physical, and technical safeguards. Audit-ready posture." },
  { label: "State",   title: "State Medicaid alignment",       note: "Billing surfaces configured per state Medicaid program requirements. Per-agency templates." },
  { label: "Access",  title: "Role-based access control",      note: "Owner · Coordinator · Caregiver tiers. Invitation-only onboarding. Audit log on every privileged action." },
] as const;
