/**
 * Product registry — the canonical list of GhimTech products plus the deep
 * content that powers each product page.
 *
 * Two flagship products today:
 *   • Helix Studio   — premium AI development platform (the rebranded GCODE
 *                      app-builder engine, now a first-class product).
 *   • RayHealthEVV   — enterprise healthcare operations platform. Its rich
 *                      deep-dive data continues to live in `@/lib/projects`.
 */

export type ProductAccent = "signal" | "vital";

export interface ProductSummary {
  slug: string;
  name: string;
  /** Short category line, e.g. "AI development platform". */
  category: string;
  status: string;
  tagline: string;
  oneLiner: string;
  description: string;
  accent: ProductAccent;
  /** Internal deep-dive page on ghimtech.org. */
  href: string;
  /** The product's own standalone website — each is a separate product. */
  externalUrl: string;
  /** Bare host shown as the external-link affordance, e.g. "helixstudio.org". */
  externalLabel: string;
  featured: boolean;
  stack: readonly string[];
  metrics: readonly { label: string; value: string }[];
  highlights: readonly string[];
}

/** Summaries — used by /products index and the home showcase. */
export const PRODUCTS: readonly ProductSummary[] = [
  {
    slug: "helix-studio",
    name: "Helix Studio",
    category: "AI development platform",
    status: "Live · Beta",
    tagline: "From prompt to production.",
    oneLiner:
      "Describe an app in plain language. Helix plans it, writes real files, opens a pull request, and ships a live preview.",
    description:
      "A premium AI development platform. Helix Studio turns intent into running software — it reads your repository, writes real code across many files, opens a reviewable pull request, and deploys a live preview beside the chat. Bring your own model and your own keys.",
    accent: "signal",
    href: "/products/helix-studio",
    externalUrl: "https://helixstudio.org",
    externalLabel: "helixstudio.org",
    featured: true,
    stack: ["Next.js", "OpenAI", "Anthropic", "GitHub", "Vercel", "Monaco"],
    metrics: [
      { label: "Files / build", value: "50" },
      { label: "Model providers", value: "3" },
      { label: "Workflow", value: "PR-native" },
    ],
    highlights: [
      "Prompt-to-production app generation",
      "Bring your own model — OpenAI, Anthropic, or local",
      "Real GitHub repositories, not a sandbox",
      "Live preview pane beside the chat",
    ],
  },
  {
    slug: "rayhealth-evv",
    name: "RayHealthEVV™",
    category: "Healthcare operations platform",
    status: "Production · Active",
    tagline: "Care. Verified. Delivered.",
    oneLiner:
      "A unified operating system for home-care agencies — caregiver, coordinator, billing, payroll, scheduling, training, and compliance in one calm surface.",
    description:
      "An enterprise platform for the businesses that deliver home care. RayHealthEVV brings owner-first visibility, invitation-only onboarding, EVV visit verification, and audit-grade compliance posture into a single command center — designed to support EVV and state Medicaid requirements.",
    accent: "vital",
    href: "/products/rayhealth-evv",
    externalUrl: "https://rayhealthevv.com",
    externalLabel: "rayhealthevv.com",
    featured: true,
    stack: ["Next.js", "Supabase", "PostgreSQL", "AI Copilot", "iOS", "Android"],
    metrics: [
      { label: "Modules", value: "12" },
      { label: "Roles", value: "3" },
      { label: "Uptime", value: "99.9%" },
    ],
    highlights: [
      "Owner-first command center",
      "Invitation-only caregiver onboarding",
      "EVV visit verification (GPS · voice · biometric)",
      "Audit-grade compliance posture",
    ],
  },
] as const;

export function getProduct(slug: string): ProductSummary | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/* ==========================================================================
   HELIX STUDIO — deep content for the flagship product page
   ========================================================================== */

export const HELIX = {
  name: "Helix Studio",
  wordmark: "Helix",
  status: "Live · Beta",
  /** The product's own standalone website. */
  url: "https://helixstudio.org",
  urlLabel: "helixstudio.org",
  tagline: "From prompt to production.",
  oneLiner:
    "The AI development platform. Describe what you want; Helix builds it, opens a pull request, and ships a live preview — in real repositories, with the model you choose.",
  thesis: [
    "Most AI coding tools stop at a suggestion. Helix Studio goes the whole distance: it reads your repository, plans the change, writes real files across the codebase, commits to a branch, and opens a pull request you can actually review.",
    "A live preview deploys beside the chat as it builds. Bring your own model — OpenAI, Anthropic, or a local endpoint — and your own keys. Your code, your repos, your infrastructure.",
  ],
} as const;

export interface HelixFeature {
  id: string;
  title: string;
  eyebrow: string;
  body: string;
  bullets: readonly string[];
  accent: ProductAccent;
  icon: string;
}

