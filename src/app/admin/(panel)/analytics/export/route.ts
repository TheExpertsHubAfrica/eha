import { NextResponse } from "next/server";
import { requireAdmin } from "@/server/admin/auth";
import { loadAnalytics } from "@/server/analytics/queries";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function csvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET(request: Request) {
  await requireAdmin("analytics.read");
  const type = new URL(request.url).searchParams.get("type") ?? "applications";

  if (type === "jobs") {
    const stats = await loadAnalytics();
    const header = ["title", "city", "views", "started", "submitted", "conversion"];
    const rows = stats.jobPerformance.map((row) =>
      [row.title, row.city, row.views, row.started, row.applied, row.conversion.toFixed(3)].map(csvCell).join(","),
    );
    return new NextResponse([header.join(","), ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="job-performance.csv"',
        "Cache-Control": "private, no-store",
      },
    });
  }

  const rows = await prisma.application.findMany({
    where: { status: { not: "draft" } },
    orderBy: { submittedAt: "desc" },
    take: 2000,
    include: { profile: true, job: true },
  });
  const header = ["reference", "name", "email", "phone", "job", "city", "country", "status", "submittedAt"];
  const body = rows.map((row) =>
    [
      row.referenceNumber,
      row.profile?.fullName,
      row.profile?.email,
      row.profile?.phone,
      row.job.title,
      row.job.city,
      row.job.country,
      row.status,
      row.submittedAt?.toISOString() ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  return new NextResponse([header.join(","), ...body].join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="applications.csv"',
      "Cache-Control": "private, no-store",
    },
  });
}
