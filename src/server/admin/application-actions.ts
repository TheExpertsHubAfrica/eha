"use server";

import type { ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { confirmationPath } from "@/lib/apply/reference";
import { siteConfig } from "@/lib/site-config";
import { adminStatuses, statusLabel } from "@/lib/admin/status";
import { requireAdmin, writeAdminAudit } from "@/server/admin/auth";
import { prisma } from "@/server/db";
import { deliverEmail } from "@/server/email/send";
import { overlayEmailTemplate } from "@/server/email/custom";
import { applicationStatusChangedEmail } from "@/server/email/templates";

export async function addAdminNoteAction(applicationId: string, formData: FormData) {
  const admin = await requireAdmin("applications.write");
  const body = String(formData.get("body") ?? "").trim();
  if (body.length < 3) return { ok: false as const, error: "Enter a note." };
  await prisma.adminNote.create({
    data: { applicationId, authorId: admin.id, body },
  });
  await writeAdminAudit({
    actorId: admin.id,
    action: "application.note",
    targetType: "Application",
    targetId: applicationId,
  });
  revalidatePath(`/admin/applications/${applicationId}`);
  return { ok: true as const };
}

export async function updateApplicationStatusAction(applicationId: string, formData: FormData) {
  const admin = await requireAdmin("applications.write");
  const toStatus = String(formData.get("status") ?? "") as ApplicationStatus;
  const note = String(formData.get("note") ?? "").trim() || null;
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { profile: true, job: true },
  });
  if (!application) return { ok: false as const, error: "Application not found." };
  if (application.status === "draft") {
    return { ok: false as const, error: "Draft applications cannot be moved from this screen." };
  }
  if (!adminStatuses.includes(toStatus)) {
    return { ok: false as const, error: "Choose a valid status." };
  }

  await prisma.$transaction([
    prisma.application.update({
      where: { id: applicationId },
      data: { status: toStatus },
    }),
    prisma.applicationStatusHistory.create({
      data: {
        applicationId,
        fromStatus: application.status,
        toStatus,
        note,
        actorId: admin.id,
      },
    }),
  ]);

  await writeAdminAudit({
    actorId: admin.id,
    action: "application.status",
    targetType: "Application",
    targetId: applicationId,
    metadata: { from: application.status, to: toStatus },
  });

  if (
    application.profile &&
    application.referenceNumber &&
    application.status !== toStatus
  ) {
    const confirmationUrl = `${siteConfig.url}${confirmationPath(application.referenceNumber)}`;
    const message = applicationStatusChangedEmail({
      applicantName: application.profile.fullName,
      reference: application.referenceNumber,
      jobTitle: application.job.title,
      statusLabel: statusLabel(toStatus),
      confirmationUrl,
    });
    await deliverEmail({
      applicationId,
      to: application.profile.email,
      ...(await overlayEmailTemplate(
        "application_status_changed",
        {
          applicantName: application.profile.fullName,
          reference: application.referenceNumber,
          jobTitle: application.job.title,
          statusLabel: statusLabel(toStatus),
          confirmationUrl,
        },
        message,
        siteConfig.name,
      )),
      template: `application_status_changed:${toStatus}`,
    });
  }

  revalidatePath(`/admin/applications/${applicationId}`);
  revalidatePath("/admin/applications");
  revalidatePath("/admin");
  return { ok: true as const };
}
