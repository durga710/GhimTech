/**
 * Rate limiter.
 *
 * Implementation: fixed-window in-memory map. Sufficient for a
 * single-instance Next.js deploy on Vercel (each invocation gets its
 * own memory, so this gives per-instance limiting — not perfect, but
 * better than nothing for the contact form / public API surface).
 *
 * Production upgrade path (recommended when traffic warrants):
 *   1. npm i @upstash/ratelimit @upstash/redis
 *   2. Replace the body of `rateLimit()` with:
 *        const ratelimit = new Ratelimit({
 *          redis: Redis.fromEnv(),
 *          limiter: Ratelimit.slidingWindow(limit, `${windowMs} ms`),
 *        });
 *        return await ratelimit.limit(key);
 *   3. Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to env.
 *
 * The interface here matches Upstash's so the swap is one file.
 */

import "server-only";

type Bucket = {
  count: number;
  resetAt: number;
};

// Module-level map. Survives across requests within one server instance.
const buckets = new Map<string, Bucket>();

// Periodically purge expired buckets so the map doesn't grow forever.
// Run on every limit() call rather than a setInterval (which doesn't
// play well with serverless cold-starts).
function purgeIfDue() {
  const now = Date.now();
  // Cheap heuristic: only sweep when the map gets meaningfully large.
  if (buckets.size < 256) return;
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number; // ms epoch
  limit: number;
}

export function rateLimit(
  key: string,
  options: { limit: number; windowMs: number }
): RateLimitResult {
  const { limit, windowMs } = options;
  const now = Date.now();

  purgeIfDue();

  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    // Fresh window
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, reset: now + windowMs, limit };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, reset: bucket.resetAt, limit };
  }

  bucket.count += 1;
  return {
    success: true,
    remaining: limit - bucket.count,
    reset: bucket.resetAt,
    limit,
  };
}

/**
 * Helper: derive a stable rate-limit key from a request.
 * Strategy:
 *   - Authenticated requests: keyed by app userId (per-user limit)
 *   - Anonymous requests: keyed by IP (per-IP limit)
 *
 * For IP we trust x-forwarded-for since we're behind Vercel/Cloudflare
 * which set it correctly. NEVER trust this header in a self-hosted
 * setup without a known proxy.
 */
export function rateLimitKey(req: Request, userId: string | null, prefix: string): string {
  if (userId) return `${prefix}:user:${userId}`;
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0]?.trim() || "unknown";
  return `${prefix}:ip:${ip}`;
}

/**
 * Apply standard headers to a Response to communicate the limit state.
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.floor(result.reset / 1000)),
  };
}
