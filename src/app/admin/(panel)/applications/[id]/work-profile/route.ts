import { NextResponse } from "next/server";
import { contentDisposition } from "@/lib/uploads/http";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import { draftJob, type DraftApplication } from "@/server/application/service";
import { buildWorkProfilePdf } from "@/server/pdf/work-profile";
import { prisma } from "@/server/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin("applications.documents");
  const { id } = await context.params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      profile: true,
      education: { orderBy: { sortOrder: "asc" } },
      employment: { orderBy: { sortOrder: "asc" } },
      travelHistory: { orderBy: { sortOrder: "asc" } },
      dependants: { orderBy: { sortOrder: "asc" } },
      emergencyContacts: { orderBy: { sortOrder: "asc" } },
      military: true,
      documents: { orderBy: { createdAt: "asc" } },
      job: {
        include: {
          faqs: { orderBy: { sortOrder: "asc" } },
          documentRequirements: { orderBy: { sortOrder: "asc" } },
          profileSectionRequirements: true,
        },
      },
    },
  });

  if (!application) {
    return NextResponse.json({ ok: false, error: "Application not found." }, { status: 404 });
  }

  const draft = application as DraftApplication;
  const job = draftJob(draft);
  const bytes = await buildWorkProfilePdf(draft, job);
  const basename = application.referenceNumber?.trim() || application.id;
  const filename = `${basename}-work-profile.pdf`;

  await writeAdminAudit({
    actorId: admin.id,
    action: "application.work_profile_download",
    targetType: "Application",
    targetId: application.id,
    metadata: {
      referenceNumber: application.referenceNumber,
      filename,
    },
  });

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": contentDisposition(filename, "attachment"),
      "Content-Length": String(bytes.length),
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
