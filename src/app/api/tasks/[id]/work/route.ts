/**
 * /api/tasks/[id]/work
 *   POST → have GPT-5 actually DO the task: produce the real deliverable
 *          (document, runbook+commands, code, or analysis), grounded in the
 *          task's linked project repo. Returns Markdown — does not auto-save.
 *
 * Operator-only, owner-scoped, rate-limited.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
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
  "You are a senior engineer and operator executing ONE task for a solo founder. PRODUCE THE ACTUAL WORK PRODUCT that completes the task — not advice about it. " +
  "If the task is a document, write the complete document. If it's implementation or configuration, write a precise step-by-step runbook with the exact commands and any code/diffs. If it's a review or analysis, produce the concrete findings and recommendations. " +
  "Ground everything in the provided repo context; be specific and ready-to-use, not generic. Output clean Markdown. " +
  "End with a short '## Done when' checklist to confirm completion. If any part requires a real-world action you cannot perform (signing, purchasing), state exactly what the human must do.";

export async function POST(_req: Request, ctx: Ctx) {
  const user = await requireUser();
  const { id } = await ctx.params;

  const task = await prisma.task.findUnique({
    where: { id },
    include: { project: { select: { name: true, sourceRepo: true, description: true } } },
  });
  if (!task || task.userId !== user.id) return apiErrors.notFound("Task");

  const rl = rateLimit(`task.work:${user.id}`, { limit: 30, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const ai = getOpenAI();
  if (!ai) return apiErrors.badRequest("AI is not configured (missing OPENAI_API_KEY).");

  let repoBlock = "(no linked repo)";
  if (task.project?.sourceRepo && hasGitHubToken()) {
    const repoCtx = await fetchRepoContext(task.project.sourceRepo);
    if (repoCtx) {
      repoBlock =
        `REPO ${repoCtx.repo}\n` +
        `README:\n${repoCtx.readme ?? "(none)"}\n\n` +
        `PROJECT_STATUS.md:\n${repoCtx.statusDoc ?? "(none)"}\n\n` +
        `NEXT_STEPS.md:\n${repoCtx.nextSteps ?? "(none)"}\n\n` +
        `OPEN ISSUES:\n${repoCtx.openIssues.map((i) => `#${i.number} ${i.title}`).join("\n") || "(none)"}\n\n` +
        `RECENT COMMITS:\n${repoCtx.recentCommits.join("\n") || "(none)"}`;
    }
  }

  const userContent =
    `TASK: ${task.title}\n` +
    `Priority: ${task.priority} · Status: ${task.status} · Project: ${task.project?.name ?? "Personal"}\n` +
    (task.description ? `Task notes: ${task.description}\n` : "") +
    `\nPROJECT CONTEXT:\n${task.project?.description ?? "(none)"}\n\n` +
    `${repoBlock}\n\n` +
    `Produce the deliverable that completes this task.`;

  let deliverable: string;
  try {
    const completion = await ai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent },
      ],
      max_tokens: 2000,
    });
    deliverable = completion.choices[0]?.message?.content ?? "";
  } catch (e) {
    console.error("[task.work]", e);
    return apiErrors.internal();
  }

  if (!deliverable.trim()) return apiErrors.internal();

  await audit({ action: "task.work", target: id, actorId: user.id, req: _req });

  return ok({ deliverable, model: OPENAI_MODEL });
}
