import { notFound, redirect } from "next/navigation";
import { applicationAccessPath, parseApplicationReference } from "@/lib/apply/reference";
import {
  ACCESS_LINK_TTL_SECONDS,
  createDraftToken,
  hashDraftToken,
  LINK_SESSION_SECONDS,
} from "@/lib/apply/token";
import { siteConfig } from "@/lib/site-config";
import { prisma } from "@/server/db";
import { readDraftToken, writeDraftToken } from "@/server/application/cookies";
import { draftJob, issueResumeToken, type DraftApplication } from "@/server/application/service";

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

/** Every failure sends the visitor to the same page, so nothing reveals whether a reference exists. */
export async function requireSubmittedAccess(reference: string, queryToken?: string | null) {
  if (!parseApplicationReference(reference)) notFound();
  const application = await prisma.application.findFirst({
    where: { referenceNumber: reference.toUpperCase() },
    include: submittedInclude,
  });
  const accessPath = applicationAccessPath(reference);
  if (!application?.referenceNumber || application.status === "draft" || !application.submittedAt) {
    redirect(accessPath);
  }
  if (!application.accessExpiresAt || application.accessExpiresAt < new Date()) {
    redirect(accessPath);
  }
  const cookieToken = await readDraftToken(application.jobId);
  const token = queryToken?.trim() || cookieToken;
  if (!token || hashDraftToken(token) !== application.tokenHash) {
    redirect(accessPath);
  }
  return {
    application: application as SubmittedApplication,
    job: draftJob(application as DraftApplication),
    token,
  };
}

/** Issues a single-use link, replacing any earlier unused one. */
export async function issueAccessLink(applicationId: string, reference: string) {
  const expiresAt = new Date(Date.now() + ACCESS_LINK_TTL_SECONDS * 1000);
  const token = await issueResumeToken(applicationId, expiresAt);
  return `${siteConfig.url.replace(/\/$/, "")}/application/open/${encodeURIComponent(reference)}?t=${encodeURIComponent(token)}`;
}

function accessLinkWhere(reference: string, token: string) {
  return {
    referenceNumber: reference.toUpperCase(),
    status: { not: "draft" as const },
    resumeTokenHash: hashDraftToken(token),
    resumeTokenExpiresAt: { gt: new Date() },
  };
}

/** Read-only, because mail scanners open links: nothing changes until the applicant confirms. */
export async function inspectAccessLink(reference: string, token: string) {
  return prisma.application.findFirst({
    where: accessLinkWhere(reference, token),
    select: { profile: { select: { email: true } }, job: { select: { title: true, city: true } } },
  });
}

/** Spends the link and moves access into a short-lived cookie, signing out any other device. */
export async function consumeAccessLink(reference: string, token: string) {
  const where = accessLinkWhere(reference, token);
  const application = await prisma.application.findFirst({ where, select: { jobId: true } });
  if (!application) return false;
  const sessionToken = createDraftToken();
  const updated = await prisma.application.updateMany({
    where,
    data: {
      tokenHash: hashDraftToken(sessionToken),
      resumeTokenHash: null,
      resumeTokenExpiresAt: null,
      accessExpiresAt: new Date(Date.now() + LINK_SESSION_SECONDS * 1000),
    },
  });
  if (updated.count === 0) return false;
  await writeDraftToken(application.jobId, sessionToken, LINK_SESSION_SECONDS);
  return true;
}

export async function findSubmittedByReferenceAndEmail(reference: string, email: string) {
  return prisma.application.findFirst({
    where: {
      referenceNumber: reference.toUpperCase(),
      status: { not: "draft" },
      profile: { email: email.trim().toLowerCase() },
    },
    include: { profile: { select: { fullName: true } }, job: { select: { title: true, city: true, country: true } } },
  });
}

export function applicantEmailStatus(logs: { template: string; status: string }[]) {
  return logs.find((item) => item.template === "application_received")?.status ?? "skipped";
}
