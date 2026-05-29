// Simple sliding-window in-memory rate limiter. Adequate for a single-region
// deployment; swap to Upstash Ratelimit when scaling to multi-region.
const buckets = new Map<string, { count: number; resetAt: number }>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export function rateLimit(key: string, max: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: max - 1, resetAt };
  }

  if (bucket.count >= max) {
    return { allowed: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { allowed: true, remaining: max - bucket.count, resetAt: bucket.resetAt };
}

// Periodic cleanup so the map doesn't grow forever in long-running edges.
if (typeof globalThis !== 'undefined' && !(globalThis as { __rl_cleanup?: boolean }).__rl_cleanup) {
  (globalThis as { __rl_cleanup?: boolean }).__rl_cleanup = true;
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 60_000).unref?.();
}
