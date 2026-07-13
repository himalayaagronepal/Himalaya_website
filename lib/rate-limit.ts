// Tiny in-memory rate limiter for auth-sensitive endpoints (password step and the
// 2FA code step). Keyed by an arbitrary string (we use `email:ip` / `userId:ip`).
//
// Scope/caveat: state lives in this Node process only. For a single-instance
// deployment (this app) that's sufficient. If the app is ever scaled to multiple
// instances behind a load balancer, swap this for a shared store (Redis/Upstash)
// keeping the same exported surface.

type Attempt = {
  count: number;
  // epoch ms when the current lockout window ends (only meaningful once locked).
  blockedUntil: number;
  // epoch ms of the last recorded failure; used to expire stale buckets.
  lastFailure: number;
};

// Allow this many failures inside a window before locking out.
const MAX_ATTEMPTS = 5;
// How long a bucket of failures is remembered / how long a lockout lasts.
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

const attempts = new Map<string, Attempt>();

// Opportunistic cleanup so the Map can't grow without bound. Runs at most once
// per call and only sweeps when the bucket is comfortably stale.
function sweep(now: number) {
  if (attempts.size < 5000) return;
  for (const [key, a] of attempts) {
    if (now - a.lastFailure > WINDOW_MS && now > a.blockedUntil) {
      attempts.delete(key);
    }
  }
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const a = attempts.get(key);
  if (!a) return { allowed: true };

  // A finished window resets the bucket.
  if (now - a.lastFailure > WINDOW_MS && now > a.blockedUntil) {
    attempts.delete(key);
    return { allowed: true };
  }

  if (now < a.blockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((a.blockedUntil - now) / 1000) };
  }

  return { allowed: true };
}

export function recordFailure(key: string): void {
  const now = Date.now();
  sweep(now);
  const a = attempts.get(key) ?? { count: 0, blockedUntil: 0, lastFailure: 0 };

  // Reset a stale bucket before counting this failure.
  if (now - a.lastFailure > WINDOW_MS && now > a.blockedUntil) {
    a.count = 0;
    a.blockedUntil = 0;
  }

  a.count += 1;
  a.lastFailure = now;
  if (a.count >= MAX_ATTEMPTS) {
    a.blockedUntil = now + WINDOW_MS;
  }
  attempts.set(key, a);
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}
