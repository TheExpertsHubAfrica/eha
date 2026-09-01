import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation/contact";
import { consumeContactSlot } from "@/server/contact/rate-limit";
import { submitContactEnquiry } from "@/server/contact/submit";
import { getResolvedSite } from "@/server/settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  const limited = consumeContactSlot(`contact:${clientIp(request)}`);
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

  const site = await getResolvedSite();
  const result = await submitContactEnquiry(parsed.data, site.email);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 503 });
  }

  return NextResponse.json({ ok: true });
}
