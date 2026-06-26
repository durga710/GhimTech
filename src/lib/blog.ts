/**
 * Blog content — a lightweight, typed posts source.
 *
 * Each post is authored inline as paragraphs. Kept deliberately simple (no
 * MDX pipeline) so the engineering notes stay close to the codebase. Add new
 * entries to the top of POSTS.
 */

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date, YYYY-MM-DD. */
  date: string;
  readingTime: string;
  tag: string;
  author: string;
  body: readonly string[];
}

export const POSTS: readonly BlogPost[] = [
  {
    slug: "prompt-to-production",
    title: "Prompt to production: why we built Helix Studio around pull requests",
    excerpt:
      "Most AI coding tools stop at a suggestion. We think the unit of AI development should be a reviewable pull request — here's why.",
    date: "2026-06-10",
    readingTime: "5 min read",
    tag: "Engineering",
    author: "GhimTech",
    body: [
      "When we set out to build Helix Studio, we made one decision early that shaped everything else: the output of an AI build should be a pull request, not a patch you paste into your editor.",
      "It sounds like a small thing. It isn't. A pull request is a contract. It says: here is a complete, reviewable change, with a diff you can read, checks you can run, and a preview you can click. It keeps a human in the loop at exactly the right moment — after the work is done, before it ships.",
      "Helix reads your repository, plans the files it needs, writes them in a single pass, commits to a branch, and opens the PR. A live preview deploys beside the chat. You review, you merge. Nothing reaches your main branch without your say-so.",
      "This is what 'AI that confirms, never assumes' looks like in practice. The model proposes; you decide. And because every change is a PR, your existing review culture, CI, and deploy pipeline just work — no new trust required.",
    ],
  },
  {
    slug: "boring-fundamentals",
    title: "The boring fundamentals win",
    excerpt:
      "Audit logs on every write. Zod at every boundary. Ownership checks that return 404, not 403. The unglamorous decisions that make software trustworthy.",
    date: "2026-06-04",
    readingTime: "4 min read",
    tag: "Culture",
    author: "GhimTech",
    body: [
      "There's a discipline you learn in the Marine Corps that translates surprisingly well to software: the boring, repeated, audited fundamentals are what hold up under stress. Not heroics. Not cleverness. Fundamentals.",
      "In our codebases that means a few non-negotiables. Every input is validated with a schema at the boundary. Every write hits an audit log. Every ownership check returns a 404 rather than a 403, so we never even leak whether a resource exists.",
      "None of this is exciting. None of it demos well. But it's the difference between software you can trust on the worst day and software that merely works on the best one.",
      "We'd rather be the company whose systems are quietly correct than the one with the flashiest launch. Trust compounds; flash doesn't.",
    ],
  },
  {
    slug: "bring-your-own-model",
    title: "Bring your own model: provider-agnostic by design",
    excerpt:
      "OpenAI, Anthropic, or a local endpoint — and your own keys. Why we refuse to lock you to a single vendor.",
    date: "2026-05-28",
    readingTime: "3 min read",
    tag: "Product",
    author: "GhimTech",
    body: [
      "The model landscape moves fast. The best model for a task this quarter may not be the best next quarter — and the right choice depends on your data, your budget, and your constraints.",
      "So Helix Studio is provider-agnostic. Choose OpenAI, Anthropic, or any OpenAI-compatible local endpoint like Ollama or LM Studio. Add your own API key. We never mark up your tokens or hold your workflow hostage to a single vendor.",
      "It's a small philosophical stance with big practical consequences: your tools should serve you, not lock you in. Optionality is a feature.",
    ],
  },
] as const;

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

/** Formats an ISO date as e.g. "June 10, 2026". */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  if (!y || !m || !d) return iso;
  return `${months[m - 1]} ${d}, ${y}`;
}
