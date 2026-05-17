/**
 * Simple in-memory sliding-window rate limiter.
 * Per-IP, resets every minute. Good enough for serverless cold starts;
 * for production at scale, swap the store for Redis (Upstash, etc.)
 */

interface RateLimitRecord {
  count: number;
  windowStart: number;
}

// Module-level map — survives across requests in the same serverless instance
const store = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60_000; // 1 minute
const DEFAULT_LIMIT = Number(process.env.RATE_LIMIT_RPM ?? 10);

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetInMs: number;
}

export function checkRateLimit(
  ip: string,
  limit = DEFAULT_LIMIT
): RateLimitResult {
  const now = Date.now();
  const record = store.get(ip);

  if (!record || now - record.windowStart > WINDOW_MS) {
    // New window
    store.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetInMs: WINDOW_MS };
  }

  if (record.count >= limit) {
    const resetInMs = WINDOW_MS - (now - record.windowStart);
    return { allowed: false, remaining: 0, resetInMs };
  }

  record.count += 1;
  return {
    allowed: true,
    remaining: limit - record.count,
    resetInMs: WINDOW_MS - (now - record.windowStart),
  };
}

/** Utility: extract IP from Next.js request headers */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
