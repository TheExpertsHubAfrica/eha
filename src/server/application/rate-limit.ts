type Bucket = { count: number; resetAt: number };

const WINDOW_MS = 60 * 60 * 1000;
const buckets = new Map<string, Bucket>();

export const RESUME_LINK_LIMITS = { perIp: 20, perEmail: 5 };

export function consumeResumeLinkSlot(key: string, max: number) {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true as const };
  }
  if (existing.count >= max) {
    return { ok: false as const };
  }
  existing.count += 1;
  return { ok: true as const };
}