export const HELIX_FEATURES: readonly HelixFeature[] = [
  {
    id: "prompt-to-production",
    title: "Prompt to production",
    eyebrow: "The core loop",
    body: "Describe an app or a change in plain language. Helix plans the work against your repo, writes real files in a single pass, commits to a branch, and opens a pull request. Nothing is hand-waved — the output is code you ship.",
    bullets: [
      "Up to 50 files written per build",
      "Branch + commit + pull request, automatically",
      "Repo-aware planning, not blind generation",
    ],
    accent: "signal",
    icon: "Rocket",
  },
  {
    id: "byo-model",
    title: "Bring your own model",
    eyebrow: "Provider-agnostic",
    body: "Choose OpenAI, Anthropic, or any OpenAI-compatible local endpoint — Ollama, LM Studio, vLLM. Add your own API key. Helix never locks you to a single vendor or marks up your tokens.",
    bullets: [
      "OpenAI · Anthropic · local",
      "Your keys, stored encrypted",
      "Per-member identity & settings",
    ],
    accent: "vital",
    icon: "Cpu",
  },
  {
    id: "real-repos",
    title: "Real repositories",
    eyebrow: "Not a sandbox",
    body: "Helix works against real GitHub repositories. It can create a new repo for a fresh idea or build into an existing one — with guardrails that protect the studio's own source and scan for leaked secrets before anything ships.",
    bullets: [
      "Create new repos or build into existing",
      "Self-repo guardrails",
      "Secret scanning on every build",
    ],
    accent: "signal",
    icon: "GitBranch",
  },
  {
    id: "live-preview",
    title: "Live preview pane",
    eyebrow: "See it run",
    body: "A running deployment appears beside the chat. Helix opens the pull request, Vercel builds the preview, and the studio polls until your app is live — so you watch the change come up in real time.",
    bullets: [
      "Vercel preview deployments",
      "Running app beside the chat",
      "Build + deploy status, live",
    ],
    accent: "vital",
    icon: "MonitorPlay",
  },
  {
    id: "code-editor",
    title: "Inspect every file",
    eyebrow: "Full control",
    body: "A Monaco-powered editor lets you read and refine everything Helix writes. This is a development platform, not a black box — you stay in control of the code at every step.",
    bullets: [
      "Monaco editor built in",
      "Read and edit generated files",
      "No black boxes",
    ],
    accent: "signal",
    icon: "Code2",
  },
  {
    id: "guardrails",
    title: "Confirm before it acts",
    eyebrow: "Safety by design",
    body: "Helix proposes; you approve. Pull requests are the unit of change, so nothing reaches your main branch without review. Destructive actions are explicit and reversible.",
    bullets: [
      "PR-native, review-first workflow",
      "Explicit, reversible actions",
      "Rate-limited and audited",
    ],
    accent: "vital",
    icon: "ShieldCheck",
  },
] as const;

export interface HelixWorkflowStep {
  n: string;
  title: string;
  body: string;
}

export const HELIX_WORKFLOW: readonly HelixWorkflowStep[] = [
  { n: "01", title: "Describe", body: "Tell Helix what to build in plain language — a page, a feature, a whole app." },
  { n: "02", title: "Plan", body: "Helix reads your repository context and plans the files it needs to write." },
  { n: "03", title: "Build", body: "It writes real code across many files in a single pass." },
  { n: "04", title: "Review", body: "A pull request opens with the full diff, ready for you to review." },
  { n: "05", title: "Preview", body: "A live Vercel deployment comes up beside the chat as it builds." },
  { n: "06", title: "Ship", body: "Merge when it's right. Your code, your repo, your call." },
] as const;

export interface ArchLayer {
  layer: string;
  detail: string;
  tech: readonly string[];
}

export const HELIX_ARCHITECTURE: readonly ArchLayer[] = [
  { layer: "Studio", detail: "Chat, Monaco editor, and the live preview pane", tech: ["Next.js", "React", "Framer Motion"] },
  { layer: "Agent", detail: "Tool-calling agent that plans, writes files, and opens PRs", tech: ["Tool calling", "Zod", "Repo context"] },
  { layer: "Model", detail: "Provider-agnostic model layer, your keys", tech: ["OpenAI", "Anthropic", "Local"] },
  { layer: "Source", detail: "Real Git operations against GitHub", tech: ["GitHub REST", "Branches", "Pull requests"] },
  { layer: "Preview", detail: "Preview deployments polled until live", tech: ["Vercel", "Deploy API"] },
] as const;

export interface RoadmapPhase {
  phase: string;
  when: string;
  items: readonly string[];
}

export const HELIX_ROADMAP: readonly RoadmapPhase[] = [
  { phase: "Now", when: "Shipping", items: ["Model picker (OpenAI/Anthropic/local)", "Live preview pane", "Bring-your-own key", "Repo creation + guardrails"] },
  { phase: "Next", when: "In build", items: ["Streaming responses", "Build history", "Multi-file diff review", "Keyboard-first command bar"] },
  { phase: "Horizon", when: "Planned", items: ["Collaborative building", "Template marketplace", "Voice input", "Custom agent tools"] },
  { phase: "Vision", when: "Direction", items: ["Agentic project ownership", "Continuous self-repair", "Cross-repo refactors", "Full SDLC automation"] },
] as const;

export interface ChangelogEntry {
  version: string;
  date: string;
  title: string;
  notes: readonly string[];
}

/** Illustrative changelog mirroring the real shipped PRs (#11–#23). */
export const HELIX_CHANGELOG: readonly ChangelogEntry[] = [
  { version: "v0.5", date: "2026-06-11", title: "Build reliability", notes: ["vercel.json build override", "Best-effort push + repair endpoint", "Runtime DB schema push + drift detection"] },
  { version: "v0.4", date: "2026-06-09", title: "Bring your own AI", notes: ["Create new repos from the studio", "Bring-your-own AI API key", "Per-member GitHub identity"] },
  { version: "v0.3", date: "2026-06-07", title: "Model picker", notes: ["OpenAI / Anthropic / local model picker", "Visual identity + self-repo guardrails"] },
  { version: "v0.2", date: "2026-06-05", title: "Live preview", notes: ["Running app beside the chat", "Preview polling until live"] },
  { version: "v0.1", date: "2026-06-03", title: "Helix Studio launch", notes: ["Branded app-builder studio", "Prompt-to-PR core loop"] },
] as const;

/** GitHub source for live activity on the Helix page. */
export const HELIX_GITHUB = {
  owner: "durga710",
  repo: "GhimTech",
  url: "https://github.com/durga710/GhimTech",
} as const;
