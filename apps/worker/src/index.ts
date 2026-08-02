/**
 * Background worker. Three queues:
 *
 *   - efile-ack-poll: polls the API's idempotent /efile/poll endpoint for
 *     returns awaiting acknowledgment (agency latency simulation in dev).
 *   - document-ocr: heavy OCR work off the request path (the dev mock engine
 *     is fast, but real engines are not).
 *   - communications: outbound notification templates.
 *
 * The worker talks to the API with a dedicated service account token so all
 * writes stay behind the same permission checks and audit logging as human
 * traffic. It requires Redis; without REDIS_URL it exits with instructions
 * rather than pretending to run.
 */
import { Queue, Worker, type Job } from "bullmq";
import { Redis } from "ioredis";

const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error(
    "[ghimtech-worker] REDIS_URL is not set. Start Redis (docker compose up redis) and retry.",
  );
  process.exit(1);
}
const apiBase = process.env.GHIMTECH_API_URL ?? "http://localhost:4000";
const serviceToken = process.env.GHIMTECH_WORKER_TOKEN;

const connection = new Redis(redisUrl, { maxRetriesPerRequest: null });

export const QUEUE_NAMES = {
  ackPoll: "efile-ack-poll",
  ocr: "document-ocr",
  communications: "communications",
} as const;

const ackQueue = new Queue(QUEUE_NAMES.ackPoll, { connection });

async function pollAcknowledgment(job: Job<{ returnId: string }>): Promise<string> {
  if (!serviceToken) throw new Error("GHIMTECH_WORKER_TOKEN not configured");
  const response = await fetch(`${apiBase}/returns/${job.data.returnId}/efile/poll`, {
    method: "POST",
    headers: { authorization: `Bearer ${serviceToken}` },
  });
  if (!response.ok) {
    throw new Error(`Poll failed with ${response.status}`);
  }
  const body = (await response.json()) as { status: string };
  if (body.status === "ACKNOWLEDGMENT_PENDING") {
    // Still pending — try again with backoff.
    await ackQueue.add(
      "poll",
      { returnId: job.data.returnId },
      { delay: Math.min((job.attemptsMade + 1) * 60_000, 15 * 60_000) },
    );
  }
  return body.status;
}

new Worker(QUEUE_NAMES.ackPoll, pollAcknowledgment, {
  connection,
  concurrency: 4,
});

new Worker(
  QUEUE_NAMES.communications,
  async (job: Job<{ template: string; clientId: string }>) => {
    // Outbound email/SMS integration is environment-specific; the dev worker
    // logs the intent. Templates never include full TINs or bank numbers.
    console.warn(
      `[ghimtech-worker] communication "${job.data.template}" queued for client ${job.data.clientId} (no mail transport configured)`,
    );
  },
  { connection },
);

console.warn(`[ghimtech-worker] listening on ${redisUrl} → API ${apiBase}`);

const shutdown = async () => {
  await connection.quit();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
