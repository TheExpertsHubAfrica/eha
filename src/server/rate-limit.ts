import { createHash } from "node:crypto";
import { prisma } from "@/server/db";

const MINUTE = 60;
const HOUR = 60 * MINUTE;

// Per-IP limits are generous because mobile networks and cafes put many applicants behind one IP.
export const RATE_LIMITS = {
  adminLoginIpEmail: { scope: "admin-login-ip-email", max: 8, windowSeconds: 15 * MINUTE },
  adminLoginIp: { scope: "admin-login-ip", max: 40, windowSeconds: 15 * MINUTE },
  adminLoginEmail: { scope: "admin-login-email", max: 20, windowSeconds: 15 * MINUTE },
  contactIp: { scope: "contact-ip", max: 5, windowSeconds: 15 * MINUTE },
  draftCreateIp: { scope: "draft-create-ip", max: 30, windowSeconds: HOUR },
  draftEmailIp: { scope: "draft-email-ip", max: 20, windowSeconds: HOUR },
  draftEmailRecipient: { scope: "draft-email-recipient", max: 5, windowSeconds: HOUR },
  // Site-wide, in separate groups so a flood of one kind cannot silence the others.
  siteLinkEmails: { scope: "site-link-emails", max: 200, windowSeconds: HOUR },
  siteConfirmationEmails: { scope: "site-confirmation-emails", max: 200, windowSeconds: HOUR },
  siteAdminEmails: { scope: "site-admin-emails", max: 100, windowSeconds: HOUR },
  paymentInitializeIp: { scope: "payment-initialize-ip", max: 20, windowSeconds: 15 * MINUTE },
  paymentLookupIp: { scope: "payment-lookup-ip", max: 20, windowSeconds: 15 * MINUTE },
  uploadDraft: { scope: "upload-draft", max: 30, windowSeconds: HOUR },
} as const;

export type RateLimit = (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS];

/** Checks the IP first, so requests from a blocked IP cannot use up a recipient's allowance. */
export async function consumeApplicantEmailSlot(ip: string, email: string) {
  const byIp = await consumeRateLimit(RATE_LIMITS.draftEmailIp, ip);
  if (!byIp.ok) return false;
  const byRecipient = await consumeRateLimit(RATE_LIMITS.draftEmailRecipient, email.toLowerCase());
  return byRecipient.ok;
}

const PRUNE_CHANCE = 0.01;

/** Vercel overwrites this header. Behind any other proxy, make sure the proxy overwrites it too. */
export function clientIp(headers: Headers) {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}

/**
 * Counts one attempt in Postgres so every server instance shares the same count. Identifiers are
 * hashed to keep emails and IPs out of the table. If the database fails the request is allowed,
 * because a limiter outage should not take the site down with it.
 */
export async function consumeRateLimit(limit: RateLimit, identifier: string) {
  const key = `${limit.scope}:${createHash("sha256").update(identifier).digest("hex")}`;
  try {
    const [bucket] = await prisma.$queryRaw<{ count: number; retry_after: number }[]>`
      INSERT INTO "rate_limit_buckets" ("key", "count", "reset_at")
      VALUES (${key}, 1, now() + (${limit.windowSeconds}::int * interval '1 second'))
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "rate_limit_buckets"."reset_at" <= now()
          THEN 1 ELSE "rate_limit_buckets"."count" + 1 END,
        "reset_at" = CASE WHEN "rate_limit_buckets"."reset_at" <= now()
          THEN EXCLUDED."reset_at" ELSE "rate_limit_buckets"."reset_at" END
      RETURNING "count", ceil(extract(epoch FROM "reset_at" - now()))::int AS retry_after
    `;
    if (Math.random() < PRUNE_CHANCE) {
      await prisma.$executeRaw`DELETE FROM "rate_limit_buckets" WHERE "reset_at" < now()`;
    }
    return bucket.count <= limit.max
      ? { ok: true as const, retryAfterSeconds: 0 }
      : { ok: false as const, retryAfterSeconds: Math.max(1, bucket.retry_after) };
  } catch (error) {
    console.error(`rate limit check failed for ${limit.scope}`, error);
    return { ok: true as const, retryAfterSeconds: 0 };
  }
}
