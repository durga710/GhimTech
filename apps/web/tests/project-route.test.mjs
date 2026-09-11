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
