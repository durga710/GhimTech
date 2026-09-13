import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";
const source = await readFile(new URL("../src/app/api/project/route.ts", import.meta.url), "utf8");
const patched = source
  .replace(
    'from "@/lib/enquiry.mjs"',
    'from "' + new URL("../src/lib/enquiry.mjs", import.meta.url).href + '"',
  )
  .replace(
    /import\s*\{\s*siteUrl\s*\}\s*from\s*"@\/lib\/site";/,
    'const siteUrl="https://ghimtech.org";',
  );
const compiled = ts.transpileModule(patched, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
}).outputText;
const { POST } = await import(
  "data:text/javascript;base64," + Buffer.from(compiled).toString("base64")
);
const valid = {
  name: "Test",
  email: "test@example.com",
  company: "Example",
  business: "Service business",
  bottleneck: "Manual intake",
  currentProcess: "Calls",
  idealSystem: "Assigned requests",
  startedAt: Date.now() - 10000,
  requestId: "bf9738a8-74a8-42bb-8a80-482aef384d70",
};
const originalFetch = globalThis.fetch;
const keys = [
  "PROJECT_WEBHOOK_URL",
  "PROJECT_WEBHOOK_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "RATE_LIMIT_SECRET",
  "RESEND_API_KEY",
  "ENQUIRY_INBOX",
  "ENQUIRY_FROM",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
];
const original = Object.fromEntries(keys.map((k) => [k, process.env[k]]));
function request(data = valid, headers = {}) {
  return new Request("https://ghimtech.org/api/project", {
    method: "POST",
    headers: { origin: "https://ghimtech.org", "content-type": "application/json", ...headers },
    body: JSON.stringify(data),
  });
}
function setup() {
  process.env.PROJECT_WEBHOOK_URL = "https://receiver.example.com";
  process.env.PROJECT_WEBHOOK_TOKEN = "test-only";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-only";
  process.env.RATE_LIMIT_SECRET = "test-only-random-secret";
}
test.afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const k of keys) {
    if (original[k] === undefined) delete process.env[k];
    else process.env[k] = original[k];
  }
});
test("rejects cross-origin submissions", async () => {
  assert.equal((await POST(request(valid, { origin: "https://other.example" }))).status, 403);
});
test("rejects non-JSON and oversized requests", async () => {
  assert.equal((await POST(request(valid, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await POST(request(valid, { "content-length": "22000" }))).status, 413);
});
test("checks actual body size without trusting content-length", async () => {
  assert.equal((await POST(request({ ...valid, context: "x".repeat(22000) }))).status, 400);
});
test("rejects honeypot, fast requests, and invalid request identifiers", async () => {
  for (const extra of [
    { fax: "bot" },
    { startedAt: Date.now() + 100000 },
    { requestId: "invalid" },
  ])
    assert.equal((await POST(request({ ...valid, ...extra }))).status, 400);
});
test("validates server-side even if client validation is bypassed", async () => {
  const response = await POST(request({ ...valid, email: "wrong" }));
  assert.equal(response.status, 422);
  assert.ok((await response.json()).errors.email);
});
test("fails closed without configured delivery", async () => {
  for (const key of keys) delete process.env[key];
  globalThis.fetch = () => {
    throw new Error("Must not send");
  };
  assert.equal((await POST(request())).status, 503);
});
test("shared limiter rejects excess requests before delivery", async () => {
  setup();
  let calls = 0;
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ result: 0 });
  };
  const response = await POST(request());
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "3600");
  assert.equal(calls, 1);
});
test("limiter outages fail closed", async () => {
  setup();
  globalThis.fetch = async () => Response.json({ error: "unavailable" }, { status: 500 });
  assert.equal((await POST(request())).status, 503);
});
test("delivery errors never report success", async () => {
  setup();
  globalThis.fetch = async (url) =>
    String(url).includes("redis")
      ? Response.json({ result: 1 })
      : new Response(null, { status: 500 });
  assert.equal((await POST(request())).status, 503);
});
test("durable acknowledgement reports receipt and retries use the same key", async () => {
  setup();
  const received = [];
  globalThis.fetch = async (url, options) => {
    if (String(url).includes("redis")) return Response.json({ result: 1 });
    received.push(options);
    return new Response(null, { status: 202 });
  };
  assert.equal((await POST(request())).status, 200);
  assert.equal((await POST(request())).status, 200);
  assert.equal(received[0].headers["Idempotency-Key"], received[1].headers["Idempotency-Key"]);
  assert.equal(received[0].redirect, "error");
  assert.equal(JSON.parse(received[0].body).email, valid.email);
});
test("network failures preserve an explicit failure response", async () => {
  setup();
  globalThis.fetch = async () => {
    throw new Error("Internal network details");
  };
  const response = await POST(request());
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes("Internal network details"));
});
function setupResend() {
  process.env.RESEND_API_KEY = "re_test_only";
  process.env.ENQUIRY_INBOX = "owner@example.com";
  process.env.UPSTASH_REDIS_REST_URL = "https://redis.example.com";
  process.env.UPSTASH_REDIS_REST_TOKEN = "test-only";
  process.env.RATE_LIMIT_SECRET = "test-only-random-secret";
}
test("resend delivery emails the inbox with reply-to and an idempotency key", async () => {
  setupResend();
  const sent = [];
  globalThis.fetch = async (url, options) => {
    if (String(url).includes("redis")) return Response.json({ result: 1 });
    sent.push({ url: String(url), options });
    return Response.json({ id: "email-id" });
  };
  const response = await POST(request({ ...valid, name: "Line\nBreak", context: "More\ndetail" }));
  assert.equal(response.status, 200);
  assert.equal(sent.length, 1);
  assert.equal(sent[0].url, "https://api.resend.com/emails");
  assert.equal(sent[0].options.headers.Authorization, "Bearer re_test_only");
  assert.match(sent[0].options.headers["Idempotency-Key"], /^[0-9a-f]{64}$/);
  assert.equal(sent[0].options.redirect, "error");
  const body = JSON.parse(sent[0].options.body);
  assert.deepEqual(body.to, ["owner@example.com"]);
  assert.equal(body.reply_to, valid.email);
  assert.equal(body.from, "GhimTech Enquiries <onboarding@resend.dev>");
  assert.equal(body.subject, "Project enquiry: Line Break at Example");
  assert.ok(body.text.includes("What is slowing them down\nManual intake"));
  assert.ok(body.text.includes("Additional context\nMore\ndetail"));
  assert.ok(!body.text.includes("undefined"));
});
test("resend mode honours a configured sender and fails closed on rejection", async () => {
  setupResend();
  process.env.ENQUIRY_FROM = "GhimTech <hello@ghimtech.org>";
  let from;
  globalThis.fetch = async (url, options) => {
    if (String(url).includes("redis")) return Response.json({ result: 1 });
    from = JSON.parse(options.body).from;
    return Response.json({ message: "invalid key" }, { status: 401 });
  };
  assert.equal((await POST(request())).status, 503);
  assert.equal(from, "GhimTech <hello@ghimtech.org>");
});
test("resend mode requires a valid inbox and the shared limiter", async () => {
  globalThis.fetch = () => {
    throw new Error("Must not send");
  };
  setupResend();
  process.env.ENQUIRY_INBOX = "not-an-email";
  assert.equal((await POST(request())).status, 503);
  setupResend();
  delete process.env.UPSTASH_REDIS_REST_URL;
  assert.equal((await POST(request())).status, 503);
});
test("webhook takes precedence when both deliveries are configured", async () => {
  setup();
  setupResend();
  const urls = [];
  globalThis.fetch = async (url) => {
    urls.push(String(url));
    return Response.json({ result: 1 });
  };
  assert.equal((await POST(request())).status, 200);
  assert.deepEqual(urls, ["https://redis.example.com", "https://receiver.example.com"]);
});
test("accepts the Vercel Marketplace KV variable names and derives the hashing secret", async () => {
  setupResend();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
  delete process.env.RATE_LIMIT_SECRET;
  process.env.KV_REST_API_URL = "https://kv.example.com";
  process.env.KV_REST_API_TOKEN = "kv-test-only";
  const calls = [];
  globalThis.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    return String(url).includes("kv.example")
      ? Response.json({ result: 1 })
      : Response.json({ id: "x" });
  };
  assert.equal((await POST(request())).status, 200);
  assert.equal(calls[0].url, "https://kv.example.com");
  assert.equal(calls[0].options.headers.Authorization, "Bearer kv-test-only");
  const keysUsed = JSON.parse(calls[0].options.body).slice(3);
  assert.match(keysUsed[0], /^ghimtech:ip:[0-9a-f]{64}$/);
  assert.match(keysUsed[1], /^ghimtech:email:[0-9a-f]{64}$/);
  // Still fails closed with no Redis at all.
  delete process.env.KV_REST_API_URL;
  delete process.env.KV_REST_API_TOKEN;
  assert.equal((await POST(request())).status, 503);
});
