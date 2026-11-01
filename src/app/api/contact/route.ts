import { NextResponse } from "next/server";
import { TURNSTILE_ACTIONS, TURNSTILE_FAILED_MESSAGE } from "@/lib/turnstile";
import { contactSchema } from "@/lib/validation/contact";
import { submitContactEnquiry } from "@/server/contact/submit";
import { clientIp, consumeRateLimit, RATE_LIMITS } from "@/server/rate-limit";
import { getResolvedSite } from "@/server/settings";
import { verifyTurnstile } from "@/server/turnstile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const limited = await consumeRateLimit(RATE_LIMITS.contactIp, clientIp(request.headers));
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many messages. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "");
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return NextResponse.json({ ok: false, errors }, { status: 400 });
  }

  if (parsed.data._gotcha?.trim()) {
    return NextResponse.json({ ok: true });
  }

  if (!(await verifyTurnstile(parsed.data.turnstileToken, clientIp(request.headers), TURNSTILE_ACTIONS.contact))) {
    return NextResponse.json({ ok: false, error: TURNSTILE_FAILED_MESSAGE }, { status: 403 });
  }

  const site = await getResolvedSite();
  const result = await submitContactEnquiry(parsed.data, site.email);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
