/**
 * /api/copilot/chat
 *   POST → agentic chat with GPT-5 (OpenAI Responses API). The copilot can
 *          browse the web (built-in web_search) and call function tools that
 *          act on the operator's tasks, projects, notes, and linked repos.
 *          Body: { messages: [{role, content, attachments?}] }.
 *          Attachments (photos as data URLs, PDFs, text files) ride on the
 *          latest user message and are passed to the model as vision/file
 *          input. Returns { ok, data: { text, actions: [{tool, label}] } }.
 *
 * Operator-only, rate-limited. Non-streaming (an agent turn may run several
 * tool round-trips).
 */

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ok, apiErrors } from "@/lib/api-response";
import { rateLimit } from "@/lib/rate-limit";
import { getOpenAI, OPENAI_MODEL } from "@/lib/openai";
import { COPILOT_TOOLS, executeTool, toolLabel } from "@/lib/copilot-tools";
import { z } from "zod";

export const runtime = "nodejs";
export const maxDuration = 120;

const AttachmentSchema = z.object({
  name: z.string().min(1).max(200),
  kind: z.enum(["image", "pdf", "text"]),
  // Photos and PDFs travel as base64 data URLs; text files arrive pre-read.
  dataUrl: z.string().max(4_000_000).optional(),
  text: z.string().max(80_000).optional(),
});

const ChatSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(8000),
        attachments: z.array(AttachmentSchema).max(4).optional(),
      }),
    )
    .min(1)
    .max(40),
});

type Attachment = z.infer<typeof AttachmentSchema>;

type ContentPart =
  | { type: "input_text"; text: string }
  | { type: "input_image"; image_url: string; detail: "auto" }
  | { type: "input_file"; filename: string; file_data: string };

function attachmentParts(attachments: Attachment[]): ContentPart[] {
  const parts: ContentPart[] = [];
  for (const a of attachments) {
    if (a.kind === "image" && a.dataUrl?.startsWith("data:image/")) {
      parts.push({ type: "input_image", image_url: a.dataUrl, detail: "auto" });
    } else if (a.kind === "pdf" && a.dataUrl?.startsWith("data:application/pdf")) {
      parts.push({ type: "input_file", filename: a.name, file_data: a.dataUrl });
    } else if (a.kind === "text" && a.text) {
      parts.push({ type: "input_text", text: `--- Attached file: ${a.name} ---\n${a.text}` });
    }
  }
  return parts;
}

export async function POST(req: Request) {
  const user = await requireUser();

  const rl = rateLimit(`copilot.chat:${user.id}`, { limit: 100, windowMs: 60 * 60 * 1000 });
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

  // Compact live context for the system instructions.
  const [projects, tasks] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id, status: { not: "ARCHIVED" } },
      select: { name: true, slug: true, status: true, progress: true, sourceRepo: true },
      orderBy: { updatedAt: "desc" },
      take: 20,
    }),
    prisma.task.findMany({
      where: { userId: user.id, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }],
      select: { title: true, priority: true },
      take: 25,
    }),
  ]);

  const linkedRepos = Array.from(
    new Set(projects.map((p) => p.sourceRepo).filter((r): r is string => Boolean(r))),
  );

  const instructions =
    "You are the founder's operations copilot inside their dashboard. Be direct, concrete, and genuinely useful. " +
    "You can BROWSE THE WEB (web_search) and CALL TOOLS that act on the operator's real data (list/create tasks, update task status, list projects, create notes, read a project's linked GitHub repo and its live activity). " +
    "HARD RULE — ACT, DON'T INSTRUCT: you have hands. When the operator asks for an app, a feature, a fix, or any code, you MUST do the work yourself by calling build_app_files (complete file contents, sensible stack — static index.html for tiny things, Vite/Next for real apps) and reply with the PR link. " +
    "NEVER reply with setup steps, 'create this file', 'run npm install', code blocks for the operator to paste, or offers like 'would you like me to...'. If you wrote code in your head, it belongs in build_app_files, not in chat. " +
    "Vercel-connected repos get a live preview URL on the PR automatically — mention it. Reuse the same branch for follow-up fixes so they land on the same PR. " +
    "If you need a push target and none is obvious, call list_github_repos and pick or offer from REAL entries. NEVER ask the operator for branch names — build_app_files resolves the default branch itself. " +
    "If a repo errors as inaccessible, call list_github_repos, tell the operator which repos ARE available, and relay the tool's fix instructions verbatim — do not invent troubleshooting steps. " +
    "The operator may attach photos or files (screenshots, documents, code) — look at them carefully and use what they contain. After acting, confirm what you did in one line with links. Reference projects/tasks by name. Keep replies tight unless asked to expand.\n\n" +
    "--- LIVE CONTEXT ---\n" +
    `Operator: ${user.firstName ?? "the founder"}.\n` +
    `Projects: ${projects.map((p) => `${p.name} (slug ${p.slug}) [${p.status} ${p.progress}%]`).join("; ") || "none"}\n` +
    `GitHub repos you can build into (build_app_files targets): ${linkedRepos.join(", ") || "none linked yet — ask the operator for an owner/name repo"}\n` +
    `Top open tasks: ${tasks.map((t) => `[${t.priority}] ${t.title}`).join("; ") || "none"}`;

  const actions: { tool: string; label: string }[] = [];

  try {
    // First turn: the full conversation as input. Messages with attachments
    // become multimodal content (text + images + files).
    const input = parsed.data.messages.map((m) => {
      if (m.role !== "user" || !m.attachments?.length) {
        return { role: m.role, content: m.content };
      }
      const parts = attachmentParts(m.attachments);
      return {
        role: m.role,
        content: [{ type: "input_text" as const, text: m.content }, ...parts],
      };
    });

    let resp = await ai.responses.create({
      model: OPENAI_MODEL,
      instructions,
      input,
      tools: COPILOT_TOOLS,
      store: true,
    });

    // Note web searches the model performed.
    for (const item of resp.output ?? []) {
      if (item.type === "web_search_call") actions.push({ tool: "web_search", label: toolLabel("web_search", null) });
    }

    // Tool round-trips for our custom function tools (max 6 hops).
    for (let hop = 0; hop < 6; hop++) {
      const calls = (resp.output ?? []).filter(
        (o): o is Extract<typeof o, { type: "function_call" }> => o.type === "function_call",
      );
      if (calls.length === 0) break;

      const outputs = [];
      for (const call of calls) {
        let result: unknown;
        try {
          const parsedArgs = JSON.parse(call.arguments || "{}") as Record<string, unknown>;
          result = await executeTool(call.name, parsedArgs, user.id);
        } catch (e) {
          result = { error: e instanceof Error ? e.message : "tool failed" };
        }
        actions.push({ tool: call.name, label: toolLabel(call.name, result) });
        outputs.push({
          type: "function_call_output" as const,
          call_id: call.call_id,
          output: JSON.stringify(result).slice(0, 8000),
        });
      }

      resp = await ai.responses.create({
        model: OPENAI_MODEL,
        previous_response_id: resp.id,
        input: outputs,
        tools: COPILOT_TOOLS,
        store: true,
      });

      for (const item of resp.output ?? []) {
        if (item.type === "web_search_call") actions.push({ tool: "web_search", label: toolLabel("web_search", null) });
      }
    }

    const text = resp.output_text?.trim() || "Done.";
    return ok({ text, actions });
  } catch (e) {
    console.error("[copilot-chat]", e);
    return apiErrors.internal();
  }
}
