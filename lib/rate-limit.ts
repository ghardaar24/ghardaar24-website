/**
 * Rate limiting utility using token bucket algorithm
 *
 * Uses globalThis to persist the store across hot reloads (dev) and
 * within the same serverless function instance (production).
 *
 * LIMITATION: In serverless environments (e.g. Vercel), each cold start
 * creates a new process with its own store. This provides per-instance
 * rate limiting only. For stricter global rate limiting at scale,
 * replace this with a Redis-backed store (e.g. Upstash).
 */

interface RateLimitConfig {
  interval: number; // Time window in milliseconds
  maxRequests: number; // Max requests per interval
}

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

// Persist across hot reloads (dev) and within the same serverless instance
const globalStore = globalThis as unknown as {
  __rateLimitStore?: Map<string, RateLimitEntry>;
};

if (!globalStore.__rateLimitStore) {
  globalStore.__rateLimitStore = new Map<string, RateLimitEntry>();
}

const rateLimitStore = globalStore.__rateLimitStore;

// Default configuration: 10 requests per minute
const DEFAULT_CONFIG: RateLimitConfig = {
  interval: 60 * 1000, // 1 minute
  maxRequests: 10,
};

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier for the client (e.g., IP address)
 * @param config - Optional custom rate limit configuration
 * @returns Object with limited status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { limited: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  if (!entry) {
    // First request from this identifier
    rateLimitStore.set(identifier, {
      tokens: config.maxRequests - 1,
      lastRefill: now,
    });
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.interval,
    };
  }

  // Calculate time since last refill
  const timeSinceRefill = now - entry.lastRefill;

  // Check if we should refill tokens
  if (timeSinceRefill >= config.interval) {
    // Full refill
    rateLimitStore.set(identifier, {
      tokens: config.maxRequests - 1,
      lastRefill: now,
    });
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetIn: config.interval,
    };
  }

  // No refill yet, check remaining tokens
  if (entry.tokens <= 0) {
    return {
      limited: true,
      remaining: 0,
      resetIn: config.interval - timeSinceRefill,
    };
  }

  // Consume a token
  entry.tokens -= 1;
  rateLimitStore.set(identifier, entry);

  return {
    limited: false,
    remaining: entry.tokens,
    resetIn: config.interval - timeSinceRefill,
  };
}

/**
 * Get client identifier from request headers
 * Falls back to a default identifier if IP cannot be determined
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIp) {
    return realIp;
  }

  // Fallback - in production this should be more robust
  return "unknown-client";
}

/**
 * Create rate limit headers for response
 */
export function getRateLimitHeaders(
  remaining: number,
  resetIn: number,
  limit: number = DEFAULT_CONFIG.maxRequests
): Record<string, string> {
  return {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": Math.ceil(resetIn / 1000).toString(),
  };
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    for (const [key, entry] of rateLimitStore.entries()) {
      if (now - entry.lastRefill > maxAge) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}
