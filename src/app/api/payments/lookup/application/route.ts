import { NextResponse } from "next/server";
import { maskPersonName } from "@/lib/apply/mask-name";
import { parseApplicationReference } from "@/lib/apply/reference";
import { prisma } from "@/server/db";
import { clientIp, consumeRateLimit, RATE_LIMITS } from "@/server/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const limited = await consumeRateLimit(RATE_LIMITS.paymentLookupIp, clientIp(request.headers));
  if (!limited.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many lookups. Please wait a few minutes and try again." },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSeconds) } },
    );
  }

  const ref = new URL(request.url).searchParams.get("ref")?.trim().toUpperCase() ?? "";
  if (!parseApplicationReference(ref)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid submission number (for example TEHA-2026-000005-K7M2QX)." },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { referenceNumber: ref },
    include: {
      profile: { select: { fullName: true } },
      job: { select: { title: true, city: true, country: true } },
    },
  });

  if (!application || application.status === "draft" || !application.submittedAt) {
    return NextResponse.json(
      { ok: false, error: "No submitted application was found for that number." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    ok: true,
    application: {
      referenceNumber: application.referenceNumber,
      maskedApplicantName: maskPersonName(application.profile?.fullName ?? "Applicant"),
      jobTitle: application.job.title,
      jobLocation: `${application.job.city}, ${application.job.country}`,
    },
  });
}
