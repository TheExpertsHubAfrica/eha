type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60 * 60 * 1000;
const MAX_UPLOADS = 30;
const buckets = new Map<string, Bucket>();

export function consumeUploadSlot(key: string) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true as const, retryAfterSeconds: 0 };
  }
  if (existing.count >= MAX_UPLOADS) {
    return {
      ok: false as const,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }
  existing.count += 1;
  return { ok: true as const, retryAfterSeconds: 0 };
}
