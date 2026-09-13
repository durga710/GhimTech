import { createHmac } from "node:crypto";
import { validateEnquiry } from "@/lib/enquiry.mjs";
import { siteUrl } from "@/lib/site";
export const runtime = "nodejs";
const unavailable =
  "The enquiry service is temporarily unavailable. Your details have not been confirmed as received. Please keep this page open and try again later.";
function reply(status: number, message: string, extra: Record<string, unknown> = {}) {
  return Response.json(
    { message, ...extra },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
        ...(status === 429 ? { "Retry-After": "3600" } : {}),
      },
    },
  );
}
async function readBody(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("empty");
  let size = 0;
  const chunks: Uint8Array[] = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 20000) {
        await reader.cancel();
        throw new Error("large");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
}
type Enquiry = ReturnType<typeof validateEnquiry>["data"];
const labels: [keyof Enquiry, string][] = [
  ["name", "Name"],
  ["email", "Email"],
  ["company", "Company"],
  ["website", "Website"],
  ["budget", "Budget"],
  ["timeline", "Timeline"],
  ["business", "What the company does"],
  ["bottleneck", "What is slowing them down"],
  ["currentProcess", "How the process is handled today"],
  ["idealSystem", "What the ideal system would do"],
  ["context", "Additional context"],
];
// Header values must stay on one line; enquiry text may legitimately contain newlines.
const line = (value: string) => value.replace(/\s+/g, " ").trim();
function renderEnquiry(id: string, data: Enquiry, receivedAt: string) {
  const sections = labels
    .filter(([key]) => data[key])
    .map(([key, label]) => label + "\n" + data[key]);
  return [
    "New project enquiry from " + siteUrl + "/contact",
    "Received " + receivedAt,
    "Reference " + id,
    "",
    ...sections.flatMap((section) => [section, ""]),
  ].join("\n");
}
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(siteUrl).origin;
  const local = process.env.NODE_ENV === "development" && origin === new URL(request.url).origin;
  if (!origin || (origin !== expected && !local))
    return reply(403, "Please submit the form from the GhimTech website.");
  if (!request.headers.get("content-type")?.startsWith("application/json"))
    return reply(415, "Please send the form as JSON.");
  const length = Number(request.headers.get("content-length") || 0);
  if (length > 20000) return reply(413, "Please shorten the project details.");
  let input: Record<string, unknown>;
  try {
    input = await readBody(request);
  } catch {
    return reply(400, "Please check the form and try again.");
  }
  if (!input || typeof input !== "object" || Array.isArray(input))
    return reply(400, "Please check the form and try again.");
  if (input.fax) return reply(400, "Unable to process this enquiry.");
  const elapsed = Date.now() - Number(input.startedAt);
  if (!Number.isFinite(elapsed) || elapsed < 2500 || elapsed > 86400000)
    return reply(
      400,
      "Please take a moment to review the form, then try again. If this page has been open for a day, reload it.",
    );
  if (
    typeof input.requestId !== "string" ||
    !/^([0-9a-f]{8}-)([0-9a-f]{4}-){3}[0-9a-f]{12}$/i.test(input.requestId)
  )
    return reply(400, "Please reload the form and try again.");
  const { data, errors } = validateEnquiry(input);
  if (Object.keys(errors).length)
    return reply(422, "Please check the highlighted fields.", { errors });
  // Delivery is either a durable HTTPS webhook or an email through Resend.
  // The webhook wins when both are configured.
  const webhook = process.env.PROJECT_WEBHOOK_URL;
  const token = process.env.PROJECT_WEBHOOK_TOKEN;
  const resendKey = process.env.RESEND_API_KEY;
  const inbox = process.env.ENQUIRY_INBOX;
  const sender = process.env.ENQUIRY_FROM || "GhimTech Enquiries <onboarding@resend.dev>";
  const redis = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const secret = process.env.RATE_LIMIT_SECRET;
  const viaWebhook = !!(webhook && token);
  const viaResend = !!(resendKey && inbox && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inbox));
  if ((!viaWebhook && !viaResend) || !redis || !redisToken || !secret)
    return reply(503, unavailable);
  try {
    if (viaWebhook && new URL(webhook!).protocol !== "https:") return reply(503, unavailable);
    if (new URL(redis).protocol !== "https:") return reply(503, unavailable);
    const hash = (value: string) => createHmac("sha256", secret).update(value).digest("hex");
    // Only trust the platform-controlled client IP header on Vercel.
    // Other hosts use a shared bucket until an explicit trusted proxy is configured.
    const identity = process.env.VERCEL
      ? request.headers.get("x-vercel-forwarded-for")?.split(",")[0]?.trim() || "unknown"
      : "shared";
    const script =
      "local a=redis.call('INCR',KEYS[1]); if a==1 then redis.call('EXPIRE',KEYS[1],3600) end; local b=redis.call('INCR',KEYS[2]); if b==1 then redis.call('EXPIRE',KEYS[2],3600) end; if a>20 or b>5 then return 0 end; return 1";
    const limited = await fetch(redis, {
      method: "POST",
      headers: { Authorization: "Bearer " + redisToken, "Content-Type": "application/json" },
      body: JSON.stringify([
        "EVAL",
        script,
        2,
        "ghimtech:ip:" + hash(identity),
        "ghimtech:email:" + hash(data.email.toLowerCase()),
      ]),
      signal: AbortSignal.timeout(4000),
      cache: "no-store",
    });
    if (!limited.ok) throw new Error("rate-limit unavailable");
    const result = await limited.json();
    if (result.error || ![0, 1].includes(result.result)) throw new Error("rate-limit error");
    if (result.result === 0)
      return reply(
        429,
        "Too many enquiries have been sent. Please wait an hour before trying again.",
      );
    const receipt = hash(input.requestId + JSON.stringify(data));
    const receivedAt = new Date().toISOString();
    const delivery = viaWebhook
      ? { url: webhook!, auth: token!, body: { id: receipt, ...data, receivedAt } }
      : {
          url: "https://api.resend.com/emails",
          auth: resendKey!,
          body: {
            from: sender,
            to: [inbox!],
            reply_to: data.email,
            subject: line("Project enquiry: " + data.name + " at " + data.company),
            text: renderEnquiry(receipt, data, receivedAt),
          },
        };
    const delivered = await fetch(delivery.url, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + delivery.auth,
        "Content-Type": "application/json",
        "Idempotency-Key": receipt,
      },
      body: JSON.stringify(delivery.body),
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    if (!delivered.ok) throw new Error("delivery failed");
    return reply(200, "Your project enquiry has been received.");
  } catch {
    return reply(503, unavailable);
  }
}
