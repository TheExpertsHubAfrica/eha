import { NextResponse } from "next/server";
import { parseApplicationReference } from "@/lib/apply/reference";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ref = new URL(request.url).searchParams.get("ref")?.trim().toUpperCase() ?? "";
  if (!parseApplicationReference(ref)) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid submission number (for example TEHA-2026-000005)." },
      { status: 400 },
    );
  }

  const application = await prisma.application.findUnique({
    where: { referenceNumber: ref },
    include: {
      profile: { select: { fullName: true, email: true } },
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
      id: application.id,
      referenceNumber: application.referenceNumber,
      applicantName: application.profile?.fullName ?? "Applicant",
      suggestedEmail: application.profile?.email ?? "",
      jobTitle: application.job.title,
      jobLocation: `${application.job.city}, ${application.job.country}`,
    },
  });
}
