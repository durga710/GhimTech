/**
 * /api/copilot/chat
 *   POST → streaming chat with GPT-5, grounded in the operator's live
 *          projects + open tasks. Body: { messages: [{role, content}] }.
 *          Returns a text/plain token stream.
 *
 * Operator-only, rate-limited.
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 60;

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`copilot.chat:${user.id}`, { limit: 120, windowMs: 60 * 60 * 1000 });
  if (!rl.success) return apiErrors.rateLimit(rl.reset);

  const ai = getOpenAI();
  if (!ai) return apiErrors.badRequest("AI is not configured (missing OPENAI_API_KEY).");

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiErrors.badRequest("Request body must be valid JSON");
  }
  const parsed = ChatSchema.safeParse(body);
  if (!parsed.success) return apiErrors.validation(parsed.error);

  // Fresh, server-side context (never trust the client for this).
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id, status: { not: "ARCHIVED" } },
      select: { name: true, status: true, progress: true, sourceRepo: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.task.findMany({
      where: { userId: user.id, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }, { dueAt: "asc" }],
      select: { title: true, priority: true, status: true },
      take: 30,
    }),
  ]);

  const context =
    `Operator: ${user.firstName ?? "the founder"}.\n` +
    `Projects:\n${projects.map((p) => `- ${p.name} [${p.status}, ${p.progress}%]${p.sourceRepo ? ` (repo ${p.sourceRepo})` : ""}`).join("\n") || "- (none)"}\n` +
    `Open tasks:\n${tasks.map((t) => `- [${t.priority}] ${t.title}`).join("\n") || "- (none)"}`;

  const system =
    "You are the founder's operations copilot, embedded in their dashboard. Be direct, concrete, and genuinely useful — like a sharp chief of staff who knows their work. " +
    "Ground answers in the live context below; reference specific projects and tasks by name when relevant. Keep replies tight unless asked to go deep. If asked to draft something, write the actual thing.\n\n" +
    `--- LIVE CONTEXT ---\n${context}`;

  try {
    const stream = await ai.chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "system", content: system }, ...parsed.data.messages],
      stream: true,
    });

    const encoder = new TextEncoder();
    const rs = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content;
            if (token) controller.enqueue(encoder.encode(token));
          }
        } catch {
          controller.enqueue(encoder.encode("\n\n[stream interrupted]"));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(rs, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (e) {
    console.error("[copilot-chat]", e);
    return apiErrors.internal();
  }
}
