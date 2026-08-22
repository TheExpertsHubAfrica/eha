import { formatDisplayDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { confirmationPath, formatApplicationReference } from "@/lib/apply/reference";
import { canAccessStep } from "@/lib/apply/steps";
import { missingRequiredDocuments } from "@/lib/apply/documents";
import { prisma } from "@/server/db";
import { getEmailConfig } from "@/server/email/config";
import { deliverEmail } from "@/server/email/send";
import { overlayEmailTemplate } from "@/server/email/custom";
import { adminNewApplicationEmail, applicationReceivedEmail } from "@/server/email/templates";
import { buildWorkProfilePdf } from "@/server/pdf/work-profile";
import {
  draftJob,
  loadApplicationSession,
  type DraftApplication,
} from "@/server/application/service";
import { readDraftToken } from "@/server/application/cookies";
import { recordEvent } from "@/server/analytics/events";

function confirmationUrl(reference: string, token: string) {
  return `${siteConfig.url}${confirmationPath(reference)}?t=${encodeURIComponent(token)}`;
}

async function notifySubmission(
  application: DraftApplication & { referenceNumber: string; submittedAt: Date },
  token: string,
) {
  const job = draftJob(application);
  const profile = application.profile;
  if (!profile) return;

  const vars = {
    applicantName: profile.fullName,
    applicantEmail: profile.email,
    reference: application.referenceNumber,
    jobTitle: job.title,
    location: `${job.city}, ${job.country}`,
    submittedAt: application.submittedAt,
    confirmationUrl: confirmationUrl(application.referenceNumber, token),
  };

  let pdf: Uint8Array | null = null;
  try {
    pdf = await buildWorkProfilePdf(application, job);
  } catch {
    pdf = null;
  }

  const applicant = applicationReceivedEmail(vars);
  await deliverEmail({
    applicationId: application.id,
    to: profile.email,
    ...(await overlayEmailTemplate(
      "application_received",
      {
        applicantName: vars.applicantName,
        applicantEmail: vars.applicantEmail,
        reference: vars.reference,
        jobTitle: vars.jobTitle,
        location: vars.location,
        submittedAt: formatDisplayDate(vars.submittedAt),
        confirmationUrl: vars.confirmationUrl,
      },
      applicant,
      siteConfig.name,
    )),
    attachments: pdf
      ? [{ filename: `${application.referenceNumber}-work-profile.pdf`, content: Buffer.from(pdf) }]
      : undefined,
  });

  const adminTo = getEmailConfig().adminTo;
  if (adminTo) {
    const adminMessage = adminNewApplicationEmail({
      ...vars,
      phone: profile.phone,
      applicationId: application.id,
    });
    await deliverEmail({
      applicationId: application.id,
      to: adminTo,
      ...(await overlayEmailTemplate(
        "admin_new_application",
        {
          applicantName: vars.applicantName,
          applicantEmail: vars.applicantEmail,
          phone: profile.phone,
          reference: vars.reference,
          jobTitle: vars.jobTitle,
          location: vars.location,
          submittedAt: formatDisplayDate(vars.submittedAt),
          adminUrl: `${siteConfig.url}/admin/applications/${application.id}`,
        },
        adminMessage,
        siteConfig.name,
      )),
    });
    return;
  }

  await prisma.emailLog.create({
    data: {
      applicationId: application.id,
      template: "admin_new_application",
      toAddress: "unconfigured",
      subject: `New Work Application Received — ${application.referenceNumber}`,
      status: "skipped",
      error: "ADMIN_NOTIFICATION_EMAIL is not set.",
    },
  });
}

export async function submitApplication(
  jobId: string,
  input: { declaration: boolean; acknowledgeSimilar: boolean },
) {
  if (!input.declaration) {
    return { ok: false as const, error: "Confirm that the information is accurate before submitting." };
  }

  const token = await readDraftToken(jobId);
  if (!token) {
    return {
      ok: false as const,
      error: "Your application draft could not be found. Start again from the opportunity page.",
    };
  }

  const session = await loadApplicationSession(jobId);
  if (!session) {
    return { ok: false as const, error: "Your application draft could not be found." };
  }

  if (session.status !== "draft" && session.referenceNumber) {
    return { ok: true as const, redirectTo: confirmationPath(session.referenceNumber) };
  }
  if (session.status !== "draft") {
    return { ok: false as const, error: "This application cannot be submitted." };
  }

  const job = draftJob(session);
  if (session.job.status !== "published" || session.job.availability !== "open") {
    return { ok: false as const, error: "This opportunity is not open for applications." };
  }
  if (!canAccessStep(job, session.stepsCompleted, "review")) {
    return { ok: false as const, error: "Complete every required step before submitting." };
  }
  if (missingRequiredDocuments(job, session.documents).length > 0) {
    return { ok: false as const, error: "Upload the required documents before submitting." };
  }
  if (!session.profile) {
    return { ok: false as const, error: "Complete your personal details before submitting." };
  }
  if (!input.acknowledgeSimilar) {
    return {
      ok: false as const,
      error: "A similar application may already exist. Confirm that you want to continue.",
    };
  }

  const year = new Date().getUTCFullYear();
  const submittedAt = new Date();

  const submitted = await prisma.$transaction(
    async (tx) => {
      const sequence = await tx.applicationReferenceSequence.upsert({
        where: { year },
        create: { year, last: 1 },
        update: { last: { increment: 1 } },
      });
      const referenceNumber = formatApplicationReference(year, sequence.last);

      const updated = await tx.application.updateMany({
        where: { id: session.id, status: "draft" },
        data: {
          status: "submitted",
          currentStep: "review",
          referenceNumber,
          submittedAt,
          declarationAcceptedAt: submittedAt,
        },
      });

      if (updated.count === 0) {
        const existing = await tx.application.findUnique({ where: { id: session.id } });
        if (existing?.referenceNumber && existing.status !== "draft") {
          return existing;
        }
        throw new Error("This application cannot be submitted.");
      }

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: session.id,
          fromStatus: "draft",
          toStatus: "submitted",
          note: "Applicant submitted the work profile",
        },
      });

      return tx.application.findUniqueOrThrow({ where: { id: session.id } });
    },
    { timeout: 20000, maxWait: 10000 },
  );

  if (!submitted.referenceNumber) {
    return { ok: false as const, error: "The application could not be given a reference number." };
  }

  await recordEvent({ name: "application_submitted", targetType: "Job", targetId: jobId });

  const fresh = await loadApplicationSession(jobId);
  if (fresh?.referenceNumber && fresh.submittedAt) {
    await notifySubmission(
      fresh as DraftApplication & { referenceNumber: string; submittedAt: Date },
      token,
    ).catch(() => undefined);
  }

  return { ok: true as const, redirectTo: confirmationPath(submitted.referenceNumber) };
}
