/**
 * /api/projects/[id]/copilot-sync
 *   POST → read the project's linked GitHub repo, ask GPT-5 how the tracker
 *          should be updated to reflect where the project is heading + what
 *          implementation is needed, and RETURN the proposal (does not apply).
 *
 * Operator-only, owner-scoped, rate-limited.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";
import { fetchRepoContext, hasGitHubToken } from "@/lib/github";

export const runtime = "nodejs";
export const maxDuration = 60;

interface Ctx {
  params: Promise<{ id: string }>;
}

const SYSTEM_PROMPT =
  "You maintain a founder's project-tracker entry from the project's source-of-truth GitHub repo. " +
  "From the repo signal (README, PROJECT_STATUS.md, NEXT_STEPS.md, open issues, recent commits) and the current tracker state, propose how to update the tracker to reflect where the project is heading and what implementation is still needed. " +
  "Only propose NEW items not already present in the current state. " +
  'Respond ONLY with JSON: {"direction": string (2-3 sentences), "summary": string (1-2 sentences), "suggestedProgress": number 0-100, ' +
  '"milestones": [{"title": string, "description": string}] (max 6), ' +
  '"roadmap": [{"title": string, "quarter": string, "status": string}] (max 6), ' +
  '"tasks": [{"title": string, "priority": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL"}] (concrete implementation work still needed, max 10)}.';

// --- defensive coercion (don't trust the model's exact shape) ---
const asArray = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const asObj = (v: unknown): Record<string, unknown> =>
  v && typeof v === "object" ? (v as Record<string, unknown>) : {};
const str = (v: unknown, max: number): string => (typeof v === "string" ? v : "").slice(0, max);
const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export async function POST(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      milestones: { select: { title: true } },
      roadmapItems: { select: { title: true } },
      tasks: { where: { status: { not: "DONE" } }, select: { title: true } },
    },
  });
  if (!project || project.userId !== user.id) return apiErrors.notFound("Project");
  if (!project.sourceRepo) return apiErrors.badRequest("This project has no linked GitHub repo.");

  const rl = rateLimit(`copilot.sync:${user.id}`, { limit: 15, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  if (!hasGitHubToken()) return apiErrors.badRequest("GitHub is not configured (missing GITHUB_TOKEN).");
  const ai = getOpenAI();
  if (!ai) return apiErrors.badRequest("AI is not configured (missing OPENAI_API_KEY).");

  const repoCtx = await fetchRepoContext(project.sourceRepo);
  if (!repoCtx) {
    return apiErrors.badRequest(`Couldn't read ${project.sourceRepo} — check the token's repo access.`);
  }

  const current = {
    name: project.name,
    status: project.status,
    progress: project.progress,
    existingMilestones: project.milestones.map((m) => m.title),
    existingRoadmap: project.roadmapItems.map((r) => r.title),
    openTasks: project.tasks.map((t) => t.title),
  };

  const userContent =
    `CURRENT TRACKER STATE:\n${JSON.stringify(current, null, 2)}\n\n` +
    `GITHUB REPO SIGNAL (${repoCtx.repo}):\n` +
    `README:\n${repoCtx.readme ?? "(none)"}\n\n` +
    `PROJECT_STATUS.md:\n${repoCtx.statusDoc ?? "(none)"}\n\n` +
    `NEXT_STEPS.md:\n${repoCtx.nextSteps ?? "(none)"}\n\n` +
    `OPEN ISSUES:\n${repoCtx.openIssues.map((i) => `#${i.number} ${i.title}`).join("\n") || "(none)"}\n\n` +
    `RECENT COMMITS:\n${repoCtx.recentCommits.join("\n") || "(none)"}\n\n` +
    `Propose the tracker update.`;

  let parsed: Record<string, unknown>;
  try {
    const completion = await ai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      response_format: { type: "json_object" },
      max_tokens: 1400,
    });
    parsed = asObj(JSON.parse(completion.choices[0]?.message?.content ?? "{}"));
  } catch (e) {
    console.error("[copilot-sync]", e);
    return apiErrors.internal();
  }

  const proposal = {
    direction: str(parsed.direction, 1200),
    summary: str(parsed.summary, 600),
    suggestedProgress:
      typeof parsed.suggestedProgress === "number"
        ? Math.max(0, Math.min(100, Math.round(parsed.suggestedProgress)))
        : project.progress,
    milestones: asArray(parsed.milestones)
      .slice(0, 6)
      .map((m) => {
        const o = asObj(m);
        return { title: str(o.title, 300), description: str(o.description, 2000) };
      })
      .filter((m) => m.title),
    roadmap: asArray(parsed.roadmap)
      .slice(0, 6)
      .map((r) => {
        const o = asObj(r);
        return { title: str(o.title, 300), quarter: str(o.quarter, 20), status: str(o.status, 40) || "planned" };
      })
      .filter((r) => r.title),
    tasks: asArray(parsed.tasks)
      .slice(0, 10)
      .map((t) => {
        const o = asObj(t);
        const p = str(o.priority, 12).toUpperCase();
        return { title: str(o.title, 300), priority: PRIORITIES.includes(p) ? p : "MEDIUM" };
      })
      .filter((t) => t.title),
  };

  return ok({ proposal, repo: repoCtx.repo, model: OPENAI_MODEL });
}
