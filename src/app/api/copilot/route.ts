/**
 * /api/copilot
 *   POST → generate a fresh daily brief with OpenAI from the operator's
 *          current projects + open tasks, store it as an AiSummary
 *          (scope="daily-brief"), and return it.
 *
 * Operator-only. Rate-limited. Degrades with a clear error if OPENAI_API_KEY
 * is not configured.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { audit } from "@/lib/audit";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM_PROMPT =
  "You are the daily operations copilot for a solo founder. Be concise, concrete, and calm — surface the 1-3 things that actually matter today. " +
  'Respond ONLY with JSON of the form: {"headline": string (<= 80 chars), "body": string (2-3 sentences, second person), "highlights": string[] (exactly 3 short, specific action items)}.';

export async function POST(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`copilot.brief:${user.id}`, { limit: 20, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const client = getOpenAI();
  if (!client) return apiErrors.badRequest("AI is not configured (missing OPENAI_API_KEY).");

  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id, status: { not: "ARCHIVED" } },
      select: { name: true, status: true, progress: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.task.findMany({
      where: { userId: user.id, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
      select: { title: true, priority: true, status: true, dueAt: true },
      take: 25,
    }),
  ]);

  const context = {
    date: new Date().toISOString().slice(0, 10),
    projects: projects.map((p) => ({ name: p.name, status: p.status, progress: p.progress })),
    openTasks: tasks.map((t) => ({
      title: t.title,
      priority: t.priority,
      status: t.status,
      due: t.dueAt ? t.dueAt.toISOString().slice(0, 10) : null,
    })),
  };

  let parsed: { headline?: unknown; body?: unknown; highlights?: unknown };
  try {
    const completion = await client.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `My current state:\n${JSON.stringify(context, null, 2)}\n\nWrite my brief for today.` },
      ],
      response_format: { type: "json_object" },
      max_tokens: 600,
    });
    parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");
  } catch (e) {
    console.error("[api/copilot]", e);
    return apiErrors.internal();
  }

  const headline = String(parsed.headline ?? "Today's brief").slice(0, 200);
  const body = String(parsed.body ?? "");
  const highlights = Array.isArray(parsed.highlights)
    ? parsed.highlights.slice(0, 5).map((h) => String(h))
    : [];

  const summary = await prisma.aiSummary.create({
    data: { userId: user.id, scope: "daily-brief", headline, body, highlights, model: OPENAI_MODEL },
  });

  await audit({ action: "copilot.brief", target: summary.id, actorId: user.id, req });

  return ok({
    summary: {
      id: summary.id,
      headline,
      body,
      highlights,
      generatedAt: summary.generatedAt.toISOString(),
    },
  });
}
