import { notFound } from "next/navigation";
import { parseApplicationReference } from "@/lib/apply/reference";
import { hashDraftToken } from "@/lib/apply/token";
import { prisma } from "@/server/db";
import { readDraftToken } from "@/server/application/cookies";
import { draftJob, type DraftApplication } from "@/server/application/service";

const submittedInclude = {
  profile: true,
  education: { orderBy: { sortOrder: "asc" as const } },
  employment: { orderBy: { sortOrder: "asc" as const } },
  travelHistory: { orderBy: { sortOrder: "asc" as const } },
  dependants: { orderBy: { sortOrder: "asc" as const } },
  emergencyContacts: { orderBy: { sortOrder: "asc" as const } },
  military: true,
  documents: { orderBy: { createdAt: "asc" as const } },
  emailLogs: { orderBy: { createdAt: "desc" as const }, take: 8 },
  job: {
    include: {
      faqs: { orderBy: { sortOrder: "asc" as const } },
      documentRequirements: { orderBy: { sortOrder: "asc" as const } },
      profileSectionRequirements: true,
    },
  },
};

export type SubmittedApplication = DraftApplication & {
  referenceNumber: string;
  submittedAt: Date;
  emailLogs: { template: string; status: string; toAddress: string }[];
};

export async function requireSubmittedAccess(reference: string, queryToken?: string | null) {
  if (!parseApplicationReference(reference)) notFound();
  const application = await prisma.application.findFirst({
    where: { referenceNumber: reference.toUpperCase() },
    include: submittedInclude,
  });
  if (!application?.referenceNumber || application.status === "draft" || !application.submittedAt) {
    notFound();
  }
  const cookieToken = await readDraftToken(application.jobId);
  const token = queryToken?.trim() || cookieToken;
  if (!token || hashDraftToken(token) !== application.tokenHash) {
    notFound();
  }
  return {
    application: application as SubmittedApplication,
    job: draftJob(application as DraftApplication),
    token,
  };
}

export function applicantEmailStatus(logs: { template: string; status: string }[]) {
  return logs.find((item) => item.template === "application_received")?.status ?? "skipped";
}
