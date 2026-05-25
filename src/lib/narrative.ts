/**
 * Narrative content for About + Experience pages.
 * Kept separate from `content.ts` so the landing data stays light.
 *
 * Edit the strings here to tune voice — the rendering is fully driven by this file.
 */

export const ABOUT_CHAPTERS = [
  {
    id: "origin",
    label: "Chapter 01",
    title: "Nepal — where it starts",
    accent: "origin",
    body: [
      "Born into a Nepali family where discipline, service, and respect for hard work weren't slogans — they were the air. The mountains teach you something about scale early: that you are small, that the work is long, and that consistency over time is the only real lever.",
      "That foundation — quiet, repetitive, demanding — shaped everything that came next.",
    ],
    pullQuote: "The mountains teach you about scale early.",
  },
  {
    id: "usmc",
    label: "Chapter 02",
    title: "United States Marine Corps",
    accent: "usmc",
    body: [
      "The Marine Corps doesn't just teach you how to operate under pressure. It teaches you that systems matter more than heroics — that the difference between a unit that performs and one that fails is rarely talent. It's the discipline of the boring, repeated, audited fundamentals.",
      "Service also taught a harder lesson: when systems fail people, the cost isn't abstract. Someone's day, livelihood, or life is on the other end. That clarity never left.",
    ],
    pullQuote: "Systems matter more than heroics.",
  },
  {
    id: "pivot",
    label: "Chapter 03",
    title: "Into technology",
    accent: "pivot",
    body: [
      "After service, I started looking at industries where systems were still failing real people every day. Healthcare operations — and home care specifically — kept surfacing.",
      "Caregivers were drowning in paper. Agency owners couldn't see their own businesses. Families couldn't trust the system. Compliance was a fear instead of a tool. The whole stack had been built for billing, not for care.",
      "That gap looked a lot like the gaps I had seen in the Marines — and the playbook felt familiar: build the boring fundamentals well, make them audit-proof, and earn trust through reliability instead of marketing.",
    ],
    pullQuote: "The whole stack had been built for billing, not for care.",
  },
  {
    id: "build",
    label: "Chapter 04",
    title: "RayHealthEVV™",
    accent: "build",
    body: [
      "RayHealth is what happens when veteran-grade operational rigor meets healthcare software. One unified system spanning caregiver onboarding, scheduling, EVV, billing, payroll, training, and compliance — designed owner-first.",
      "Invitation-only caregiver onboarding with access codes. Missed-punch corrections that flow into a coordinator review queue. AI workflow copilots that confirm before they act. Per-agency dynamic legal templates. The work is endless. The bar is non-negotiable.",
    ],
    pullQuote: "Designed owner-first. The bar is non-negotiable.",
  },
  {
    id: "vision",
    label: "Chapter 05",
    title: "Operational peace of mind",
    accent: "vision",
    body: [
      "The long-term vision isn't more software. It's quieter software — technology that does its job so well it disappears, so that agency owners, caregivers, and the families they serve can focus on care instead of paperwork.",
      "The endgame is a category: healthcare operating systems that are designed to support compliance rather than retrofit it, that respect the people inside them, and that earn the trust they ask for.",
    ],
    pullQuote: "Quieter software. Calmer operators. Better care.",
  },
] as const;

export const ACHIEVEMENTS = [
  { value: 12, label: "Modules shipped", suffix: "", duration: 1.8 },
  { value: 3, label: "Operator roles supported", suffix: "", duration: 1.2 },
  { value: 99.9, label: "Uptime", suffix: "%", duration: 2.2, decimals: 1 },
  { value: 100, label: "Veteran-built", suffix: "%", duration: 1.6 },
] as const;

/**
 * Experience timeline.
 * Each entry has:
 *   - period: short HUD-style label ("2018 – 2022", "Now")
 *   - role / org
 *   - body: 1-3 short paragraphs
 *   - tags: stack / focus / discipline chips
 *   - tone: "service" | "founder" | "leadership" | "vision"
 *     (drives the color accent of the marker)
 */
export const EXPERIENCE = [
  {
    period: "Origin",
    org: "Nepal",
    role: "Foundation",
    tone: "service" as const,
    body: [
      "Raised in a Nepali household where discipline and family were structural, not aspirational. Learned early that consistency over time outperforms intensity in a moment.",
    ],
    tags: ["Discipline", "Family", "Service"],
  },
  {
    period: "Service",
    org: "United States Marine Corps",
    role: "Marine · Operator",
    tone: "service" as const,
    body: [
      "Operational discipline at unit scale. Repeating the boring fundamentals until they hold under stress. Learning that the unglamorous systems — the checklists, the audits, the handoffs — are what actually save lives.",
      "Carried out responsibilities under the Corps' standard of accountability: if the system fails, it fails on you.",
    ],
    tags: ["Operations", "Accountability", "Leadership", "Audit-proof systems"],
  },
  {
    period: "Transition",
    org: "Independent study · Healthcare ops",
    role: "Researcher · Operator-in-training",
    tone: "leadership" as const,
    body: [
      "Spent the post-service period studying where systems were still failing real people. Home care kept rising to the top — fragmented tooling, paper-heavy workflows, agency owners with no operational visibility, compliance treated as a fear.",
      "Started prototyping what an owner-first home-care operating system could look like.",
    ],
    tags: ["Research", "Healthcare ops", "Field interviews"],
  },
  {
    period: "Founding",
    org: "RayHealth",
    role: "Founder · Operator · Product",
    tone: "founder" as const,
    body: [
      "Founded RayHealth to bring veteran-grade rigor to home-care agencies. Built the platform from caregiver onboarding to billing in a single unified system.",
      "Wear multiple hats by design — product strategy, compliance positioning, sales collateral, onboarding, and operational rollout — because the founder owning the whole loop is the only way the standard stays high.",
    ],
    tags: ["Founder", "Product", "Sales", "Operations", "Compliance"],
  },
  {
    period: "Now",
    org: "RayHealthEVV — Command Glass",
    role: "Founder · Building",
    tone: "founder" as const,
    body: [
      "Currently leading the whole-platform redesign anchored in an executive command-center experience. Caregiver invitation/access-code onboarding, coordinator review queues, AI workflow copilots (Fast and Deep), mobile apps, and per-agency legal templates.",
      "The platform is live, agencies are onboard, and the work is in continuous shipping mode.",
    ],
    tags: ["Command Glass", "AI Copilot", "Mobile", "EVV", "Active"],
  },
  {
    period: "Horizon",
    org: "Operational peace of mind",
    role: "Long-term vision",
    tone: "vision" as const,
    body: [
      "The long-term play is a category of healthcare operating systems — designed to support compliance, respect the people inside them, and quietly disappear into the work.",
      "More software is not the goal. Quieter, more trustworthy software is.",
    ],
    tags: ["Category", "Vision", "Trust"],
  },
] as const;

export const PHILOSOPHY = [
  {
    n: "01",
    title: "The boring fundamentals win",
    body: "Audit-proof, repeated, unglamorous discipline beats clever shortcuts on a long enough timeline.",
  },
  {
    n: "02",
    title: "Owner-first or it doesn't work",
    body: "If the agency owner can't see the whole picture in one calm surface, the product has failed them.",
  },
  {
    n: "03",
    title: "Earn trust through reliability",
    body: "Trust is built by showing up the same way on the worst day as on the best one. Marketing comes after.",
  },
  {
    n: "04",
    title: "AI confirms, never assumes",
    body: "Automation that acts without confirmation is liability. The system asks before it moves.",
  },
] as const;
